/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CardsModule} from '../cards/cards.module';
import {TranslateModule} from '@ngx-translate/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {MonitoringComponent} from './monitoring.component';
import { MonitoringFiltersComponent } from './components/monitoring-filters/monitoring-filters.component';
import { MonitoringTableComponent } from './components/monitoring-table/monitoring-table.component';
import {DatetimeFilterModule} from '../../modules/share/datetime-filter/datetime-filter.module';
import {AppRoutingModule} from '../../app-routing.module';
import {MultiFilter2Module} from '../../modules/share/multi-filter-2/multi-filter-2.module';



@NgModule({
  declarations: [
      MonitoringComponent,
      MonitoringFiltersComponent,
      MonitoringTableComponent
  ],
  imports: [
    CommonModule
      , FormsModule
      , ReactiveFormsModule
      , CardsModule
      , TranslateModule
      , NgbModule
      , DatetimeFilterModule
      , AppRoutingModule
      , MultiFilter2Module
  ]
})
export class MonitoringModule { }
