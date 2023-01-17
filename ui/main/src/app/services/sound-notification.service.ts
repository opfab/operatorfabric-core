/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Injectable, OnDestroy} from '@angular/core';
import {PlatformLocation} from '@angular/common';
import {LightCard, Severity} from '@ofModel/light-card.model';
import {Notification} from '@ofModel/external-devices.model';
import {LightCardsFeedFilterService} from './lightcards/lightcards-feed-filter.service';
import {LightCardsStoreService} from './lightcards/lightcards-store.service';
import {EMPTY, iif, merge, of, Subject, timer} from 'rxjs';
import {filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {ExternalDevicesService} from '@ofServices/external-devices.service';
import {ConfigService} from 'app/business/services/config.service';
import {LogOption, OpfabLoggerService} from './logs/opfab-logger.service';

@Injectable({
    providedIn: 'root'
})
export class SoundNotificationService implements OnDestroy {
    private static RECENT_THRESHOLD = 4000; // in milliseconds
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

    private soundFileBasePath: string;

    private incomingCardOrReminder = new Subject();
    private sessionEnd = new Subject();
    private clearSignal = new Subject();
    private ngUnsubscribe$ = new Subject<void>();
    private lastSentCardId: string;

    private isServiceActive = true;

    constructor(
        private platformLocation: PlatformLocation,
        private lightCardsFeedFilterService: LightCardsFeedFilterService,
        private lightCardsStoreService: LightCardsStoreService,
        private externalDevicesService: ExternalDevicesService,
        private configService: ConfigService,
        private logger: OpfabLoggerService
    ) {
        // use to have access from cypress to the current object for stubbing method playSound
        if (window['Cypress']) window['soundNotificationService'] = this;
    }

    public stopService() {
        this.isServiceActive = false;
        this.logger.info("Stopping sound service",LogOption.LOCAL_AND_REMOTE);
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

        const baseHref = this.platformLocation.getBaseHrefFromDOM();
        this.soundFileBasePath = (baseHref ? baseHref : '/') + 'assets/sounds/';

        this.soundEnabled = new Map<Severity, boolean>();
        this.soundConfigBySeverity.forEach((soundConfig, severity) => {
            this.configService.getConfigValueAsObservable(soundConfig.soundEnabledSetting, false).subscribe((x) => {
                this.soundEnabled.set(severity, x);
                this.setSoundForSessionEndWhenAtLeastOneSoundForASeverityIsActivated();
            });
        });
        this.configService.getConfigValueAsObservable('settings.playSoundOnExternalDevice', false).subscribe((x) => {
            this.playSoundOnExternalDevice = x;
        });
        this.configService.getConfigValueAsObservable('settings.replayEnabled', false).subscribe((x) => {
            this.replayEnabled = x;
        });
        this.configService.getConfigValueAsObservable('settings.replayInterval', SoundNotificationService.DEFAULT_REPLAY_INTERVAL)
            .subscribe((x) => {
                this.replayInterval = Math.max(3,x);
            });

        for (const severity of Object.values(Severity)) this.initSoundPlayingForSeverity(severity);
        this.initSoundPlayingForSessionEnd();

        this.listenForCardUpdate();
    }



    public getPlaySoundOnExternalDevice(): boolean {
        return this.configService.getConfigValue('externalDevicesEnabled') && this.playSoundOnExternalDevice;
    }

    private setSoundForSessionEndWhenAtLeastOneSoundForASeverityIsActivated() {
        this.playSoundWhenSessionEnd = false;
        for (const soundEnabled of this.soundEnabled.values()) {
            if (soundEnabled) this.playSoundWhenSessionEnd = true;
        }
    }

    private listenForCardUpdate() {
        this.lightCardsStoreService.getNewLightCards().subscribe((card) => this.handleLoadedCard(card));
    }

    ngOnDestroy() {
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
    }

    public clearOutstandingNotifications() {
        this.clearSignal.next(null);
    }

    public handleRemindCard(card: LightCard) {
        if (this.lightCardsFeedFilterService.isCardVisibleInFeed(card)) this.incomingCardOrReminder.next(card);
    }

    public handleLoadedCard(card: LightCard) {
        if (card.id === this.lastSentCardId)
            this.lastSentCardId = ''; // no sound as the card was send by the current user
        else {
            if (this.lightCardsFeedFilterService.isCardVisibleInFeed(card) && this.checkCardIsRecent(card))
                this.incomingCardOrReminder.next(card);
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

    private checkCardIsRecent(card: LightCard): boolean {
        return new Date().getTime() - card.publishDate <= SoundNotificationService.RECENT_THRESHOLD;
    }

    private getSoundForSeverity(severity: Severity): HTMLAudioElement {
        return new Audio(this.soundFileBasePath + this.soundConfigBySeverity.get(severity).soundFileName);
    }

    private playSoundForSeverityEnabled(severity: Severity) {
        if (this.soundEnabled.get(severity)) this.playSound(severity);
        else this.logger.debug('No sound was played for ' + severity + ' as sound is disabled for this severity',LogOption.LOCAL);
    }

    private playSound(severity: Severity) {
        if (!this.isServiceActive) return;
        if (this.configService.getConfigValue('externalDevicesEnabled') && this.playSoundOnExternalDevice) {
            this.logger.debug('External devices enabled. Sending notification for ' + severity + '.',LogOption.LOCAL_AND_REMOTE);
            const notification = new Notification(severity.toString());
            this.externalDevicesService.sendNotification(notification).subscribe();
        } else {
            this.logger.debug('Play sound on browser with severity ' + severity + '.',LogOption.LOCAL_AND_REMOTE);
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
                console.log(new Date().toISOString(), ' Play sound');
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
                console.log(new Date().toISOString(), ' Play sound for session end');
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
            console.log(
                new Date().toISOString(),
                `Notification sound wasn't played because the user hasn't interacted with the app yet (autoplay policy).`
            );
            /* This is to handle the exception thrown due to the autoplay policy on Chrome. See https://goo.gl/xX8pDD */
        });
    }

    public isAtLeastOneSoundActivated(): boolean {
        let activated = false;
        this.soundEnabled.forEach((soundForSeverity) => {
            if (!!soundForSeverity) activated = true;
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
