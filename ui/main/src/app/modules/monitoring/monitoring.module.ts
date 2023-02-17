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
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CardModule} from '../card/card.module';
import {TranslateModule} from '@ngx-translate/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {MonitoringComponent} from './monitoring.component';
import {MonitoringFiltersComponent} from './components/monitoring-filters/monitoring-filters.component';
import {MonitoringTableComponent} from './components/monitoring-table/monitoring-table.component';
import {DatetimeFilterModule} from '../../modules/share/datetime-filter/datetime-filter.module';
import {AppRoutingModule} from '../../router/app-routing.module';
import {TimelineButtonsModule} from '../share/timeline-buttons/timeline-buttons.module';
import {AgGridModule} from 'ag-grid-angular';
import {AnswerCellRendererComponent} from './components/cell-renderers/answer-cell-renderer.component';
import {ResponsesCellRendererComponent} from './components/cell-renderers/responses-cell-renderer.component';
import {MultiSelectModule} from '../share/multi-select/multi-select.module';

@NgModule({
    declarations: [
        MonitoringComponent,
        MonitoringFiltersComponent,
        MonitoringTableComponent,
        AnswerCellRendererComponent,
        ResponsesCellRendererComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CardModule,
        TranslateModule,
        NgbModule,
        DatetimeFilterModule,
        AppRoutingModule,
        MultiSelectModule,
        TimelineButtonsModule,
        AgGridModule
    ]
})
export class MonitoringModule {}
