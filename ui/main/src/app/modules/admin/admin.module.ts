/* Copyright (c) 2020, RTEi (http://www.rte-international.com)
 * Copyright (c) 2019-2024, RTE (http://www.rte-france.com)
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
import {AdminComponent} from './admin.component';
import {AdminRoutingModule} from './admin-routing.module';
import {TranslateModule} from '@ngx-translate/core';
import {UsersTableComponent} from './components/table/users-table.component';
import {EditUserModalComponent} from './components/editmodal/users/edit-user-modal.component';
import {EntitiesTableComponent} from './components/table/entities-table.component';
import {GroupsTableComponent} from './components/table/groups-table.component';
import {AgGridModule} from 'ag-grid-angular';
import {ActionCellRendererComponent} from './components/cell-renderers/action-cell-renderer.component';
import {SharingService} from './services/sharing.service';
import {PerimetersTableComponent} from './components/table/perimeters-table.component';
import {ProcessesTableComponent} from './components/table/processes-table.component';
import {StateRightsCellRendererComponent} from './components/cell-renderers/state-rights-cell-renderer.component';
import {RoleCellRendererComponent} from './components/cell-renderers/role-cell-renderer.component';
import {EditEntityModalComponent} from './components/editmodal/entities/edit-entity-modal.component';
import {EditGroupModalComponent} from './components/editmodal/groups/edit-group-modal.component';
import {EditPerimeterModalComponent} from './components/editmodal/perimeters/edit-perimeter-modal.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {TagInputModule} from 'ngx-chips';
import {MultiSelectModule} from '../share/multi-select/multi-select.module';
import {BusinessDataTableComponent} from './components/table/businessData-table.component';
import {SupervisedEntitiesTableComponent} from './components/table/supervised-entities-table.component';
import {EditSupervisedEntityModalComponent} from './components/editmodal/supervised-entities/edit-supervised-entity-modal.component';
import {IdCellRendererComponent} from './components/cell-renderers/id-cell-renderer.component';
import {SignalMappingsCellRendererComponent} from './components/cell-renderers/signal-mappings-cell-renderer.component';

@NgModule({
    declarations: [
        AdminComponent,
        UsersTableComponent,
        EntitiesTableComponent,
        GroupsTableComponent,
        PerimetersTableComponent,
        ProcessesTableComponent,
        BusinessDataTableComponent,
        SupervisedEntitiesTableComponent,
        EditSupervisedEntityModalComponent,
        EditUserModalComponent,
        EditEntityModalComponent,
        EditGroupModalComponent,
        EditPerimeterModalComponent,
        ActionCellRendererComponent,
        StateRightsCellRendererComponent,
        RoleCellRendererComponent,
        IdCellRendererComponent,
        SignalMappingsCellRendererComponent
    ],

    imports: [
        FormsModule,
        ReactiveFormsModule,
        TagInputModule,
        AdminRoutingModule,
        CommonModule,
        MultiSelectModule,
        TranslateModule,
        NgbModule,
        AgGridModule
    ],
    providers: [{provide: SharingService, useClass: SharingService}]
})
export class AdminModule {}
