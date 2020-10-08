/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import { AdminComponent } from './admin.component';
import { OfUsersTableComponent } from './components/ngtable/users/ofuserstable.component';
import { OfGroupsTableComponent } from './components/ngtable/groups/of-groups-table/of-groups-table.component';
import { OfEntitiesTableComponent } from './components/ngtable/entities/of-entities-table/of-entities-table.component';

const routes: Routes = [
    {
        path: '**',
        component: AdminComponent
          //  ,children: [
          //    {
          //               path: 'users',
          //               component: AdminComponent,
          //    },
          //    {
          //               path: 'groups',
          //               component: AdminComponent,
          //    },
          //   // {
          //   //             path: 'entities',
          //   //             component: AdminComponent,
          //   //  }
        // ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule { }
