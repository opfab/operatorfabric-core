/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RealtimeusersComponent} from './realtimeusers.component';
import {RealtimeusersRoutingModule} from './realtimeusers-routing.module';
import {TranslateModule} from '@ngx-translate/core';
import {SingleFilterModule} from '../share/single-filter/single-filter.module';
import {ReactiveFormsModule} from '@angular/forms';
import { SpinnerModule } from '../share/spinner/spinner.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

@NgModule({
    declarations: [RealtimeusersComponent],
    imports: [CommonModule, TranslateModule, RealtimeusersRoutingModule, SingleFilterModule, ReactiveFormsModule, SpinnerModule, NgbModule]
})
export class RealtimeusersModule {}
