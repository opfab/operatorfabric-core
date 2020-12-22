/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {NgModule} from '@angular/core';
import {PreloadAllModules, Router, RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './components/login/login.component';
import {AboutComponent} from './modules/about/about.component';
import {LoggingComponent} from './modules/logging/logging.component';
import {MonitoringComponent} from './modules/monitoring/monitoring.component';
import {CalendarComponent} from './modules/calendar/calendar.component';
import { ArchivesEntryPointComponent } from './modules/archives/archives-entry-point.component'

const defaultPath = '/feed';
const archivePath = 'archives';

const routes: Routes = [
    {
        path: 'feed',
        loadChildren: () => import('./modules/feed/feed.module').then(m => m.FeedModule),
    },
    {
        path: 'usercard',
        loadChildren: () => import('./modules/usercard/usercard.module').then(m => m.UserCardModule),
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
        component: LoggingComponent
    },
    {
        path: 'calendar',
        component: CalendarComponent
    },
    {
        path: 'businessconfigparty',
        loadChildren: () => import('./modules/businessconfigparty/businessconfigparty.module').then(m => m.BusinessconfigpartyModule),
    },
    {
        path: 'settings',
        loadChildren: () => import('./modules/settings/settings.module').then(m => m.SettingsModule),
    },
    {
        path: 'navbar',
        component: LoginComponent
    },
    {
        path: 'about',
        component: AboutComponent
    },
    {
        path: 'admin',
         loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule),
    },
    {
        path: 'feedconfiguration',
        loadChildren: () => import('./modules/feedconfiguration/feedconfiguration.module').then(m => m.FeedconfigurationModule),
    },
    {   path: '**',
        redirectTo: defaultPath
    }
];
// TODO manage visible path more gently
const startIndex = 0;
const numberOfHiddenRoutes = 6 ; // 'businessconfigparty', 'settings', 'navbar', 'admin', 'about', 'feedconfiguration'
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
    const destination = (hashLength > 2) ? pathname.substr(1, hashLength - 1) : defaultPath;
    // as archive searches are not stored need to got back to archives root path
    const lastDestination = (destination.includes(archivePath)) ? archivePath : destination;
    currentRouter.navigate([lastDestination]);
}

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            enableTracing: false, preloadingStrategy:
            PreloadAllModules,
            /* sets initialNavigation to false is needed to enable authentication implicit flow
            * otherwise HashLocationStrategy breaks it by handling '#' within `window.location`.
            */
            initialNavigation: false
        })],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
