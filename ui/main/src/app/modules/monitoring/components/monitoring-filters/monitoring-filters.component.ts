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
import {FilterType} from '@ofServices/filter.service';
import {ApplyFilter, ResetFilter} from '@ofActions/feed.actions';
import {DateTimeNgb, getDateTimeNgbFromMoment, offSetCurrentTime} from '@ofModel/datetime-ngb.model';
import {ConfigService} from '@ofServices/config.service';
import * as moment from 'moment';

@Component({
    selector: 'of-monitoring-filters',
    templateUrl: './monitoring-filters.component.html',
    styleUrls: ['./monitoring-filters.component.scss']
})
export class MonitoringFiltersComponent implements OnInit, OnDestroy {

    size = 10;
    monitoringForm: FormGroup;
    unsubscribe$: Subject<void> = new Subject<void>();

    dropdownList = [];
    selectedItems = [];
    dropdownSettings = {};

    @Input()
    public processData: Observable<any>;

    public submittedOnce = false;

    constructor(private store: Store<AppState>, private configService: ConfigService) {

    }

    ngOnInit() {
        this.size = this.configService.getConfigValue('archive.filters.page.size', 10);
        this.monitoringForm = new FormGroup(
            {
                process: new FormControl([]),
                publishDateFrom: new FormControl(''),
                publishDateTo: new FormControl(''),
                activeFrom: new FormControl(''),
                activeTo: new FormControl('')
            }
        );
        this.processData.subscribe(items => this.dropdownList = items);

        this.dropdownSettings = {
            text: 'Select a Process',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            enableSearchFilter: true,
            classes: 'custom-class-example'
        };

    }

    sendQuery() {
        this.store.dispatch(new ResetFilter());
        const testProc = this.monitoringForm.get('process');
        const processesId = Array.prototype.map.call(testProc.value, item => item.id);
        if (this.hasFormControlValueChanged(testProc)) {
            const procFilter = {
                name: FilterType.PROCESS_FILTER
                , active: true
                , status: {processes: processesId}
            };
            this.store.dispatch(new ApplyFilter(procFilter));
        }
        const pubStart = this.monitoringForm.get('publishDateFrom');
        const pubEnd = this.monitoringForm.get('publishDateTo');
        if (this.hasFormControlValueChanged(pubStart)
            || this.hasFormControlValueChanged(pubEnd)) {

            const start = this.extractDateOrDefaultOne(pubStart,  offSetCurrentTime([{amount: -2, unit: 'hours'}]));
            const end = this.extractDateOrDefaultOne(pubEnd, offSetCurrentTime([{amount: 2, unit: 'days'}]));
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
            const start = this.extractDateOrDefaultOne(busiStart, null);
            const end = this.extractDateOrDefaultOne(busiEnd, null);
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
