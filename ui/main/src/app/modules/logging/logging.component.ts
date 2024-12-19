/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
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
import {Subject} from 'rxjs';

import {ProcessesService} from '@ofServices/processes/ProcessesService';
import {takeUntil} from 'rxjs/operators';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ConfigService} from 'app/services/config/ConfigService';
import {DateTimeFormatterService} from 'app/services/dateTimeFormatter/DateTimeFormatterService';
import {LightCard} from '@ofModel/light-card.model';
import {Page} from '@ofModel/page.model';
import {ExcelExport} from 'app/business/common/excel-export';
import {ArchivesLoggingFiltersComponent} from '../share/archives-logging-filters/archives-logging-filters.component';
import {EntitiesService} from '@ofServices/entities/EntitiesService';
import {NgbModal, NgbModalOptions, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {CardsFilter} from '@ofModel/cards-filter.model';
import {FilterMatchTypeEnum, FilterModel} from '@ofModel/filter-model';
import {CardService} from 'app/business/services/card/card.service';
import {NgIf} from '@angular/common';
import {SpinnerComponent} from '../share/spinner/spinner.component';
import {LoggingTableComponent} from './components/logging-table/logging-table.component';
import {TranslateModule} from '@ngx-translate/core';
import {BusinessConfigAPI} from 'app/api/businessconfig.api';
import {UserPreferencesService} from 'app/business/services/users/user-preference.service';
import {TranslationService} from '@ofServices/translation/TranslationService';

@Component({
    selector: 'of-logging',
    templateUrl: './logging.component.html',
    styleUrls: ['./logging.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        ArchivesLoggingFiltersComponent,
        NgIf,
        SpinnerComponent,
        LoggingTableComponent,
        TranslateModule
    ]
})
export class LoggingComponent implements OnDestroy, OnInit, AfterViewInit {
    unsubscribe$: Subject<void> = new Subject<void>();

    tags: any[] = [];
    loggingForm = new FormGroup({
        tags: new FormControl([]),
        state: new FormControl([]),
        process: new FormControl([]),
        processGroup: new FormControl([]),
        publishDateRange: new FormControl({}),
        activeDateRange: new FormControl({})
    });

    results: LightCard[];
    currentPage = 0;

    totalElements: number;
    totalPages: number;
    page: number;
    pageSize: number = 10;

    firstQueryHasBeenDone = false;
    firstQueryHasResults = false;
    loadingInProgress = false;
    technicalError = false;

    resultsNumber = 0;

    processStateDescription = new Map();
    processStateName = new Map();
    processNames = new Map();
    stateColors = new Map();

    @ViewChild('filters') filtersTemplate: ArchivesLoggingFiltersComponent;

    modalRef: NgbModalRef;
    @ViewChild('exportInProgress') exportTemplate: ElementRef;

    listOfProcessesForFilter = [];
    listOfProcessesForRequest = [];

    columnFilters: FilterModel[] = [];
    isProcessGroupFilterVisible: boolean;

    private readonly mapSeverity = new Map([
        ['alarm', 1],
        ['action', 2],
        ['compliant', 3],
        ['information', 4]
    ]);

    constructor(
        private readonly modalService: NgbModal,
        private readonly changeDetector: ChangeDetectorRef
    ) {
        ProcessesService.getAllProcesses().forEach((process) => {
            if (process.uiVisibility?.logging) {
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

    ngOnInit() {
        const savedPageSize = UserPreferencesService.getPreference('opfab.archives.page.size');
        if (savedPageSize) this.pageSize = parseInt(savedPageSize);
        BusinessConfigAPI.getTags('logging').then((customTags) => {
            this.tags = customTags ?? ConfigService.getConfigValue('logging.filters.tags.list');
            this.changeDetector.markForCheck();
        });
        this.results = [];
    }

    ngAfterViewInit() {
        this.isProcessGroupFilterVisible = this.filtersTemplate.isProcessGroupFilterVisible();
    }

    resetForm() {
        this.loggingForm.reset();
        this.columnFilters = [];
        this.firstQueryHasBeenDone = false;
    }

    sendFilterQuery(page_number): void {
        this.technicalError = false;
        this.loadingInProgress = true;
        this.changeDetector.markForCheck();

        const {value} = this.loggingForm;
        this.filtersTemplate.transformFiltersListToMap(value);

        const filter = this.getFilter(page_number, this.pageSize, this.filtersTemplate.filters);

        CardService.fetchFilteredArchivedCards(filter)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
                next: (page: Page<any>) => {
                    this.loadingInProgress = false;

                    this.currentPage = page_number + 1; // page on ngb-pagination component start at 1 , and page on backend start at 0

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

    private getFilter(page: number, size: number, filtersMap: Map<string, any[]>): CardsFilter {
        const filters = [];
        let isAdminMode = false;
        filtersMap.forEach((values, key) => {
            if (key === 'adminMode') isAdminMode = values[0];
            else filters.push(new FilterModel(key, null, FilterMatchTypeEnum.IN, values));
        });
        // if no process selected , set the filter to the list of process that shall be visible on the UI
        if (this.listOfProcessesForRequest.length && !filtersMap.has('process'))
            filters.push(new FilterModel('process', null, FilterMatchTypeEnum.IN, this.listOfProcessesForRequest));

        this.columnFilters.forEach((filter) => filters.push(filter));
        return new CardsFilter(page, size, isAdminMode, true, false, filters);
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
        this.sendFilterQuery(0);
        this.page = 1;
    }

    onPageChange(currentPage): void {
        // page on ngb-pagination component start at 1 , and page on backend start at 0
        this.sendFilterQuery(currentPage - 1);
        this.page = currentPage;
    }

    onPageSizeChange(pageSize: number): void {
        this.pageSize = pageSize;
        UserPreferencesService.setPreference('opfab.archives.page.size', this.pageSize);
        this.sendFilterQuery(0);
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
        this.sendFilterQuery(0);
    }

    displayTime(date) {
        return DateTimeFormatterService.getFormattedDateAndTime(date);
    }

    exportToExcel(): void {
        const exportArchiveData = [];

        const modalOptions: NgbModalOptions = {
            centered: true,
            backdrop: 'static', // Modal shouldn't close even if we click outside it
            size: 'sm'
        };
        this.modalRef = this.modalService.open(this.exportTemplate, modalOptions);

        const filter = this.getFilter(0, this.resultsNumber, this.filtersTemplate.filters);

        CardService.fetchFilteredArchivedCards(filter)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((page: Page<LightCard>) => {
                const lines = page.content;

                const severityColumnName = this.translateColumn('shared.result.severity');
                const timeOfActionColumnName = this.translateColumn('shared.result.timeOfAction');
                const processGroupColumnName = this.translateColumn('shared.result.processGroup');
                const processColumnName = this.translateColumn('shared.result.process');
                const titleColumnName = this.translateColumn('shared.result.title');
                const summaryColumnName = this.translateColumn('shared.result.summary');
                const stateColumnName = this.translateColumn('shared.result.state');
                const descriptionColumnName = this.translateColumn('shared.result.description');
                const senderColumnName = this.translateColumn('shared.result.sender');
                const representativeColumnName = this.translateColumn('shared.result.representative');

                lines.forEach((card: any) => {
                    this.cardPostProcessing(card);
                    // TO DO translation for old process should be done  , but loading local arrives too late , solution to find
                    if (this.filtersTemplate.isProcessGroupFilterVisible())
                        exportArchiveData.push({
                            [severityColumnName]: TranslationService.translateSeverity(card.severity),
                            [timeOfActionColumnName]: DateTimeFormatterService.getFormattedDateAndTime(
                                card.publishDate
                            ),
                            [processGroupColumnName]: this.translateColumn(
                                ProcessesService.findProcessGroupLabelForProcess(card.process)
                            ),
                            [processColumnName]: card.processName,
                            [titleColumnName]: card.titleTranslated,
                            [summaryColumnName]: card.summaryTranslated,
                            [stateColumnName]: this.processStateName.get(card.process + '.' + card.state),
                            [descriptionColumnName]: this.processStateDescription.get(card.process + '.' + card.state),
                            [senderColumnName]: this.translateColumn(card.sender),
                            [representativeColumnName]: this.translateColumn(card.representative)
                        });
                    else
                        exportArchiveData.push({
                            [severityColumnName]: card.severity,
                            [timeOfActionColumnName]: DateTimeFormatterService.getFormattedDateAndTime(
                                card.publishDate
                            ),
                            [processColumnName]: card.processName,
                            [titleColumnName]: card.titleTranslated,
                            [summaryColumnName]: card.summaryTranslated,
                            [stateColumnName]: this.processStateName.get(card.process + '.' + card.state),
                            [descriptionColumnName]: this.processStateDescription.get(card.process + '.' + card.state),
                            [senderColumnName]: this.translateColumn(card.sender),
                            [representativeColumnName]: this.translateColumn(card.representative)
                        });
                });
                ExcelExport.exportJsonToExcelFile(exportArchiveData, 'Logging');
                this.modalRef.close();
            });
    }

    translateColumn(key: string, interpolateParams?: Map<string, string>): any {
        return TranslationService.getTranslation(key, interpolateParams);
    }

    ngOnDestroy() {
        if (this.modalRef) {
            this.modalRef.close();
        }
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
