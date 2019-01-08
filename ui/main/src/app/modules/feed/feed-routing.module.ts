/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {NgModule} from '@angular/core';
import {FeedComponent} from "./feed.component";
import {AuthenticationGuard} from "@ofServices/guard.service";
import {RouterModule, Routes} from "@angular/router";
import {NoSelectionComponent} from "./components/no-selection/no-selection.component";
import {DetailsComponent} from "./components/details/details.component";
import {DetailComponent} from "./components/detail/detail.component";
import {CardDetailsComponent} from "./components/card-details/card-details.component";

const routes: Routes = [
    {
        path: '',
        component: FeedComponent,
        canActivate: [AuthenticationGuard],
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'cards'
            },
            {
                path: 'cards',
                children : [
                    {
                        path: '',
                        component: CardDetailsComponent,
                    },
                    {
                        path: ':cid',
                        component: CardDetailsComponent,
                        children: [
                            {
                                path: 'details/:did',
                                component: DetailComponent
                            }
                        ]
                    }]
            },
            ]
    },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FeedRoutingModule { }
