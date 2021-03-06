/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SettingsRoutingModule} from './settings-routing.module';
import {SettingsComponent} from './components/settings/settings.component';
import {TextSettingComponent} from './components/settings/text-setting/text-setting.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {ListSettingComponent} from './components/settings/list-setting/list-setting.component';
import {MultiSettingsComponent} from './components/settings/multi-settings/multi-settings.component';
import {TypeAheadSettingsComponent} from './components/settings/type-ahead-settings/type-ahead-settings.component';
import {TypeaheadModule} from 'ngx-type-ahead';
import {CheckboxSettingComponent} from './components/settings/checkbox-setting/checkbox-setting.component';

@NgModule({
    declarations: [SettingsComponent
        , TextSettingComponent
        , ListSettingComponent
        , MultiSettingsComponent
        , TypeAheadSettingsComponent
        , CheckboxSettingComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TypeaheadModule,
        SettingsRoutingModule,
        TranslateModule,
    ]
})
export class SettingsModule {
}
