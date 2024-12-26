/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {LightCard, Severity} from '@ofModel/light-card.model';
import {Notification} from '@ofServices/notifications/model/ExternalDevices';
import {EMPTY, iif, merge, of, Subject, timer} from 'rxjs';
import {filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {ExternalDevicesService} from '@ofServices/notifications/ExternalDevicesService';
import {ConfigService} from 'app/services/config/ConfigService';
import {LogOption, LoggerService as logger} from 'app/services/logs/LoggerService';
import {AlertMessageService} from '@ofServices/alerteMessage/AlertMessageService';
import {MessageLevel} from '@ofServices/alerteMessage/model/Message';
import {SoundServer} from '@ofServices/notifications/server/SoundServer';
import {OpfabStore} from 'app/business/store/opfabStore';
import {ModalService} from '../modal/ModalService';
import {I18n} from '@ofModel/i18n.model';
import {NotificationDecision} from './NotificationDecision';

@Injectable({
    providedIn: 'root'
})
export class SoundNotificationService {
    /* The subscription used by the front end to get cards to display in the feed from the backend doesn't distinguish
     * between old cards loaded from the database and new cards arriving through the notification broker.
     * In addition, the getCardOperation observable on which this sound notification is hooked will also emit events
     * every time the subscription changes (= every time the feed time filters are changed). So to only notify cards
     * once (and only new cards), sounds will only be played for a given card if the elapsed time since its publishDate
     * is below this threshold. */

    private static readonly DEFAULT_REPLAY_INTERVAL = 5; // in seconds
    private static readonly SECONDS_TO_MILLISECONDS = 1000;
    private static replayInterval: number;

    private static soundConfigBySeverity: Map<Severity, SoundConfig>;
    private static playSoundOnExternalDevice: boolean;
    private static replayEnabled: boolean;

    private static readonly incomingCard = new Subject();
    private static readonly sessionEnd = new Subject();
    private static readonly clearSignal = new Subject();
    private static readonly ngUnsubscribe$ = new Subject<void>();
    private static isServiceActive = true;

    private static soundServer: SoundServer;
    private static doNotAlertForHiddenCardReceived: boolean;

    public static setSoundServer(soundServer: SoundServer) {
        SoundNotificationService.soundServer = soundServer;
    }

    public static stopService() {
        this.isServiceActive = false;
        logger.info('Stopping sound service', LogOption.LOCAL_AND_REMOTE);
        this.clearOutstandingNotifications();
    }

    public static initSoundService() {
        // use to have access from cypress to the current object for stubbing method playSound
        if (window['Cypress']) window['soundNotificationService'] = this;
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

        this.soundConfigBySeverity.forEach((soundConfig, severity) => {
            ConfigService.getConfigValueAsObservable(soundConfig.soundEnabledSetting, false).subscribe((x) => {
                NotificationDecision.setSoundEnabledForSeverity(severity, x);
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
        this.activateBrowserSoundIfNotActivated();
        for (const severity of Object.values(Severity)) this.initSoundPlayingForSeverity(severity);
        this.initSoundPlayingForSessionEnd();
        SoundNotificationService.doNotAlertForHiddenCardReceived = ConfigService.getConfigValue(
            'alerts.doNotAlertForHiddenCardReceived',
            false
        );

        this.listenForCardUpdate();
    }

    // Some browsers have an autoplay policy that prevents sounds from playing until the user interacts with the app.
    // This method is designed to circumvent this restriction by opening a modal, thereby forcing user interaction.
    // Once the user interacts with the modal, the sound can be activated even if the user hasn't interacted with the rest of the app.
    private static activateBrowserSoundIfNotActivated() {
        setTimeout(() => {
            const playSoundOnExternalDevice = SoundNotificationService.getPlaySoundOnExternalDevice();
            if (!playSoundOnExternalDevice && NotificationDecision.isAtLeastOneSoundActivated()) {
                const context = new AudioContext();
                if (context.state !== 'running') {
                    context.resume();
                    logger.info('Sound not activated', LogOption.REMOTE);
                    ModalService.openInformationModal(new I18n('global.activateSoundText')).then(() => {
                        logger.info('Sound activated', LogOption.REMOTE);
                    });
                }
            }
        }, 3000);
    }

    public static getPlaySoundOnExternalDevice(): boolean {
        return ConfigService.getConfigValue('externalDevicesEnabled') && this.playSoundOnExternalDevice;
    }

    private static listenForCardUpdate() {
        OpfabStore.getLightCardStore()
            .getNewLightCards()
            .subscribe((card) => this.handleLoadedCard(card));
        OpfabStore.getLightCardStore()
            .getNewLightChildCards()
            .subscribe((card) => this.handleLoadedChildCard(card));
    }

    public static clearOutstandingNotifications() {
        this.clearSignal.next(null);
        NotificationDecision.setLastUserAction(new Date().valueOf());
    }

    public static handleLoadedCard(card: LightCard) {
        if (NotificationDecision.isSoundToBePlayedForCard(card)) {
            this.incomingCard.next(card);
            if (
                !OpfabStore.getFilteredLightCardStore().isCardVisibleInFeed(card) &&
                !SoundNotificationService.doNotAlertForHiddenCardReceived
            )
                AlertMessageService.sendAlertMessage({
                    message: null,
                    level: MessageLevel.ALARM,
                    i18n: {key: 'feed.hiddenCardReceived'}
                });
        }
    }

    public static handleLoadedChildCard(lightCard: LightCard) {
        if (NotificationDecision.isNotificationNeededForChildCard(lightCard)) {
            const parentCard = OpfabStore.getLightCardStore().getLightCard(lightCard.parentCardId);
            this.incomingCard.next(parentCard);
            if (
                !OpfabStore.getFilteredLightCardStore().isCardVisibleInFeed(parentCard) &&
                !SoundNotificationService.doNotAlertForHiddenCardReceived
            )
                AlertMessageService.sendAlertMessage({
                    message: null,
                    level: MessageLevel.ALARM,
                    i18n: {key: 'feed.hiddenCardReceived'}
                });
        }
    }

    public static handleSessionEnd() {
        if (NotificationDecision.isPlaySoundWhenSessionEndEnabled()) {
            this.sessionEnd.next(null);
        }
    }

    private static getSoundForSeverity(severity: Severity): HTMLAudioElement {
        return this.soundServer.getSound(this.soundConfigBySeverity.get(severity).soundFileName);
    }

    private static playSoundForSeverityEnabled(severity: Severity) {
        if (NotificationDecision.isPlaySoundForSeverityEnabled(severity)) this.playSound(severity);
        else
            logger.debug(
                'No sound was played for ' + severity + ' as sound is disabled for this severity',
                LogOption.LOCAL
            );
    }

    private static playSound(severity: Severity) {
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

    private static initSoundPlayingForSeverity(severity: Severity) {
        merge(
            this.incomingCard.pipe(
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

    private static initSoundPlayingForSessionEnd() {
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

    private static processSignal() {
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
    private static playSoundOnBrowser(sound: HTMLAudioElement) {
        sound.play().catch((error) => {
            logger.warn(
                `Notification sound wasn't played because the user hasn't interacted with the app yet (autoplay policy).`
            );
            /* This is to handle the exception thrown due to the autoplay policy on Chrome. See https://goo.gl/xX8pDD */
        });
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
