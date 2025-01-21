/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * Copyright (c) 2023, Alliander (http://www.alliander.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component} from '@angular/core';
import {AlertView} from 'app/views/core/alert/alert.view';
import {AlertPage} from 'app/views/core/alert/alertPage';
import {NgIf} from '@angular/common';

@Component({
    selector: 'of-alert',
    styleUrls: ['./alert.component.scss'],
    templateUrl: './alert.component.html',
    standalone: true,
    imports: [NgIf]
})
export class AlertComponent {
    public alertView: AlertView;
    public alertPage: AlertPage;

    constructor() {
        this.alertView = new AlertView();
        this.alertPage = this.alertView.getAlertPage();
    }
}
