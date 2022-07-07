/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
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
import {AbstractControl, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {debounce, debounceTime, distinctUntilChanged, takeUntil} from 'rxjs/operators';
import * as _ from 'lodash-es';
import {FilterType} from '@ofModel/feed-filter.model';
import {UserPreferencesService} from '@ofServices/user-preference.service';

import {DateTimeNgb} from '@ofModel/datetime-ngb.model';
import moment from 'moment';
import {MessageLevel} from '@ofModel/message.model';
import {AlertMessageAction} from '@ofStore/actions/alert.actions';
import {FilterService} from '@ofServices/lightcards/filter.service';
import {LightCardsFeedFilterService} from '@ofServices/lightcards/lightcards-feed-filter.service';
import {Utilities} from 'app/common/utilities';

@Component({
    selector: 'of-feed-filter',
    templateUrl: './feed-filter.component.html',
    styleUrls: ['./feed-filter.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FeedFilterComponent implements OnInit, OnDestroy {
    @Input() hideTimerTags: boolean;
    @Input() hideAckFilter: boolean;
    @Input() hideResponseFilter: boolean;
    @Input() hideApplyFiltersToTimeLineChoice: boolean;

    dateTimeFilterChange = new Subject();

    private ngUnsubscribe$ = new Subject<void>();
    typeFilterForm: UntypedFormGroup;
    ackFilterForm: UntypedFormGroup;
    timeFilterForm: UntypedFormGroup;
    responseFilterForm: UntypedFormGroup;
    timeLineFilterForm: UntypedFormGroup;

    endMinDate: {year: number; month: number; day: number} = null;
    startMaxDate: {year: number; month: number; day: number} = null;

    private dateFilterType = FilterType.PUBLISHDATE_FILTER;

    constructor(
        private store: Store<AppState>,
        private userPreferences: UserPreferencesService,
        private filterService: FilterService,
        private lightCardsFeedFilterService: LightCardsFeedFilterService
    ) {
        this.typeFilterForm = this.createFormGroup();
        this.ackFilterForm = this.createAckFormGroup();
        this.timeFilterForm = this.createDateTimeForm();
        this.responseFilterForm = this.createResponseFormGroup();
        this.timeLineFilterForm = this.createTimeLineFormGroup();
    }

    private createFormGroup() {
        return new UntypedFormGroup(
            {
                alarm: new UntypedFormControl(),
                action: new UntypedFormControl(),
                compliant: new UntypedFormControl(),
                information: new UntypedFormControl()
            },
            {updateOn: 'change'}
        );
    }

    private createResponseFormGroup() {
        return new UntypedFormGroup(
            {
                responseControl: new UntypedFormControl(true)
            },
            {updateOn: 'change'}
        );
    }

    private createTimeLineFormGroup() {
        return new UntypedFormGroup(
            {
                timeLineControl: new UntypedFormControl(true)
            },
            {updateOn: 'change'}
        );
    }

    private createAckFormGroup() {
        return new UntypedFormGroup(
            {
                ackControl: new UntypedFormControl('notack')
            },
            {updateOn: 'change'}
        );
    }

    private createDateTimeForm() {
        return new UntypedFormGroup({
            dateTimeFrom: new UntypedFormControl(''),
            dateTimeTo: new UntypedFormControl('')
        });
    }

    ngOnDestroy() {
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
    }

    ngOnInit() {
        this.initTypeFilter();

        if (!this.hideResponseFilter) {
            this.initResponseFilter();
        }

        if (!this.hideAckFilter) {
            this.initAckFilter();
        }

        if (!this.hideTimerTags) {
            this.initDateTimeFilter();
        }
        if (!this.hideApplyFiltersToTimeLineChoice) {
            this.initTimeLineFilter();
        }
    }

    private initTypeFilter() {
        const savedAlarm = this.userPreferences.getPreference('opfab.feed.filter.type.alarm');
        const savedAction = this.userPreferences.getPreference('opfab.feed.filter.type.action');
        const savedACompliant = this.userPreferences.getPreference('opfab.feed.filter.type.compliant');
        const savedInformation = this.userPreferences.getPreference('opfab.feed.filter.type.information');

        const alarmUnset = savedAlarm && savedAlarm != 'true';
        const actionUnset = savedAction && savedAction != 'true';
        const compliantUnset = savedACompliant && savedACompliant != 'true';
        const informationUnset = savedInformation && savedInformation != 'true';

        this.typeFilterForm.get('alarm').setValue(!alarmUnset, {emitEvent: false});
        this.typeFilterForm.get('action').setValue(!actionUnset, {emitEvent: false});
        this.typeFilterForm.get('compliant').setValue(!compliantUnset, {emitEvent: false});
        this.typeFilterForm.get('information').setValue(!informationUnset, {emitEvent: false});

        this.filterService.updateFilter(
            FilterType.TYPE_FILTER,
            alarmUnset || actionUnset || compliantUnset || informationUnset,
            {alarm: !alarmUnset, action: !actionUnset, compliant: !compliantUnset, information: !informationUnset}
        );

        this.typeFilterForm.valueChanges
            .pipe(
                takeUntil(this.ngUnsubscribe$),
                distinctUntilChanged((formA, formB) => {
                    return _.isEqual(formA, formB);
                }),
                debounce(() => timer(500))
            )
            .subscribe((form) => {
                this.userPreferences.setPreference('opfab.feed.filter.type.alarm', form.alarm);
                this.userPreferences.setPreference('opfab.feed.filter.type.action', form.action);
                this.userPreferences.setPreference('opfab.feed.filter.type.compliant', form.compliant);
                this.userPreferences.setPreference('opfab.feed.filter.type.information', form.information);
                return this.filterService.updateFilter(
                    FilterType.TYPE_FILTER,
                    !(form.alarm && form.action && form.compliant && form.information),
                    form
                );
            });
    }

    private initResponseFilter() {
        const responseValue = this.userPreferences.getPreference('opfab.feed.filter.response');
        const responseUnset = responseValue && responseValue != 'true';

        this.responseFilterForm.get('responseControl').setValue(!responseUnset, {emitEvent: false});

        if (!!responseValue) {
            this.filterService.updateFilter(FilterType.RESPONSE_FILTER, responseUnset, !responseUnset);
        }

        this.responseFilterForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((form) => {
            this.userPreferences.setPreference('opfab.feed.filter.response', form.responseControl);

            return this.filterService.updateFilter(
                FilterType.RESPONSE_FILTER,
                !form.responseControl,
                form.responseControl
            );
        });
    }

    private initTimeLineFilter() {
        const timeLineValue = this.userPreferences.getPreference('opfab.feed.filter.applyToTimeLine');

        let timeLineFiltered = true;
        if (timeLineValue && timeLineValue != 'true') timeLineFiltered = false;

        this.timeLineFilterForm.get('timeLineControl').setValue(timeLineFiltered, {emitEvent: false});
        this.lightCardsFeedFilterService.setOnlyBusinessFilterForTimeLine(!timeLineFiltered);

        this.timeLineFilterForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((form) => {
            this.userPreferences.setPreference('opfab.feed.filter.applyToTimeLine', form.timeLineControl);
            this.lightCardsFeedFilterService.setOnlyBusinessFilterForTimeLine(!form.timeLineControl);
        });
    }

    private initAckFilter() {
        const ackValue = this.userPreferences.getPreference('opfab.feed.filter.ack');
        if (!!ackValue) {
            this.ackFilterForm.get('ackControl').setValue(ackValue, {emitEvent: false});
            const active = ackValue !== 'all';
            const ack = active && ackValue === 'ack';
            this.filterService.updateFilter(FilterType.ACKNOWLEDGEMENT_FILTER, active, ack);
        } else {
            this.ackFilterForm.get('ackControl').setValue('notack', {emitEvent: false});
        }

        this.ackFilterForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((form) => {
            const active = form.ackControl !== 'all';
            const ack = active && form.ackControl === 'ack';
            this.userPreferences.setPreference('opfab.feed.filter.ack', form.ackControl);

            return this.filterService.updateFilter(FilterType.ACKNOWLEDGEMENT_FILTER, active, ack);
        });
    }

    initDateTimeFilter() {
        this.dateFilterType = FilterType.PUBLISHDATE_FILTER;

        const savedStart = this.userPreferences.getPreference('opfab.feed.filter.start');
        const savedEnd = this.userPreferences.getPreference('opfab.feed.filter.end');

        if (!!savedStart) {
            this.timeFilterForm.get('dateTimeFrom').setValue(Utilities.convertEpochDateToNgbDateTime(moment(+savedStart).valueOf()));
        }
        if (!!savedEnd) {
            this.timeFilterForm.get('dateTimeTo').setValue(Utilities.convertEpochDateToNgbDateTime(moment(+savedEnd).valueOf()));
        }

        this.setNewFilterValue();

        this.dateTimeFilterChange
            .pipe(takeUntil(this.ngUnsubscribe$), debounceTime(2000))
            .subscribe(() => this.setNewFilterValue());
    }

    onDateTimeChange() {
        this.dateTimeFilterChange.next(null);
    }

    private setNewFilterValue(): void {
        const status = {start: null, end: null};
        status.start = this.extractTime(this.timeFilterForm.get('dateTimeFrom'));
        status.end = this.extractTime(this.timeFilterForm.get('dateTimeTo'));

        if (
            status.start != null &&
            !isNaN(status.start) &&
            status.end != null &&
            !isNaN(status.end) &&
            status.start > status.end
        ) {
            this.displayMessage('shared.endDateBeforeStartDate', '', MessageLevel.ERROR);
            return;
        }

        if (status.start == null || isNaN(status.start)) {
            this.userPreferences.removePreference('opfab.feed.filter.start');
            this.endMinDate = null;
        } else {
            this.userPreferences.setPreference('opfab.feed.filter.start', status.start);
            this.endMinDate = {
                year: this.timeFilterForm.value.dateTimeFrom.date.year,
                month: this.timeFilterForm.value.dateTimeFrom.date.month,
                day: this.timeFilterForm.value.dateTimeFrom.date.day
            };
        }
        if (status.end == null || isNaN(status.end)) {
            this.userPreferences.removePreference('opfab.feed.filter.end');
            this.startMaxDate = null;
        } else {
            this.userPreferences.setPreference('opfab.feed.filter.end', status.end);
            this.startMaxDate = {
                year: this.timeFilterForm.value.dateTimeTo.date.year,
                month: this.timeFilterForm.value.dateTimeTo.date.month,
                day: this.timeFilterForm.value.dateTimeTo.date.day
            };
        }

        this.filterService.updateFilter(this.dateFilterType, true, status);
    }

    private extractTime(form: AbstractControl) {
        const val = form.value;
        if (!val || val == '') {
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
        return (
            !this.typeFilterForm.get('alarm').value ||
            !this.typeFilterForm.get('action').value ||
            !this.typeFilterForm.get('compliant').value ||
            !this.typeFilterForm.get('information').value ||
            !this.responseFilterForm.get('responseControl').value ||
            this.ackFilterForm.get('ackControl').value === 'ack' ||
            !!this.extractTime(this.timeFilterForm.get('dateTimeFrom')) ||
            !!this.extractTime(this.timeFilterForm.get('dateTimeTo'))
        );
    }

    isFilterChanged(): boolean {
        return (
            !this.typeFilterForm.get('alarm').value ||
            !this.typeFilterForm.get('action').value ||
            !this.typeFilterForm.get('compliant').value ||
            !this.typeFilterForm.get('information').value ||
            !this.responseFilterForm.get('responseControl').value ||
            this.ackFilterForm.get('ackControl').value != 'notack' ||
            !this.timeLineFilterForm.get('timeLineControl').value ||
            !!this.extractTime(this.timeFilterForm.get('dateTimeFrom')) ||
            !!this.extractTime(this.timeFilterForm.get('dateTimeTo'))
        );
    }

    reset() {
        this.typeFilterForm.get('alarm').setValue(true, {emitEvent: true});
        this.typeFilterForm.get('action').setValue(true, {emitEvent: true});
        this.typeFilterForm.get('compliant').setValue(true, {emitEvent: true});
        this.typeFilterForm.get('information').setValue(true, {emitEvent: true});
        if (!this.hideResponseFilter) {
            this.responseFilterForm.get('responseControl').setValue(true, {emitEvent: true});
        }
        if (!this.hideAckFilter) {
            this.ackFilterForm.get('ackControl').setValue('notack', {emitEvent: true});
        }

        if (!this.hideTimerTags) {
            this.timeFilterForm.get('dateTimeFrom').setValue(null);
            this.timeFilterForm.get('dateTimeTo').setValue(null);
            this.setNewFilterValue();
        }
        if (!this.hideApplyFiltersToTimeLineChoice) {
            this.timeLineFilterForm.get('timeLineControl').setValue(true, {emitEvent: true});
        }
    }

    private displayMessage(i18nKey: string, msg: string, severity: MessageLevel = MessageLevel.ERROR) {
        this.store.dispatch(
            new AlertMessageAction({alertMessage: {message: msg, level: severity, i18n: {key: i18nKey}}})
        );
    }
}
