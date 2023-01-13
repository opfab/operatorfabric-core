/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, EventEmitter, forwardRef, Injectable, Input, OnInit, OnDestroy, Output} from '@angular/core';
import {
    AbstractControl,
    ControlContainer,
    ControlValueAccessor,
    NG_VALUE_ACCESSOR, FormControl, FormGroup
} from '@angular/forms';
import {NgbDatepickerI18n, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import {takeUntil} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {ConfigService} from 'app/business/config/config.service';

const i18nPrefix = 'datePicker.';

const I18N_KEYS = {
    weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    months: [
        'january',
        'february',
        'march',
        'april',
        'may',
        'june',
        'july',
        'august',
        'september',
        'october',
        'november',
        'december'
    ],
    weekLabel: 'week'
};

// Define custom service providing the months and weekdays translations
@Injectable()
export class CustomDatepickerI18n extends NgbDatepickerI18n {
    constructor(private translateService: TranslateService) {
        super();
    }

    getWeekdayLabel(weekday: number): string {
        return this.translateService.instant(i18nPrefix + I18N_KEYS.weekdays[weekday - 1]);
    }
    getWeekLabel(): string {
        return this.translateService.instant(i18nPrefix + I18N_KEYS.weekLabel);
    }
    getMonthShortName(month: number): string {
        return this.translateService.instant(i18nPrefix + I18N_KEYS.months[month - 1]);
    }
    getMonthFullName(month: number): string {
        return this.getMonthShortName(month);
    }
    getDayAriaLabel(date: NgbDateStruct): string {
        return `${this.getMonthFullName(date.month)}, ${date.day}, ${date.year}`;
    }
}

@Component({
    selector: 'of-datetime-filter',
    templateUrl: './datetime-filter.component.html',
    styleUrls: ['./datetime-filter.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DatetimeFilterComponent),
            multi: true
        },
        {provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n}
    ]
})
export class DatetimeFilterComponent implements ControlValueAccessor, OnInit, OnDestroy {
    private ngUnsubscribe$ = new Subject<void>();
    @Input() labelKey: string;
    @Input() filterPath: string;
    @Input() defaultDate: NgbDateStruct;
    @Input() defaultTime: {hour: number; minute: number;};
    @Output() change = new EventEmitter();
    @Input() minDate: {year: number; month: number; day: number};
    @Input() maxDate: {year: number; month: number; day: number};

    placeholder: string;

    previousDateValue = null;

    disabled = true;
    time = {hour: 0, minute: 0};

    dateInput = new FormControl<NgbDateStruct | null>(null);
    timeInput = new FormControl<{hour: number; minute: number; second: number} | null>(null);
    public datetimeForm = new FormGroup({
        date: this.dateInput,
        time: this.timeInput
    });
    private control: AbstractControl;

    constructor(
        private store: Store<AppState>,
        private translateService: TranslateService,
        private controlContainer: ControlContainer,
        private configService: ConfigService
    ) {
        this.onChanges();
        this.resetDateAndTime();
    }

    ngOnInit(): void {
        this.getLocale()
            .pipe(takeUntil(this.ngUnsubscribe$))
            .subscribe((locale) => {
                this.translateService.use(locale);
                this.placeholder = this.translateService.instant(i18nPrefix + 'placeholder');
            });
        if (!!this.controlContainer && !!this.filterPath) {
            this.control = this.controlContainer.control.get(this.filterPath);
        }
    }

    protected getLocale(): Observable<string> {
        return this.configService.getConfigValueAsObservable('settings.locale');
    }

    ngOnDestroy() {
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
    }

    public onTouched: () => void = () => {};

    // Method call when archive-filter.component.ts set value to null
    writeValue(val: any): void {
        this.disabled = true;
        if (!val) {
            this.resetDateAndTime();
        } else if (!!val.date) {
            this.disabled = false;
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
        this.dateInput.valueChanges.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((val) => {
            if (val) {
                this.disabled = false;
            }
            // we check date value really change
            // because when we change minDate or maxDate it emits a "valueChange"
            // this was causing an infinite loop in usercard-dates-form.component.ts
            if (val !== this.previousDateValue) {
                this.previousDateValue = val;
                this.change.emit();
            }
        });
        this.timeInput.valueChanges.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((val) => {
            if (val) {
                this.disabled = false;
            }
            // avoid having null value for time field
            // when user erases values in input field
            else this.timeInput.setValue({hour:0 ,minute:0,second:0});
            
            this.change.emit();
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
        let val = {hour: 0, minute: 0, second: 0};
        if (!!this.defaultTime) {
            val = {...this.defaultTime, second: 0};
        }
        // option `{emitEvent: false})` to reset completely control and mark it as 'pristine'
        this.timeInput.reset(val, {emitEvent: false});

        let dateVal = null;
        if (this.defaultDate) {
            dateVal = this.defaultDate;
            this.disabled = false;
        }
        // option `{emitEvent: false})` to reset completely control and mark it as 'pristine'
        this.dateInput.reset(dateVal, {emitEvent: false});

        if (this.control) {
            this.control.setValue(this.datetimeForm.value);
        }
    }

    computeLabelKey(): string {
        return this.labelKey + this.filterPath;
    }
}
