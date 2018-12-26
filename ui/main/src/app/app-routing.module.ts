/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthenticationGuard} from '@ofServices/guard.service';
import {LoginComponent} from './components/login/login.component';

const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'feed',
        loadChildren: './modules/feed/feed.module#FeedModule',
        canActivate: [AuthenticationGuard]
    },
    {
        path: 'archives',
        loadChildren: './modules/archives/archives.module#ArchivesModule',
        canActivate: [AuthenticationGuard]
    },
    {path: '**', redirectTo: '/feed'}
];
// TODO manage visible path more gently
export const navigationRoutes: Routes = routes.slice(1, 3);

@NgModule({
    imports: [RouterModule.forRoot(routes,{ enableTracing: false })],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
