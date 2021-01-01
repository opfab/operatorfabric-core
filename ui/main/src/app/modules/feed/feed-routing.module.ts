/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {NgModule} from '@angular/core';
import {FeedComponent} from './feed.component';
import {RouterModule, Routes} from '@angular/router';
import {DetailComponent} from '../cards/components/detail/detail.component';
import {CardDetailsComponent} from '../cards/components/card-details/card-details.component';

const routes: Routes = [
    {
        path: '',
        component: FeedComponent,
        children: [
            {
                path: 'cards',
                children: [
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
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FeedRoutingModule {
}
