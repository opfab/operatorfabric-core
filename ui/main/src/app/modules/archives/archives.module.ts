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
import {ArchivesRoutingModule} from './archives-routing.module';
import {ArchiveListPageComponent} from './components/archive-list/archive-list-page/archive-list-page.component';
import {ArchivesComponent} from './archives.component';
import {ArchiveListComponent} from './components/archive-list/archive-list.component';
import {ArchiveFiltersComponent} from './components/archive-filters/archive-filters.component';
import {CardsModule} from '../cards/cards.module';
import {TranslateModule} from '@ngx-translate/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {DatetimeFilterModule} from '../../components/share/datetime-filter/datetime-filter.module';
import {MultiFilterModule} from '../../components/share/multi-filter/multi-filter.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ArchivesRoutingModule,
    CardsModule,
    TranslateModule,
    NgbModule
      , DatetimeFilterModule
      , MultiFilterModule

  ],
  declarations: [
    ArchivesComponent,
    ArchiveListComponent,
    ArchiveFiltersComponent,
    ArchiveListPageComponent
  ]
})
export class ArchivesModule { }
