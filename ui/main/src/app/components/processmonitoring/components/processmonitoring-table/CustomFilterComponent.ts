/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';

import type {IFilterDisplayAngularComp} from 'ag-grid-angular';
import type {FilterDisplayParams} from 'ag-grid-community';
import {NgForOf} from '@angular/common';

@Component({
    standalone: true,
    imports: [FormsModule, NgForOf],
    template: `
        <div style="margin: 10px">
            <label class="opfab-checkbox" *ngFor="let cb of checkboxes">
                <input type="checkbox" [(ngModel)]="cb.checked" (ngModelChange)="onCheckboxChange()" />
                {{ cb.label }}
                <span class="opfab-checkbox-checkmark"></span>
            </label>
        </div>
    `
})
export class CustomFilterComponent implements IFilterDisplayAngularComp<any, any, string> {
    protected checkboxes: {label: string; checked: boolean}[] = [];
    private possibleValues: string[] = [];

    private filterParams: FilterDisplayParams<any, any, string>;
    private filterText = '';

    agInit(params: FilterDisplayParams<any, any, string>): void {
        this.filterParams = params;

        this.possibleValues = (params as any).possibleValues;
        this.possibleValues.forEach((value) => {
            this.checkboxes.push({
                label: value,
                checked: false
            });
        });

        this.refresh();
    }

    refresh(): boolean {
        return true;
    }

    onCheckboxChange() {
        this.filterText = '';
        this.checkboxes.forEach((cb) => {
            if (cb.checked) {
                this.filterText += cb.label + ';';
            }
        });

        this.filterParams.onModelChange(this.filterText == null || this.filterText === '' ? null : this.filterText);
    }
}
