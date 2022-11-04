/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 *  See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from "@angular/core";
import {AbstractControl} from "@angular/forms";
import {DateTimeNgb} from "@ofModel/datetime-ngb.model";
import {MessageLevel} from "@ofModel/message.model";
import {MultiSelectOption} from "@ofModel/multiselect.model";
import {ActionTypeEnum} from "@ofModel/user-action-log.model";
import {UserService} from "@ofServices/user.service";
import {AlertMessageAction} from "@ofStore/actions/alert.actions";
import {Utilities} from "app/common/utilities";
import {debounceTime, Subject, takeUntil} from "rxjs";
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';

@Component({
    selector: 'of-useractionlogs-filters',
    templateUrl: './useractionlogs-filters.component.html'
})

export class UserActionLogsFiltersComponent implements OnInit, OnDestroy {

    @Input() userActionLogsForm;
    @Input() defaultMinDate;
    @Output() search = new EventEmitter<string>();
    @Output() reset = new EventEmitter<string>();

    loginMultiSelectConfig = {
        labelKey: 'useractionlogs.filters.login',
        placeholderKey: 'useractionlogs.login',
        sortOptions: true,
        nbOfDisplayValues: 1
    };

    actionsMultiSelectConfig = {
        labelKey: 'useractionlogs.filters.action',
        placeholderKey: 'useractionlogs.action',
        sortOptions: true,
        nbOfDisplayValues: 1
    };

    logins : Array<MultiSelectOption> = [];
    actions = [];
    loginsSelected = [];
    actionsSelected = [];
    minDate : {year: number; month: number; day: number} = null;
    maxDate : {year: number; month: number; day: number} = null;
    dateTimeFilterChange = new Subject();
    filters: Map<any, any>;

    unsubscribe$: Subject<void> = new Subject<void>();

    constructor( private store: Store<AppState>, private userService: UserService) {
    }

    ngOnInit(): void {
        this.userService.getAll().subscribe(users => {
            this.logins=[];
            users.forEach(u => {
                this.logins.push(new MultiSelectOption(u.login, u.login));
            });
        });
        Object.values(ActionTypeEnum).forEach((t) => this.actions.push(new MultiSelectOption(t, t)));

        this.dateTimeFilterChange
        .pipe(takeUntil(this.unsubscribe$), debounceTime(1000))
        .subscribe(() => this.setDateFilterBounds());
    }


    onDateTimeChange() {
        this.dateTimeFilterChange.next(null);
    }

    setDateFilterBounds(): void {
        if (this.userActionLogsForm.value.dateFrom?.date) {
            this.minDate = {
                year: this.userActionLogsForm.value.dateFrom.date.year,
                month: this.userActionLogsForm.value.dateFrom.date.month,
                day: this.userActionLogsForm.value.dateFrom.date.day
            };
        }
        if (this.userActionLogsForm.value.dateTo?.date) {
            this.maxDate = {
                year: this.userActionLogsForm.value.dateTo.date.year,
                month: this.userActionLogsForm.value.dateTo.date.month,
                day: this.userActionLogsForm.value.dateTo.date.day
            };
        }
    }

    resetForm() {
        this.loginsSelected = [];
        this.actionsSelected = [];
        this.reset.emit(null);
    }

    query() {
        if (this.isFormValid()) {
            this.search.emit(null);
        }
    }


    private isFormValid(): boolean {
        return this.areAllDatesWellFormatted() && this.areDatesInCorrectOrder();
    }

    private areAllDatesWellFormatted(): boolean {
        const validationResult = this.validateDatesFormat();

        if (!validationResult.areDatesCorrectlyFormatted) {
            this.displayMessage(validationResult.errorMessageKey, '', MessageLevel.ERROR);
        }

        return validationResult.areDatesCorrectlyFormatted;
    }

    private validateDatesFormat(): {areDatesCorrectlyFormatted: boolean; errorMessageKey: string} {
        if (!this.isDateWellFormatted('dateFrom'))
            return {areDatesCorrectlyFormatted: false, errorMessageKey: 'shared.filters.invalidFromDate'};
        if (!this.isDateWellFormatted('dateTo'))
            return {areDatesCorrectlyFormatted: false, errorMessageKey: 'shared.filters.invalidToDate'};

        return {areDatesCorrectlyFormatted: true, errorMessageKey: null};
    }

    private isDateWellFormatted(dateFieldName: string): boolean {
        const dateControl = this.userActionLogsForm.get(dateFieldName);
        const dateValue = this.extractTime(dateControl);
        const isFieldEmpty = dateControl.value.date == null;

        return isFieldEmpty || !isNaN(dateValue);
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

    private displayMessage(i18nKey: string, msg: string, severity: MessageLevel = MessageLevel.ERROR) {
        this.store.dispatch(
            new AlertMessageAction({alertMessage: {message: msg, level: severity, i18n: {key: i18nKey}}})
        );
    }

    private areDatesInCorrectOrder() {
        let result = true;

        const start = this.extractTime(this.userActionLogsForm.get('dateFrom'));
        const end = this.extractTime(this.userActionLogsForm.get('dateTo'));

        if (
            start != null &&
            !isNaN(start) &&
            end != null &&
            !isNaN(end) &&
            start > end
        ) {
            this.displayMessage('shared.filters.toDateBeforeFromDate', '', MessageLevel.ERROR);
            result = false;
        }

        return result;
    }

    transformFiltersListToMap = (filters: any): void => {
        this.filters = new Map();

        Object.keys(filters).forEach((key) => {
            const element = filters[key];
            if (element) {
                if (key === 'dateTo' || key === 'dateFrom') this.dateFilterToMap(key, element);
                else if (element.length) this.otherFilterToMap(element, key);
            }
        });
    };

    private otherFilterToMap(element: any, key: string) {
        const ids = [];
        element.forEach((val) => ids.push(val));
        this.filters.set(key, ids);
    }

    private dateFilterToMap(key: string, element: any) {
        const epochDate = Utilities.convertNgbDateTimeToEpochDate(element);
        if (epochDate) this.filters.set(key, [epochDate]);
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}