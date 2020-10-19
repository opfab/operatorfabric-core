/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnInit} from '@angular/core';
import {AppState} from '@ofStore/index';
import {Store} from '@ngrx/store';
import {FormControl, FormGroup} from '@angular/forms';
import {
    checkElement,
    FilterDateTypes,
    transformToTimestamp
} from '../../../archives/components/archive-filters/archive-filters.component';
import {SendLoggingQuery} from '@ofActions/logging.actions';
import {ConfigService} from '@ofServices/config.service';
import {TimeService} from '@ofServices/time.service';

@Component({
    selector: 'of-logging-filters',
    templateUrl: './logging-filters.component.html',
    styleUrls: ['./logging-filters.component.scss']
})
export class LoggingFiltersComponent implements OnInit {

    size = 10;
    loggingForm: FormGroup;

    dropdownList = [];
    dropdownSettings = {};

    public submittedOnce = false;

    @Input()
    public processData: [];

    constructor(private store: Store<AppState>, private timeService: TimeService, private configService: ConfigService) {

    }

    ngOnInit() {
        this.size = this.configService.getConfigValue('archive.filters.page.size', 10);
        this.loggingForm = new FormGroup(
            {
                process: new FormControl([]),
                publishDateFrom: new FormControl(''),
                publishDateTo: new FormControl(''),
                activeFrom: new FormControl(''),
                activeTo: new FormControl('')
            }
        );
        this.dropdownList = this.processData;

        this.dropdownSettings = {
            text: 'Select a Process',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            enableSearchFilter: true,
            classes: 'custom-class-example'
        };
    }

    sendQuery() {
        const {value} = this.loggingForm;
        const params = this.filtersToMap(value);
        params.set('size', [this.size.toString()]);
        params.set('page', ['0']);
        this.store.dispatch(new SendLoggingQuery({params}));
        this.submittedOnce = true;
    }

    /**
     * Transforms the filters list to Map
     */
    filtersToMap = (filters: any): Map<string, string[]> => {
        const params = new Map();
        Object.keys(filters).forEach(key => {
            const element = filters[key];
            // if the form element is date
            if (element) {
                if (checkElement(FilterDateTypes, key)) {
                    const {date, time} = element;
                    if (date) {
                        const timeStamp = this.timeService.toNgBTimestamp(transformToTimestamp(date, time));
                        if (timeStamp !== 'NaN') {
                            params.set(key, [timeStamp]);
                        }
                    }
                } else {
                    if (element.length) {
                        const idProcessArray = [];
                        element.forEach(val => idProcessArray.push(val.id));
                        params.set(key, idProcessArray);
                    }
                }
            }
        });
        return params;
    }
}
