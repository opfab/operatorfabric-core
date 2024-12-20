/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnDestroy, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {Subject, timer} from 'rxjs';
import {AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {debounce, debounceTime, distinctUntilChanged, takeUntil} from 'rxjs/operators';
import * as _ from 'lodash-es';
import {FilterType} from '@ofModel/feed-filter.model';
import {UserPreferencesService} from '@ofServices/userPreferences/UserPreferencesService';
import {MessageLevel} from '@ofModel/message.model';
import {FilteredLightCardsStore} from 'app/business/store/lightcards/lightcards-feed-filter-store';
import {AlertMessageService} from 'app/business/services/alert-message.service';
import {OpfabStore} from 'app/business/store/opfabStore';
import {MultiSelect, MultiSelectOption} from '@ofModel/multiselect.model';
import {ProcessesService} from '@ofServices/processes/ProcessesService';
import {UsersService} from '@ofServices/users/UsersService';
import {ProcessStatesMultiSelectOptionsService} from 'app/business/services/process-states-multi-select-options.service';
import {TranslateModule} from '@ngx-translate/core';
import {NgIf} from '@angular/common';
import {FeedSortComponent} from '../feed-sort/feed-sort.component';
import {MultiSelectComponent} from '../../../../../share/multi-select/multi-select.component';

@Component({
    selector: 'of-feed-filter',
    templateUrl: './feed-filter.component.html',
    styleUrls: ['./feed-filter.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, TranslateModule, NgIf, FeedSortComponent, MultiSelectComponent]
})
export class FeedFilterComponent implements OnInit, OnDestroy {
    @Input() hideTimerTags: boolean;
    @Input() defaultAcknowledgmentFilter: string;
    @Input() hideResponseFilter: boolean;
    @Input() hideProcessFilter: boolean;
    @Input() hideStateFilter: boolean;
    @Input() processFilter: string = '';
    @Input() stateFilter: string = '';

    @Input() defaultSorting: string;

    @Input() hideApplyFiltersToTimeLineChoice: boolean;

    @Output() filterActiveChange = new Subject<boolean>();

    dateTimeFilterChange = new Subject();

    private readonly ngUnsubscribe$ = new Subject<void>();
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

    processFilterForm: FormGroup<{
        process: FormControl<string | null>;
        state: FormControl<string | null>;
    }>;

    endMinDate: {year: number; month: number; day: number} = null;
    startMaxDate: {year: number; month: number; day: number} = null;

    processMultiSelect: MultiSelect;
    processList = [];
    selectedProcess: string;
    stateMultiSelect: MultiSelect;

    private dateFilterType = FilterType.PUBLISHDATE_FILTER;
    private readonly filteredLightCardStore: FilteredLightCardsStore;

    constructor() {
        this.filteredLightCardStore = OpfabStore.getFilteredLightCardStore();
        this.typeFilterForm = this.createFormGroup();
        this.ackFilterForm = this.createAckFormGroup();
        this.timeFilterForm = this.createDateTimeForm();
        this.responseFilterForm = this.createResponseFormGroup();
        this.timeLineFilterForm = this.createTimeLineFormGroup();
        this.processFilterForm = this.createProcessForm();
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

    private createProcessForm() {
        return new FormGroup(
            {
                process: new FormControl<string | null>(''),
                state: new FormControl<string | null>('')
            },
            {updateOn: 'change'}
        );
    }

    private initializeProcessMultiSelect() {
        this.processMultiSelect = {
            id: 'process',
            options: [],
            config: {
                labelKey: 'shared.filters.process',
                placeholderKey: 'shared.filters.selectProcessText',
                sortOptions: true,
                nbOfDisplayValues: 4,
                multiple: false,
                search: true
            },
            selectedOptions: []
        };
    }

    private initializeStateMultiSelect() {
        this.stateMultiSelect = {
            id: 'state',
            options: [],
            config: {
                labelKey: 'shared.filters.state',
                placeholderKey: 'shared.filters.selectStateText',
                sortOptions: true,
                nbOfDisplayValues: 4,
                multiple: false,
                search: true
            },
            selectedOptions: []
        };
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

        if (!this.hideProcessFilter) {
            this.initializeProcessMultiSelect();
            this.initProcessFilter();
            if (!this.hideStateFilter) {
                this.initializeStateMultiSelect();
            }
            this.setInitialSelectedProcess();
            this.setInitialSelectedState();
        }
    }

    private setInitialSelectedProcess() {
        if (this.processMultiSelect && this.processFilter) {
            this.processMultiSelect.selectedOptions = [this.processFilter];
            this.processFilterForm.get('process').setValue(this.processFilter, {emitEvent: true});
        }
    }

    private setInitialSelectedState() {
        if (this.stateMultiSelect && this.stateFilter) {
            this.stateMultiSelect.selectedOptions = [this.processFilter + '.' + this.stateFilter];
            this.processFilterForm
                .get('state')
                .setValue(this.processFilter + '.' + this.stateFilter, {emitEvent: true});
        }
    }

    private loadVisibleProcessesForCurrentUser() {
        ProcessesService.getAllProcesses().forEach((process) => {
            if (UsersService.isReceiveRightsForProcess(process.id)) {
                this.processList.push(process);
            }
        });
    }

    private loadVisibleStatesForCurrentUserAndProcess() {
        this.stateMultiSelect.options = [];
        if (this.selectedProcess?.length > 0) {
            const selected = this.processList.find((process) => process.id === this.selectedProcess);
            const stateOptions = ProcessStatesMultiSelectOptionsService.getStatesMultiSelectOptionsPerSingleProcess(
                selected,
                false,
                true
            );
            this.stateMultiSelect.options.push(new MultiSelectOption('', ''));
            stateOptions.forEach((option) => this.stateMultiSelect.options.push(option));
        }
    }

    private initProcessFilter() {
        this.loadVisibleProcessesForCurrentUser();
        this.processMultiSelect.options.push(new MultiSelectOption('', ''));
        this.processList.forEach((process) =>
            this.processMultiSelect.options.push(new MultiSelectOption(process.id, process.name))
        );
        this.processFilterForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((form) => {
            this.filterActiveChange.next(this.isFilterActive());
            const selectedProcessChanged = form.process !== this.selectedProcess;
            this.selectedProcess = form.process;
            if (!this.hideStateFilter && selectedProcessChanged) {
                this.loadVisibleStatesForCurrentUserAndProcess();
            }
            return this.filteredLightCardStore.updateFilter(FilterType.PROCESS_FILTER, true, {
                process: form.process,
                state: form.state
            });
        });
    }

    private initTypeFilter() {
        const savedAlarm = UserPreferencesService.getPreference('opfab.feed.filter.type.alarm');
        const savedAction = UserPreferencesService.getPreference('opfab.feed.filter.type.action');
        const savedACompliant = UserPreferencesService.getPreference('opfab.feed.filter.type.compliant');
        const savedInformation = UserPreferencesService.getPreference('opfab.feed.filter.type.information');

        const alarmUnset = savedAlarm && savedAlarm !== 'true';
        const actionUnset = savedAction && savedAction !== 'true';
        const compliantUnset = savedACompliant && savedACompliant !== 'true';
        const informationUnset = savedInformation && savedInformation !== 'true';

        this.typeFilterForm.get('alarm').setValue(!alarmUnset, {emitEvent: false});
        this.typeFilterForm.get('action').setValue(!actionUnset, {emitEvent: false});
        this.typeFilterForm.get('compliant').setValue(!compliantUnset, {emitEvent: false});
        this.typeFilterForm.get('information').setValue(!informationUnset, {emitEvent: false});

        this.filteredLightCardStore.updateFilter(
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
                UserPreferencesService.setPreference('opfab.feed.filter.type.alarm', form.alarm);
                UserPreferencesService.setPreference('opfab.feed.filter.type.action', form.action);
                UserPreferencesService.setPreference('opfab.feed.filter.type.compliant', form.compliant);
                UserPreferencesService.setPreference('opfab.feed.filter.type.information', form.information);
                this.filterActiveChange.next(this.isFilterActive());
                return this.filteredLightCardStore.updateFilter(
                    FilterType.TYPE_FILTER,
                    !(form.alarm && form.action && form.compliant && form.information),
                    form
                );
            });
    }

    private initResponseFilter() {
        const responseValue = UserPreferencesService.getPreference('opfab.feed.filter.response');
        const responseUnset = responseValue && responseValue !== 'true';

        this.responseFilterForm.get('responseControl').setValue(!responseUnset, {emitEvent: false});

        if (responseValue) {
            this.filteredLightCardStore.updateFilter(FilterType.RESPONSE_FILTER, responseUnset, !responseUnset);
        }

        this.responseFilterForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((form) => {
            UserPreferencesService.setPreference('opfab.feed.filter.response', form.responseControl);
            this.filterActiveChange.next(this.isFilterActive());
            return this.filteredLightCardStore.updateFilter(
                FilterType.RESPONSE_FILTER,
                !form.responseControl,
                form.responseControl
            );
        });
    }

    private initTimeLineFilter() {
        const timeLineValue = UserPreferencesService.getPreference('opfab.feed.filter.applyToTimeLine');

        let timeLineFiltered = true;
        if (timeLineValue && timeLineValue !== 'true') timeLineFiltered = false;

        this.timeLineFilterForm.get('timeLineControl').setValue(timeLineFiltered, {emitEvent: false});
        this.filteredLightCardStore.setOnlyBusinessFilterForTimeLine(!timeLineFiltered);

        this.timeLineFilterForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((form) => {
            UserPreferencesService.setPreference('opfab.feed.filter.applyToTimeLine', form.timeLineControl);
            this.filteredLightCardStore.setOnlyBusinessFilterForTimeLine(!form.timeLineControl);
            this.filterActiveChange.next(this.isFilterActive());
        });
    }

    private initAckFilter() {
        const ackValue = UserPreferencesService.getPreference('opfab.feed.filter.ack');
        this.initAckFilterValues(ackValue ?? this.defaultAcknowledgmentFilter);

        this.ackFilterForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((form) => {
            const active = !form.ackControl || !form.notAckControl;
            const ack = !form.ackControl && !form.notAckControl ? null : active && form.ackControl;
            UserPreferencesService.setPreference(
                'opfab.feed.filter.ack',
                this.getAckPreference(form.ackControl, form.notAckControl)
            );
            this.filterActiveChange.next(this.isFilterActive());
            return this.filteredLightCardStore.updateFilter(FilterType.ACKNOWLEDGEMENT_FILTER, active, ack);
        });
    }

    private initAckFilterValues(ackValue: string) {
        if (ackValue === 'ack') {
            this.ackFilterForm.get('ackControl').setValue(true, {emitEvent: false});
            this.ackFilterForm.get('notAckControl').setValue(false, {emitEvent: false});

            this.filteredLightCardStore.updateFilter(FilterType.ACKNOWLEDGEMENT_FILTER, true, true);
        } else if (ackValue === 'notack') {
            this.ackFilterForm.get('ackControl').setValue(false, {emitEvent: false});
            this.ackFilterForm.get('notAckControl').setValue(true, {emitEvent: false});

            this.filteredLightCardStore.updateFilter(FilterType.ACKNOWLEDGEMENT_FILTER, true, false);
        } else if (ackValue === 'all') {
            this.ackFilterForm.get('ackControl').setValue(true, {emitEvent: false});
            this.ackFilterForm.get('notAckControl').setValue(true, {emitEvent: false});

            this.filteredLightCardStore.updateFilter(FilterType.ACKNOWLEDGEMENT_FILTER, false, false);
        } else if (ackValue === 'none') {
            this.ackFilterForm.get('ackControl').setValue(false, {emitEvent: false});
            this.ackFilterForm.get('notAckControl').setValue(false, {emitEvent: false});

            this.filteredLightCardStore.updateFilter(FilterType.ACKNOWLEDGEMENT_FILTER, true, null);
        }
    }

    private getAckPreference(ack: boolean, notAck: boolean): string {
        if (ack && notAck) return 'all';
        else if (!ack && !notAck) return 'none';
        else return ack ? 'ack' : 'notack';
    }

    initDateTimeFilter() {
        this.dateFilterType = FilterType.PUBLISHDATE_FILTER;

        const savedStart =
            UserPreferencesService.getPreference('opfab.feed.filter.start') != null
                ? new Date(+UserPreferencesService.getPreference('opfab.feed.filter.start'))
                : null;
        const savedEnd =
            UserPreferencesService.getPreference('opfab.feed.filter.end') != null
                ? new Date(+UserPreferencesService.getPreference('opfab.feed.filter.end'))
                : null;

        if (savedStart != null) {
            const savedStartString =
                savedStart.getFullYear() +
                '-' +
                String(savedStart.getMonth() + 1).padStart(2, '0') +
                '-' +
                String(savedStart.getDate()).padStart(2, '0') +
                'T00:00';
            this.timeFilterForm.get('dateTimeFrom').setValue(savedStartString);
        }

        if (savedEnd != null) {
            const savedEndString =
                savedEnd.getFullYear() +
                '-' +
                String(savedEnd.getMonth() + 1).padStart(2, '0') +
                '-' +
                String(savedEnd.getDate()).padStart(2, '0') +
                'T00:00';
            this.timeFilterForm.get('dateTimeTo').setValue(savedEndString);
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
            UserPreferencesService.removePreference('opfab.feed.filter.start');
            this.endMinDate = null;
        } else {
            UserPreferencesService.setPreference('opfab.feed.filter.start', status.start);
            if (this.timeFilterForm.value.dateTimeFrom?.length) {
                this.endMinDate = this.timeFilterForm.value.dateTimeFrom;
            }
        }
        if (status.end == null || isNaN(status.end)) {
            UserPreferencesService.removePreference('opfab.feed.filter.end');
            this.startMaxDate = null;
        } else {
            UserPreferencesService.setPreference('opfab.feed.filter.end', status.end);
            if (this.timeFilterForm.value.dateTimeTo?.length) {
                this.startMaxDate = this.timeFilterForm.value.dateTimeTo;
            }
        }

        this.filteredLightCardStore.updateFilter(this.dateFilterType, true, status);
        this.filterActiveChange.next(this.isFilterActive());
    }

    private extractTime(form: AbstractControl) {
        const val = form.value;
        if (!val || val === '') {
            return null;
        }
        return Date.parse(val);
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
            !!this.extractTime(this.timeFilterForm.get('dateTimeTo')) ||
            this.processFilterForm.get('process').value.length > 0
        );
    }

    showResetLink(): boolean {
        return (
            !this.typeFilterForm.get('alarm').value ||
            !this.typeFilterForm.get('action').value ||
            !this.typeFilterForm.get('compliant').value ||
            !this.typeFilterForm.get('information').value ||
            !this.responseFilterForm.get('responseControl').value ||
            this.defaultAcknowledgmentFilter !==
                this.getAckPreference(
                    this.ackFilterForm.get('ackControl').value,
                    this.ackFilterForm.get('notAckControl').value
                ) ||
            !!this.extractTime(this.timeFilterForm.get('dateTimeFrom')) ||
            !!this.extractTime(this.timeFilterForm.get('dateTimeTo')) ||
            this.processFilterForm.get('process').value.length > 0
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
        UserPreferencesService.setPreference('opfab.feed.filter.ack', this.defaultAcknowledgmentFilter);

        if (!this.hideTimerTags) {
            this.timeFilterForm.get('dateTimeFrom').setValue(null);
            this.timeFilterForm.get('dateTimeTo').setValue(null);
            this.setNewFilterValue();
        }
        if (!this.hideApplyFiltersToTimeLineChoice) {
            this.timeLineFilterForm.get('timeLineControl').setValue(true, {emitEvent: true});
        }
        if (!this.hideProcessFilter) {
            this.processMultiSelect.selectedOptions = [];
        }
    }

    private displayMessage(i18nKey: string, msg: string, severity: MessageLevel = MessageLevel.ERROR) {
        AlertMessageService.sendAlertMessage({message: msg, level: severity, i18n: {key: i18nKey}});
    }
}
