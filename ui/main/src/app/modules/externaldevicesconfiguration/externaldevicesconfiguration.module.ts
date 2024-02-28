/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ExternaldevicesconfigurationComponent} from './externaldevicesconfiguration.component';
import {TranslateModule} from '@ngx-translate/core';
import {AgGridModule} from 'ag-grid-angular';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ExternaldevicesconfigurationModalComponent} from './editModal/externaldevicesconfiguration-modal.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ExternaldevicesconfigurationRoutingModule} from './externaldevicesconfiguration-routing.module';
import {MultiSelectModule} from '../share/multi-select/multi-select.module';
import {SpinnerModule} from '../share/spinner/spinner.module';
import {UsersTableComponent} from './table/users.table.component';
import {DevicesTableComponent} from './table/devices.table.component';
import {ExternaldevicesModalComponent} from './editModal/externaldevices-modal.component';

@NgModule({
    declarations: [
        ExternaldevicesconfigurationComponent,
        ExternaldevicesconfigurationModalComponent,
        ExternaldevicesModalComponent,
        UsersTableComponent,
        DevicesTableComponent
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        TranslateModule,
        ExternaldevicesconfigurationRoutingModule,
        MultiSelectModule,
        NgbModule,
        SpinnerModule,
        AgGridModule
    ]
})
export class ExternaldevicesModule {}
