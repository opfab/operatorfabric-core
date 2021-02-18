/* Copyright (c) 2020, RTEi (http://www.rte-international.com)
 * Copyright (c) 2019-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ErrorHandler, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AdminComponent} from './admin.component';
import {PaginationModule} from 'ngx-bootstrap/pagination';
import {AdminRoutingModule} from './admin-routing.module';
import {TranslateModule} from '@ngx-translate/core';
import {AppErrorHandler} from 'app/common/error/app-error-handler';
import {ConfirmationDialogComponent} from './components/confirmation-dialog/confirmation-dialog.component';
import {EditEntityGroupModalComponent} from './components/editmodal/groups-entities/edit-entity-group-modal.component';
import {UsersTableComponent} from './components/table/users-table.component';
import {EditUserModalComponent} from './components/editmodal/users/edit-user-modal.component';
import {EntitiesTableComponent} from './components/table/entities-table.component';
import {GroupsTableComponent} from './components/table/groups-table.component';
import {AgGridModule} from 'ag-grid-angular';
import {MultiFilterModule} from '../share/multi-filter/multi-filter.module';
import {ArrayCellRendererComponent} from './components/table/array-cell-renderer.component';
import {ActionCellRendererComponent} from './components/table/action-cell-renderer.component';
import {GroupCellRendererComponent} from './components/table/group-cell-renderer.component';
import {EntityCellRendererComponent} from './components/table/entity-cell-renderer.component';
import {SharingService} from './services/sharing.service';

@NgModule({
  declarations: [
    AdminComponent,
    UsersTableComponent,
    EntitiesTableComponent,
    GroupsTableComponent,
    EditUserModalComponent,
    ConfirmationDialogComponent,
    EditEntityGroupModalComponent,
    ActionCellRendererComponent,
    ArrayCellRendererComponent,
    GroupCellRendererComponent,
    EntityCellRendererComponent
  ],


  imports: [
    FormsModule
    , ReactiveFormsModule
    , AdminRoutingModule
    , PaginationModule.forRoot()
    , CommonModule
    , MultiFilterModule
    , TranslateModule
    , AgGridModule.withComponents([[
      ActionCellRendererComponent,
      ArrayCellRendererComponent,
      GroupCellRendererComponent,
      EntityCellRendererComponent
    ]])
  ],
  providers: [
    { provide: ErrorHandler, useClass: AppErrorHandler },
    { provide: SharingService, useClass: SharingService}
  ]
})
export class AdminModule { }

