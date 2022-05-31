/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {NgModule} from '@angular/core';
import {PreloadAllModules, Router, RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './modules/login/login.component';
import {LoggingEntryPointComponent} from './modules/logging/logging-entry-point.component';
import {MonitoringComponent} from './modules/monitoring/monitoring.component';
import {CalendarComponent} from './modules/calendar/calendar.component';
import {ArchivesEntryPointComponent} from './modules/archives/archives-entry-point.component';

const defaultPath = '/feed';
const archivePath = 'archives';

const routes: Routes = [
    {
        path: 'feed',
        loadChildren: () => import('./modules/feed/feed.module').then((m) => m.FeedModule)
    },
    {
        path: 'archives',
        component: ArchivesEntryPointComponent
    },
    {
        path: 'monitoring',
        component: MonitoringComponent
    },
    {
        path: 'logging',
        component: LoggingEntryPointComponent
    },
    {
        path: 'calendar',
        component: CalendarComponent
    },
    {
        path: 'businessconfigparty',
        loadChildren: () =>
            import('./modules/businessconfigparty/businessconfigparty.module').then((m) => m.BusinessconfigpartyModule)
    },
    {
        path: 'settings',
        loadChildren: () => import('./modules/settings/settings.module').then((m) => m.SettingsModule)
    },
    {
        path: 'navbar',
        component: LoginComponent
    },
    {
        path: 'admin',
        loadChildren: () => import('./modules/admin/admin.module').then((m) => m.AdminModule)
    },
    {
        path: 'realtimeusers',
        loadChildren: () => import('./modules/realtimeusers/realtimeusers.module').then((m) => m.RealtimeusersModule)
    },
    {
        path: 'activityarea',
        loadChildren: () => import('./modules/activityarea/activityarea.module').then((m) => m.ActivityareaModule)
    },
    {
        path: 'feedconfiguration',
        loadChildren: () =>
            import('./modules/feedconfiguration/feedconfiguration.module').then((m) => m.FeedconfigurationModule)
    },
    {
        path: 'changepassword',
        loadChildren: () => import('./modules/changepassword/changepassword.module').then((m) => m.ChangepasswordModule)
    },
    {
        path: 'externaldevicesconfiguration',
        loadChildren: () =>
            import('./modules/externaldevicesconfiguration/externaldevicesconfiguration.module').then(
                (m) => m.ExternaldevicesModule
            )
    },
    {path: '**', redirectTo: defaultPath}
];
const startIndex = 0;
const numberOfHiddenRoutes = 10; // 'Calendar', 'businessconfigparty', 'settings', 'navbar', 'admin', 'realtimeusers', 'activityarea', 'feedconfiguration', 'changepassword', 'externaldevicesconfiguration'
const manageIndexesWhichBeginAtZero = 1;
const numberOfRoutes = routes.length;
const lastIndexOfVisibleElements = numberOfRoutes - numberOfHiddenRoutes - manageIndexesWhichBeginAtZero;
export const navigationRoutes: Routes = routes.slice(startIndex, lastIndexOfVisibleElements);

/**
 * Redirect the page to the same place.
 * Useful for page refresh action
 * @param currentRouter - the router configured in the object calling this function
 */
export function redirectToCurrentLocation(currentRouter: Router): void {
    const pathname = window.location.hash;
    const hashLength = pathname.length;
    const destination = hashLength > 2 ? pathname.substring(1, hashLength) : defaultPath;
    // as archive searches are not stored need to got back to archives root path
    const lastDestination = destination.includes(archivePath) ? archivePath : destination;
    currentRouter.navigate([lastDestination]);
}

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
            relativeLinkResolution: 'legacy'
        })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {}
