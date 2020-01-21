/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {NgModule} from '@angular/core';
import {PreloadAllModules, Router, RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './components/login/login.component';

const defaultPath = '/feed';
const archivePath = 'archives';

const routes: Routes = [
    {
        path: 'feed',
        loadChildren: './modules/feed/feed.module#FeedModule',
        // canActivate: [AuthenticationGuard]
    },
    {
        path: archivePath,
        loadChildren: './modules/archives/archives.module#ArchivesModule',
        // canActivate: [AuthenticationGuard]
    },
    {
        path: 'thirdparty',
        loadChildren: './modules/thirdparty/thirdparty.module#ThirdpartyModule',
        // canActivate: [AuthenticationGuard]
    },
    {
        path: 'settings',
        loadChildren: './modules/settings/settings.module#SettingsModule',
        // canActivate: [AuthenticationGuard]
    },
    {
        path: 'navbar',
        component: LoginComponent
    },
    {path: '**', redirectTo: defaultPath}
];
// TODO manage visible path more gently
export const navigationRoutes: Routes = routes.slice(0, 2);

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
