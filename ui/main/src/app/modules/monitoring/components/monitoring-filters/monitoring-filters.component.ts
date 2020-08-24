/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {AbstractControl, FormControl, FormGroup} from '@angular/forms';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import * as moment from 'moment';
import {NgbDateStruct, NgbTimeStruct} from '@ng-bootstrap/ng-bootstrap';
import {FilterType} from '@ofServices/filter.service';
import {ApplyFilter, ResetFilter} from '@ofActions/feed.actions';
import {DateTimeNgb} from '@ofModel/datetime-ngb.model';
import {ConfigService} from '@ofServices/config.service';

@Component({
    selector: 'of-monitoring-filters',
    templateUrl: './monitoring-filters.component.html',
    styleUrls: ['./monitoring-filters.component.scss']
})
export class MonitoringFiltersComponent implements OnInit, OnDestroy {

    processes$: Observable<string[]>;
    tempProcesses: string[];
    size = 10;
    monitoringForm: FormGroup;
    unsubscribe$: Subject<void> = new Subject<void>();
    startDate: NgbDateStruct;
    startTime: NgbTimeStruct;
    endDate: NgbDateStruct;
    endTime: NgbTimeStruct;

    @Input()
    public processData: Observable<any>;

    public submittedOnce = false;

    constructor(private store: Store<AppState>, private configService: ConfigService) {
        this.monitoringForm = new FormGroup(
            {
                process: new FormControl(''),
                publishDateFrom: new FormControl(''),
                publishDateTo: new FormControl(''),
                activeFrom: new FormControl(''),
                activeTo: new FormControl('')
            }
        );

    }

    ngOnInit() {
        this.tempProcesses = ['APOGEE', 'test_action', 'TEST', 'first', 'api_test'];

        this.size = this.configService.getConfigValue('archive.filters.page.size', 10);

        const now = moment();
        const start = now.add(-2, 'hour');
        this.startDate = {
            year: start.year()
            , month: start.month() + 1 // moment month begins with 0 index
            , day: start.date() // moment day give day in the week
        } as NgbDateStruct;
        this.startTime = {hour: start.hour(), minute: start.minute(), second: start.second()};

        const end = now.add(2, 'day');
        this.endDate = {
            year: end.year()
            , month: end.month() + 1 // moment month begins with 0 index
            , day: end.date() // moment day give day in the week
        } as NgbDateStruct;
        this.endTime = {hour: end.hour(), minute: end.minute(), second: end.second()};


    }

    sendQuery() {
        this.otherWayToCreateFilters();
    }

    otherWayToCreateFilters() {
        this.store.dispatch(new ResetFilter());

        const testProc = this.monitoringForm.get('process');
        if (this.hasFormControlValueChanged(testProc)) {
            const procFilter = {
                name: FilterType.PROCESS_FILTER
                , active: true
                , status: {processes: testProc.value}
            };
            this.store.dispatch(new ApplyFilter(procFilter));
        }
        const pubStart = this.monitoringForm.get('publishDateFrom');
        const pubEnd = this.monitoringForm.get('publishDateTo');
        if (this.hasFormControlValueChanged(pubStart)
            || this.hasFormControlValueChanged(pubEnd)) {

            const start = this.extractDateOrDefaultOne(pubStart, {
                date: this.startDate
                , time: this.startTime
            });
            const end = this.extractDateOrDefaultOne(pubEnd, {
                date: this.endDate
                , time: this.endTime
            });
            const publishDateFilter = {
                name: FilterType.PUBLISHDATE_FILTER
                , active: true
                , status: {
                    start: start,
                    end: end
                }
            };
            this.store.dispatch(new ApplyFilter(publishDateFilter));
        }
        const busiStart = this.monitoringForm.get('activeFrom');
        const busiEnd = this.monitoringForm.get('activeTo');
        if (this.hasFormControlValueChanged(busiStart)
            || this.hasFormControlValueChanged(busiEnd)) {
            const end = this.extractDateOrDefaultOne(busiEnd, null);
            const start = this.extractDateOrDefaultOne(busiStart, {
                date: this.startDate
                , time: this.startTime
            });
            const businessDateFilter = (end >= 0) ? {
                    name: FilterType.MONITOR_DATE_FILTER
                    , active: true
                    , status: {
                        start: start,
                        end: end
                    }
                } : {
                    name: FilterType.MONITOR_DATE_FILTER
                    , active: true
                    , status: {
                        start: start
                    }
                }
            ;
            this.store.dispatch(new ApplyFilter(businessDateFilter));
        }

    }

    hasFormControlValueChanged(control: AbstractControl): boolean {
        if (!!control) {
            const isNotPristine = !control.pristine;
            const valueIsNotDefault = control.value !== '';
            const result = !!control && isNotPristine && valueIsNotDefault;
            return result;
        }
        return false;
    }

    extractDateOrDefaultOne(form: AbstractControl, defaultDate: any) {
        const val = form.value;
        const finallyUsedDate = (!!val && val !== '') ? val : defaultDate;
        if (!finallyUsedDate) {
            return -1;
        }
        const converter = new DateTimeNgb(finallyUsedDate.date, finallyUsedDate.time);
        return converter.convertToNumber();
    }

    resetForm() {
        this.monitoringForm.reset();
        this.store.dispatch(new ResetFilter());
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        this.store.dispatch(new ResetFilter());
    }

}
