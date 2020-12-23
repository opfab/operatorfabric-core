/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
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
import {CardsModule} from '../cards/cards.module';
import {TranslateModule} from '@ngx-translate/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {LoggingTableComponent} from './components/logging-table/logging-table.component';
import {LoggingComponent} from './logging.component';
import {LoggingFiltersComponent} from './components/logging-filters/logging-filters.component';
import {DatetimeFilterModule} from '../../components/share/datetime-filter/datetime-filter.module';
import {MultiFilter2Module} from '../../components/share/multi-filter-2/multi-filter-2.module';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CardsModule,
        TranslateModule,
        NgbModule,
        DatetimeFilterModule,
        MultiFilter2Module
    ],
    declarations: [
    LoggingComponent,
    LoggingTableComponent,
    LoggingFiltersComponent
]
})
export class LoggingModule {
}
