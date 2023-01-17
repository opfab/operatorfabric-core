/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ConfigService} from 'app/business/services/config.service';
import {Card} from '@ofModel/card.model';
import {LightCard} from '@ofModel/light-card.model';
import {AbstractControl, FormGroup} from '@angular/forms';
import {ProcessesService} from 'app/business/services/processes.service';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {NgbDateStruct, NgbTimeStruct} from '@ng-bootstrap/ng-bootstrap';
import {DateTimeNgb} from '@ofModel/datetime-ngb.model';
import {ProcessStatesMultiSelectOptionsService} from '@ofServices/process-states-multi-select-options.service';
import {MultiSelectOption} from '@ofModel/multiselect.model';
import {MessageLevel} from '@ofModel/message.model';
import {AlertMessageAction} from '@ofStore/actions/alert.actions';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';

import moment from 'moment';
import {Utilities} from 'app/common/utilities';
import {UserPreferencesService} from '@ofServices/user-preference.service';
import {UserService} from '@ofServices/user.service';
import {OpfabRolesEnum} from '@ofModel/user.model';

export enum FilterDateTypes {
    PUBLISH_DATE_FROM_PARAM = 'publishDateFrom',
    PUBLISH_DATE_TO_PARAM = 'publishDateTo',
    ACTIVE_FROM_PARAM = 'activeFrom',
    ACTIVE_TO_PARAM = 'activeTo'
}

export const checkElement = (enumeration: typeof FilterDateTypes, value: string): boolean => {
    let result = false;
    if (
        Object.values(enumeration)
            .map((enumValue) => enumValue.toString())
            .includes(value)
    ) {
        result = true;
    }
    return result;
};

export const transformToTimestamp = (date: NgbDateStruct, time: NgbTimeStruct): string => {
    return new DateTimeNgb(date, time).formatDateTime();
};

@Component({
    selector: 'of-archives-logging-filters',
    templateUrl: './archives-logging-filters.component.html',
    styleUrls: ['./archives-logging-filters.component.scss']
})
export class ArchivesLoggingFiltersComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input() public card: Card | LightCard;
    @Input() parentForm: FormGroup;
    @Input() visibleProcesses: any[];
    @Input() hideChildStates: boolean;
    @Input() tags: any[];
    @Output() search = new EventEmitter<string>();
    @Output() reset = new EventEmitter<string>();

    hasCurrentUserRigthsToViewAllArchivedCards: boolean;
    isAdminModeChecked: boolean;

    unsubscribe$: Subject<void> = new Subject<void>();

    filters;

    // Filter values
    processMultiSelectOptionsPerProcessGroups = new Map();
    processesWithoutProcessGroupMultiSelectOptions: Array<MultiSelectOption> = [];
    processGroupMultiSelectOptions: Array<MultiSelectOption> = [];
    processGroupSelected: Array<string> = [];
    processGroupMultiSelectConfig = {
        labelKey: 'shared.filters.processGroup',
        placeholderKey: 'shared.filters.selectProcessGroupText',
        sortOptions: true,
        nbOfDisplayValues: 1
    };

    processMultiSelectOptions: Array<MultiSelectOption> = [];
    processMultiSelectOptionsWhenSelectedProcessGroup: Array<MultiSelectOption> = [];
    processSelected: Array<string> = [];
    visibleProcessesId: Array<string> = [];
    processMultiSelectConfig = {
        labelKey: 'shared.filters.process',
        placeholderKey: 'shared.filters.selectProcessText',
        sortOptions: true,
        nbOfDisplayValues: 1
    };

    stateMultiSelectOptions: Array<MultiSelectOption> = [];
    stateSelected: Array<string> = [];
    stateMultiSelectConfig = {
        labelKey: 'shared.filters.state',
        placeholderKey: 'shared.filters.selectStateText',
        sortOptions: true,
        nbOfDisplayValues: 1
    };

    tagsMultiSelectOptions: Array<MultiSelectOption> = [];
    tagsSelected: Array<string> = [];
    tagsMultiSelectConfig = {
        labelKey: 'shared.filters.tags',
        placeholderKey: 'shared.filters.selectTagText',
        sortOptions: true,
        nbOfDisplayValues: 1
    };

    statesMultiSelectOptionsPerProcesses: Array<MultiSelectOption> = [];
    processesGroups: Map<string, {name: string; processes: string[]}>;

    dateTimeFilterChange = new Subject();

    publishMinDate: {year: number; month: number; day: number} = null;
    publishMaxDate: {year: number; month: number; day: number} = null;
    activeMinDate: {year: number; month: number; day: number} = null;
    activeMaxDate: {year: number; month: number; day: number} = null;

    defaultMinPublishDate: NgbDateStruct;

    constructor(
        private store: Store<AppState>,
        private configService: ConfigService,
        private processesService: ProcessesService,
        private processStatesDropdownListService: ProcessStatesMultiSelectOptionsService,
        private userPreferences: UserPreferencesService,
        private userService: UserService
    ) {
        this.hasCurrentUserRigthsToViewAllArchivedCards = this.userService.isCurrentUserAdmin() || this.userService.hasCurrentUserAnyRole([OpfabRolesEnum.VIEW_ALL_ARCHIVED_CARDS]);

        const isAdminModeCheckedInStorage = this.userPreferences.getPreference('opfab.isAdminModeChecked');
        this.isAdminModeChecked = this.hasCurrentUserRigthsToViewAllArchivedCards && isAdminModeCheckedInStorage === 'true';
    }

    ngOnInit() {
        this.processesGroups = this.processesService.getProcessGroups();
        this.processMultiSelectOptionsWhenSelectedProcessGroup = [];
        this.visibleProcessesId = this.visibleProcesses.map((element) => element.value);

        this.loadValuesForFilters();
        this.changeProcessesWhenSelectProcessGroup();
        this.changeStatesWhenSelectProcess();

        this.dateTimeFilterChange
            .pipe(takeUntil(this.unsubscribe$), debounceTime(1000))
            .subscribe(() => this.setDateFilterBounds());
    }

    ngAfterViewInit(): void {
        this.setDateFilterBounds();
    }

    clearMultiFilters() {
        this.statesMultiSelectOptionsPerProcesses = [];
        this.processesWithoutProcessGroupMultiSelectOptions = [];
        this.processMultiSelectOptionsPerProcessGroups.clear();
        this.processGroupMultiSelectOptions = [];
        this.tagsMultiSelectOptions = [];
    }

    loadValuesForFilters() {
        this.clearMultiFilters();

        this.statesMultiSelectOptionsPerProcesses =
            this.processStatesDropdownListService.getStatesMultiSelectOptionsPerProcess(
                this.isAdminModeChecked,
                this.hideChildStates
            );

        this.processesWithoutProcessGroupMultiSelectOptions =
            this.processStatesDropdownListService.getProcessesWithoutProcessGroupMultiSelectOptions(
                this.isAdminModeChecked,
                this.visibleProcessesId
            );

        this.processMultiSelectOptionsPerProcessGroups =
            this.processStatesDropdownListService.getProcessesMultiSelectOptionsPerProcessGroup(
                this.isAdminModeChecked,
                this.visibleProcessesId
            );

        this.processGroupMultiSelectOptions = this.processStatesDropdownListService.getProcessGroupsMultiSelectOptions(
            this.processesWithoutProcessGroupMultiSelectOptions,
            this.processMultiSelectOptionsPerProcessGroups
        );

        // we must filter visibleProcesses to keep only the processes in the perimeter of the user
        const processesIds = [];
        this.statesMultiSelectOptionsPerProcesses.forEach((process) => processesIds.push(process.value));
        this.processMultiSelectOptions = this.visibleProcesses.filter((visibleProcess) =>
            processesIds.includes(visibleProcess.value)
        );

        if (!!this.tags) {
            this.tags.forEach((tag) => this.tagsMultiSelectOptions.push(new MultiSelectOption(tag.value, tag.label)));
        }
        this.setDefaultPublishDateFilter();
    }

    toggleAdminMode() {
        this.isAdminModeChecked = !this.isAdminModeChecked;
        this.userPreferences.setPreference('opfab.isAdminModeChecked', String(this.isAdminModeChecked));
        this.loadValuesForFilters();
        this.resetForm();
    }

    transformFiltersListToMap = (filters: any): void => {
        this.filters = new Map();
        this.filters.set('adminMode', [this.isAdminModeChecked]);

        Object.keys(filters).forEach((key) => {
            const element = filters[key];
            // if the form element is date
            if (element) {
                if (checkElement(FilterDateTypes, key)) this.dateFilterToMap(key, element);
                else {
                    if (element.length) {
                        if (key === 'state') this.stateFilterToMap(element);
                        else if (key === 'processGroup') this.processGroupFilterToMap(element);
                        else this.otherFilterToMap(element, key);
                    }
                }
            }
        });
    };

    otherFilterToMap(element: any, key: string) {
        const ids = [];
        element.forEach((val) => ids.push(val));
        this.filters.set(key, ids);
    }

    dateFilterToMap(key: string, element: any) {
        const epochDate = Utilities.convertNgbDateTimeToEpochDate(element);
        if (epochDate) this.filters.set(key, [epochDate]);
    }

    stateFilterToMap(element: any) {
        const processStateKeys = [];
        element.forEach((val) => {
            processStateKeys.push(val);
        });
        this.filters.set('processStateKey', processStateKeys);
    }

    processGroupFilterToMap(element: any) {
        const ids = [];

        element.forEach((processGroup) => {
            if (processGroup === '--')
                this.processesWithoutProcessGroupMultiSelectOptions.forEach((process) => ids.push(process.value));
            else
                this.processMultiSelectOptionsPerProcessGroups
                    .get(processGroup)
                    .forEach((process) => ids.push(process.value));
        });
        if (!this.filters.get('process')) this.filters.set('process', ids);
    }


    addProcessesDropdownList(processesDropdownList: any[]): void {
        processesDropdownList.forEach((processMultiSelectOptions) =>
            this.processMultiSelectOptionsWhenSelectedProcessGroup.push(processMultiSelectOptions)
        );
    }

    changeProcessesWhenSelectProcessGroup(): void {
        this.parentForm.get('processGroup').valueChanges.subscribe((selectedProcessGroups) => {
            if (!!selectedProcessGroups && selectedProcessGroups.length > 0) {
                this.processMultiSelectOptionsWhenSelectedProcessGroup = [];
                selectedProcessGroups.forEach((processGroup) => {
                    if (processGroup === '--')
                        this.addProcessesDropdownList(this.processesWithoutProcessGroupMultiSelectOptions);
                    else
                        this.addProcessesDropdownList(this.processMultiSelectOptionsPerProcessGroups.get(processGroup));
                });
            } else this.processMultiSelectOptionsWhenSelectedProcessGroup = this.processMultiSelectOptions;
        });
    }

    changeStatesWhenSelectProcess(): void {
        this.parentForm.get('process').valueChanges.subscribe((selectedProcesses) => {
            this.stateSelected = [];
            this.stateMultiSelectOptions = [];
            if (!!selectedProcesses && selectedProcesses.length > 0) {
                this.statesMultiSelectOptionsPerProcesses.forEach((processStates) => {
                    if (selectedProcesses.includes(processStates.value)) {
                        this.stateMultiSelectOptions.push(processStates);
                    }
                });
            }
        });
    }

    isProcessGroupFilterVisible(): boolean {
        return !!this.processGroupMultiSelectOptions && this.processGroupMultiSelectOptions.length > 1;
    }

    isThereProcessGroup(): boolean {
        return !!this.processesGroups && this.processesGroups.size > 0;
    }

    isThereOnlyOneProcessGroupInDropdownList(): boolean {
        return !!this.processGroupMultiSelectOptions && this.processGroupMultiSelectOptions.length === 1;
    }

    isThereProcessStateToDisplay(): boolean {
        return !!this.statesMultiSelectOptionsPerProcesses && this.statesMultiSelectOptionsPerProcesses.length > 0;
    }

    setDefaultPublishDateFilter() {
        const defaultPublishDateInterval = this.configService.getConfigValue('archive.filters.publishDate.days', 10);

        const min = moment(Date.now());
        min.subtract(defaultPublishDateInterval, 'day');
        const minDate = min.toDate();
        this.defaultMinPublishDate = {
            day: minDate.getDate(),
            month: minDate.getMonth() + 1,
            year: minDate.getFullYear()
        };
    }

    setDateFilterBounds(): void {
        if (this.parentForm.value.publishDateFrom?.date) {
            this.publishMinDate = {
                year: this.parentForm.value.publishDateFrom.date.year,
                month: this.parentForm.value.publishDateFrom.date.month,
                day: this.parentForm.value.publishDateFrom.date.day
            };
        }

        if (this.parentForm.value.publishDateTo?.date) {
            this.publishMaxDate = {
                year: this.parentForm.value.publishDateTo.date.year,
                month: this.parentForm.value.publishDateTo.date.month,
                day: this.parentForm.value.publishDateTo.date.day
            };
        } else {
            this.publishMaxDate = null;
        }

        if (this.parentForm.value.activeFrom?.date) {
            this.activeMinDate = {
                year: this.parentForm.value.activeFrom.date.year,
                month: this.parentForm.value.activeFrom.date.month,
                day: this.parentForm.value.activeFrom.date.day
            };
        } else {
            this.activeMinDate = null;
        }
        if (this.parentForm.value.activeTo?.date) {
            this.activeMaxDate = {
                year: this.parentForm.value.activeTo.date.year,
                month: this.parentForm.value.activeTo.date.month,
                day: this.parentForm.value.activeTo.date.day
            };
        } else {
            this.activeMaxDate = null;
        }
    }

    onDateTimeChange() {
        this.dateTimeFilterChange.next(null);
    }

    query(): void {
        if (this.isFormValid()) {
            this.search.emit(null);
        }
    }

    resetForm() {
        this.tagsSelected = [];
        this.processGroupSelected = [];
        this.processSelected = [];
        this.stateSelected = [];
        this.publishMinDate = null;
        this.publishMaxDate = null;
        this.activeMinDate = null;
        this.activeMaxDate = null;
        this.setDateFilterBounds();
        this.reset.emit(null);
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
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
        if (!this.isDateWellFormatted('publishDateFrom'))
            return {areDatesCorrectlyFormatted: false, errorMessageKey: 'shared.filters.invalidPublishStartDate'};
        if (!this.isDateWellFormatted('publishDateTo'))
            return {areDatesCorrectlyFormatted: false, errorMessageKey: 'shared.filters.invalidPublishEndDate'};
        if (!this.isDateWellFormatted('activeFrom'))
            return {areDatesCorrectlyFormatted: false, errorMessageKey: 'shared.filters.invalidActiveStartDate'};
        if (!this.isDateWellFormatted('activeTo'))
            return {areDatesCorrectlyFormatted: false, errorMessageKey: 'shared.filters.invalidActiveEndDate'};

        return {areDatesCorrectlyFormatted: true, errorMessageKey: null};
    }

    private isDateWellFormatted(dateFieldName: string): boolean {
        const dateControl = this.parentForm.get(dateFieldName);
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

        const publishStart = this.extractTime(this.parentForm.get('publishDateFrom'));
        const publishEnd = this.extractTime(this.parentForm.get('publishDateTo'));

        if (
            publishStart != null &&
            !isNaN(publishStart) &&
            publishEnd != null &&
            !isNaN(publishEnd) &&
            publishStart > publishEnd
        ) {
            this.displayMessage('shared.filters.publishEndDateBeforeStartDate', '', MessageLevel.ERROR);
            result = false;
        }

        const activeStart = this.extractTime(this.parentForm.get('activeFrom'));
        const activeEnd = this.extractTime(this.parentForm.get('activeTo'));

        if (
            activeStart != null &&
            !isNaN(activeStart) &&
            activeEnd != null &&
            !isNaN(activeEnd) &&
            activeStart > activeEnd
        ) {
            this.displayMessage('shared.filters.activeEndDateBeforeStartDate', '', MessageLevel.ERROR);
            result = false;
        }
        return result;
    }
}
