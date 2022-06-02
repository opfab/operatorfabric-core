/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnInit} from '@angular/core';
import {Actions, ofType} from '@ngrx/effects';
import {Message, MessageLevel} from '@ofModel/message.model';
import {AlertActions, AlertActionTypes} from '@ofStore/actions/alert.actions';

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

    constructor(private actions$: Actions) {
    }

    ngOnInit(): void {
        this.actions$
        .pipe(ofType<AlertActions>(AlertActionTypes.AlertMessage))
        .subscribe((alert) => {
            this.displayAlert(alert.payload.alertMessage);
        });
    }

    private displayAlert(message: Message) {
        let className = '';
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
            default :
                className = 'opfab-alert-info';
                break;
        }
        this.alertMessage = {
            alert: message,
            className: className,
            display: true
        };

        setTimeout(() => {
            this.alertMessage.display = false;
        }, 5000);
    }
}




