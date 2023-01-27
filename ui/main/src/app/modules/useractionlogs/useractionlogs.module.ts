/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 *  See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {TranslateModule} from "@ngx-translate/core";
import {AgGridModule} from "ag-grid-angular";
import {AppRoutingModule} from "app/app-routing.module";
import {DatetimeFilterModule} from "../share/datetime-filter/datetime-filter.module";
import {MultiSelectModule} from "../share/multi-select/multi-select.module";
import {UserActionLogsComponent} from "./useractionlogs.component";
import {UserActionLogsTableComponent} from "./components/useractionlogs-table/useractionlogs-table.component";
import {UserActionLogsFiltersComponent} from "./components/useractionlogs-filters/useractionlogs-filters.component";
import {SpinnerModule} from '../share/spinner/spinner.module';

@NgModule({
    declarations: [UserActionLogsComponent, UserActionLogsTableComponent, UserActionLogsFiltersComponent],
    imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    NgbModule,
    SpinnerModule,
    DatetimeFilterModule,
    AppRoutingModule,
    MultiSelectModule,
    AgGridModule]
})
export class UserActionLogsModule {}
