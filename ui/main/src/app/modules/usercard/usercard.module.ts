/* Copyright (c) 2020-2022, RTE (http://www.rte-france.com)
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
import {SingleFilterModule} from '../../modules/share/single-filter/single-filter.module';
import {DatetimeFilterModule} from '../../modules/share/datetime-filter/datetime-filter.module';
import {CardDetailModule} from 'app/modules/share/card-detail/card-detail.module';
import {LightCardModule} from 'app/modules/share/light-card/light-card.module';
import {UserCardDatesFormComponent} from './datesForm/usercard-dates-form.component';
import {UserCardSelectStateFormComponent} from './selectStateForm/usercard-select-state-form.component';
import {UserCardRecipientsFormComponent} from './recipientForm/usercard-recipients-form.component';
import {UsercardSelectCardEmitterFormComponent} from './selectCardEmitterForm/usercard-select-card-emitter-form.component';
import {MultiSelectModule} from '../share/multi-select/multi-select.module';

@NgModule({
    declarations: [
        UserCardComponent,
        UserCardDatesFormComponent,
        UserCardSelectStateFormComponent,
        UserCardRecipientsFormComponent,
        UsercardSelectCardEmitterFormComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule,
        SingleFilterModule,
        DatetimeFilterModule,
        MultiSelectModule,
        CardDetailModule,
        LightCardModule
    ],
    exports: [UserCardComponent]
})
export class UserCardModule {}
