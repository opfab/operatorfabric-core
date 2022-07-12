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
import {ConfigService} from '@ofServices/config.service';
import {SettingsService} from '@ofServices/settings.service';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {MultiSelectConfig} from '@ofModel/multiselect.model';

@Component({
    selector: 'of-list-setting',
    templateUrl: './list-setting.component.html'
})
export class ListSettingComponent extends BaseSettingDirective implements OnInit, OnDestroy {
    @Input() values:  string [];
    optionList: {value: string; label: string}[];
    selectedOption = new Array();
    multiSelectConfig : MultiSelectConfig;


    constructor(
        protected store: Store<AppState>,
        protected configService: ConfigService,
        protected settingsService: SettingsService
    ) {
        super(store, configService, settingsService);
    }

    ngOnInit() {
        this.multiSelectConfig =  {
            labelKey: 'settings.' + this.settingPath,
            multiple: false,
            search: false,
            sortOptions: true
        };

        this.optionList = [];
        if (this.values) {
            for (const v of this.values) this.optionList.push({value: v, label: v});
        }
        super.ngOnInit();
    }

    initFormGroup() {
        return new UntypedFormGroup(
            {
                setting: new UntypedFormControl('',  [Validators.required])
            },
            {updateOn: 'change'}
        );
    }

    updateValue(value) {
        this.selectedOption[0] = value ? value : '';
    }

    protected isEqual(formA, formB): boolean {
        return formA.setting === formB.setting;
    }


}
