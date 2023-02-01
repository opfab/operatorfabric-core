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
import {LoggingComponent} from './logging.component';
import {CardModule} from '../card/card.module';
import {TranslateModule} from '@ngx-translate/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {DatetimeFilterModule} from '../share/datetime-filter/datetime-filter.module';
import {SimplifiedCardViewModule} from 'app/modules/share/simplified-card-view/simplified-card-view.module';
import {LoggingEntryPointComponent} from './logging-entry-point.component';
import {ArchivesLoggingFiltersModule} from '../share/archives-logging-filters/archives-logging-filters.module';
import {SpinnerModule} from '../share/spinner/spinner.module';
import {LoggingTableComponent} from './components/logging-table/logging-table.component';
import {AgGridModule} from 'ag-grid-angular';
import {TimeCellRendererComponent} from './components/cell-renderers/time-cell-renderer.component';
import {ProcessGroupCellRendererComponent} from './components/cell-renderers/process-group-cell-renderer.component';
import {StateCellRendererComponent} from './components/cell-renderers/state-cell-renderer.component';
import {StateDescriptionCellRendererComponent} from './components/cell-renderers/state-description-cell-renderer.component';
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
    declarations: [LoggingComponent, LoggingTableComponent, LoggingEntryPointComponent,
        TimeCellRendererComponent, ProcessGroupCellRendererComponent, StateCellRendererComponent,
        StateDescriptionCellRendererComponent, SenderCellRendererComponent]
})
export class LoggingModule {}
