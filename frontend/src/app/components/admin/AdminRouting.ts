/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Routes} from '@angular/router';
import {AdminComponent} from './AdminComponent';
import {UsersTableComponent} from './components/table/UsersTableComponent';
import {GroupsTableComponent} from './components/table/GroupsTableComponent';
import {EntitiesTableComponent} from './components/table/EntitiesTableComponent';
import {PerimetersTableComponent} from './components/table/PerimetersTableComponent';
import {ProcessesTableComponent} from './components/table/ProcessesTableComponent';
import {BusinessDataTableComponent} from './components/table/BusinessDataTableComponent';
import {SupervisedEntitiesTableComponent} from './components/table/SupervisedEntitiesTableComponent';

const defaultPath = 'users';

const routes: Routes = [
    {
        path: '',
        component: AdminComponent,
        children: [
            {
                path: 'users',
                component: UsersTableComponent
            },
            {
                path: 'entities',
                component: EntitiesTableComponent
            },
            {
                path: 'groups',
                component: GroupsTableComponent
            },
            {
                path: 'perimeters',
                component: PerimetersTableComponent
            },
            {
                path: 'processes',
                component: ProcessesTableComponent
            },
            {
                path: 'businessData',
                component: BusinessDataTableComponent
            },
            {
                path: 'supervisedEntities',
                component: SupervisedEntitiesTableComponent
            },
            {path: '**', redirectTo: defaultPath}
        ]
    }
];

export default routes;
