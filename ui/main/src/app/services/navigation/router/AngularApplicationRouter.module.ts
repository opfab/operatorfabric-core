/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from '../../../components/core/application-loading/login/login.component';
import {FeedComponent} from 'app/components/feed/feed.component';
import {CardComponent} from 'app/components/card/card.component';
import {CardBodyComponent} from 'app/components/card/components/card-body/card-body.component';
import {MapComponent} from 'app/components/feed/components/map/map.component';

// !!! WARNING !!!
//  WHEN MODIFYING THE CODE
//  DO NOT USE path starting with "state" as it is a reserved path for implicit authentication mode

const routes: Routes = [
    {
        // Avoid lazy loading otherwise it may cause issues when accessing
        // a card directly via the url (e.g. /feed/cards/1234)
        // see issue #7632
        path: 'feed',
        component: FeedComponent,
        children: [
            {
                path: 'cards',
                children: [
                    {
                        path: '',
                        component: CardComponent
                    },
                    {
                        path: ':cid',
                        component: CardComponent,
                        children: [
                            {
                                path: 'details/:did',
                                component: CardBodyComponent
                            }
                        ]
                    }
                ]
            },
            {
                path: '',
                component: MapComponent
            }
        ]
    },
    {
        path: 'archives',
        loadComponent: () => import('../../../components/archives/archives.component').then((m) => m.ArchivesComponent)
    },
    {
        path: 'monitoring',
        loadComponent: () =>
            import('../../../components/monitoring/monitoring.component').then((m) => m.MonitoringComponent)
    },
    {
        path: 'dashboard',
        loadComponent: () =>
            import('../../../components/dashboard/dashboard.component').then((m) => m.DashboardComponent)
    },
    {
        path: 'logging',
        loadComponent: () => import('../../../components/logging/logging.component').then((m) => m.LoggingComponent)
    },
    {
        path: 'processmonitoring',
        loadComponent: () =>
            import('../../../components/processmonitoring/processmonitoring.component').then(
                (m) => m.ProcessMonitoringComponent
            )
    },
    {
        path: 'calendar',
        loadComponent: () => import('../../../components/calendar/calendar.component').then((m) => m.CalendarComponent)
    },
    {
        path: 'businessconfigparty',
        loadChildren: () => import('../../../components/businessconfigparty/businessconfigparty-routing')
    },
    {
        path: 'settings',
        loadChildren: () => import('../../../components/settings/settings-routing')
    },
    {
        path: 'navbar',
        component: LoginComponent
    },
    {
        path: 'admin',
        loadChildren: () => import('../../../components/admin/admin-routing')
    },
    {
        path: 'realtimeusers',
        loadComponent: () =>
            import('../../../components/realtimeusers/realtimeusers.component').then((m) => m.RealtimeusersComponent)
    },
    {
        path: 'activityarea',
        loadChildren: () => import('../../../components/activityarea/activityarea-routing')
    },
    {
        path: 'feedconfiguration',
        loadChildren: () => import('../../../components/notificationconfiguration/notificationconfiguration-routing')
    },
    {
        path: 'changepassword',
        loadComponent: () =>
            import('../../../components/changepassword/changepassword.component').then((m) => m.ChangepasswordComponent)
    },
    {
        path: 'externaldevicesconfiguration',
        loadChildren: () =>
            import('../../../components/externaldevicesconfiguration/externaldevicesconfiguration-routing')
    },
    {
        path: 'useractionlogs',
        loadComponent: () =>
            import('../../../components/useractionlogs/useractionlogs.component').then((m) => m.UserActionLogsComponent)
    },
    {
        path: 'devtools/richtext',
        loadComponent: () =>
            import('../../../components/devtools/richtext/richtext.component').then((m) => m.RichTextComponent)
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
