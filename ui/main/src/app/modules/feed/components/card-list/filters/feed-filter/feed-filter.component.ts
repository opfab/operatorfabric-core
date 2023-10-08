/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnDestroy, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {Subject, timer} from 'rxjs';
import {AbstractControl, FormControl, FormGroup} from '@angular/forms';
import {debounce, debounceTime, distinctUntilChanged, takeUntil} from 'rxjs/operators';
import * as _ from 'lodash-es';
import {FilterType} from '@ofModel/feed-filter.model';
import {UserPreferencesService} from 'app/business/services/users/user-preference.service';

import {DateTimeNgb} from '@ofModel/datetime-ngb.model';
import moment from 'moment';
import {MessageLevel} from '@ofModel/message.model';
import {FilterService} from 'app/business/services/lightcards/filter.service';
import {LightCardsFeedFilterService} from 'app/business/services/lightcards/lightcards-feed-filter.service';
import {Utilities} from 'app/business/common/utilities';
import {AlertMessageService} from 'app/business/services/alert-message.service';

@Component({
    selector: 'of-feed-filter',
    templateUrl: './feed-filter.component.html',
    styleUrls: ['./feed-filter.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FeedFilterComponent implements OnInit, OnDestroy {
    @Input() hideTimerTags: boolean;
    @Input() defaultAcknowledgmentFilter: string;
    @Input() hideResponseFilter: boolean;

    @Input() defaultSorting: string;

    @Input() hideApplyFiltersToTimeLineChoice: boolean;

    @Output() filterActiveChange = new Subject<boolean>();

    dateTimeFilterChange = new Subject();

    private ngUnsubscribe$ = new Subject<void>();
    typeFilterForm: FormGroup<{
        alarm: FormControl<boolean | null>;
        action: FormControl<boolean | null>;
        compliant: FormControl<boolean | null>;
        information: FormControl<boolean | null>;
    }>;
    ackFilterForm: FormGroup<{
        ackControl: FormControl<boolean | null>;
        notAckControl: FormControl<boolean | null>;
    }>;
    timeFilterForm: FormGroup<{
        dateTimeFrom: FormControl<any>;
        dateTimeTo: FormControl<any>;
    }>;
    responseFilterForm: FormGroup<{
        responseControl: FormControl<boolean | null>;
    }>;
    timeLineFilterForm: FormGroup<{
        timeLineControl: FormControl<boolean | null>;
    }>;

    endMinDate: {year: number; month: number; day: number} = null;
    startMaxDate: {year: number; month: number; day: number} = null;

    private dateFilterType = FilterType.PUBLISHDATE_FILTER;

    constructor(
        private userPreferences: UserPreferencesService,
        private filterService: FilterService,
        private lightCardsFeedFilterService: LightCardsFeedFilterService,
    ) {
        this.typeFilterForm = this.createFormGroup();
        this.ackFilterForm = this.createAckFormGroup();
        this.timeFilterForm = this.createDateTimeForm();
        this.responseFilterForm = this.createResponseFormGroup();
        this.timeLineFilterForm = this.createTimeLineFormGroup();
    }

    private createFormGroup() {
        return new FormGroup(
            {
                alarm: new FormControl<boolean | null>(null),
                action: new FormControl<boolean | null>(null),
                compliant: new FormControl<boolean | null>(null),
                information: new FormControl<boolean | null>(null)
            },
            {updateOn: 'change'}
        );
    }

    private createResponseFormGroup() {
        return new FormGroup(
            {
                responseControl: new FormControl<boolean | null>(true)
            },
            {updateOn: 'change'}
        );
    }

    private createTimeLineFormGroup() {
        return new FormGroup(
            {
                timeLineControl: new FormControl<boolean | null>(true)
            },
            {updateOn: 'change'}
        );
    }

    private createAckFormGroup() {
        return new FormGroup(
            {
                ackControl: new FormControl<boolean | null>(false),
                notAckControl: new FormControl<boolean | null>(true)
            },
            {updateOn: 'change'}
        );
    }

    private createDateTimeForm() {
        return new FormGroup({
            dateTimeFrom: new FormControl<any>(''),
            dateTimeTo: new FormControl<any>('')
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

        this.initAckFilter();

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

        const alarmUnset = savedAlarm && savedAlarm !== 'true';
        const actionUnset = savedAction && savedAction !== 'true';
        const compliantUnset = savedACompliant && savedACompliant !== 'true';
        const informationUnset = savedInformation && savedInformation !== 'true';

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
                this.filterActiveChange.next(this.isFilterActive());
                return this.filterService.updateFilter(
                    FilterType.TYPE_FILTER,
                    !(form.alarm && form.action && form.compliant && form.information),
                    form
                );
            });
    }

    private initResponseFilter() {
        const responseValue = this.userPreferences.getPreference('opfab.feed.filter.response');
        const responseUnset = responseValue && responseValue !== 'true';

        this.responseFilterForm.get('responseControl').setValue(!responseUnset, {emitEvent: false});

        if (responseValue) {
            this.filterService.updateFilter(FilterType.RESPONSE_FILTER, responseUnset, !responseUnset);
        }

        this.responseFilterForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((form) => {
            this.userPreferences.setPreference('opfab.feed.filter.response', form.responseControl);
            this.filterActiveChange.next(this.isFilterActive());
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
        if (timeLineValue && timeLineValue !== 'true') timeLineFiltered = false;

        this.timeLineFilterForm.get('timeLineControl').setValue(timeLineFiltered, {emitEvent: false});
        this.lightCardsFeedFilterService.setOnlyBusinessFilterForTimeLine(!timeLineFiltered);

        this.timeLineFilterForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((form) => {
            this.userPreferences.setPreference('opfab.feed.filter.applyToTimeLine', form.timeLineControl);
            this.lightCardsFeedFilterService.setOnlyBusinessFilterForTimeLine(!form.timeLineControl);
            this.filterActiveChange.next(this.isFilterActive());

        });
    }

    private initAckFilter() {
        const ackValue = this.userPreferences.getPreference('opfab.feed.filter.ack');
        this.initAckFilterValues(ackValue ? ackValue : this.defaultAcknowledgmentFilter);


        this.ackFilterForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((form) => {
            const active = !form.ackControl || !form.notAckControl;
            const ack = (!form.ackControl && !form.notAckControl) ? null : active && form.ackControl;
            this.userPreferences.setPreference('opfab.feed.filter.ack', this.getAckPreference(form.ackControl, form.notAckControl));
            this.filterActiveChange.next(this.isFilterActive());
            return this.filterService.updateFilter(FilterType.ACKNOWLEDGEMENT_FILTER, active, ack);
        });
    }

    private initAckFilterValues(ackValue : string) {
        if (ackValue === 'ack') {
            this.ackFilterForm.get('ackControl').setValue(true, {emitEvent: false});
            this.ackFilterForm.get('notAckControl').setValue(false, {emitEvent: false});

            this.filterService.updateFilter(FilterType.ACKNOWLEDGEMENT_FILTER, true, true);
        } else if (ackValue === 'notack') {
            this.ackFilterForm.get('ackControl').setValue(false, {emitEvent: false});
            this.ackFilterForm.get('notAckControl').setValue(true, {emitEvent: false});

            this.filterService.updateFilter(FilterType.ACKNOWLEDGEMENT_FILTER, true, false);
        } else  if (ackValue === 'all') {
            this.ackFilterForm.get('ackControl').setValue(true, {emitEvent: false});
            this.ackFilterForm.get('notAckControl').setValue(true, {emitEvent: false});

            this.filterService.updateFilter(FilterType.ACKNOWLEDGEMENT_FILTER, false, false);
        } else  if (ackValue === 'none'){
            this.ackFilterForm.get('ackControl').setValue(false, {emitEvent: false});
            this.ackFilterForm.get('notAckControl').setValue(false, {emitEvent: false});

            this.filterService.updateFilter(FilterType.ACKNOWLEDGEMENT_FILTER, true, null);
        }
    }

    private getAckPreference(ack: boolean, notAck: boolean) : string {
        if (ack && notAck) return 'all';
        else if (!ack && !notAck) return 'none';
        else return ack ? 'ack' : 'notack';
    }

    initDateTimeFilter() {
        this.dateFilterType = FilterType.PUBLISHDATE_FILTER;

        const savedStart = this.userPreferences.getPreference('opfab.feed.filter.start');
        const savedEnd = this.userPreferences.getPreference('opfab.feed.filter.end');

        if (savedStart) {
            this.timeFilterForm.get('dateTimeFrom').setValue(Utilities.convertEpochDateToNgbDateTime(moment(+savedStart).valueOf()));
        }
        if (savedEnd) {
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
        this.filterActiveChange.next(this.isFilterActive());
    }

    private extractTime(form: AbstractControl) {
        const val = form.value;
        if (!val || val === '') {
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
            !this.ackFilterForm.get('notAckControl').value ||
            !!this.extractTime(this.timeFilterForm.get('dateTimeFrom')) ||
            !!this.extractTime(this.timeFilterForm.get('dateTimeTo'))
        );
    }

    showResetLink(): boolean {
        return (
            !this.typeFilterForm.get('alarm').value ||
            !this.typeFilterForm.get('action').value ||
            !this.typeFilterForm.get('compliant').value ||
            !this.typeFilterForm.get('information').value ||
            !this.responseFilterForm.get('responseControl').value ||
            this.defaultAcknowledgmentFilter !== this.getAckPreference(this.ackFilterForm.get('ackControl').value, this.ackFilterForm.get('notAckControl').value) ||
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
        this.initAckFilterValues(this.defaultAcknowledgmentFilter);
        this.userPreferences.setPreference('opfab.feed.filter.ack', this.defaultAcknowledgmentFilter);

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
        AlertMessageService.sendAlertMessage({message: msg, level: severity, i18n: {key: i18nKey}});
    }
}
