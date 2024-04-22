/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
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
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';

import {ProcessesService} from 'app/business/services/businessconfig/processes.service';
import {FormControl, FormGroup} from '@angular/forms';
import {ConfigService} from 'app/business/services/config.service';
import {DateTimeFormatterService} from 'app/business/services/date-time-formatter.service';
import {LightCard} from '@ofModel/light-card.model';
import {Page} from '@ofModel/page.model';
import {ExcelExport} from 'app/business/common/excel-export';
import {EntitiesService} from 'app/business/services/users/entities.service';
import {NgbModal, NgbModalOptions, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {CardsFilter} from '@ofModel/cards-filter.model';
import {FilterMatchTypeEnum, FilterModel} from '@ofModel/filter-model';
import {CardService} from 'app/business/services/card/card.service';
import {TranslationService} from 'app/business/services/translation/translation.service';
import {SelectedCardService} from '../../business/services/card/selectedCard.service';
import {ProcessMonitoringView} from 'app/business/view/processmonitoring/processmonitoring.view';
import {ProcessToMonitor} from 'app/business/view/processmonitoring/processmonitoringPage';
import {MultiSelectOption} from '@ofModel/multiselect.model';
import {UserPreferencesService} from 'app/business/services/users/user-preference.service';

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
    selector: 'of-processmonitoring',
    templateUrl: './processmonitoring.component.html',
    styleUrls: ['./processmonitoring.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcessMonitoringComponent implements OnDestroy, OnInit, AfterViewInit {
    processMonitoringView = new ProcessMonitoringView();
    processList: ProcessToMonitor[];

    processGroupMultiSelectOptions: Array<MultiSelectOption> = [];
    processGroupSelected: Array<string> = [];
    processGroupMultiSelectConfig = {
        labelKey: 'shared.filters.processGroup',
        placeholderKey: 'shared.filters.selectProcessGroupText',
        sortOptions: true,
        nbOfDisplayValues: 1
    };

    processMultiSelectOptions: Array<MultiSelectOption> = [];
    processSelected: Array<string> = [];
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

    tags: any[];
    size: number;
    processMonitoringForm = new FormGroup({
        tags: new FormControl([]),
        state: new FormControl([]),
        process: new FormControl([]),
        processGroup: new FormControl([]),
        activeFrom: new FormControl(),
        activeTo: new FormControl()
    });

    activeMinDate: {year: number; month: number; day: number} = null;
    activeMaxDate: {year: number; month: number; day: number} = null;

    results: LightCard[];
    currentPage = 0;

    totalElements: number;
    totalPages: number;
    page: number;

    firstQueryHasResults = false;
    firstQueryHasBeenDone = false;
    loadingInProgress = false;
    technicalError = false;

    resultsNumber = 0;

    processStateDescription = new Map();
    processStateName = new Map();
    processNames = new Map();
    stateColors = new Map();

    interval: any;

    modalRef: NgbModalRef;
    @ViewChild('exportInProgress') exportTemplate: ElementRef;

    listOfProcessesForFilter = [];
    listOfProcessesForRequest = [];

    columnFilters: FilterModel[] = [];
    isProcessGroupFilterVisible: boolean;
    mustViewAllCardsFeatureBeDisplayed: boolean;
    isAdminModeChecked: boolean;
    filters;
    yearButtonClicked = false;
    monthButtonClicked = false;
    weekButtonClicked = false;
    periodClicked: string;

    private mapSeverity = new Map([
        ['alarm', 1],
        ['action', 2],
        ['compliant', 3],
        ['information', 4]
    ]);
    private processMonitoring: any[];
    selectedCardId: string;

    constructor(
        private translationService: TranslationService,
        private modalService: NgbModal,
        private changeDetector: ChangeDetectorRef
    ) {
        this.processMonitoring = ConfigService.getConfigValue('processMonitoring');
        this.processList = this.processMonitoringView.getProcessList();
        this.isAdminModeChecked =
            UserPreferencesService.getPreference('opfab.seeOnlyCardsForWhichUserIsRecipient') === 'false';

        ProcessesService.getAllProcesses().forEach((process) => {
            if (process.uiVisibility?.processMonitoring) {
                const itemName = process.name ? process.name : process.id;
                this.processNames.set(process.id, itemName);
                for (const key of process.states.keys()) {
                    this.processStateDescription.set(process.id + '.' + key, process.states.get(key).description);
                    this.processStateName.set(process.id + '.' + key, process.states.get(key).name);
                    this.stateColors.set(process.id + '.' + key, process.states.get(key).color);
                }

                this.listOfProcessesForRequest.push(process.id);
                this.listOfProcessesForFilter.push({
                    value: process.id,
                    label: itemName,
                    i18nPrefix: `${process.id}.${process.version}`
                });
            }
        });
    }

    isThereProcessStateToDisplay(): boolean {
        return this.processList.length > 0;
    }

    moveDomain(isForward: boolean): void {
        if (this.processMonitoringForm.value.activeFrom && this.processMonitoringForm.value.activeTo) {
            const newDates = this.processMonitoringView.getDatesWhenMoving(
                this.processMonitoringForm.value.activeFrom,
                this.processMonitoringForm.value.activeTo,
                isForward,
                this.periodClicked
            );
            this.processMonitoringForm.patchValue({activeFrom: newDates.activeFrom, activeTo: newDates.activeTo});
        }
    }

    changeDateBoundsFollowingPeriodClicked(periodClicked: string): void {
        this.periodClicked = periodClicked;
        this.yearButtonClicked = periodClicked === 'year';
        this.monthButtonClicked = periodClicked === 'month';
        this.weekButtonClicked = periodClicked === 'week';

        const newDates = this.processMonitoringView.getDatesAfterPeriodClick(periodClicked);
        this.processMonitoringForm.patchValue({activeFrom: newDates.activeFrom, activeTo: newDates.activeTo});

        setTimeout(() => this.setDateFilterBounds(), 100);
    }

    ngOnInit() {
        this.isProcessGroupFilterVisible = this.processMonitoringView.getProcessGroups().length > 1;
        this.mustViewAllCardsFeatureBeDisplayed = this.processMonitoringView.mustViewAllCardsFeatureBeDisplayed();

        this.processGroupMultiSelectOptions = this.processMonitoringView.getProcessGroups().map((processGroup) => {
            return new MultiSelectOption(processGroup.id, processGroup.label);
        });
        this.processMultiSelectOptions = this.processList.map((process) => {
            return new MultiSelectOption(process.id, process.label);
        });

        this.changeProcessesWhenSelectProcessGroup();
        this.changeStatesWhenSelectProcess();

        this.size = ConfigService.getConfigValue('processmonitoring.filters.page.size', 10);
        this.tags = ConfigService.getConfigValue('processmonitoring.filters.tags.list');

        this.results = [];

        SelectedCardService.getSelectCardIdChanges().subscribe(
            (selectedCardId) => (this.selectedCardId = selectedCardId)
        );
    }

    changeProcessesWhenSelectProcessGroup(): void {
        this.processMonitoringForm.get('processGroup').valueChanges.subscribe((selectedProcessGroups) => {
            if (selectedProcessGroups?.length > 0) {
                this.processMultiSelectOptions = this.processMonitoringView
                    .getProcessesPerProcessGroups(selectedProcessGroups)
                    .map((process) => {
                        return new MultiSelectOption(process.id, process.label);
                    });
            } else
                this.processMultiSelectOptions = this.processList.map((process) => {
                    return new MultiSelectOption(process.id, process.label);
                });
            this.changeDetector.markForCheck();
        });
    }

    changeStatesWhenSelectProcess(): void {
        this.processMonitoringForm.get('process').valueChanges.subscribe((selectedProcess) => {
            if (selectedProcess?.length > 0) {
                this.stateMultiSelectOptions = this.processMonitoringView
                    .getStatesPerProcess(selectedProcess)
                    .map((statePerProcess) => {
                        const stateOptions = new MultiSelectOption(statePerProcess.id, statePerProcess.processName);
                        stateOptions.options = [];
                        statePerProcess.states.forEach((state) => {
                            stateOptions.options.push(
                                new MultiSelectOption(statePerProcess.id + '.' + state.id, state.label)
                            );
                        });
                        return stateOptions;
                    });
            } else {
                this.stateMultiSelectOptions = [];
            }
            this.changeDetector.markForCheck();
        });
    }

    ngAfterViewInit() {
        document.getElementById('opfab-processmonitoring-period-year').click();
        this.sendFilterQuery(0, false);
    }

    resetPeriodClicked() {
        this.yearButtonClicked = false;
        this.monthButtonClicked = false;
        this.weekButtonClicked = false;
        this.periodClicked = '';
    }

    resetForm() {
        this.processMonitoringForm.reset();
        this.processGroupMultiSelectOptions = this.processMonitoringView.getProcessGroups().map((processGroup) => {
            return new MultiSelectOption(processGroup.id, processGroup.label);
        });
        this.columnFilters = [];
        this.firstQueryHasBeenDone = false;
        this.setDateFilterBounds();
        this.resetPeriodClicked();
        document.getElementById('opfab-processmonitoring-period-year').click();
    }

    setDateFilterBounds(): void {
        if (this.processMonitoringForm.value.activeFrom?.length > 0) {
            this.activeMinDate = this.processMonitoringForm.value.activeFrom;
        } else {
            this.activeMinDate = null;
        }

        if (this.processMonitoringForm.value.activeTo?.length > 0) {
            this.activeMaxDate = this.processMonitoringForm.value.activeTo;
        } else {
            this.activeMaxDate = null;
        }

        this.changeDetector.markForCheck();
    }

    onDateTimeChange() {
        this.resetPeriodClicked();
        // need to wait otherwise change is not always done
        setTimeout(() => this.setDateFilterBounds(), 100);
    }

    toggleAdminMode() {
        this.isAdminModeChecked = !this.isAdminModeChecked;
        UserPreferencesService.setPreference(
            'opfab.seeOnlyCardsForWhichUserIsRecipient',
            String(!this.isAdminModeChecked)
        );
    }

    sendFilterQuery(page_number: number, isSearchButtonClicked: boolean): void {
        this.technicalError = false;
        this.loadingInProgress = true;

        if (isSearchButtonClicked) {
            const {value} = this.processMonitoringForm;
            this.transformFiltersListToMap(value);
        }

        const filter = this.getFilter(page_number, this.size);

        CardService.fetchFilteredCards(filter).subscribe({
            next: (page: Page<any>) => {
                this.loadingInProgress = false;

                this.currentPage = page_number + 1; // page on ngb-pagination component starts at 1, and page on backend starts at 0

                if (!this.firstQueryHasBeenDone) {
                    this.firstQueryHasResults = page.content.length > 0;
                    this.resultsNumber = page.totalElements;
                }

                this.firstQueryHasBeenDone = true;

                page.content.forEach((card) => {
                    this.cardPostProcessing(card);
                });
                this.results = page.content;
                this.totalElements = page.totalElements;
                this.totalPages = page.totalPages;
                this.changeDetector.markForCheck();
            },
            error: () => {
                this.firstQueryHasBeenDone = false;
                this.loadingInProgress = false;
                this.technicalError = true;
                this.changeDetector.markForCheck();
            }
        });
    }

    private getFilter(page: number, size: number): CardsFilter {
        const localFilters = [];
        this.filters?.forEach((values, key) => {
            localFilters.push(new FilterModel(key, null, FilterMatchTypeEnum.IN, values));
        });
        // if no process selected, set the filter to the list of process that shall be visible on the UI
        if (this.listOfProcessesForRequest.length && !this.filters?.has('process'))
            localFilters.push(new FilterModel('process', null, FilterMatchTypeEnum.IN, this.listOfProcessesForRequest));

        this.columnFilters.forEach((filter) => localFilters.push(filter));

        const selectedFields: string[] = [];
        this.processMonitoring.forEach((column) => {
            selectedFields.push(column.field);
        });

        return new CardsFilter(page, size, this.isAdminModeChecked, true, false, localFilters, selectedFields);
    }

    transformFiltersListToMap = (filters: any): void => {
        this.filters = new Map();

        Object.keys(filters).forEach((key) => {
            const element = filters[key];
            // if the form element is date
            if (key !== 'processGroup' && element) {
                if (checkElement(FilterDateTypes, key)) {
                    this.dateFilterToMap(key, element);
                } else if (key === 'process') {
                    this.processFilterToMap(element);
                } else if (element.length) {
                    if (key === 'state') {
                        this.stateFilterToMap(element);
                    } else {
                        this.otherFilterToMap(element, key);
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
        const epochDate = Date.parse(element);
        if (epochDate) {
            this.filters.set(key, [epochDate]);
        }
    }

    processFilterToMap(element: any) {
        const processes = [];
        if (element.length === 0) this.processMultiSelectOptions.forEach((val) => processes.push(val.value));
        else
            element.forEach((val) => {
                processes.push(val);
            });
        this.filters.set('process', processes);
    }

    stateFilterToMap(element: any) {
        const processStateKeys = [];
        element.forEach((val) => {
            processStateKeys.push(val);
        });
        this.filters.set('processStateKey', processStateKeys);
    }

    cardPostProcessing(card) {
        const isThirdPartyPublisher = card.publisherType === 'EXTERNAL';
        const sender = isThirdPartyPublisher ? card.publisher : EntitiesService.getEntityName(card.publisher);

        let representative = '';
        if (card.representativeType && card.representative) {
            const isThirdPartyRepresentative = card.representativeType === 'EXTERNAL';
            representative = isThirdPartyRepresentative
                ? card.representative
                : EntitiesService.getEntityName(card.representative);
        }
        card.sender = sender;
        card.representative = representative;

        card.processName = this.processNames.get(card.process);
        card.stateColor = this.stateColors.get(card.process + '.' + card.state);
        card.severityNumber = this.mapSeverity.get(card.severity.toLocaleLowerCase());
    }

    search() {
        this.firstQueryHasBeenDone = false;
        this.columnFilters = [];
        this.sendFilterQuery(0, true);
        this.page = 1;
    }

    onPageChange(currentPage): void {
        // page on ngb-pagination component starts at 1, and page on backend starts at 0
        this.sendFilterQuery(currentPage - 1, false);
        this.page = currentPage;
    }

    onTableFilterChange(filterModel) {
        this.columnFilters = [];
        Object.keys(filterModel).forEach((column) => {
            const type: string = filterModel[column].type;
            this.columnFilters.push(
                new FilterModel(column, filterModel[column].filterType, FilterMatchTypeEnum[type.toUpperCase()], [
                    filterModel[column].filter
                ])
            );
        });
        this.sendFilterQuery(0, false);
    }

    displayTime(date) {
        return DateTimeFormatterService.getFormattedDateAndTimeFromEpochDate(date);
    }

    exportToExcel(): void {
        const exportArchiveData = [];

        const modalOptions: NgbModalOptions = {
            centered: true,
            backdrop: 'static', // Modal shouldn't close even if we click outside it
            size: 'sm'
        };
        this.modalRef = this.modalService.open(this.exportTemplate, modalOptions);

        const filter = this.getFilter(0, this.resultsNumber);

        CardService.fetchFilteredCards(filter).subscribe((page: Page<Object>) => {
            const lines = page.content;
            const severityColumnName = this.translateColumn('shared.result.severity');

            lines.forEach((card: any) => {
                this.cardPostProcessing(card);

                const lineForExport = {};
                lineForExport[severityColumnName] = card.severity;
                this.processMonitoring.forEach((column) => {
                    if (column.type === 'date') {
                        lineForExport[column.colName] = this.displayTime(card[String(column.field).split('.').pop()]);
                    } else {
                        lineForExport[column.colName] = card[String(column.field).split('.').pop()];
                    }
                });

                exportArchiveData.push(lineForExport);
            });
            ExcelExport.exportJsonToExcelFile(exportArchiveData, 'ProcessMonitoring');
            this.modalRef.close();
        });
    }

    translateColumn(key: string, interpolateParams?: Map<string, string>): any {
        return this.translationService.getTranslation(key, interpolateParams);
    }

    ngOnDestroy() {
        if (this.modalRef) {
            this.modalRef.close();
        }
    }

    protected readonly document = document;
}
