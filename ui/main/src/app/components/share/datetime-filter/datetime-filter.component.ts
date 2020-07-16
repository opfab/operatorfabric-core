/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Component, forwardRef, Input, OnInit, OnDestroy} from '@angular/core';
import {ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR} from '@angular/forms';
import {NgbDateStruct, NgbTimeStruct} from '@ng-bootstrap/ng-bootstrap';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

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
    disabled = true;
    time = {hour: 0, minute: 0};
    @Input() filterPath: string;
    @Input() defaultDate: NgbDateStruct;
    @Input() defaultTime: { hour: number, minute: number };
    public datetimeForm: FormGroup = new FormGroup({
        date: new FormControl(),
        time: new FormControl()
    });

    constructor() {
        this.onChanges();
        this.resetDateAndTime();

    }

    ngOnInit() {
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
        this.disabled = true;
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
        this.datetimeForm.get('date').valueChanges.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(val => {
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
        const time = this.datetimeForm.get('time');
        let val = {hour: 0, minute: 0};
        if (!!this.defaultTime) {
            val = this.defaultTime;
        }
        // option `{emitEvent: false})` to reset completely control and mark it as 'pristine'
        time.reset(val, {emitEvent: false});

        const date = this.datetimeForm.get('date');
        let dateVal = null;
        if (this.defaultDate) {
            dateVal = this.defaultDate;
        }
        // option `{emitEvent: false})` to reset completely control and mark it as 'pristine'
        date.reset(dateVal, {emitEvent: false});

    }

    computeLabelKey(): string {
        return this.labelKey + this.filterPath;
    }


}
