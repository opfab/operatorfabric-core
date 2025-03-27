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
import {NgForOf, NgIf} from '@angular/common';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MultiSelectComponent} from '../../share/multi-select/multi-select.component';

@Component({
    selector: 'of-select-cell-renderer',
    templateUrl: './SelectCellRendererComponent.html',
    standalone: true,
    imports: [NgIf, NgForOf, ReactiveFormsModule, MultiSelectComponent]
})
export class SelectCellRendererComponent implements ICellRendererAngularComp {
    public params: any;
    public isInputFieldVisible = false;
    public fieldValue = '';
    cardSelectControl: FormControl = new FormControl('');
    selectOptions = [];

    agInit(params: any): void {
        this.params = params;
        this.fieldValue = params.getValue().value;
        this.selectOptions = params.getValue().possibleValues.map((value: any) => ({
            label: value.label,
            value: value.value
        }));

        // Initialize control with current value
        this.cardSelectControl.setValue(this.fieldValue);
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
        return this.cardSelectControl.value;
    }

    onKeyDown(event: KeyboardEvent) {
        event.stopPropagation();
    }

    onClick(event: MouseEvent) {
        event.stopPropagation();
    }
}
