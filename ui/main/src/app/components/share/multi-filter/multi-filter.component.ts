/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Component, Input, OnInit} from '@angular/core';
import {Observable, of} from 'rxjs';
import {I18n} from '@ofModel/i18n.model';
import {TranslateService} from '@ngx-translate/core';
import {FormControl, FormGroup} from '@angular/forms';
import {map} from 'rxjs/operators';

@Component({
    selector: 'of-multi-filter',
    templateUrl: './multi-filter.component.html',
    styleUrls: ['./multi-filter.component.css']
})
export class MultiFilterComponent implements OnInit {

    preparedList: { value: string, label: Observable<string> }[];
    @Input() public i18nRootLabelKey: string;
    @Input() public values: ({ value: string, label: (I18n | string) } | string)[];
    @Input() public parentForm: FormGroup;
    @Input() public filterPath: string;
    @Input() public valuesInObservable: Observable<any>;

    constructor(private translateService: TranslateService) {
        this.parentForm = new FormGroup({
            [this.filterPath]: new FormControl()
        });
    }

    ngOnInit() {
        this.preparedList = [];

        if (!this.valuesInObservable && this.values) {
            for (const v of this.values) {
                this.preparedList.push(this.computeValueAndLabel(v));
            }
        } else {
            if (!!this.valuesInObservable) {
                this.valuesInObservable.pipe(
                    map((values: ({ value: string, label: (I18n | string), i18NPrefix?: string } | string)[]) => {
                            for (const v of values) {
                                this.preparedList.push(this.computeValueAndLabel(v));
                            }
                        }
                    ))
                    .subscribe();
            }
        }
    }

    computeI18nLabelKey(): string {
        return this.i18nRootLabelKey + this.filterPath;
    }

    computeValueAndLabel(entry: ({ value: string, label: (I18n | string), i18nPrefix?: string } | string)):
        { value: string, label: Observable<string> } {
        if (typeof entry === 'string') {
            return {value: entry, label: of(entry)};
        } else if (typeof entry.label === 'string') {
            return {value: entry.value, label: of(entry.label)};
        } else if (!entry.label) {
            return {value: entry.value, label: of(entry.value)};
        }
        // mind the trailing dot! mandatory for translation if I18n prefix exists
        const i18nPrefix = (entry.i18nPrefix) ? `${entry.i18nPrefix}.` : '';
        return {
            value: entry.value,
            label: this.translateService.get(`${i18nPrefix}${entry.label.key}`, entry.label.parameters)
        };

    }


}
