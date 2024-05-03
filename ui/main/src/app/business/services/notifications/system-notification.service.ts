/* Copyright (c) 2023, Alliander (http://www.alliander.com)
 * Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {LightCard, Severity} from '@ofModel/light-card.model';
import {merge, Subject} from 'rxjs';
import {FilteredLightCardsStore} from '../../store/lightcards/lightcards-feed-filter-store';
import {ConfigService} from '../config.service';
import {LogOption, LoggerService as logger} from '../logs/logger.service';
import {filter} from 'rxjs/operators';
import {MessageLevel} from '@ofModel/message.model';
import {AlertMessageService} from '../alert-message.service';
import {OpfabStore} from 'app/business/store/opfabStore';
import {RouterService} from '../router.service';

export class SystemNotificationService {
    private static RECENT_THRESHOLD = 4000;

    private static systemNotificationConfigBySeverity: Map<Severity, string>;
    private static systemNotificationEnabled: Map<Severity, boolean>;
    private static incomingCardOrReminder = new Subject();
    private static lastSentCardId: string;
    private static filteredLightCardStore: FilteredLightCardsStore = OpfabStore.getFilteredLightCardStore();

    public static initSystemNotificationService() {
        this.systemNotificationConfigBySeverity = new Map<Severity, string>();
        this.systemNotificationConfigBySeverity.set(Severity.ALARM, 'settings.systemNotificationAlarm');
        this.systemNotificationConfigBySeverity.set(Severity.ACTION, 'settings.systemNotificationAction');
        this.systemNotificationConfigBySeverity.set(Severity.COMPLIANT, 'settings.systemNotificationCompliant');
        this.systemNotificationConfigBySeverity.set(Severity.INFORMATION, 'settings.systemNotificationInformation');

        this.systemNotificationEnabled = new Map<Severity, boolean>();
        this.systemNotificationConfigBySeverity.forEach((systemNotificationConfig, severity) => {
            ConfigService.getConfigValueAsObservable(systemNotificationConfig, false).subscribe((x) => {
                this.systemNotificationEnabled.set(severity, x);

                if (this.isAtLeastOneSeverityEnabled()) {
                    this.requestPermissionForSystemNotification();
                }
            });
        });

        for (const severity of Object.values(Severity)) {
            this.initSystemNotificationForSeverity(severity);
        }

        this.listenForCardUpdate();
    }

    private static isAtLeastOneSeverityEnabled(): boolean {
        for (const entry of this.systemNotificationEnabled.entries()) {
            if (entry[1]) {
                return true;
            }
        }
        return false;
    }

    public static requestPermissionForSystemNotification() {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        } else {
            if (Notification.permission === 'denied') {
                AlertMessageService.sendAlertMessage({
                    message: null,
                    level: MessageLevel.BUSINESS,
                    i18n: {key: 'settings.systemNotificationsDisabledInBrowser'}
                });
            }
        }
    }

    static listenForCardUpdate() {
        OpfabStore.getLightCardStore()
            .getNewLightCards()
            .subscribe((lightCard) => this.handleLoadedCard(lightCard));
    }

    public static handleRemindCard(card: LightCard) {
        if (this.filteredLightCardStore.isCardVisibleInFeed(card)) this.incomingCardOrReminder.next(card);
    }

    public static handleLoadedCard(lightCard: LightCard) {
        if (lightCard.id === this.lastSentCardId)
            this.lastSentCardId = ''; // no system notification as the card was sent by the current user
        else {
            if (!lightCard.hasBeenRead && this.checkCardIsRecent(lightCard)) {
                this.incomingCardOrReminder.next(lightCard);
            }
        }
    }

    public static lastSentCard(cardId: string) {
        this.lastSentCardId = cardId;
    }

    public static getLastSentCardId(): string {
        return this.lastSentCardId;
    }

    private static checkCardIsRecent(card: LightCard): boolean {
        return new Date().getTime() - card.publishDate <= SystemNotificationService.RECENT_THRESHOLD;
    }

    private static initSystemNotificationForSeverity(severity: Severity) {
        merge(this.incomingCardOrReminder.pipe(filter((card: LightCard) => card.severity === severity))).subscribe(
            (lightCard) => {
                this.notifyIfSeverityEnabled(severity, lightCard);
            }
        );
    }

    private static notifyIfSeverityEnabled(severity: Severity, lightCard: LightCard) {
        if (this.systemNotificationEnabled.get(severity)) {
            logger.debug(new Date().toISOString() + ' Send system notification');
            this.sendSystemNotificationMessage(lightCard);
        } else {
            logger.debug(
                'No system notification was sent for ' +
                    severity +
                    ' as system notification is disabled for this severity',
                LogOption.LOCAL
            );
        }
    }

    static sendSystemNotificationMessage(lightCard: LightCard) {
        const severity = lightCard.severity.toString();
        const systemNotificationOptions = {
            body: `${lightCard.titleTranslated.toUpperCase()} \n ${lightCard.summaryTranslated}`
        };
        const systemNotification = new Notification(severity, systemNotificationOptions);
        systemNotification.onclick = () => {
            systemNotification.close();
            window.parent.focus();
            RouterService.navigateTo('/feed/cards/' + lightCard.id);
        };
    }
}
