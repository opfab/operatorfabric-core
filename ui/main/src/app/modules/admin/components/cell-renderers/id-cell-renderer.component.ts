/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component} from '@angular/core';
import {ICellRendererAngularComp} from 'ag-grid-angular';
import {ICellRendererParams} from 'ag-grid-community';

@Component({
    selector: 'of-id-cell-renderer',
    templateUrl: './id-cell-renderer.component.html'
})
export class IdCellRendererComponent implements ICellRendererAngularComp  {

    value: string;

    agInit(params: ICellRendererParams<any, any>): void {
        this.value = params.value;
    }

    refresh(params: ICellRendererParams<any, any>): boolean {
        return true;
    }

}
