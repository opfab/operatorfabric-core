/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {NgModule} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivateFn, RouterModule, RouterStateSnapshot, Routes} from '@angular/router';
import {ExternaldevicesconfigurationComponent} from './externaldevicesconfiguration.component';
import {DevicesTableComponent} from './table/devices.table.component';
import {UsersTableComponent} from './table/users.table.component';
import {PermissionEnum} from '@ofModel/permission.model';
import {UserService} from 'app/business/services/users/user.service';

const defaultPath = 'devices';

const canActivateAdmin: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    return UserService.hasCurrentUserAnyPermission([PermissionEnum.ADMIN]);
};

const routes: Routes = [
    {
        path: '',
        canActivate: [canActivateAdmin],
        component: ExternaldevicesconfigurationComponent,

        children: [
            {
                path: 'devices',
                component: DevicesTableComponent
            },
            {
                path: 'users',
                component: UsersTableComponent
            },

            {path: '**', redirectTo: defaultPath}
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ExternaldevicesconfigurationRoutingModule {}
