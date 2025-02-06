/* Copyright (c) 2025, RTE (http://www.rte-france.com)
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
import {TranslateModule} from '@ngx-translate/core';
import {NgIf} from '@angular/common';
import {NgbPopover} from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'of-has-response-cell-renderer',
    templateUrl: './HasResponseCellRendererComponent.html',
    standalone: true,
    imports: [TranslateModule, NgIf, NgbPopover]
})
export class HasResponseCellRendererComponent implements ICellRendererAngularComp {
    public params: any;

    agInit(params: any): void {
        this.params = params;
    }

    /** This method returns true to signal to the grid that this renderer doesn't need to be recreated if the underlying data changes
     *  See https://www.ag-grid.com/documentation/angular/component-cell-renderer/#handling-refresh
     * */
    refresh(params: ICellRendererParams): boolean {
        return true;
    }
}
