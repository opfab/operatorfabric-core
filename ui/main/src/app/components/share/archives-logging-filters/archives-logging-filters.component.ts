/* Copyright (c) 2021-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {
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
import {ConfigService} from 'app/services/config/ConfigService';
import {Card} from '@ofServices/cards/model/Card';
import {LightCard} from '@ofModel/light-card.model';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ProcessesService} from '@ofServices/processes/ProcessesService';
import {Subject} from 'rxjs';
import {ProcessStatesMultiSelectOptionsService} from '@ofServices/processStatesMultiSelectOptions/ProcessStatesMultiSelectOptionsService';
import {MultiSelectOption} from 'app/components/share/multi-select/model/MultiSelect';
import {Utilities} from '../../../utils/utilities';
import {UserPreferencesService} from '@ofServices/userPreferences/UserPreferencesService';
import {UsersService} from '@ofServices/users/UsersService';
import {PermissionEnum} from '@ofServices/groups/model/PermissionEnum';
import {sub} from 'date-fns';
import {TranslateModule} from '@ngx-translate/core';
import {NgIf, NgClass} from '@angular/common';
import {MultiSelectComponent} from '../multi-select/multi-select.component';
import {NgxDaterangepickerMd} from 'ngx-daterangepicker-material';
import {TranslationService} from '@ofServices/translation/TranslationService';

@Component({
    selector: 'of-archives-logging-filters',
    templateUrl: './archives-logging-filters.component.html',
    styleUrls: ['./archives-logging-filters.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        TranslateModule,
        NgIf,
        MultiSelectComponent,
        FormsModule,
        ReactiveFormsModule,
        NgClass,
        NgxDaterangepickerMd
    ]
})
export class ArchivesLoggingFiltersComponent implements OnInit, OnChanges, OnDestroy {
    @Input() public card: Card | LightCard;
    @Input() parentForm: FormGroup;
    @Input() visibleProcesses: any[];
    @Input() hideChildStates: boolean;
    @Input() tags: any[];
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

    defaultPublishMaxDate: Date;
    defaultPublishMinDate: Date;

    locale: any = {};
    ranges: any = {};

    constructor(private readonly changeDetector: ChangeDetectorRef) {
        this.hasCurrentUserRightsToViewAllArchivedCards =
            UsersService.isCurrentUserAdmin() ||
            UsersService.hasCurrentUserAnyPermission([PermissionEnum.VIEW_ALL_CARDS]);

        this.hasCurrentUserRightsToViewAllArchivedCardsInHisPerimeters =
            !this.hasCurrentUserRightsToViewAllArchivedCards &&
            UsersService.hasCurrentUserAnyPermission([PermissionEnum.VIEW_ALL_CARDS_FOR_USER_PERIMETERS]);

        const seeOnlyCardsForWhichUserIsRecipientInStorage =
            UserPreferencesService.getPreference('opfab.seeOnlyCardsForWhichUserIsRecipient') ?? true;

        this.isAdminModeChecked =
            (this.hasCurrentUserRightsToViewAllArchivedCards ||
                this.hasCurrentUserRightsToViewAllArchivedCardsInHisPerimeters) &&
            seeOnlyCardsForWhichUserIsRecipientInStorage === 'false';

        this.locale = {
            format: 'YYYY-MM-DD HH:mm',
            applyLabel: TranslationService.getTranslation('datePicker.applyLabel'),
            daysOfWeek: TranslationService.getTranslation('datePicker.daysOfWeek'),
            monthNames: TranslationService.getTranslation('datePicker.monthNames')
        };

        const currentDate = new Date(),
            y = currentDate.getFullYear(),
            m = currentDate.getMonth();
        const startCurrentMonth = new Date(y, m, 1);
        const endCurrentMonth = new Date(y, m + 1, 1);
        const startPreviousMonth = new Date(y, m - 1, 1);

        const todayTranslation = TranslationService.getTranslation('datePicker.today');
        const yesterdayTranslation = TranslationService.getTranslation('datePicker.yesterday');
        const last7DaysTranslation = TranslationService.getTranslation('datePicker.last7Days');
        const last30DaysTranslation = TranslationService.getTranslation('datePicker.last30Days');
        const thisMonthTranslation = TranslationService.getTranslation('datePicker.thisMonth');
        const lastMonthTranslation = TranslationService.getTranslation('datePicker.lastMonth');

        this.ranges = {
            [todayTranslation]: [new Date().setHours(0, 0, 0, 0), new Date().setHours(24, 0, 0, 0)],
            [yesterdayTranslation]: [sub(new Date().setHours(0, 0, 0, 0), {days: 1}), new Date().setHours(0, 0, 0, 0)],
            [last7DaysTranslation]: [sub(new Date(), {days: 7}).setHours(0, 0, 0, 0), new Date().setHours(24, 0, 0, 0)],
            [last30DaysTranslation]: [
                sub(new Date(), {days: 30}).setHours(0, 0, 0, 0),
                new Date().setHours(24, 0, 0, 0)
            ],
            [thisMonthTranslation]: [startCurrentMonth, endCurrentMonth],
            [lastMonthTranslation]: [startPreviousMonth, startCurrentMonth]
        };
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

        this.parentForm.controls.publishDateRange.setValue({
            startDate: this.defaultPublishMinDate,
            endDate: this.defaultPublishMaxDate
        });
        this.parentForm.controls.activeDateRange.setValue(null);
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
        this.parentForm.controls.publishDateRange.setValue({
            startDate: this.defaultPublishMinDate,
            endDate: this.defaultPublishMaxDate
        });
        this.parentForm.controls.activeDateRange.setValue(null);
    }

    transformFiltersListToMap = (filters: any): void => {
        this.filters = new Map();
        this.filters.set('adminMode', [this.isAdminModeChecked]);

        Object.keys(filters).forEach((key) => {
            const element = filters[key];
            switch (key) {
                case 'state':
                    this.filterToMap(element, 'processStateKey');
                    break;
                case 'processGroup':
                    this.processGroupFilterToMap(element);
                    break;
                case 'publishDateRange':
                    if (element?.startDate && element?.endDate) {
                        this.filters.set('publishDateFrom', [Date.parse(element.startDate.toISOString())]);
                        this.filters.set('publishDateTo', [Date.parse(element.endDate.toISOString())]);
                    }
                    break;
                case 'activeDateRange':
                    if (element?.startDate && element?.endDate) {
                        this.filters.set('activeFrom', [Date.parse(element.startDate.toISOString())]);
                        this.filters.set('activeTo', [Date.parse(element.endDate.toISOString())]);
                    }
                    break;
                default:
                    this.filterToMap(element, key);
                    break;
            }
        });
    };

    filterToMap(element: any, key: string) {
        const ids = [];
        if (element?.length) {
            element.forEach((val) => ids.push(val));
            this.filters.set(key, ids);
        }
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

        if (element?.length) {
            element.forEach((processGroup) => {
                if (processGroup === '--') {
                    this.processesWithoutProcessGroupMultiSelectOptions.forEach((process) => ids.push(process.value));
                } else {
                    this.processMultiSelectOptionsPerProcessGroups
                        .get(processGroup)
                        .forEach((process) => ids.push(process.value));
                }
            });
            if (!this.filters.get('process')) this.filters.set('process', ids);
        }
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

        const currentDate = new Date();
        this.defaultPublishMaxDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
            23,
            59,
            59
        );

        this.defaultPublishMinDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
            0,
            0,
            0
        );
        this.defaultPublishMinDate = sub(this.defaultPublishMinDate, {days: defaultPublishDateInterval});

        this.parentForm.controls.publishDateRange.setValue({
            startDate: this.defaultPublishMinDate,
            endDate: this.defaultPublishMaxDate
        });
        this.parentForm.controls.activeDateRange.setValue(null);
    }

    query(): void {
        this.search.emit(null);
    }

    resetForm() {
        this.resetFormEvent.emit(null);
        this.tagsSelected = [];
        this.processGroupSelected = [];
        this.processSelected = [];
        this.stateSelected = [];
        this.parentForm.controls.publishDateRange.setValue({
            startDate: this.defaultPublishMinDate,
            endDate: this.defaultPublishMaxDate
        });
        this.parentForm.controls.activeDateRange.setValue(null);
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
