/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable, OnDestroy} from '@angular/core';
import {LightCard, Severity} from '@ofModel/light-card.model';
import {Notification} from '@ofModel/external-devices.model';
import {FilteredLightCardsStore} from '../../store/lightcards/lightcards-feed-filter-store';
import {EMPTY, iif, merge, of, Subject, timer} from 'rxjs';
import {filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {ExternalDevicesService} from 'app/business/services/notifications/external-devices.service';
import {ConfigService} from 'app/business/services/config.service';
import {LogOption, LoggerService as logger} from '../logs/logger.service';
import {AlertMessageService} from 'app/business/services/alert-message.service';
import {MessageLevel} from '@ofModel/message.model';
import {SoundServer} from 'app/business/server/sound.server';
import {OpfabStore} from 'app/business/store/opfabStore';

@Injectable({
    providedIn: 'root'
})
export class SoundNotificationService implements OnDestroy {
    private static RECENT_THRESHOLD = 18000000; // in milliseconds , 30 minutes
    private static ERROR_MARGIN = 4000; // in milliseconds

    /* The subscription used by the front end to get cards to display in the feed from the backend doesn't distinguish
     * between old cards loaded from the database and new cards arriving through the notification broker.
     * In addition, the getCardOperation observable on which this sound notification is hooked will also emit events
     * every time the subscription changes (= every time the feed time filters are changed). So to only notify cards
     * once (and only new cards), sounds will only be played for a given card if the elapsed time since its publishDate
     * is below this threshold. */

    private static DEFAULT_REPLAY_INTERVAL = 5; // in seconds
    private static SECONDS_TO_MILLISECONDS = 1000;
    private replayInterval: number;

    private soundConfigBySeverity: Map<Severity, SoundConfig>;
    private soundEnabled: Map<Severity, boolean>;
    private playSoundOnExternalDevice: boolean;
    private replayEnabled: boolean;
    private playSoundWhenSessionEnd = false;

    private incomingCardOrReminder = new Subject();
    private sessionEnd = new Subject();
    private clearSignal = new Subject();
    private ngUnsubscribe$ = new Subject<void>();
    private lastSentCardId: string;
    private lastUserAction = new Date().valueOf();

    private isServiceActive = true;
    private filteredLightCardStore: FilteredLightCardsStore;

    constructor(private soundServer: SoundServer) {
        // use to have access from cypress to the current object for stubbing method playSound
        if (window['Cypress']) window['soundNotificationService'] = this;
        this.filteredLightCardStore = OpfabStore.getFilteredLightCardStore();
    }

    public stopService() {
        this.isServiceActive = false;
        logger.info('Stopping sound service', LogOption.LOCAL_AND_REMOTE);
        this.clearOutstandingNotifications();
    }

    public initSoundService() {
        this.soundConfigBySeverity = new Map<Severity, SoundConfig>();
        this.soundConfigBySeverity.set(Severity.ALARM, {
            soundFileName: 'alarm.mp3',
            soundEnabledSetting: 'settings.playSoundForAlarm'
        });
        this.soundConfigBySeverity.set(Severity.ACTION, {
            soundFileName: 'action.mp3',
            soundEnabledSetting: 'settings.playSoundForAction'
        });
        this.soundConfigBySeverity.set(Severity.COMPLIANT, {
            soundFileName: 'compliant.mp3',
            soundEnabledSetting: 'settings.playSoundForCompliant'
        });
        this.soundConfigBySeverity.set(Severity.INFORMATION, {
            soundFileName: 'information.mp3',
            soundEnabledSetting: 'settings.playSoundForInformation'
        });

        this.soundEnabled = new Map<Severity, boolean>();
        this.soundConfigBySeverity.forEach((soundConfig, severity) => {
            ConfigService.getConfigValueAsObservable(soundConfig.soundEnabledSetting, false).subscribe((x) => {
                this.soundEnabled.set(severity, x);
                this.setSoundForSessionEndWhenAtLeastOneSoundForASeverityIsActivated();
            });
        });
        ConfigService.getConfigValueAsObservable('settings.playSoundOnExternalDevice', false).subscribe((x) => {
            this.playSoundOnExternalDevice = x;
        });
        ConfigService.getConfigValueAsObservable('settings.replayEnabled', false).subscribe((x) => {
            this.replayEnabled = x;
        });
        ConfigService.getConfigValueAsObservable(
            'settings.replayInterval',
            SoundNotificationService.DEFAULT_REPLAY_INTERVAL
        ).subscribe((x) => {
            this.replayInterval = Math.max(3, x);
        });

        for (const severity of Object.values(Severity)) this.initSoundPlayingForSeverity(severity);
        this.initSoundPlayingForSessionEnd();

        this.listenForCardUpdate();
    }

    public getPlaySoundOnExternalDevice(): boolean {
        return ConfigService.getConfigValue('externalDevicesEnabled') && this.playSoundOnExternalDevice;
    }

    private setSoundForSessionEndWhenAtLeastOneSoundForASeverityIsActivated() {
        this.playSoundWhenSessionEnd = false;
        for (const soundEnabled of this.soundEnabled.values()) {
            if (soundEnabled) this.playSoundWhenSessionEnd = true;
        }
    }

    private listenForCardUpdate() {
        OpfabStore.getLightCardStore()
            .getNewLightCards()
            .subscribe((card) => this.handleLoadedCard(card));
    }

    ngOnDestroy() {
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
    }

    public clearOutstandingNotifications() {
        this.clearSignal.next(null);
        this.lastUserAction = new Date().valueOf();
    }

    public handleRemindCard(card: LightCard) {
        this.incomingCardOrReminder.next(card);
    }

    public handleLoadedCard(card: LightCard) {
        if (card.id === this.lastSentCardId)
            this.lastSentCardId = ''; // no sound as the card was sent by the current user
        else {
            if (
                !card.hasBeenRead &&
                this.checkCardHasBeenPublishAfterLastUserAction(card) &&
                this.checkCardIsRecent(card)
            ) {
                this.incomingCardOrReminder.next(card);
                if (!this.filteredLightCardStore.isCardVisibleInFeed(card))
                    AlertMessageService.sendAlertMessage({
                        message: null,
                        level: MessageLevel.BUSINESS,
                        i18n: {key: 'feed.hiddenCardReceived'}
                    });
            }
        }
    }

    public handleSessionEnd() {
        if (this.playSoundWhenSessionEnd) {
            this.sessionEnd.next(null);
        }
    }

    public lastSentCard(cardId: string) {
        this.lastSentCardId = cardId;
    }

    private checkCardHasBeenPublishAfterLastUserAction(card: LightCard) {
        return card.publishDate + SoundNotificationService.ERROR_MARGIN - this.lastUserAction > 0;
    }

    private checkCardIsRecent(card: LightCard): boolean {
        return new Date().getTime() - card.publishDate <= SoundNotificationService.RECENT_THRESHOLD;
    }

    private getSoundForSeverity(severity: Severity): HTMLAudioElement {
        return this.soundServer.getSound(this.soundConfigBySeverity.get(severity).soundFileName);
    }

    private playSoundForSeverityEnabled(severity: Severity) {
        if (this.soundEnabled.get(severity)) this.playSound(severity);
        else
            logger.debug(
                'No sound was played for ' + severity + ' as sound is disabled for this severity',
                LogOption.LOCAL
            );
    }

    private playSound(severity: Severity) {
        if (!this.isServiceActive) return;
        if (ConfigService.getConfigValue('externalDevicesEnabled') && this.playSoundOnExternalDevice) {
            logger.debug(
                'External devices enabled. Sending notification for ' + severity + '.',
                LogOption.LOCAL_AND_REMOTE
            );
            const notification = new Notification(severity.toString());
            ExternalDevicesService.sendNotification(notification).subscribe();
        } else {
            logger.debug('Play sound on browser with severity ' + severity + '.', LogOption.LOCAL_AND_REMOTE);
            this.playSoundOnBrowser(this.getSoundForSeverity(severity));
        }
    }

    private initSoundPlayingForSeverity(severity: Severity) {
        merge(
            this.incomingCardOrReminder.pipe(
                filter((card: LightCard) => card.severity === severity),
                map((x) => SignalType.NOTIFICATION)
            ),
            this.clearSignal.pipe(map((x) => SignalType.CLEAR))
        )
            // Outputs an observable that emits a SignalType.NOTIFICATION element for every new card or reminder for the
            // given severity, and a SignalType.CLEAR element every time the user clicks anywhere on the screen
            // For each new SignalType.NOTIFICATION value, the next stage creates an observable that emits immediately then
            // at the specified interval. In the case of SignalType.CLEAR, it creates an observable that completes immediately.
            // Because of the switchMap, any new observable cancels the previous one, so that a click or a new card/reminder
            // resets the replay timer.
            .pipe(this.processSignal(), takeUntil(this.ngUnsubscribe$))
            .subscribe((x) => {
                logger.debug(' Play sound');
                this.playSoundForSeverityEnabled(severity);
            });
    }

    private initSoundPlayingForSessionEnd() {
        merge(
            this.sessionEnd.pipe(map((x) => SignalType.NOTIFICATION)),
            this.clearSignal.pipe(map((x) => SignalType.CLEAR))
        )
            .pipe(this.processSignal(), takeUntil(this.ngUnsubscribe$))
            .subscribe((x) => {
                logger.debug(' Play sound for session end');
                this.playSound(Severity.ALARM);
            });
    }

    private processSignal() {
        return switchMap((x: SignalType) => {
            if (x === SignalType.CLEAR) {
                return EMPTY;
            } else {
                return iif(
                    () => this.replayEnabled,
                    timer(0, this.replayInterval * SoundNotificationService.SECONDS_TO_MILLISECONDS),
                    of(null)
                );
            }
        });
    }

    /* There is no need to limit the frequency of calls to playSound because if a given sound XXXX is already
     * playing when XXXX.play() is called, nothing happens.
     * */
    private playSoundOnBrowser(sound: HTMLAudioElement) {
        sound.play().catch((error) => {
            logger.warn(
                `Notification sound wasn't played because the user hasn't interacted with the app yet (autoplay policy).`
            );
            /* This is to handle the exception thrown due to the autoplay policy on Chrome. See https://goo.gl/xX8pDD */
        });
    }

    public isAtLeastOneSoundActivated(): boolean {
        let activated = false;
        this.soundEnabled.forEach((soundForSeverity) => {
            if (soundForSeverity) activated = true;
        });
        return activated;
    }
}

export class SoundConfig {
    soundFileName: string;
    soundEnabledSetting: string;
}

export enum SignalType {
    NOTIFICATION,
    CLEAR
}
