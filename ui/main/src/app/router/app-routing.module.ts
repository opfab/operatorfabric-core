/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {LoginComponent} from '../modules/core/application-loading/login/login.component';
import {MonitoringComponent} from '../modules/monitoring/monitoring.component';
import {CalendarComponent} from '../modules/calendar/calendar.component';
import {UserActionLogsComponent} from '../modules/useractionlogs/useractionlogs.component';
import {DashboardComponent} from 'app/modules/dashboard/dashboard.component';
import {ArchivesComponent} from '../modules/archives/archives.component';
import {LoggingComponent} from '../modules/logging/logging.component';
import {ProcessMonitoringComponent} from '../modules/processmonitoring/processmonitoring.component';
import {RichTextComponent} from 'app/modules/devtools/richtext/richtext.component';
import {RealtimeusersComponent} from 'app/modules/realtimeusers/realtimeusers.component';
import {ChangepasswordComponent} from 'app/modules/changepassword/changepassword.component';

// !!! WARNING !!!
//  WHEN MODIFYING THE CODE
//  DO NOT USE path starting with "state" as it is a reserved path for implicit authentication mode

const routes: Routes = [
    {
        path: 'feed',
        loadChildren: () => import('../modules/feed/feed-routing')
    },
    {
        path: 'archives',
        component: ArchivesComponent
    },
    {
        path: 'monitoring',
        component: MonitoringComponent
    },
    {
        path: 'dashboard',
        component: DashboardComponent
    },
    {
        path: 'logging',
        component: LoggingComponent
    },
    {
        path: 'processmonitoring',
        component: ProcessMonitoringComponent
    },
    {
        path: 'calendar',
        component: CalendarComponent
    },
    {
        path: 'businessconfigparty',
        loadChildren: () => import('../modules/businessconfigparty/businessconfigparty-routing')
    },
    {
        path: 'settings',
        loadChildren: () => import('../modules/settings/settings-routing')
    },
    {
        path: 'navbar',
        component: LoginComponent
    },
    {
        path: 'admin',
        loadChildren: () => import('../modules/admin/admin-routing')
    },
    {
        path: 'realtimeusers',
        component: RealtimeusersComponent
    },
    {
        path: 'activityarea',
        loadChildren: () => import('../modules/activityarea/activityarea-routing')
    },
    {
        path: 'feedconfiguration',
        loadChildren: () => import('../modules/notificationconfiguration/notificationconfiguration-routing')
    },
    {
        path: 'changepassword',
        component: ChangepasswordComponent
    },
    {
        path: 'externaldevicesconfiguration',
        loadChildren: () => import('../modules/externaldevicesconfiguration/externaldevicesconfiguration-routing')
    },
    {
        path: 'useractionlogs',
        component: UserActionLogsComponent
    },
    {
        path: 'devtools/richtext',
        component: RichTextComponent
    }
];
const startIndex = 0;
const numberOfHiddenRoutes = 11; // 'Calendar', 'businessconfigparty', 'settings', 'navbar', 'admin', 'realtimeusers', 'activityarea', 'feedconfiguration', 'changepassword', 'externaldevicesconfiguration', 'useractionlogs'
const manageIndexesWhichBeginAtZero = 1;
const numberOfRoutes = routes.length;
const lastIndexOfVisibleElements = numberOfRoutes - numberOfHiddenRoutes - manageIndexesWhichBeginAtZero;
export const navigationRoutes: Routes = routes.slice(startIndex, lastIndexOfVisibleElements);

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            enableTracing: false,
            preloadingStrategy: PreloadAllModules,
            /* sets initialNavigation to false is needed to enable authentication implicit flow
             * otherwise HashLocationStrategy breaks it by handling '#' within `window.location`.
             */
            /* sets initialNavigation to false is needed to enable authentication implicit flow
             * otherwise HashLocationStrategy breaks it by handling '#' within `window.location`.
             */
            initialNavigation: 'disabled',

            // required to reload external application when user click again on the same link
            // see https://github.com/opfab/operatorfabric-core/issues/4509
            onSameUrlNavigation: 'reload'
        })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {}
