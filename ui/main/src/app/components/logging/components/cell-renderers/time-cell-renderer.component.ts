/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component} from '@angular/core';
import {DateTimeFormatterService} from 'app/services/dateTimeFormatter/DateTimeFormatterService';
import {ICellRendererAngularComp} from 'ag-grid-angular';
import {ICellRendererParams} from 'ag-grid-community';

@Component({
    selector: 'of-time-cell-renderer',
    templateUrl: './time-cell-renderer.component.html',
    standalone: true
})
export class TimeCellRendererComponent implements ICellRendererAngularComp {
    // For explanations regarding ag-grid CellRenderers see
    // https://www.ag-grid.com/documentation/angular/component-cell-renderer/#example-rendering-using-angular-components

    timestamp: string;

    agInit(params: any): void {
        this.timestamp = DateTimeFormatterService.getFormattedDateAndTime(params.value);
    }

    // noinspection JSUnusedLocalSymbols
    /** This method returns true to signal to the grid that this renderer doesn't need to be recreated if the underlying data changes
     *  See https://www.ag-grid.com/documentation/angular/component-cell-renderer/#handling-refresh
     * */
    refresh(params: ICellRendererParams): boolean {
        return true;
    }
}
