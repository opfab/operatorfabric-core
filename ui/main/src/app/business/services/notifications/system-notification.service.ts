/* Copyright (c) 2023, Alliander (http://www.alliander.com)
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from "@angular/core";
import {LightCard, Severity} from "@ofModel/light-card.model";
import {merge, Subject} from "rxjs";
import {LightCardsFeedFilterService} from "../lightcards/lightcards-feed-filter.service";
import {LightCardsStoreService} from "../lightcards/lightcards-store.service";
import {ConfigService} from "../config.service";
import {LogOption, OpfabLoggerService} from "../logs/opfab-logger.service";
import {Router} from "@angular/router";
import {filter} from "rxjs/operators";
import {MessageLevel} from "@ofModel/message.model";
import {AlertMessageService} from "../alert-message.service";

@Injectable({
    providedIn: 'root'
})
export class SystemNotificationService {
    private static RECENT_THRESHOLD = 4000;

    private systemNotificationConfigBySeverity: Map<Severity, string>;
    private systemNotificationEnabled: Map<Severity, boolean>;
    private incomingCardOrReminder = new Subject();
    private lastSentCardId: string;
    private alertMessageService: AlertMessageService;

    constructor(
        private lightCardsFeedFilterService: LightCardsFeedFilterService,
        private lightCardsStoreService: LightCardsStoreService,
        private configService: ConfigService,
        private logger: OpfabLoggerService,
        private router: Router
    ) {
        this.alertMessageService = AlertMessageService.getInstance();
    }

    public initSystemNotificationService() {
        this.systemNotificationConfigBySeverity = new Map<Severity, string>();
        this.systemNotificationConfigBySeverity.set(Severity.ALARM, 'settings.systemNotificationAlarm');
        this.systemNotificationConfigBySeverity.set(Severity.ACTION, 'settings.systemNotificationAction');
        this.systemNotificationConfigBySeverity.set(Severity.COMPLIANT, 'settings.systemNotificationCompliant');
        this.systemNotificationConfigBySeverity.set(Severity.INFORMATION, 'settings.systemNotificationInformation');

        this.systemNotificationEnabled = new Map<Severity, boolean>();
        this.systemNotificationConfigBySeverity.forEach((systemNotificationConfig, severity) => {
            this.configService.getConfigValueAsObservable(systemNotificationConfig, false).subscribe((x) => {
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

    private isAtLeastOneSeverityEnabled(): boolean {
        for (const entry of this.systemNotificationEnabled.entries()) {
            if (entry[1]) {
                return true;
            }
        }
        return false;
    }

    public requestPermissionForSystemNotification() {
        if (Notification.permission === "default") {
            Notification.requestPermission();
        } else {
            if (Notification.permission === "denied") {
                this.alertMessageService.sendAlertMessage({
                    message: null,
                    level: MessageLevel.BUSINESS,
                    i18n: {key: 'settings.systemNotificationsDisabledInBrowser'}
                });
            }
        }
    }

    listenForCardUpdate() {
        this.lightCardsStoreService.getNewLightCards().subscribe((lightCard) => this.handleLoadedCard(lightCard));
    }

    public handleRemindCard(card: LightCard) {
        if (this.lightCardsFeedFilterService.isCardVisibleInFeed(card)) this.incomingCardOrReminder.next(card);
    }

    public handleLoadedCard(lightCard: LightCard) {
        if (lightCard.id === this.lastSentCardId)
            this.lastSentCardId = ''; // no system notification as the card was sent by the current user
        else {
            if (this.checkCardIsRecent(lightCard)) {
                this.incomingCardOrReminder.next(lightCard);
            }
        }
    }

    public lastSentCard(cardId: string) {
        this.lastSentCardId = cardId;
    }

    private checkCardIsRecent(card: LightCard): boolean {
        return new Date().getTime() - card.publishDate <= SystemNotificationService.RECENT_THRESHOLD;
    }

    private initSystemNotificationForSeverity(severity: Severity) {
        merge(
            this.incomingCardOrReminder.pipe(
                filter((card: LightCard) => card.severity === severity)
            ),
        ).subscribe((lightCard) => {
            this.notifyIfSeverityEnabled(severity, lightCard);
        })
    }

    private notifyIfSeverityEnabled(severity: Severity, lightCard: LightCard) {
        if (this.systemNotificationEnabled.get(severity)) {
            this.logger.debug(new Date().toISOString() + ' Send system notification')
            this.sendSystemNotificationMessage(lightCard);
        } else {
            this.logger.debug('No system notification was sent for ' + severity + ' as system notification is disabled for this severity', LogOption.LOCAL);
        }
    }

    sendSystemNotificationMessage(lightCard: LightCard) {
        const severity = lightCard.severity.toString();
        const systemNotificationOptions = {
            body: `${lightCard.titleTranslated.toUpperCase()} \n ${lightCard.summaryTranslated}`
        }
        const systemNotification = new Notification(severity, systemNotificationOptions);
        systemNotification.onclick = () => {
            systemNotification.close();
            window.parent.focus();
            this.router.navigate(['/feed/cards/', lightCard.id]);
        }
    }
}
