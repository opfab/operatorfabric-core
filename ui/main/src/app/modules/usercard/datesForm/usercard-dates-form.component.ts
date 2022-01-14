/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Subject} from 'rxjs';
import {TimeService} from '@ofServices/time.service';
import {NgbDateStruct, NgbTimeStruct} from '@ng-bootstrap/ng-bootstrap';
import {DateTimeNgb, getDateTimeNgbFromMoment} from '@ofModel/datetime-ngb.model';
import * as moment from 'moment-timezone';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {DatesForm} from './dates-form.model';

@Component({
    selector: 'of-usercard-dates-form',
    templateUrl: './usercard-dates-form.component.html',

})
export class UserCardDatesFormComponent implements OnInit, OnDestroy , OnChanges {

    @Input() public datesFormInputData: DatesForm;

    datesForm: FormGroup;
    unsubscribe$: Subject<void> = new Subject<void>();

    endDateMin: {year: number, month: number, day: number} = null;
    startDateMax: {year: number, month: number, day: number} = null;

    dateTimeFilterChange = new Subject();

    constructor(
        private timeService: TimeService
    ) {
    }

    ngOnInit() {

        this.datesForm = new FormGroup({
            startDate: new FormControl(''),
            endDate: new FormControl(''),
            lttd: new FormControl(''),

        });
        this.setInitialDateValues();
        this.dateTimeFilterChange.pipe(
            takeUntil(this.unsubscribe$),
            debounceTime(1000),
        ).subscribe(() => this.setDateFilterBounds());
    }

    private setInitialDateValues(): void {
        if (this.datesForm) {
            if (this.datesFormInputData.startDate.isVisible) this.datesForm.get('startDate').setValue(this.datesFormInputData.startDate.initialEpochDate != null ? getDateTimeNgbFromMoment(moment(this.datesFormInputData.startDate.initialEpochDate)) : '');
            if (this.datesFormInputData.endDate.isVisible) this.datesForm.get('endDate').setValue(this.datesFormInputData.endDate.initialEpochDate != null ? getDateTimeNgbFromMoment(moment(this.datesFormInputData.endDate.initialEpochDate)) : '');
            if (this.datesFormInputData.lttd.isVisible) this.datesForm.get('lttd').setValue(this.datesFormInputData.lttd.initialEpochDate != null ? getDateTimeNgbFromMoment(moment(this.datesFormInputData.lttd.initialEpochDate)) : '');
        }
        this.setDateFilterBounds();
    }

    private setDateFilterBounds(): void {
        if (this.datesForm) {
            if (this.datesFormInputData.startDate.isVisible) {
                this.endDateMin = {
                    year: this.datesForm.value.startDate.date.year,
                    month: this.datesForm.value.startDate.date.month,
                    day: this.datesForm.value.startDate.date.day
                };
            } else {
                this.endDateMin = null;
            }
            if (this.datesFormInputData.endDate.isVisible) {
                this.startDateMax = {
                    year: this.datesForm.value.endDate.date.year,
                    month: this.datesForm.value.endDate.date.month,
                    day: this.datesForm.value.endDate.date.day
                };
            } else {
                this.startDateMax = null;
            }
        }
    }

    public getStartDateAsEpoch(): number {
        return this.createTimestampFromValue(this.datesForm.get('startDate').value);
    }

    public getEndDateAsEpoch(): number {
        return this.createTimestampFromValue(this.datesForm.get('endDate').value);
    }

    public getLttdAsEpoch(): number {
        return this.createTimestampFromValue(this.datesForm.get('lttd').value);
    }

    onDateTimeChange() {
        this.dateTimeFilterChange.next(null);
    }

    ngOnChanges() {
        this.setDateFilterBounds();
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    private createTimestampFromValue = (value: any): number => {
        const {date, time} = value;
        if (date) {
            return this.timeService.toNgBNumberTimestamp(this.transformToTimestamp(date, time));
        } else {
            return null;
        }
    }

    private transformToTimestamp(date: NgbDateStruct, time: NgbTimeStruct): string {
        return new DateTimeNgb(date, time).formatDateTime();
    }

}
