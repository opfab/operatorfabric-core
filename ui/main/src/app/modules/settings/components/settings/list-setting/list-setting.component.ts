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
import {ConfigService} from 'app/business/services/config.service';
import {SettingsService} from 'app/business/services/settings.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MultiSelectConfig} from '@ofModel/multiselect.model';
import {OpfabLoggerService} from 'app/business/services/logs/opfab-logger.service';
import {CurrentUserStore} from 'app/business/store/current-user.store';

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
        protected configService: ConfigService,
        protected settingsService: SettingsService,
        protected currentUserStore: CurrentUserStore,
        protected logger: OpfabLoggerService
        
    ) {
        super(configService, settingsService,currentUserStore,logger);
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
        return new FormGroup(
            {
                setting: new FormControl('',  [Validators.required])
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
