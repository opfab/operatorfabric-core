/* Copyright (c) 2021-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';
import {ConfigService} from 'app/business/services/config.service';
import {Card} from '@ofModel/card.model';
import {LightCard} from '@ofModel/light-card.model';
import {AbstractControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ProcessesService} from 'app/business/services/businessconfig/processes.service';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {ProcessStatesMultiSelectOptionsService} from 'app/business/services/process-states-multi-select-options.service';
import {MultiSelectOption} from '@ofModel/multiselect.model';
import {MessageLevel} from '@ofModel/message.model';

import {Utilities} from 'app/business/common/utilities';
import {UserPreferencesService} from 'app/business/services/users/user-preference.service';
import {UserService} from 'app/business/services/users/user.service';
import {PermissionEnum} from '@ofModel/permission.model';
import {AlertMessageService} from 'app/business/services/alert-message.service';
import {sub} from 'date-fns';
import {TranslateModule} from '@ngx-translate/core';
import {NgIf, NgClass} from '@angular/common';
import {MultiSelectComponent} from '../multi-select/multi-select.component';

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

@Component({
    selector: 'of-archives-logging-filters',
    templateUrl: './archives-logging-filters.component.html',
    styleUrls: ['./archives-logging-filters.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [TranslateModule, NgIf, MultiSelectComponent, FormsModule, ReactiveFormsModule, NgClass]
})
export class ArchivesLoggingFiltersComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
    @Input() public card: Card | LightCard;
    @Input() parentForm: FormGroup;
    @Input() visibleProcesses: any[];
    @Input() hideChildStates: boolean;
    @Input() tags: any[];
    @Input() displayPublishDateFilter = true;
    @Output() search = new EventEmitter<string>();
    @Output() resetFormEvent = new EventEmitter<string>();

    hasCurrentUserRightsToViewAllArchivedCards: boolean;
    hasCurrentUserRightsToViewAllArchivedCardsInHisPerimeters: boolean;
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

    defaultMinPublishDateStringFormat: string;

    constructor(private changeDetector: ChangeDetectorRef) {
        this.hasCurrentUserRightsToViewAllArchivedCards =
            UserService.isCurrentUserAdmin() ||
            UserService.hasCurrentUserAnyPermission([PermissionEnum.VIEW_ALL_CARDS]);

        this.hasCurrentUserRightsToViewAllArchivedCardsInHisPerimeters =
            !this.hasCurrentUserRightsToViewAllArchivedCards &&
            UserService.hasCurrentUserAnyPermission([PermissionEnum.VIEW_ALL_CARDS_FOR_USER_PERIMETERS]);

        const seeOnlyCardsForWhichUserIsRecipientInStorage =
            UserPreferencesService.getPreference('opfab.seeOnlyCardsForWhichUserIsRecipient') ?? true;

        this.isAdminModeChecked =
            (this.hasCurrentUserRightsToViewAllArchivedCards ||
                this.hasCurrentUserRightsToViewAllArchivedCardsInHisPerimeters) &&
            seeOnlyCardsForWhichUserIsRecipientInStorage === 'false';
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.loadValuesforTags();
    }

    ngOnInit() {
        this.processesGroups = ProcessesService.getProcessGroups();
        this.processMultiSelectOptionsWhenSelectedProcessGroup = [];
        this.visibleProcessesId = this.visibleProcesses.map((element) => element.value);

        this.loadValuesForFilters();
        this.changeProcessesWhenSelectProcessGroup();
        this.changeStatesWhenSelectProcess();

        this.dateTimeFilterChange
            .pipe(takeUntil(this.unsubscribe$), debounceTime(1000))
            .subscribe(() => this.setDateFilterBounds());

        this.parentForm.controls.publishDateFrom.setValue(this.defaultMinPublishDateStringFormat);
    }

    ngAfterViewInit(): void {
        this.setDateFilterBounds();
    }

    clearMultiFilters() {
        this.statesMultiSelectOptionsPerProcesses = [];
        this.processesWithoutProcessGroupMultiSelectOptions = [];
        this.processMultiSelectOptionsPerProcessGroups.clear();
        this.processGroupMultiSelectOptions = [];
        this.tagsSelected = [];
        this.processGroupSelected = [];
        this.processSelected = [];
        this.stateSelected = [];
    }

    loadValuesforTags() {
        this.tagsMultiSelectOptions = [];
        if (this.tags) {
            this.tags.forEach((tag) => this.tagsMultiSelectOptions.push(new MultiSelectOption(tag.value, tag.label)));
        }
    }

    loadValuesForFilters() {
        this.clearMultiFilters();

        this.statesMultiSelectOptionsPerProcesses =
            ProcessStatesMultiSelectOptionsService.getStatesMultiSelectOptionsPerProcess(
                this.isAdminModeChecked && this.hasCurrentUserRightsToViewAllArchivedCards,
                this.hideChildStates
            );

        this.processesWithoutProcessGroupMultiSelectOptions =
            ProcessStatesMultiSelectOptionsService.getProcessesWithoutProcessGroupMultiSelectOptions(
                this.isAdminModeChecked && this.hasCurrentUserRightsToViewAllArchivedCards,
                this.visibleProcessesId
            );

        this.processMultiSelectOptionsPerProcessGroups =
            ProcessStatesMultiSelectOptionsService.getProcessesMultiSelectOptionsPerProcessGroup(
                this.isAdminModeChecked && this.hasCurrentUserRightsToViewAllArchivedCards,
                this.visibleProcessesId
            );

        this.processGroupMultiSelectOptions = ProcessStatesMultiSelectOptionsService.getProcessGroupsMultiSelectOptions(
            this.processesWithoutProcessGroupMultiSelectOptions,
            this.processMultiSelectOptionsPerProcessGroups
        );

        // we must filter visibleProcesses to keep only the processes in the perimeter of the user
        const processesIds = [];
        this.statesMultiSelectOptionsPerProcesses.forEach((process) => {
            processesIds.push(process.value);
            process.options.sort((obj1, obj2) => Utilities.compareObj(obj1.label, obj2.label));
        });
        this.processMultiSelectOptions = this.visibleProcesses.filter((visibleProcess) =>
            processesIds.includes(visibleProcess.value)
        );
        this.processMultiSelectOptionsWhenSelectedProcessGroup = this.processMultiSelectOptions;
        this.setDefaultPublishDateFilter();
    }

    toggleAdminMode() {
        this.isAdminModeChecked = !this.isAdminModeChecked;
        UserPreferencesService.setPreference(
            'opfab.seeOnlyCardsForWhichUserIsRecipient',
            String(!this.isAdminModeChecked)
        );
        this.loadValuesForFilters();
        this.resetFormEvent.emit(null);
        this.parentForm.controls.publishDateFrom.setValue(this.defaultMinPublishDateStringFormat);
    }

    transformFiltersListToMap = (filters: any): void => {
        this.filters = new Map();
        this.filters.set('adminMode', [this.isAdminModeChecked]);

        Object.keys(filters).forEach((key) => {
            const element = filters[key];
            // if the form element is date
            if (element) {
                if (checkElement(FilterDateTypes, key)) {
                    this.dateFilterToMap(key, element);
                } else {
                    if (element.length) {
                        if (key === 'state') {
                            this.stateFilterToMap(element);
                        } else if (key === 'processGroup') {
                            this.processGroupFilterToMap(element);
                        } else {
                            this.otherFilterToMap(element, key);
                        }
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
        if (element.length) {
            this.filters.set(key, [Date.parse(element + ':00')]);
        }
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
            if (selectedProcessGroups?.length > 0) {
                this.processMultiSelectOptionsWhenSelectedProcessGroup = [];
                selectedProcessGroups.forEach((processGroup) => {
                    if (processGroup === '--')
                        this.addProcessesDropdownList(this.processesWithoutProcessGroupMultiSelectOptions);
                    else
                        this.addProcessesDropdownList(this.processMultiSelectOptionsPerProcessGroups.get(processGroup));
                });
            } else this.processMultiSelectOptionsWhenSelectedProcessGroup = this.processMultiSelectOptions;
            this.changeDetector.markForCheck();
        });
    }

    changeStatesWhenSelectProcess(): void {
        this.parentForm.get('process').valueChanges.subscribe((selectedProcesses) => {
            this.stateSelected = [];
            this.stateMultiSelectOptions = [];
            if (selectedProcesses?.length > 0) {
                this.statesMultiSelectOptionsPerProcesses.forEach((processStates) => {
                    if (selectedProcesses.includes(processStates.value)) {
                        this.stateMultiSelectOptions.push(processStates);
                    }
                });
            }
            this.changeDetector.markForCheck();
        });
    }

    isProcessGroupFilterVisible(): boolean {
        return this.processGroupMultiSelectOptions?.length > 1;
    }

    isThereProcessGroup(): boolean {
        return this.processesGroups?.size > 0;
    }

    isThereOnlyOneProcessGroupInDropdownList(): boolean {
        return this.processGroupMultiSelectOptions?.length === 1;
    }

    isThereProcessStateToDisplay(): boolean {
        return this.processMultiSelectOptions?.length > 0 && this.statesMultiSelectOptionsPerProcesses?.length > 0;
    }

    setDefaultPublishDateFilter() {
        const defaultPublishDateInterval = ConfigService.getConfigValue('archive.filters.publishDate.days', 10);

        const min = new Date();
        const minDate = sub(min, {days: defaultPublishDateInterval});

        this.defaultMinPublishDateStringFormat =
            minDate.getFullYear() +
            '-' +
            String(minDate.getMonth() + 1).padStart(2, '0') +
            '-' +
            String(minDate.getDate()).padStart(2, '0') +
            'T00:00';
    }

    setDateFilterBounds(): void {
        if (this.parentForm.value.publishDateFrom?.length) {
            this.publishMinDate = this.parentForm.value.publishDateFrom;
        }

        if (this.parentForm.value.publishDateTo?.length) {
            this.publishMaxDate = this.parentForm.value.publishDateTo;
        } else {
            this.publishMaxDate = null;
        }

        if (this.parentForm.value.activeFrom?.length) {
            this.activeMinDate = this.parentForm.value.activeFrom;
        } else {
            this.activeMinDate = null;
        }
        if (this.parentForm.value.activeTo?.length) {
            this.activeMaxDate = this.parentForm.value.activeTo;
        } else {
            this.activeMaxDate = null;
        }
        this.changeDetector.markForCheck();
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
        this.resetFormEvent.emit(null);
        this.tagsSelected = [];
        this.processGroupSelected = [];
        this.processSelected = [];
        this.stateSelected = [];
        this.publishMinDate = null;
        this.publishMaxDate = null;
        this.activeMinDate = null;
        this.activeMaxDate = null;
        this.parentForm.controls.publishDateFrom.setValue(this.defaultMinPublishDateStringFormat);
        this.setDateFilterBounds();
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
        const isFieldEmpty = dateControl.value?.date == null;

        return isFieldEmpty || !isNaN(dateValue);
    }

    private extractTime(form: AbstractControl) {
        const val = form.value;
        if (!val || val === '') {
            return null;
        }
        return Date.parse(val);
    }

    private displayMessage(i18nKey: string, msg: string, severity: MessageLevel = MessageLevel.ERROR) {
        AlertMessageService.sendAlertMessage({message: msg, level: severity, i18n: {key: i18nKey}});
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
