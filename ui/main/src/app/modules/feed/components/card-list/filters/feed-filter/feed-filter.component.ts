/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Component, Input, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {Subject, timer} from 'rxjs';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {AbstractControl, FormControl, FormGroup} from '@angular/forms';
import {debounce, debounceTime, distinctUntilChanged, takeUntil} from 'rxjs/operators';
import {ApplyFilter} from '@ofActions/feed.actions';
import * as _ from 'lodash-es';
import {FilterType} from '@ofServices/filter.service';

import {DateTimeNgb, getDateTimeNgbFromMoment} from '@ofModel/datetime-ngb.model';
import moment from 'moment';


@Component({
    selector: 'of-feed-filter',
    templateUrl: './feed-filter.component.html',
    styleUrls: ['./feed-filter.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FeedFilterComponent implements OnInit, OnDestroy {
    @Input() filterByPublishDate: boolean;
    @Input() hideTimerTags: boolean;
    @Input() hideAckFilter: boolean;

    dateTimeFilterChange = new Subject();

    private ngUnsubscribe$ = new Subject<void>();
    typeFilterForm: FormGroup;
    ackFilterForm: FormGroup;
    timeFilterForm: FormGroup;

    private dateFilterType = FilterType.PUBLISHDATE_FILTER;

    constructor(private store: Store<AppState>) {
        this.typeFilterForm = this.createFormGroup();
        this.ackFilterForm = this.createAckFormGroup();
        this.timeFilterForm = this.createDateTimeForm();
    }

    private createFormGroup() {
        return new FormGroup({
            alarm: new FormControl(),
            action: new FormControl(),
            compliant: new FormControl(),
            information: new FormControl()
        }, {updateOn: 'change'});
    }

    private createAckFormGroup() {
        return new FormGroup({
            ackControl: new FormControl('notack')
        }, {updateOn: 'change'});
    }

    private createDateTimeForm() {
        return new FormGroup(
            {
                dateTimeFrom: new FormControl(''),
                dateTimeTo: new FormControl(''),
            }
        );
    }

    ngOnDestroy() {
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
    }

    ngOnInit() {
        this.initTypeFilter();

        if (!this.hideAckFilter) {
            this.initAckFilter();
        }

        if (!this.hideTimerTags) {
            this.initDateTimeFilter();
        }
    }

    private initTypeFilter() {

       const savedAlarm = localStorage.getItem('opfab.feed.filter.type.alarm');
       const savedAction = localStorage.getItem('opfab.feed.filter.type.action');
       const savedACompliant = localStorage.getItem('opfab.feed.filter.type.compliant');
       const savedInformation = localStorage.getItem('opfab.feed.filter.type.information');

       const alarmUnset = savedAlarm && savedAlarm != 'true';
       const actionUnset = savedAction && savedAction != 'true';
       const compliantUnset = savedACompliant && savedACompliant != 'true';
       const informationUnset = savedInformation && savedInformation != 'true';


       this.typeFilterForm.get('alarm').setValue(!alarmUnset, {emitEvent: false});
       this.typeFilterForm.get('action').setValue(!actionUnset, {emitEvent: false});
       this.typeFilterForm.get('compliant').setValue(!compliantUnset, {emitEvent: false});
       this.typeFilterForm.get('information').setValue(!informationUnset, {emitEvent: false});

       this.store.dispatch(
        new ApplyFilter({
            name: FilterType.TYPE_FILTER,
            active: (alarmUnset || actionUnset || compliantUnset || informationUnset),
            status: {'alarm' : !alarmUnset, 'action': !actionUnset, 'compliant' : !compliantUnset, 'information' : !informationUnset}
        }));


        this.typeFilterForm
                .valueChanges
                .pipe(
                    takeUntil(this.ngUnsubscribe$),
                    distinctUntilChanged((formA, formB) => {
                        return _.isEqual(formA, formB);
                    }),
                    debounce(() => timer(500)))
                .subscribe(form => {
                    localStorage.setItem('opfab.feed.filter.type.alarm', form.alarm);
                    localStorage.setItem('opfab.feed.filter.type.action', form.action);
                    localStorage.setItem('opfab.feed.filter.type.compliant', form.compliant);
                    localStorage.setItem('opfab.feed.filter.type.information', form.information);
                    return this.store.dispatch(
                    new ApplyFilter({
                        name: FilterType.TYPE_FILTER,
                        active: !(form.alarm && form.action && form.compliant && form.information),
                        status: form
                    }));
                });
    }

    private initAckFilter() {

        const ackValue = localStorage.getItem('opfab.feed.filter.ack');
        if (!!ackValue) {
            this.ackFilterForm.get('ackControl').setValue(ackValue, {emitEvent: false});
            const active = ackValue !== 'all';
            const ack = active && ackValue === 'ack';
            this.store.dispatch(
                new ApplyFilter({
                    name: FilterType.ACKNOWLEDGEMENT_FILTER,
                    active: active,
                    status: ack
                }));

        } else {
            this.ackFilterForm.get('ackControl').setValue('notack', {emitEvent: false});
        }

        this.ackFilterForm
            .valueChanges
            .pipe(
                takeUntil(this.ngUnsubscribe$))
            .subscribe(form => {
                const active = form.ackControl !== 'all';
                const ack = active && form.ackControl === 'ack';
                localStorage.setItem('opfab.feed.filter.ack', form.ackControl);

                return this.store.dispatch(
                    new ApplyFilter({
                        name: FilterType.ACKNOWLEDGEMENT_FILTER,
                        active: active,
                        status: ack
                    }));
            });
    }

    initDateTimeFilter() {

        if (this.filterByPublishDate) this.dateFilterType = FilterType.PUBLISHDATE_FILTER;
        else this.dateFilterType = FilterType.BUSINESSDATE_FILTER;

        const savedStart = localStorage.getItem('opfab.feed.filter.start');
        const savedEnd = localStorage.getItem('opfab.feed.filter.end');

        if (!!savedStart) {
            this.timeFilterForm.get('dateTimeFrom').setValue(getDateTimeNgbFromMoment(moment(+savedStart)));
        }
        if (!!savedEnd) {
            this.timeFilterForm.get('dateTimeTo').setValue(getDateTimeNgbFromMoment(moment(+savedEnd)));
        }

        this.setNewFilterValue();

        this.dateTimeFilterChange.pipe(
            takeUntil(this.ngUnsubscribe$),
            debounceTime(2000),
        ).subscribe(() => this.setNewFilterValue());
    }


    onDateTimeChange() {
        this.dateTimeFilterChange.next();
    }

    private setNewFilterValue(): void {
        const status = { start: null, end: null };
        status.start = this.extractTime(this.timeFilterForm.get('dateTimeFrom'));
        status.end = this.extractTime(this.timeFilterForm.get('dateTimeTo'));

        if (status.start == null) {
            localStorage.removeItem('opfab.feed.filter.start');
        } else {
            localStorage.setItem('opfab.feed.filter.start', status.start);
        }
        if (status.end == null) {
            localStorage.removeItem('opfab.feed.filter.end');
        } else {
            localStorage.setItem('opfab.feed.filter.end', status.end);
        }

        this.store.dispatch(
            new ApplyFilter({
                name: this.dateFilterType,
                active: true,
                status: status
            }));
    }

    private extractTime(form: AbstractControl) {
        const val = form.value;
        if (!val || val == '')  {
            return null;
        }

        if (isNaN(val.time.hour)) {
            val.time.hour = 0;
        }
        if (isNaN(val.time.minute)) {
            val.time.minute = 0;
        }
        if (isNaN(val.time.second)) {
            val.time.second = 0;
        }

        const converter = new DateTimeNgb(val.date, val.time);
        return converter.convertToNumber();
    }

    isFilterActive(): boolean {
        return !this.typeFilterForm.get('alarm').value || !this.typeFilterForm.get('action').value
            || !this.typeFilterForm.get('compliant').value || !this.typeFilterForm.get('information').value
            || this.ackFilterForm.get('ackControl').value === 'ack'
            || !!this.extractTime(this.timeFilterForm.get('dateTimeFrom')) || !!this.extractTime(this.timeFilterForm.get('dateTimeTo'));
    }

    isFilterChanged(): boolean {
        return !this.typeFilterForm.get('alarm').value || !this.typeFilterForm.get('action').value
            || !this.typeFilterForm.get('compliant').value || !this.typeFilterForm.get('information').value
            || this.ackFilterForm.get('ackControl').value != 'notack'
            || !!this.extractTime(this.timeFilterForm.get('dateTimeFrom')) || !!this.extractTime(this.timeFilterForm.get('dateTimeTo'));
    }

    reset() {
        this.typeFilterForm.get('alarm').setValue(true, {emitEvent: true});
        this.typeFilterForm.get('action').setValue(true, {emitEvent: true});
        this.typeFilterForm.get('compliant').setValue(true, {emitEvent: true});
        this.typeFilterForm.get('information').setValue(true, {emitEvent: true});
        if (!this.hideAckFilter) {
            this.ackFilterForm.get('ackControl').setValue('notack', {emitEvent: true});
        }

        if (!this.hideTimerTags) {
            this.timeFilterForm.get('dateTimeFrom').setValue(null);
            this.timeFilterForm.get('dateTimeTo').setValue(null);
            this.setNewFilterValue();
        }
    }

}
