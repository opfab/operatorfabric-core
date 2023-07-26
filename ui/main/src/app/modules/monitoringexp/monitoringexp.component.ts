/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';

import {ProcessesService} from 'app/business/services/businessconfig/processes.service';
import {takeUntil} from 'rxjs/operators';
import {FormControl, FormGroup} from '@angular/forms';
import {ConfigService} from 'app/business/services/config.service';
import {DateTimeFormatterService} from 'app/business/services/date-time-formatter.service';
import {LightCard} from '@ofModel/light-card.model';
import {Page} from '@ofModel/page.model';
import {ExcelExport} from 'app/business/common/excel-export';
import {ArchivesLoggingFiltersComponent} from '../share/archives-logging-filters/archives-logging-filters.component';
import {EntitiesService} from 'app/business/services/users/entities.service';
import {NgbModal, NgbModalOptions, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {CardsFilter} from '@ofModel/cards-filter.model';
import {FilterMatchTypeEnum, FilterModel} from '@ofModel/filter-model';
import {CardService} from 'app/business/services/card/card.service';
import {TranslationService} from 'app/business/services/translation/translation.service';

@Component({
    selector: 'of-monitoringexp',
    templateUrl: './monitoringexp.component.html',
    styleUrls: ['./monitoringexp.component.scss']
})
export class MonitoringExpComponent implements OnDestroy, OnInit, AfterViewInit {
    unsubscribe$: Subject<void> = new Subject<void>();

    tags: any[];
    size: number;
    monitoringExpForm = new FormGroup({
            tags: new FormControl([]),
            state: new FormControl([]),
            process: new FormControl([]),
            processGroup: new FormControl([]),
            publishDateFrom: new FormControl<string | null>(null),
            publishDateTo: new FormControl(''),
            activeFrom: new FormControl(''),
            activeTo: new FormControl('')
        });

    results: LightCard[];
    currentPage = 0;

    totalElements: number;
    totalPages: number;
    page: number;

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

    private mapSeverity = new Map([
        ['alarm', 1],
        ['action', 2],
        ['compliant', 3],
        ['information', 4]
    ]);
    private processMonitoring: any[];

    constructor(
        private processesService: ProcessesService,
        private configService: ConfigService,
        private dateTimeFormatter: DateTimeFormatterService,
        private cardService: CardService,
        private translationService: TranslationService,
        private entitiesService: EntitiesService,
        private modalService: NgbModal
    ) {
        this.processMonitoring = this.configService.getConfigValue('processMonitoring');

        processesService.getAllProcesses().forEach((process) => {
            const itemName = process.name ? process.name : process.id;
            this.processNames.set(process.id, itemName);
            for (let key of process.states.keys()) {
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
        });
    }

    ngOnInit() {
        this.size = this.configService.getConfigValue('logging.filters.page.size', 10);
        this.tags = this.configService.getConfigValue('logging.filters.tags.list');

        this.results = [];

        setInterval(() => {
            if (this.currentPage === 0) {
                this.sendFilterQuery(0);
            } else {
                this.sendFilterQuery(this.currentPage - 1);
            }
        }, 5000);
    }

    ngAfterViewInit() {
        this.isProcessGroupFilterVisible = this.filtersTemplate.isProcessGroupFilterVisible();
        this.sendFilterQuery(0);
    }

    resetForm() {
        this.monitoringExpForm.reset();
        this.columnFilters = [];
        this.firstQueryHasBeenDone = false;
    }

     sendFilterQuery(page_number): void {
        this.technicalError = false;
        this.loadingInProgress = true;

        const {value} = this.monitoringExpForm;
        this.filtersTemplate.transformFiltersListToMap(value);

        const filter = this.getFilter(page_number, this.size, this.filtersTemplate.filters);

        this.cardService
            .fetchFilteredCards(filter)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
                next: (page: Page<any>) => {
                    this.loadingInProgress = false;

                    this.currentPage = page_number + 1; // page on ngb-pagination component starts at 1, and page on backend starts at 0

                    if (!this.firstQueryHasBeenDone) {
                        this.firstQueryHasResults=page.content.length > 0;
                        this.resultsNumber = page.totalElements;
                    }

                    this.firstQueryHasBeenDone = true;

                    page.content.forEach((card) => {
                        this.cardPostProcessing(card);
                    });
                    this.results = page.content;
                    this.totalElements= page.totalElements;
                    this.totalPages= page.totalPages;
                },
                error: () => {
                    this.firstQueryHasBeenDone = false;
                    this.loadingInProgress = false;
                    this.technicalError = true;
                }
            });
    }

    private getFilter(page: number, size: number, filtersMap: Map<string, any[]>) : CardsFilter {
        const filters = [];
        let isAdminMode = false;
        filtersMap.forEach( (values, key) => {
            if (key === 'adminMode')
                isAdminMode = values[0];
            else
                filters.push(new FilterModel(key, null, FilterMatchTypeEnum.IN, values));
        });
        // if no process selected, set the filter to the list of process that shall be visible on the UI
        if (this.listOfProcessesForRequest.length && !filtersMap.has('process'))
            filters.push(new FilterModel('process', null, FilterMatchTypeEnum.IN, this.listOfProcessesForRequest));

        this.columnFilters.forEach(filter => filters.push(filter));

        const selectedFields: string[] = [];
        this.processMonitoring.forEach(column => {
            selectedFields.push(column.field);
        });

        return new CardsFilter(page, size, isAdminMode, true, false, filters, selectedFields);
    }

    cardPostProcessing(card) {
        const isThirdPartyPublisher = card.publisherType === 'EXTERNAL';
        const sender = isThirdPartyPublisher ? card.publisher : this.entitiesService.getEntityName(card.publisher);

        let representative = '';
        if (card.representativeType && card.representative) {
            const isThirdPartyRepresentative = card.representativeType === 'EXTERNAL';
            representative = isThirdPartyRepresentative
                ? card.representative
                : this.entitiesService.getEntityName(card.representative);
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
        // page on ngb-pagination component starts at 1, and page on backend starts at 0
        this.sendFilterQuery(currentPage - 1);
        this.page = currentPage;
    }

    onTableFilterChange(filterModel) {
        this.columnFilters = [];
        Object.keys(filterModel).forEach(column => {
            const type : string = filterModel[column].type;
            this.columnFilters.push(new FilterModel(column, filterModel[column].filterType, FilterMatchTypeEnum[type.toUpperCase()], [filterModel[column].filter]))
        });
        this.sendFilterQuery(0);
    }

    displayTime(date) {
        return this.dateTimeFormatter.getFormattedDateAndTimeFromEpochDate(date);
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

        this.cardService
            .fetchFilteredCards(filter)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((page: Page<Object>) => {
                const lines = page.content;
                const severityColumnName = this.translateColumn('shared.result.severity');

                lines.forEach((card: any) => {
                    this.cardPostProcessing(card);

                    let lineForExport = {};
                    lineForExport[severityColumnName] = card.severity;
                    this.processMonitoring.forEach(column => {
                        lineForExport[column.colName] = card[String(column.field).split(".").pop()];
                    });

                    exportArchiveData.push(lineForExport);
                });
                ExcelExport.exportJsonToExcelFile(exportArchiveData, 'MonitoringExp');
                this.modalRef.close();
            });
    }

    translateColumn(key: string, interpolateParams?: Map<string,string>): any {
        if (!key) return '';
        return this.translationService.getTranslation(key,interpolateParams);
    }

    ngOnDestroy() {
        if (this.modalRef) {
            this.modalRef.close();
        }
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}