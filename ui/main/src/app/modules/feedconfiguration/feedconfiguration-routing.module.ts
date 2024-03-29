/* Copyright (c) 2020-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {NgModule} from '@angular/core';
import {CanDeactivateFn, RouterModule, Routes} from '@angular/router';
import {FeedconfigurationComponent} from './feedconfiguration.component';

const canDeactivate: CanDeactivateFn<FeedconfigurationComponent> = (component: FeedconfigurationComponent) => {
    return component.canDeactivate ? component.canDeactivate() : true;
};

const routes: Routes = [
    {
        path: '',
        component: FeedconfigurationComponent,
        canDeactivate: [canDeactivate]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FeedconfigurationRoutingModule {}
