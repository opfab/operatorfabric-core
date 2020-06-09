/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {ConfigService} from '@ofServices/config.service';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';

import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {FormControl, FormGroup} from '@angular/forms';
import {SendArchiveQuery} from '@ofStore/actions/archive.actions';
import {DateTimeNgb} from '@ofModel/datetime-ngb.model';
import {NgbDateStruct, NgbTimeStruct} from '@ng-bootstrap/ng-bootstrap';
import {TimeService} from '@ofServices/time.service';
import {TranslateService} from '@ngx-translate/core';


export enum FilterDateTypes {
    PUBLISH_DATE_FROM_PARAM = 'publishDateFrom',
    PUBLISH_DATE_TO_PARAM = 'publishDateTo',
    ACTIVE_FROM_PARAM = 'activeFrom',
    ACTIVE_TO_PARAM = 'activeTo'

}

export const checkElement = (enumeration: typeof FilterDateTypes, value: string): boolean => {
    let result = false;
    if (Object.values(enumeration).includes(value)) {
        result = true;
    }
    return result;
};

export const transformToTimestamp = (date: NgbDateStruct, time: NgbTimeStruct): string => {
    return new DateTimeNgb(date, time).formatDateTime();
};

@Component({
    selector: 'of-archive-filters',
    templateUrl: './archive-filters.component.html',
    styleUrls: ['./archive-filters.component.css']
})
export class ArchiveFiltersComponent implements OnInit, OnDestroy {

    tags: string [];
    processes: string [];
    size: number;
    archiveForm: FormGroup;
    unsubscribe$: Subject<void> = new Subject<void>();

    constructor(private store: Store<AppState>
        , private timeService: TimeService
        , private translateService: TranslateService
        , private  configService: ConfigService) {
        this.archiveForm = new FormGroup({
            tags: new FormControl(''),
            process: new FormControl(),
            publishDateFrom: new FormControl(),
            publishDateTo: new FormControl(''),
            activeFrom: new FormControl(''),
            activeTo: new FormControl(''),
        });
    }


    ngOnInit() {
        this.tags = this.configService.getConfigValue('archive.filters.tags.list');
        this.processes = this.configService.getConfigValue('archive.filters.process.list');
        this.size = this.configService.getConfigValue('archive.filters.page.size', 10);
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
                        params.set(key, element);
                    }
                }
            }
        });
        return params;
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    sendQuery(): void {
        const {value} = this.archiveForm;
        const params = this.filtersToMap(value);
        params.set('size', [this.size.toString()]);
        params.set('page', ['0']);
        this.store.dispatch(new SendArchiveQuery({params}));
    }

}

