/* Copyright (c) 2022, RTE (http://www.rte-france.com)
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
import {ActionCellRendererComponent} from '../admin/components/cell-renderers/action-cell-renderer.component';
import {SingleFilterModule} from '../share/single-filter/single-filter.module';
import {ExternaldevicesconfigurationModalComponent} from './editModal/externaldevicesconfiguration-modal.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ExternaldevicesconfigurationRoutingModule} from './externaldevicesconfiguration-routing.module';
import {MultiSelectModule} from '../share/multi-select/multi-select.module';

@NgModule({
    declarations: [ExternaldevicesconfigurationComponent, ExternaldevicesconfigurationModalComponent],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        TranslateModule,
        ExternaldevicesconfigurationRoutingModule,
        SingleFilterModule,
        MultiSelectModule,
        NgbModule,
        AgGridModule.withComponents([[ActionCellRendererComponent]])
    ]
})
export class ExternaldevicesModule {}
