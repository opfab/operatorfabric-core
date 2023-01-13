/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {BaseSettingDirective} from '../base-setting/base-setting.directive';
import {AppState} from '@ofStore/index';
import {Store} from '@ngrx/store';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ConfigService} from 'app/business/config/config.service';
import {SettingsService} from '@ofServices/settings.service';
import {OpfabLoggerService} from '@ofServices/logs/opfab-logger.service';

@Component({
    selector: 'of-text-setting',
    templateUrl: './text-setting.component.html'
})
export class TextSettingComponent extends BaseSettingDirective implements OnInit, OnDestroy {
    @Input() pattern: string;
    @Input() disabled: boolean;
    @Input() text: string;

    constructor(
        protected store: Store<AppState>,
        protected configService: ConfigService,
        protected settingsService: SettingsService,
        protected logger: OpfabLoggerService
    ) {
        super(store, configService, settingsService,logger);
    }

    initFormGroup() {
        const validators = this.computeTextValidators();
        return new FormGroup(
            {
                setting: new FormControl<string | null>(null, validators)
            },
            {updateOn: 'change'}
        );
    }

    protected computeTextValidators() {
        const validators = [];
        if (this.requiredField) {
            validators.push(Validators.required);
        }
        if (this.pattern) {
            validators.push(Validators.pattern(this.pattern));
        }
        return validators;
    }

    updateValue(value) {
        // Undefined or null value means the user does not have made a choice for his settings, so we set the input value "text" (default value)
        if (value === null || value === undefined) this.form.get('setting').setValue(this.text, {emitEvent: false});
        else this.form.get('setting').setValue(value, {emitEvent: false});
    }

    protected isEqual(formA, formB): boolean {
        return formA.setting === formB.setting;
    }
}
