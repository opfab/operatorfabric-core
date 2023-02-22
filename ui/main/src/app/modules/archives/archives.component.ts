/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {ProcessesService} from 'app/business/services/processes.service';
import {takeUntil, tap} from 'rxjs/operators';
import {FormControl, FormGroup} from '@angular/forms';
import {ConfigService} from 'app/business/services/config.service';
import {NgbModal, NgbModalOptions, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {LightCard} from '@ofModel/light-card.model';
import {Page} from '@ofModel/page.model';
import {ExcelExport} from 'app/business/common/excel-export';
import {TranslateService} from '@ngx-translate/core';
import {UserPreferencesService} from 'app/business/services/user-preference.service';
import {Utilities} from 'app/business/common/utilities';
import {Card, CardData} from '@ofModel/card.model';
import {ArchivesLoggingFiltersComponent} from '../share/archives-logging-filters/archives-logging-filters.component';
import {DisplayContext} from '@ofModel/templateGateway.model';
import {FilterMatchTypeEnum, FilterModel} from '@ofModel/filter-model';
import {ArchivedCardsFilter} from '@ofModel/archived-cards-filter.model';
import {DateTimeFormatterService} from 'app/business/services/date-time-formatter.service';
import {CardService} from 'app/business/services/card.service';

@Component({
    selector: 'of-archives',
    templateUrl: './archives.component.html',
    styleUrls: ['./archives.component.scss']
})
export class ArchivesComponent implements OnDestroy, OnInit {
    unsubscribe$: Subject<void> = new Subject<void>();

    tags: any[];
    size: number;
    historySize: number;
    archiveForm = new FormGroup({
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
    updatesByCardId: {
        mostRecent: LightCard;
        cardHistories: LightCard[];
        displayHistory: boolean;
        tooManyRows: boolean;
    }[];
    currentPage = 0;
    resultsNumber = 0;
    hasResult = false;
    firstQueryHasBeenDone = false;
    loadingInProgress = false;
    cardLoadingInProgress = false;
    cardLoadingIsTakingMoreThanOneSecond = false;
    isCollapsibleUpdatesActivated = false;
    technicalError = false;

    // View card
    modalRef: NgbModalRef;
    @ViewChild('cardDetail') cardDetailTemplate: ElementRef;
    @ViewChild('cardLoadingInProgress') cardLoadingTemplate: ElementRef;
    @ViewChild('exportInProgress') exportTemplate: ElementRef;
    @ViewChild('filters') filtersTemplate: ArchivesLoggingFiltersComponent;

    selectedCard: Card;
    selectedChildCards: Card[];

    listOfProcesses = [];

    lastRequestID: number;

    displayContext: any = DisplayContext.ARCHIVE;

    constructor(
        private processesService: ProcessesService,
        private configService: ConfigService,
        private dateTimeFormatter: DateTimeFormatterService,
        private cardService: CardService,
        private translate: TranslateService,
        private userPreferences: UserPreferencesService,
        private modalService: NgbModal
    ) {
        processesService.getAllProcesses().forEach((process) => {
            let itemName = process.name;
            if (!itemName) itemName = process.id;
            this.listOfProcesses.push({
                value: process.id,
                label: itemName,
                i18nPrefix: `${process.id}.${process.version}`
            });
        });
    }

    ngOnInit() {
        const isCollapsibleUpdatesActivatedInStorage = this.userPreferences.getPreference(
            'opfab.archives.isCollapsibleUpdatesActivated'
        );
        this.isCollapsibleUpdatesActivated = isCollapsibleUpdatesActivatedInStorage === 'true';

        this.size = this.configService.getConfigValue('archive.filters.page.size', 10);
        this.historySize = parseInt(this.configService.getConfigValue('archive.history.size', 100));
        this.tags = this.configService.getConfigValue('archive.filters.tags.list');
        this.results = [];
        this.updatesByCardId = [];
    }

    toggleCollapsibleUpdates() {
        this.isCollapsibleUpdatesActivated = !this.isCollapsibleUpdatesActivated;
        this.userPreferences.setPreference(
            'opfab.archives.isCollapsibleUpdatesActivated',
            String(this.isCollapsibleUpdatesActivated)
        );
        this.getResults(0);
    }

    resetForm() {
        this.archiveForm.reset();
        this.firstQueryHasBeenDone = false;
        this.hasResult = false;
        this.resultsNumber = 0;
    }

    sendQuery(page_number): void {
        const {value} = this.archiveForm;
        this.filtersTemplate.transformFiltersListToMap(value);
        this.filtersTemplate.filters.set('size', [this.size.toString()]);

        this.getResults(page_number);
    }

    private getResults(page_number: number): void {
        this.technicalError = false;
        this.loadingInProgress = true;

        const isAdminModeChecked = this.filtersTemplate.filters.get('adminMode')[0];

        const filter = this.getFilter(page_number, Number(this.size), this.filtersTemplate.filters, this.isCollapsibleUpdatesActivated);

        this.cardService
        .fetchFilteredArchivedCards(filter)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
            next: (page: Page<LightCard>) => {
                this.resultsNumber = page.totalElements;
                this.currentPage = page_number + 1; // page on ngb-pagination component starts at 1 , and page on backend starts at 0
                this.firstQueryHasBeenDone = true;
                this.hasResult = page.content.length > 0;
                this.results = page.content;

                if (this.isCollapsibleUpdatesActivated && this.hasResult) {
                    const requestID = new Date().valueOf();
                    this.lastRequestID = requestID;
                    this.loadUpdatesByCardId(requestID, isAdminModeChecked);
                } else {
                    this.loadingInProgress = false;
                    this.updatesByCardId = [];
                    this.results.forEach((lightCard) => {
                        this.updatesByCardId.push({
                            mostRecent: lightCard,
                            cardHistories: [],
                            displayHistory: false,
                            tooManyRows: false
                        });
                    });
                }
            },
            error: () => {
                this.firstQueryHasBeenDone = false;
                this.loadingInProgress = false;
                this.technicalError = true;
            }
        });
    }

    private getFilter(page: number, size: number, filtersMap: Map<string, any[]>, latestUpdateOnly: boolean) : ArchivedCardsFilter {
        const filters = [];
        let isAdminMode = false;
        filtersMap.forEach( (values, key) => {
            if (key === 'adminMode')
                isAdminMode = values[0];
            else
                filters.push(new FilterModel(key,null,FilterMatchTypeEnum.IN, values));
        });

        return new ArchivedCardsFilter(page, size, isAdminMode, false, latestUpdateOnly, filters);
    }



    loadUpdatesByCardId(requestID: number, isAdminModeChecked: boolean) {
        this.updatesByCardId = [];
        this.results.forEach((lightCard, index) => {
            this.updatesByCardId.splice(index, 0, {
                mostRecent: lightCard,
                cardHistories: [],
                displayHistory: false,
                tooManyRows: false
            });
        });

        const updatesRequests$ = [];
        this.results.forEach((lightCard, index) => {
            updatesRequests$.push(this.fetchUpdatesByCardId(lightCard, index, requestID, isAdminModeChecked));
        });

        Utilities.subscribeAndWaitForAllObservablesToEmitAnEvent(updatesRequests$).subscribe(() => {
            this.loadingInProgress = false;
        });
    }

    private fetchUpdatesByCardId(
        lightCard: LightCard,
        index: number,
        requestID: number,
        isAdminModeChecked: boolean
    ): Observable<Page<LightCard>> {
        const filters: Map<string, string[]> = new Map();
        filters.set('process', [lightCard.process]);
        filters.set('processInstanceId', [lightCard.processInstanceId]);

        if (isAdminModeChecked) {
            filters.set('adminMode', ['true']);
        }
        const filter = this.getFilter(0, 1 + this.historySize , filters, false);


        return this.cardService.fetchFilteredArchivedCards(filter).pipe(
            takeUntil(this.unsubscribe$),
            tap({
                next: (page: Page<LightCard>) => {
                    this.removeMostRecentCardFromHistories(lightCard.id, page.content);
                    // log to debug CI/CD Failures
                    console.debug(new Date().toISOString(), 'Archives : receive card update ');
                    // since we are in asynchronous mode, we test requestId to avoid that the requests "overlap" and that the results appear in a wrong order
                    if (requestID === this.lastRequestID)
                        this.updatesByCardId.splice(index, 1, {
                            mostRecent: lightCard,
                            cardHistories: page.content,
                            displayHistory: false,
                            tooManyRows: page.totalPages > 1
                        });
                }
            })
        );
    }

    removeMostRecentCardFromHistories(mostRecentId: string, histories: LightCard[]) {
        histories.forEach((lightCard, index) => {
            if (lightCard.id === mostRecentId) histories.splice(index, 1);
        });
    }

    displayHistoryOfACard(card: {mostRecent: LightCard; cardHistories: LightCard[]; displayHistory: boolean}) {
        card.displayHistory = true;
    }

    hideHistoryOfACard(card: {mostRecent: LightCard; cardHistories: LightCard[]; displayHistory: boolean}) {
        card.displayHistory = false;
    }

    updateResultPage(currentPage): void {
        // page on ngb-pagination component start at 1 , and page on backend start at 0
        this.getResults(currentPage - 1);
    }

    displayTime(date) {
        return this.dateTimeFormatter.getFormattedDateAndTimeFromEpochDate(date);
    }

    // EXPORT TO EXCEL
    initExportArchiveData(): void {
        const exportArchiveData = [];

        const modalOptions: NgbModalOptions = {
            centered: true,
            backdrop: 'static', // Modal shouldn't close even if we click outside it
            size: 'sm'
        };
        this.modalRef = this.modalService.open(this.exportTemplate, modalOptions);

        const filter = this.getFilter(0, 1 + this.historySize, this.filtersTemplate.filters, false);
        this.cardService
            .fetchFilteredArchivedCards(filter)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((page: Page<LightCard>) => {
                const lines = page.content;

                const severityColumnName = this.translateColumn('shared.result.severity');
                const publishDateColumnName = this.translateColumn('shared.result.publishDate');
                const businessDateColumnName = this.translateColumn('shared.result.businessPeriod');
                const titleColumnName = this.translateColumn('shared.result.title');
                const summaryColumnName = this.translateColumn('shared.result.summary');
                const processGroupColumnName = this.translateColumn('shared.result.processGroup');

                lines.forEach((card: LightCard) => {
                    if (typeof card !== undefined) {
                        // TO DO translation for old process should be done, but loading local arrives too late, solution to find
                        if (this.filtersTemplate.isProcessGroupFilterVisible())
                            exportArchiveData.push({
                                [severityColumnName]: Utilities.translateSeverity(this.translate, card.severity),
                                [publishDateColumnName]: this.dateTimeFormatter.getFormattedDateAndTimeFromEpochDate(
                                    card.publishDate
                                ),
                                [businessDateColumnName]:
                                    this.displayTime(card.startDate) + '-' + this.displayTime(card.endDate),
                                [titleColumnName]: card.titleTranslated,
                                [summaryColumnName]: card.summaryTranslated,
                                [processGroupColumnName]: this.translateColumn(
                                    this.processesService.findProcessGroupLabelForProcess(card.process)
                                )
                            });
                        else
                            exportArchiveData.push({
                                [severityColumnName]: Utilities.translateSeverity(this.translate, card.severity),
                                [publishDateColumnName]: this.dateTimeFormatter.getFormattedDateAndTimeFromEpochDate(
                                    card.publishDate
                                ),
                                [businessDateColumnName]:
                                    this.displayTime(card.startDate) + '-' + this.displayTime(card.endDate),
                                [titleColumnName]: card.titleTranslated,
                                [summaryColumnName]: card.summaryTranslated
                            });
                    }
                });
                ExcelExport.exportJsonToExcelFile(exportArchiveData, 'Archive');
                this.modalRef.close();
            });
    }

    export(): void {
        this.initExportArchiveData();
    }

    translateColumn(key: string | Array<string>, interpolateParams?: Object): any {
        let translatedColumn: number;

        this.translate
            .get(key, interpolateParams)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((translate) => {
                translatedColumn = translate;
            });

        return translatedColumn;
    }

    openCard(cardId) {
        this.cardLoadingInProgress = true;
        this.checkForCardLoadingInProgressForMoreThanOneSecond();

        this.cardService.loadArchivedCard(cardId).subscribe((card: CardData) => {
            this.selectedCard = card.card;
            this.selectedChildCards = card.childCards;

            const options: NgbModalOptions = {
                size: 'fullscreen'
            };
            if (!!this.modalRef) this.modalRef.close();
            this.modalRef = this.modalService.open(this.cardDetailTemplate, options);
            this.cardLoadingInProgress = false;
            this.cardLoadingIsTakingMoreThanOneSecond = false;
        });
    }

    // we show a spinner on screen if archives loading takes more than 1 second
    private checkForCardLoadingInProgressForMoreThanOneSecond() {
        setTimeout(() => {
            this.cardLoadingIsTakingMoreThanOneSecond = this.cardLoadingInProgress;
            if (this.cardLoadingIsTakingMoreThanOneSecond) {
                const modalOptions: NgbModalOptions = {
                    centered: true,
                    backdrop: 'static', // Modal shouldn't close even if we click outside it
                    size: 'sm'
                };
                this.modalRef = this.modalService.open(this.cardLoadingTemplate, modalOptions);
            }
        }, 1000);
    }

    getFormattedDate(date: number): any {
        return this.dateTimeFormatter.getFormattedDateFromEpochDate(date);
    }

    getFormattedTime(date: number): any {
        return this.dateTimeFormatter.getFormattedTimeFromEpochDate(date);
    }

    ngOnDestroy() {
        if (!!this.modalRef) {
            this.modalRef.close();
        }
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
