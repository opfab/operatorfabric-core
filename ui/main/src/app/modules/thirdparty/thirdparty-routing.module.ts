/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
// import {AuthenticationGuard} from "@ofServices/guard.service";
import {IframeDisplayComponent} from "./iframedisplay.component";

const routes: Routes = [
    {
        path: '',
        component: IframeDisplayComponent,
        // canActivate: [AuthenticationGuard]
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ThirdpartyRoutingModule { }
