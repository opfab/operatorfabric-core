/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {AlertMessageService} from 'app/business/services/alert-message.service';
import {ConfigService} from 'app/business/services/config.service';
import {AlertPage} from './alertPage';
import {Message, MessageLevel} from '@ofModel/message.model';
import {TranslationService} from 'app/business/services/translation.service';

export class AlertView {
    private alertMessageBusinessAutoClose: boolean;
    private alertPage: AlertPage;
    private lastMessageDate : number;

    constructor(private configService: ConfigService, private alertMessageService: AlertMessageService, private translationService: TranslationService) {
        this.alertMessageBusinessAutoClose = this.configService.getConfigValue('alertMessageBusinessAutoClose', false);
        this.alertPage = new AlertPage();
        this.alertPage.style = 'top: 0';
        if (this.configService.getConfigValue('alertMessageOnBottomOfTheScreen', false))
            this.alertPage.style = 'bottom: 0';
        alertMessageService.getAlertMessage().subscribe((message: Message) => this.processAlertMessage(message));
    }

    private processAlertMessage(message: Message) {
        this.alertPage.display = true;
        if (message.i18n) this.alertPage.message = this.translationService.getTranslation(message.i18n.key,message.i18n.parameters);
        else this.alertPage.message = message.message;
        this.alertPage.backgroundColor = this.getBackgroundColor(message.level);
        this.lastMessageDate = new Date().valueOf();
        if (message.level !== MessageLevel.BUSINESS || this.alertMessageBusinessAutoClose)
            setTimeout(() => {
                // to avoid closing a message which replace a previous one
                if (new Date().valueOf() - this.lastMessageDate >= 5000) this.alertPage.display = false;
            }, 5000);
    }

    private getBackgroundColor(messageLevel: MessageLevel) {
        switch (messageLevel) {
            case MessageLevel.DEBUG:
                return '#0070da';
            case MessageLevel.INFO:
                return '#67a854';
            case MessageLevel.ERROR:
                return '#e87a08';
            case MessageLevel.BUSINESS:
                return '#a71a1a';
            default:
                return '#0070da';
        }
    }

    public getAlertPage(): AlertPage {
        return this.alertPage;
    }

    public closeAlert() {
        this.alertPage.display = false;
    }
}
