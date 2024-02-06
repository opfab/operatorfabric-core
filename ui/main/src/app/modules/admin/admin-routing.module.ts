/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {NgModule} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivateFn, RouterModule, RouterStateSnapshot, Routes} from '@angular/router';
import {AdminComponent} from './admin.component';
import {UsersTableComponent} from './components/table/users-table.component';
import {GroupsTableComponent} from './components/table/groups-table.component';
import {EntitiesTableComponent} from './components/table/entities-table.component';
import {PerimetersTableComponent} from './components/table/perimeters-table.component';
import {ProcessesTableComponent} from './components/table/processes-table.component';
import {BusinessDataTableComponent} from './components/table/businessData-table.component';
import {SupervisedEntitiesTableComponent} from './components/table/supervised-entities-table.component';
import {UserService} from 'app/business/services/users/user.service';
import {PermissionEnum} from '@ofModel/permission.model';

const defaultPath = 'users';

const canActivateAdmin: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    return UserService.hasCurrentUserAnyPermission([PermissionEnum.ADMIN]);
};

const canActivateAdminBusinessProcess: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    return UserService.hasCurrentUserAnyPermission([PermissionEnum.ADMIN, PermissionEnum.ADMIN_BUSINESS_PROCESS]);
};

const routes: Routes = [
    {
        path: '',
        component: AdminComponent,
        children: [
            {
                path: 'users',
                canActivate: [canActivateAdmin],
                component: UsersTableComponent
            },
            {
                path: 'entities',
                canActivate: [canActivateAdmin],
                component: EntitiesTableComponent
            },
            {
                path: 'groups',
                canActivate: [canActivateAdmin],
                component: GroupsTableComponent
            },
            {
                path: 'perimeters',
                canActivate: [canActivateAdmin],
                component: PerimetersTableComponent
            },
            {
                path: 'processes',
                component: ProcessesTableComponent
            },
            {
                path: 'businessData',
                canActivate: [canActivateAdminBusinessProcess],
                component: BusinessDataTableComponent
            },
            {
                path: 'supervisedEntities',
                canActivate: [canActivateAdmin],
                component: SupervisedEntitiesTableComponent
            },
            {path: '**', redirectTo: defaultPath}
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule {}
