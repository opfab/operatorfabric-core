/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {BaseSettingDirective} from '../base-setting/base-setting.directive';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {FormControl, FormGroup} from '@angular/forms';
import {ConfigService} from 'app/business/services/config.service';
import {SettingsService} from '@ofServices/settings.service';
import {OpfabLoggerService} from '@ofServices/logs/opfab-logger.service';

@Component({
    selector: 'of-checkbox-setting',
    templateUrl: './checkbox-setting.component.html',
    styleUrls: ['./checkbox-setting.component.scss']
})
export class CheckboxSettingComponent extends BaseSettingDirective implements OnInit, OnDestroy {
    @Input() public labelClass: string;
    @Input() public name: string;
    @Input() public checked: boolean;

    constructor(
        protected store: Store<AppState>,
        protected configService: ConfigService,
        protected settingsService: SettingsService,
        protected logger: OpfabLoggerService
    ) {
        super(store, configService, settingsService,logger);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    initFormGroup() {
        return new FormGroup(
            {
                setting: new FormControl('')
            },
            {updateOn: 'change'}
        );
        // No need for validators are the checkbox input type can only create boolean values
    }

    updateValue(value) {
        // Undefined or null value means the user does not have made a choice for his settings, so we set the input value "checked" (default value)
        if (value === null || value === undefined) this.form.get('setting').setValue(this.checked, {emitEvent: false});
        else this.form.get('setting').setValue(value, {emitEvent: false});
    }
}
