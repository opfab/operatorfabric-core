/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {I18n} from '@ofModel/i18n.model';
import {TranslateService} from '@ngx-translate/core';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {Observable, Subject} from 'rxjs';
import {buildSettingsOrConfigSelector} from '@ofStore/selectors/settings.x.config.selectors';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'of-multi-filter',
    templateUrl: './multi-filter.component.html'
})
export class MultiFilterComponent implements OnInit, OnChanges, OnDestroy {

    unsubscribe$: Subject<void> = new Subject<void>();

    dropdownList: { id: string, itemName: string }[];
    @Input() public i18nRootLabelKey: string;
    @Input() public values: ({ id: string, itemName: (I18n | string), i18nPrefix?: string } | string)[];
    @Input() public parentForm: FormGroup;
    @Input() public dropdownSettings = {};
    @Input() public filterPath: string;
    /** `selectedItems` is an array containing the ids of items that have been selected */
    @Input() public selectedItems;
    /** `selection` is an array containing {id,itemName} pairs representing the selection that will actually be passed by the component.
     * In particular, if `selectedItems` is undefined, `selection` will be equal to the full list of possible values (`dropDownList`).
     * This behaviour is useful if the component is being used as a filter and when no values are selected, we don't want to restrict search
     * results based on this criteria (e.g. archive screen filters).
     * In other cases, when no items are selected we want the passed selection to be empty as well (e.g. edition modals in the admin
     * screen). In this case, `selectedItems` should be set to [].
     * */
    public selection = [];

    constructor(private store: Store<AppState>, private translateService: TranslateService) {
        this.parentForm = new FormGroup({
            [this.filterPath]: new FormControl()
        });
    }

    ngOnInit() {

        // Subscribe to locale changes and handle translations for placeholders
        this.getLocale().pipe(takeUntil(this.unsubscribe$)).subscribe(locale => {
            this.translateService.use(locale);
            this.translateService.get(['multiFilter.searchPlaceholderText', 'multiFilter.selectAllText', 'multiFilter.unSelectAllText',
                'multiFilter.filterSelectAllText', 'multiFilter.filterUnSelectAllText'])
                .subscribe(translations => {
                    this.dropdownSettings = {...{
                            searchPlaceholderText: translations['multiFilter.searchPlaceholderText'],
                            selectAllText: translations['multiFilter.selectAllText'],
                            unSelectAllText: translations['multiFilter.unSelectAllText'],
                            filterSelectAllText: translations['multiFilter.filterSelectAllText'],
                            filterUnSelectAllText: translations['multiFilter.filterUnSelectAllText'],
                            noDataLabel: translations['multiFilter.noDataLabel'],
                        }, ...this.dropdownSettings};
                });
        });
    }


    onDeSelectAll(items: any) {
        this.selection = [];
        this.parentForm.get(this.filterPath).setValue(this.selection);
    }

    ngOnChanges() {

        // Initialisation of component values
        this.selection = [];
        this.dropdownList = [];
        if (!!this.values) {
            this.dropdownList = this.values.map(entry => this.computeValueAndLabel(entry));
        } else {
            // should throws an error ?
            console.error('There are currently no values for ' + this.filterPath);
        }
        if (!this.selectedItems) this.selection = this.dropdownList.map(item => item); // If selectedItems haven't been defined,
        // selection is set to a copy of all values so no filter is applied for this field
        else {
            this.selectedItems.forEach(element => {
                const items = this.dropdownList.filter(item  => item.id === element);
                if (!!items[0]) this.selection.push(items[0]);
            });

        }
        this.parentForm.get(this.filterPath).setValue(this.selection);

    }

    protected getLocale(): Observable<string> {
        return this.store.select(buildSettingsOrConfigSelector('locale'));
    }

    computeI18nLabelKey(): string {
        return this.i18nRootLabelKey + this.filterPath;
    }

    computeValueAndLabel(entry: ({ id: string, itemName: (I18n | string), i18nPrefix?: string } | string)):
        { id: string, itemName: string } {
        if (typeof entry === 'string') {
            return {id: entry, itemName: entry};
        } else if (typeof entry.itemName === 'string') {
            if (!!entry.i18nPrefix) { // need mutualisation
                const firstI18nPrefix = (entry.i18nPrefix) ? `${entry.i18nPrefix}.` : '';
                let firstTranslatedItemName = entry.id;
                this.translateService.get(`${firstI18nPrefix}${entry.itemName}`
                    , null).subscribe(result => firstTranslatedItemName = result);
                return {
                    id: entry.id,
                    itemName: firstTranslatedItemName
                };
            }
            return {id: entry.id, itemName: entry.itemName};
        } else if (!entry.itemName) {
            return {id: entry.id, itemName: entry.id};
        }
        // mind the trailing dot! mandatory for translation if I18n prefix exists
        const i18nPrefix = (entry.i18nPrefix) ? `${entry.i18nPrefix}.` : '';
        let translatedItemName = entry.id;
        this.translateService.get(`${i18nPrefix}${entry.itemName.key}`
            , entry.itemName.parameters).subscribe(result => translatedItemName = result);
        return {
            id: entry.id,
            itemName: translatedItemName
        };
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}

