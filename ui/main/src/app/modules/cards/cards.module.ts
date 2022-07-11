/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CardDetailsComponent} from './components/card-details/card-details.component';
import {DetailComponent} from './components/detail/detail.component';
import {TranslateModule} from '@ngx-translate/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {CountDownModule} from '../share/countdown/countdown.module';
import {UserCardModule} from '../usercard/usercard.module';
import {SingleFilterModule} from '../share/single-filter/single-filter.module';
import {ReactiveFormsModule} from '@angular/forms';
import { SpinnerModule } from '../share/spinner/spinner.module';

@NgModule({
    declarations: [CardDetailsComponent, DetailComponent],
    imports: [
        CommonModule,
        CountDownModule,
        TranslateModule,
        NgbModule,
        UserCardModule,
        SingleFilterModule,
        ReactiveFormsModule,
        SpinnerModule
    ],
    exports: [CardDetailsComponent, DetailComponent]
})
export class CardsModule {}
