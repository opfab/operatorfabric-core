/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * Copyright (c) 2023, Alliander (http://www.alliander.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component} from '@angular/core';
import {AlertMessageService} from 'app/business/services/alert-message.service';
import {TranslationService} from 'app/business/services/translation.service';
import {AlertView} from 'app/business/view/core/alert/alert.view';
import {AlertPage} from 'app/business/view/core/alert/alertPage';
import {ConfigService} from "../../../business/services/config.service";


@Component({
    selector: 'of-alert',
    styleUrls: ['./alert.component.scss'],
    templateUrl: './alert.component.html'
})
export class AlertComponent  {

    public alertView: AlertView;
    public alertPage : AlertPage;

    constructor(
        alertMessageService: AlertMessageService,
        configService: ConfigService,
        translationService: TranslationService
    ) {
        this.alertView = new AlertView(configService,alertMessageService,translationService);
        this.alertPage = this.alertView.getAlertPage();
    }


}




