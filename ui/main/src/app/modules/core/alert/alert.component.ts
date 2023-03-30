/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * Copyright (c) 2023, Alliander (http://www.alliander.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnInit} from '@angular/core';
import {Message, MessageLevel} from '@ofModel/message.model';
import {AlertMessageService} from 'app/business/services/alert-message.service';
import {ConfigService} from "../../../business/services/config.service";

class Alert {
    alert: Message;
    display: boolean;
    className: string;
}

@Component({
    selector: 'of-alert',
    styleUrls: ['./alert.component.scss'],
    templateUrl: './alert.component.html'
})
export class AlertComponent implements OnInit {

    alertMessage: Alert = {alert: undefined, className: undefined, display: false};
    alertMessageBusinessAutoClose: boolean;
    alertMessageOnBottomOfTheScreen: boolean;

    constructor(
        private alertMessageService: AlertMessageService,
        private configService: ConfigService
    ) {}

    ngOnInit(): void {
        this.alertMessageBusinessAutoClose = this.configService.getConfigValue('alertMessageBusinessAutoClose', false);
        this.alertMessageOnBottomOfTheScreen = this.configService.getConfigValue('alertMessageOnBottomOfTheScreen', false);

        this.alertMessageService.getAlertMessage()
        .subscribe((alert) => {
            if (!this.alertMessage.display || this.alertMessage.alert.level !== MessageLevel.BUSINESS )
                this.displayAlert(alert);
        });
    }

    private displayAlert(message: Message) {
        let className = '';
        let autoClose = true;
        switch (message.level) {
            case MessageLevel.DEBUG:
                className = 'opfab-alert-debug';
                break;
            case MessageLevel.INFO:
                className = 'opfab-alert-info';
                break;
            case MessageLevel.ERROR:
                className = 'opfab-alert-error';
                break;
            case MessageLevel.BUSINESS:
                className = 'opfab-alert-business';
                autoClose = this.alertMessageBusinessAutoClose;
                break;
            default :
                className = 'opfab-alert-info';
                break;
        }
        this.alertMessage = {
            alert: message,
            className: className,
            display: true
        };
        if (autoClose) {
            setTimeout(() => {
                this.alertMessage.display = false;
            }, 5000);
        }
    }

    closeAlert() {
        this.alertMessage.display = false;
    }

    alertMessagePosition() {
        if (this.alertMessageOnBottomOfTheScreen) {
            return 'bottom: 0';
        } else {
            return 'top: 0';
        }
    }
}




