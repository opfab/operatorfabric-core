/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
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
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {MultiSelectModule} from '../share/multi-select/multi-select.module';

@NgModule({
    declarations: [SettingsComponent],
    imports: [CommonModule, FormsModule, ReactiveFormsModule, SettingsRoutingModule, TranslateModule, MultiSelectModule]
})
export class SettingsModule {}
