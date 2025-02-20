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
import {NgIf} from '@angular/common';
import {FormControl, ReactiveFormsModule} from '@angular/forms';

@Component({
    selector: 'of-has-response-cell-renderer',
    templateUrl: './InputCellRendererComponent.html',
    standalone: true,
    imports: [NgIf, ReactiveFormsModule]
})
export class InputCellRendererComponent implements ICellRendererAngularComp {
    public params: any;
    public isInputFieldVisible = false;
    public fieldValue = '';
    cardInputControl: FormControl = new FormControl('');

    agInit(params: any): void {
        this.params = params;
        this.fieldValue = params.getValue();
        this.cardInputControl.setValue(this.fieldValue);
    }

    /** This method returns true to signal to the grid that this renderer doesn't need to be recreated if the underlying data changes
     *  See https://www.ag-grid.com/documentation/angular/component-cell-renderer/#handling-refresh
     * */
    refresh(params: ICellRendererParams): boolean {
        return true;
    }

    activateInput() {
        this.isInputFieldVisible = true;
    }
    deactivateInput() {
        this.isInputFieldVisible = false;
    }
    getInputValue() {
        return this.cardInputControl.value;
    }
}
