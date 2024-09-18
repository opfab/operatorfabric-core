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
import {ConfigService} from '../config.service';
import {LogOption, LoggerService as logger} from '../logs/logger.service';
import {filter} from 'rxjs/operators';
import {MessageLevel} from '@ofModel/message.model';
import {AlertMessageService} from '../alert-message.service';
import {OpfabStore} from 'app/business/store/opfabStore';
import {RouterService} from '../router.service';
import {NotificationDecision} from './notification-decision';

export class SystemNotificationService {
    private static systemNotificationConfigBySeverity: Map<Severity, string>;

    private static incomingCard = new Subject();

    public static initSystemNotificationService() {
        this.systemNotificationConfigBySeverity = new Map<Severity, string>();
        this.systemNotificationConfigBySeverity.set(Severity.ALARM, 'settings.systemNotificationAlarm');
        this.systemNotificationConfigBySeverity.set(Severity.ACTION, 'settings.systemNotificationAction');
        this.systemNotificationConfigBySeverity.set(Severity.COMPLIANT, 'settings.systemNotificationCompliant');
        this.systemNotificationConfigBySeverity.set(Severity.INFORMATION, 'settings.systemNotificationInformation');

        this.systemNotificationConfigBySeverity.forEach((systemNotificationConfig, severity) => {
            ConfigService.getConfigValueAsObservable(systemNotificationConfig, false).subscribe((x) => {
                NotificationDecision.setSystemNotificationEnabledForSeverity(severity, x);
                if (NotificationDecision.isAtLeastOneSystemNotificationSeverityEnabled()) {
                    this.requestPermissionForSystemNotification();
                }
            });
        });

        for (const severity of Object.values(Severity)) {
            this.initSystemNotificationForSeverity(severity);
        }

        this.listenForCardUpdate();
    }

    public static requestPermissionForSystemNotification() {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        } else {
            if (Notification.permission === 'denied') {
                AlertMessageService.sendAlertMessage({
                    message: null,
                    level: MessageLevel.ALARM,
                    i18n: {key: 'settings.systemNotificationsDisabledInBrowser'}
                });
            }
        }
    }

    static listenForCardUpdate() {
        OpfabStore.getLightCardStore()
            .getNewLightCards()
            .subscribe((lightCard) => this.handleLoadedCard(lightCard));
        OpfabStore.getLightCardStore()
            .getNewLightChildCards()
            .subscribe((card) => this.handleLoadedChildCard(card));
    }

    public static handleLoadedCard(lightCard: LightCard) {
        if (NotificationDecision.isSystemNotificationToBeShownForCard(lightCard)) this.incomingCard.next(lightCard);
    }

    public static handleLoadedChildCard(lightCard: LightCard) {
        if (NotificationDecision.isNotificationNeededForChildCard(lightCard)) {
            const parentCard = OpfabStore.getLightCardStore().getLightCard(lightCard.parentCardId);
            this.incomingCard.next(parentCard);
        }
    }

    private static initSystemNotificationForSeverity(severity: Severity) {
        merge(this.incomingCard.pipe(filter((card: LightCard) => card.severity === severity))).subscribe(
            (lightCard) => {
                this.notifyIfSeverityEnabled(severity, lightCard);
            }
        );
    }

    private static notifyIfSeverityEnabled(severity: Severity, lightCard: LightCard) {
        if (NotificationDecision.isSystemNotificationEnabledForSeverity(severity)) {
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
