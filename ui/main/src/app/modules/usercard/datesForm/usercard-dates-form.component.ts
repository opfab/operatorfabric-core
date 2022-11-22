/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnChanges, OnDestroy, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {DatesForm} from './dates-form.model';
import {Utilities} from 'app/common/utilities';

@Component({
    selector: 'of-usercard-dates-form',
    templateUrl: './usercard-dates-form.component.html'
})
export class UserCardDatesFormComponent implements OnInit, OnDestroy, OnChanges {
    @Input() public datesFormInputData: DatesForm;

    @Output() public startDateFilterChange = new Subject();
    @Output() public endDateFilterChange = new Subject();
    @Output() public lttdFilterChange = new Subject();
    @Output() public expirationDateFilterChange = new Subject();

    datesForm: FormGroup<{
        startDate: FormControl<any | null>;
        endDate: FormControl<any | null>;
        lttd: FormControl<any | null>;
        expirationDate: FormControl<any | null>;
    }>;
    unsubscribe$: Subject<void> = new Subject<void>();

    endDateMin: {year: number; month: number; day: number} = null;

    ngOnInit() {
        this.datesForm = new FormGroup({
            startDate: new FormControl(''),
            endDate: new FormControl(''),
            lttd: new FormControl(''),
            expirationDate: new FormControl('')
        });
        this.setInitialDateValues();
        this.changeEndDateFilterBoundsWhenStartDateChange();
    }

    private setInitialDateValues(): void {
        this.setInitialStartDate();
        this.setInitialEndDate();
        this.setInitialLttd();
        this.setInitialExpirationDate();
        this.setEndDateFilterBounds();
    }

    private setInitialStartDate() {
        if (this.datesFormInputData.startDate.isVisible) {
            this.datesForm
                .get('startDate')
                .setValue(
                    this.datesFormInputData.startDate.initialEpochDate != null
                        ? Utilities.convertEpochDateToNgbDateTime(this.datesFormInputData.startDate.initialEpochDate)
                        : ''
                );
        }
    }

    private setInitialEndDate() {
        if (this.datesFormInputData.endDate.isVisible) {
            this.datesForm
                .get('endDate')
                .setValue(
                    this.datesFormInputData.endDate.initialEpochDate != null
                        ? Utilities.convertEpochDateToNgbDateTime(this.datesFormInputData.endDate.initialEpochDate)
                        : ''
                );
        }
    }

    private setInitialLttd() {
        if (this.datesFormInputData.lttd.isVisible) {
            this.datesForm
                .get('lttd')
                .setValue(
                    this.datesFormInputData.lttd.initialEpochDate != null
                        ? Utilities.convertEpochDateToNgbDateTime(this.datesFormInputData.lttd.initialEpochDate)
                        : ''
                );
        }
    }

    private setInitialExpirationDate() {
        if (this.datesFormInputData.expirationDate.isVisible) {
            this.datesForm
                .get('expirationDate')
                .setValue(
                    this.datesFormInputData.expirationDate.initialEpochDate != null
                        ? Utilities.convertEpochDateToNgbDateTime(this.datesFormInputData.expirationDate.initialEpochDate)
                        : ''
                );
        }
    }

    private changeEndDateFilterBoundsWhenStartDateChange() {
        this.startDateFilterChange
            .pipe(takeUntil(this.unsubscribe$), debounceTime(1000))
            .subscribe(() => this.setEndDateFilterBounds());
    }

    private setEndDateFilterBounds(): void {
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
        }
    }

    public getStartDateAsEpoch(): number {
        return Utilities.convertNgbDateTimeToEpochDate(this.datesForm.get('startDate').value);
    }

    public getEndDateAsEpoch(): number {
        return Utilities.convertNgbDateTimeToEpochDate(this.datesForm.get('endDate').value);
    }

    public getLttdAsEpoch(): number {
        return Utilities.convertNgbDateTimeToEpochDate(this.datesForm.get('lttd').value);
    }

    public getExpirationDateAsEpoch(): number {
        return Utilities.convertNgbDateTimeToEpochDate(this.datesForm.get('expirationDate').value);
    }

    // Hack : The three following method use setTimeout to let the component update the date internally
    // otherwise when we get the date we obtain the old one
    // refactoring of the date component may be needed to solve this problem
    onStartDateChange() {
        setTimeout(() => this.startDateFilterChange.next(null), 0);
    }

    onEndDateChange() {
        setTimeout(() => this.endDateFilterChange.next(null), 0);
    }

    onLttdChange() {
        setTimeout(() => this.lttdFilterChange.next(null), 0);
    }

    onExpirationDateChange() {
        setTimeout(() => this.expirationDateFilterChange.next(null), 0);
    }

    ngOnChanges() {
        if (this.datesForm) this.setInitialDateValues();
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
