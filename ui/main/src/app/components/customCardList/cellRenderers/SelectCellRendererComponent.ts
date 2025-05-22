/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, ElementRef, ViewChild} from '@angular/core';
import {ICellRendererAngularComp} from 'ag-grid-angular';
import {ICellRendererParams} from 'ag-grid-community';
import {NgForOf, NgIf} from '@angular/common';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MultiSelectComponent} from '../../share/multi-select/MultiSelectComponent';
import {TranslationService} from '@ofServices/translation/TranslationService';

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
    public fieldLabel = '';
    public allowNewOptionForSelect = false;
    public otherOptionLabel = 'Other...';
    public otherOptionPlaceholder = 'Please specify';

    @ViewChild('otherInput') otherInputElement!: ElementRef<HTMLInputElement>;

    cardSelectControl: FormControl = new FormControl('');
    selectOptions = [];
    showOtherInput = false;
    otherInputControl: FormControl = new FormControl('');

    agInit(params: any): void {
        this.otherOptionLabel = TranslationService.getTranslation('customCardList.select.otherOptionLabel');
        this.otherOptionPlaceholder = TranslationService.getTranslation('customCardList.select.otherOptionPlaceholder');
        this.params = params;
        this.fieldValue = params.getValue().value;
        this.allowNewOptionForSelect = params.getValue().allowNewOptionForSelect;
        this.selectOptions = params.getValue().possibleValues.map((value: any) => ({
            label: value.label,
            value: value.value
        }));
        // Add initial value to options if it does not exist
        if (this.fieldValue && !this.selectOptions.some((option) => option.value === this.fieldValue)) {
            this.selectOptions.push({value: this.fieldValue, label: this.fieldValue});
        }
        this.fieldLabel =
            params.getValue()?.possibleValues?.find((value: any) => value.value === this.fieldValue)?.label ??
            this.fieldValue;

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

    onSelectChange(event: Event) {
        const value = (event.target as HTMLSelectElement).value;
        this.showOtherInput = value === '__other__';
        if (this.showOtherInput) {
            // set user focus on the input field
            setTimeout(() => this.otherInputElement.nativeElement.focus(), 0);
            this.otherInputControl.setValue('');
        }
    }

    addOtherOption() {
        const newValue = this.otherInputControl.value;
        if (newValue) {
            // if label edited by user is already in the list, we set the select value to the value corresponding to the label
            if (this.selectOptions.some((option) => option.label === newValue)) {
                const existingOptionToSelect = this.selectOptions.find((option) => option.label === newValue);
                this.cardSelectControl.setValue(existingOptionToSelect?.value);
                this.showOtherInput = false;
                this.otherInputControl.setValue('');
            } else {
                this.selectOptions.push({value: newValue, label: newValue});
                this.cardSelectControl.setValue(newValue);
                this.showOtherInput = false;
                this.otherInputControl.setValue('');
            }
        }
    }

    cancelOtherInput() {
        this.showOtherInput = false;
        this.otherInputControl.setValue('');
        this.cardSelectControl.setValue(this.fieldValue);
    }
}
