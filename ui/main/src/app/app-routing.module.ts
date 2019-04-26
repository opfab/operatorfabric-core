/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
// import {AuthenticationGuard} from '@ofServices/guard.service';
import {LoginComponent} from './components/login/login.component';
import {environment} from "@env/environment";

const routes: Routes = [
    // {
    //     path: 'login',
    //     component: LoginComponent
    // },
    {
        path: 'feed',
        loadChildren: './modules/feed/feed.module#FeedModule',
        // canActivate: [AuthenticationGuard]
    },
    {
        path: 'archives',
        loadChildren: './modules/archives/archives.module#ArchivesModule',
        // canActivate: [AuthenticationGuard]
    },
    {
        path: 'thirdparty',
        loadChildren: './modules/thirdparty/thirdparty.module#ThirdpartyModule',
        // canActivate: [AuthenticationGuard]
    },
    {
        path: 'navbar',
        component: LoginComponent
    },
    {path: '**', redirectTo: '/feed'}
];
// TODO manage visible path more gently
export const navigationRoutes: Routes = routes.slice(0, 2);

@NgModule({
    imports: [RouterModule.forRoot(routes,{ enableTracing: !environment.production, preloadingStrategy: PreloadAllModules })],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
