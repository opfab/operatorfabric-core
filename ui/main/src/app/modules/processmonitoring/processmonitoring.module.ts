/* Copyright (c) 2023, RTE (http://www.rte-france.com)
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
import {ProcessMonitoringComponent} from './processmonitoring.component';
import {CardModule} from '../card/card.module';
import {TranslateModule} from '@ngx-translate/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {DatetimeFilterModule} from '../share/datetime-filter/datetime-filter.module';
import {SimplifiedCardViewModule} from 'app/modules/share/simplified-card-view/simplified-card-view.module';
import {ProcessmonitoringEntryPointComponent} from './processmonitoring-entry-point.component';
import {ArchivesLoggingFiltersModule} from '../share/archives-logging-filters/archives-logging-filters.module';
import {SpinnerModule} from '../share/spinner/spinner.module';
import {ProcessmonitoringTableComponent} from './components/processmonitoring-table/processmonitoring-table.component';
import {AgGridModule} from 'ag-grid-angular';
import {TimeCellRendererComponent} from './components/cell-renderers/time-cell-renderer.component';
import {SenderCellRendererComponent} from './components/cell-renderers/sender-cell-renderer.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CardModule,
        TranslateModule,
        NgbModule,
        DatetimeFilterModule,
        SimplifiedCardViewModule,
        ArchivesLoggingFiltersModule,
        SpinnerModule,
        AgGridModule
    ],
    declarations: [ProcessMonitoringComponent, ProcessmonitoringTableComponent, ProcessmonitoringEntryPointComponent,
        TimeCellRendererComponent,
        SenderCellRendererComponent]
})
export class ProcessmonitoringModule {}
