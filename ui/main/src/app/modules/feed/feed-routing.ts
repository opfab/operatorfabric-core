/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {FeedComponent} from './feed.component';
import {Routes} from '@angular/router';
import {CardBodyComponent} from '../card/components/card-body/card-body.component';
import {CardComponent} from '../card/card.component';
import {MapComponent} from './components/map/map.component';

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
    }
];

export default routes;
