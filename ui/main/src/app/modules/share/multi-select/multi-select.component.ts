/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AfterViewInit, Component, Input, OnChanges, OnDestroy} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {MultiSelectConfig, MultiSelectOption} from '@ofModel/multiselect.model';

declare const VirtualSelect: any;

@Component({
    selector: 'of-multi-select ',
    templateUrl: './multi-select.component.html'
})
export class MultiSelectComponent implements AfterViewInit, OnDestroy, OnChanges {
    @Input() public parentForm: FormGroup;
    @Input() public multiSelectId: string;
    @Input() public config: MultiSelectConfig;
    @Input() public options:Array<MultiSelectOption>;
    @Input() public selectedOptions: [];

    private ngAfterViewInitHasBeenDone = false;
    private virtualSelectComponent: any;

    constructor(private translateService: TranslateService) {}

    ngAfterViewInit() {
        setTimeout(() => {
            // Hack : let the time to destroy on old version of a multiselect with same id
            this.createVirtualSelectComponent();
            this.setOptionList();
            this.setSelectedOptions();
            this.ngAfterViewInitHasBeenDone = true;
        }, 0);
    }

    private createVirtualSelectComponent() {
        let placeholder = '';
        let nbOfDisplayValues = 50;
        if (this.config.placeholderKey)
            placeholder = this.translateService.instant(this.config.placeholderKey);
        if (this.config.nbOfDisplayValues) nbOfDisplayValues = this.config.nbOfDisplayValues;
        VirtualSelect.init({
            ele: '#' + this.multiSelectId,
            options: [],
            multiple: true,
            showValueAsTags: true,
            placeholder: placeholder,
            noOfDisplayValues: nbOfDisplayValues,
            selectAllOnlyVisible: true,
            optionsCount: 8,
            searchPlaceholderText: this.translateService.instant(
                'multiSelect.searchPlaceholderText'
            ),
            clearButtonText: this.translateService.instant('multiSelect.clearButtonText'),
            noOptionsText: this.translateService.instant('multiSelect.noOptionsText'),
            noSearchResultsText: this.translateService.instant('multiSelect.noSearchResultsText')
        });

        this.virtualSelectComponent = document.querySelector('#' + this.multiSelectId);
        const currentComponent = this;
        this.virtualSelectComponent.addEventListener('change', function () {
            currentComponent.setSelectedOptionsToParentForm();
        });
    }

    private setSelectedOptionsToParentForm() {
        this.parentForm.get(this.multiSelectId).setValue(this.virtualSelectComponent.value);
    }

    private setOptionList() {
        if (this.options) {
            if (this.config.sortOptions) this.sortOptionListByLabel();
            this.virtualSelectComponent.setOptions(this.options);
        }
    }

    private sortOptionListByLabel() {
        this.options.sort((a, b) => {
            if (!(<any>a).label) return a;
            if (!(<any>b).label) return b;
            return (<any>a).label.localeCompare((<any>b).label);
        });
    }

    private setSelectedOptions() {
        if (this.selectedOptions) this.virtualSelectComponent.setValue(this.selectedOptions);
    }

    ngOnChanges() {
        if (this.ngAfterViewInitHasBeenDone) {
            this.setOptionList();
            this.setSelectedOptions();
        }
    }

    ngOnDestroy() {
        this.virtualSelectComponent.destroy();
    }
}
