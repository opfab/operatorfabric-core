/* Copyright (c) 2020-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UserCardComponent} from './usercard.component';
import {TranslateModule} from '@ngx-translate/core';
import {SimplifiedCardViewModule} from 'app/modules/share/simplified-card-view/simplified-card-view.module';
import {LightCardModule} from 'app/modules/share/light-card/light-card.module';
import {MultiSelectModule} from '../share/multi-select/multi-select.module';
import {SpinnerModule} from '../share/spinner/spinner.module';

@NgModule({
    declarations: [UserCardComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule,
        MultiSelectModule,
        SimplifiedCardViewModule,
        LightCardModule,
        SpinnerModule
    ],
    exports: [UserCardComponent]
})
export class UserCardModule {}
