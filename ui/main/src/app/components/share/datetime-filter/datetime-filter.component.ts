/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import * as moment from 'moment';
import {AfterViewInit, Component, forwardRef, Input, OnDestroy, OnInit} from '@angular/core';
import {ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR} from '@angular/forms';
import {NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {getDateTimeNgbFromMoment} from '@ofModel/datetime-ngb.model';

@Component({
    selector: 'of-datetime-filter',
    templateUrl: './datetime-filter.component.html',
    styleUrls: ['./datetime-filter.component.css'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => DatetimeFilterComponent),
        multi: true
    }
    ]
})
export class DatetimeFilterComponent implements ControlValueAccessor, OnInit, OnDestroy {

    private ngUnsubscribe$ = new Subject<void>();
    @Input() labelKey: string;
    @Input() filterPath: string;
    @Input() defaultDate: NgbDateStruct;
    @Input() defaultTime: { hour: number, minute: number };
    // no "unit of time enforcement", so be careful using offset
    @Input() offset: { amount: number, unit: string }[];

    disabled = true;
    time = {hour: 0, minute: 0};

    dateInput = new FormControl();
    timeInput = new FormControl();
    public datetimeForm: FormGroup = new FormGroup({
        date: this.dateInput,
        time: this.timeInput
    });

    constructor() {
        this.onChanges();
        this.resetDateAndTime();

    }

    ngOnInit() {
        if (!!this.offset) {
            const temp = moment();
            // @ts-ignore
            this.offset.forEach(os => temp.add(os.amount, os.unit));
            const converted = getDateTimeNgbFromMoment(temp);
            this.defaultDate = converted.date;
            this.defaultTime = converted.time;
            this.disabled = false;
            this.dateInput.setValue(this.defaultDate);

            this.dateInput.updateValueAndValidity({onlySelf: false, emitEvent: false});
            this.datetimeForm.updateValueAndValidity({onlySelf: false, emitEvent: true});

        }
    }

    ngOnDestroy() {
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
    }

    /* istanbul ignore next */
    public onTouched: () => void = () => {
    }

    // Method call when archive-filter.component.ts set value to 0
    writeValue(val: any): void {
        if (!this.offset) {
            this.disabled = true;
        }
        this.resetDateAndTime();

        if (val) {
            this.datetimeForm.setValue(val, {emitEvent: false});
        }
    }

    registerOnChange(fn: any): void {
        this.datetimeForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(fn);
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        isDisabled ? this.datetimeForm.disable() : this.datetimeForm.enable();
    }


    // Set time to enable when a date has been set
    onChanges(): void {
        this.dateInput.valueChanges.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(val => {
            if (val) {
                this.disabled = false;
            }
        });
        this.timeInput.valueChanges.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(val => {
            if (val) {
                this.disabled = false;
            }
        });
    }

    // Set time to disable when date is empty
    onChange(event): void {
        if (event.target.value === '') {
            this.disabled = true;
            this.resetDateAndTime();
        }
    }

    resetDateAndTime() {
        let val = {hour: 0, minute: 0};
        if (!!this.defaultTime) {
            val = this.defaultTime;
        }
        // option `{emitEvent: false})` to reset completely control and mark it as 'pristine'
        this.timeInput.reset(val, {emitEvent: false});

        let dateVal = null;
        if (this.defaultDate) {
            dateVal = this.defaultDate;
        }
        // option `{emitEvent: false})` to reset completely control and mark it as 'pristine'
        this.dateInput.reset(dateVal, {emitEvent: false});

    }

    computeLabelKey(): string {
        return this.labelKey + this.filterPath;
    }


}
