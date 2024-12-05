/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
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
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {ProcessesService} from 'app/business/services/businessconfig/processes.service';
import {takeUntil, tap} from 'rxjs/operators';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ConfigService} from 'app/business/services/config.service';
import {NgbModal, NgbModalOptions, NgbModalRef, NgbPopover, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {LightCard} from '@ofModel/light-card.model';
import {Page} from '@ofModel/page.model';
import {ExcelExport} from 'app/business/common/excel-export';
import {UserPreferencesService} from 'app/business/services/users/user-preference.service';
import {Utilities} from 'app/business/common/utilities';
import {Card, CardWithChildCards} from '@ofModel/card.model';
import {ArchivesLoggingFiltersComponent} from '../share/archives-logging-filters/archives-logging-filters.component';
import {DisplayContext} from '@ofModel/template.model';
import {FilterMatchTypeEnum, FilterModel} from '@ofModel/filter-model';
import {CardsFilter} from '@ofModel/cards-filter.model';
import {DateTimeFormatterService} from 'app/business/services/date-time-formatter.service';
import {CardService} from 'app/business/services/card/card.service';
import {TranslationService} from 'app/business/services/translation/translation.service';
import {EntitiesService} from 'app/business/services/users/entities.service';
import {LoggerService as logger} from 'app/business/services/logs/logger.service';
import {NgIf, NgFor} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {SpinnerComponent} from '../share/spinner/spinner.component';
import {ArchivedCardDetailComponent} from './components/archived-card-detail/archived-card-detail.component';
import {OpfabTitleCasePipe} from '../share/pipes/opfab-title-case.pipe';
import {BusinessConfigAPI} from 'app/api/businessconfig.api';

@Component({
    selector: 'of-archives',
    templateUrl: './archives.component.html',
    styleUrls: ['./archives.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        ArchivesLoggingFiltersComponent,
        NgIf,
        TranslateModule,
        NgFor,
        NgbPopover,
        NgbPagination,
        SpinnerComponent,
        ArchivedCardDetailComponent,
        OpfabTitleCasePipe
    ]
})
export class ArchivesComponent implements OnDestroy, OnInit {
    unsubscribe$: Subject<void> = new Subject<void>();

    tags: any[] = [];
    size: number;
    historySize: number;
    archiveForm = new FormGroup({
        tags: new FormControl([]),
        state: new FormControl([]),
        process: new FormControl([]),
        processGroup: new FormControl([]),
        publishDateRange: new FormControl({}),
        activeDateRange: new FormControl({})
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
    selectedCardTruncatedTitle: string;
    selectedChildCards: Card[];

    listOfProcesses = [];

    lastRequestID: number;

    displayContext: any = DisplayContext.ARCHIVE;

    constructor(
        private readonly translationService: TranslationService,
        private readonly modalService: NgbModal,
        private readonly changeDetector: ChangeDetectorRef
    ) {
        ProcessesService.getAllProcesses().forEach((process) => {
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
        const isCollapsibleUpdatesActivatedInStorage = UserPreferencesService.getPreference(
            'opfab.archives.isCollapsibleUpdatesActivated'
        );
        this.isCollapsibleUpdatesActivated = isCollapsibleUpdatesActivatedInStorage === 'true';

        this.size = ConfigService.getConfigValue('archive.filters.page.size', 10);
        this.historySize = parseInt(ConfigService.getConfigValue('archive.history.size', 100));
        BusinessConfigAPI.getTags('archive').then((customTags) => {
            this.tags = customTags ?? ConfigService.getConfigValue('archive.filters.tags.list');
            this.changeDetector.markForCheck();
        });
        this.results = [];
        this.updatesByCardId = [];
    }

    toggleCollapsibleUpdates() {
        this.isCollapsibleUpdatesActivated = !this.isCollapsibleUpdatesActivated;
        UserPreferencesService.setPreference(
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
        this.changeDetector.markForCheck();

        const isAdminModeChecked = this.filtersTemplate.filters.get('adminMode')[0];

        const filter = this.getFilter(
            page_number,
            Number(this.size),
            this.filtersTemplate.filters,
            this.isCollapsibleUpdatesActivated
        );

        CardService.fetchFilteredArchivedCards(filter)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
                next: (page: Page<LightCard>) => {
                    if (page) {
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
                            this.changeDetector.markForCheck();
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
                    } else {
                        this.firstQueryHasBeenDone = false;
                        this.loadingInProgress = false;
                        this.changeDetector.markForCheck();
                        this.technicalError = true;
                    }
                },
                error: () => {
                    this.firstQueryHasBeenDone = false;
                    this.loadingInProgress = false;
                    this.changeDetector.markForCheck();
                    this.technicalError = true;
                }
            });
    }

    private getFilter(
        page: number,
        size: number,
        filtersMap: Map<string, any[]>,
        latestUpdateOnly: boolean
    ): CardsFilter {
        const filters = [];
        let isAdminMode = false;
        filtersMap.forEach((values, key) => {
            if (key === 'adminMode') isAdminMode = values[0];
            else filters.push(new FilterModel(key, null, FilterMatchTypeEnum.IN, values));
        });

        return new CardsFilter(page, size, isAdminMode, false, latestUpdateOnly, filters);
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
            this.changeDetector.markForCheck();
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
        const filter = this.getFilter(0, 1 + this.historySize, filters, false);

        return CardService.fetchFilteredArchivedCards(filter).pipe(
            takeUntil(this.unsubscribe$),
            tap({
                next: (page: Page<LightCard>) => {
                    this.removeMostRecentCardFromHistories(lightCard.id, page.content);
                    // log to debug CI/CD Failures
                    logger.debug('Archives : receive card update');
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
        return DateTimeFormatterService.getFormattedDateAndTime(date);
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

        const filter = this.getFilter(null, null, this.filtersTemplate.filters, false);
        CardService.fetchFilteredArchivedCards(filter)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((page: Page<LightCard>) => {
                const lines = page.content;

                const severityColumnName = this.translateColumn('shared.result.severity');
                const publishDateColumnName = this.translateColumn('shared.result.publishDate');
                const publisherColumnName = this.translateColumn('shared.result.emitter');
                const entityRecipientsColumnName = this.translateColumn('shared.result.entityRecipients');
                const titleColumnName = this.translateColumn('shared.result.title');
                const summaryColumnName = this.translateColumn('shared.result.summary');
                const processGroupColumnName = this.translateColumn('shared.result.processGroup');
                const processColumnName = this.translateColumn('shared.result.process');

                lines.forEach((card: LightCard) => {
                    if (card) {
                        if (this.filtersTemplate.isProcessGroupFilterVisible())
                            exportArchiveData.push({
                                [severityColumnName]: this.translationService.translateSeverity(card.severity),
                                [publishDateColumnName]: DateTimeFormatterService.getFormattedDateAndTime(
                                    card.publishDate
                                ),
                                [publisherColumnName]: EntitiesService.getEntityName(card.publisher),
                                [entityRecipientsColumnName]: this.getEntityRecipientsNames(card.entityRecipients).join(
                                    ', '
                                ),
                                [titleColumnName]: card.titleTranslated,
                                [summaryColumnName]: card.summaryTranslated,
                                [processGroupColumnName]: this.translateColumn(
                                    ProcessesService.findProcessGroupLabelForProcess(card.process)
                                ),
                                [processColumnName]: this.getProcessName(card.process)
                            });
                        else
                            exportArchiveData.push({
                                [severityColumnName]: this.translationService.translateSeverity(card.severity),
                                [publishDateColumnName]: DateTimeFormatterService.getFormattedDateAndTime(
                                    card.publishDate
                                ),
                                [publisherColumnName]: EntitiesService.getEntityName(card.publisher),
                                [entityRecipientsColumnName]: this.getEntityRecipientsNames(card.entityRecipients).join(
                                    ', '
                                ),
                                [titleColumnName]: card.titleTranslated,
                                [summaryColumnName]: card.summaryTranslated,
                                [processColumnName]: this.getProcessName(card.process)
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

    translateColumn(key: string, interpolateParams?: Map<string, string>): any {
        return this.translationService.getTranslation(key, interpolateParams);
    }

    openCard(cardId) {
        this.cardLoadingInProgress = true;
        this.checkForCardLoadingInProgressForMoreThanOneSecond();

        CardService.loadArchivedCard(cardId).subscribe((card: CardWithChildCards) => {
            if (card) {
                this.selectedCard = card.card;
                this.selectedCardTruncatedTitle = Utilities.sliceForFormat(card.card.titleTranslated, 100);
                this.selectedChildCards = card.childCards;

                const options: NgbModalOptions = {
                    size: 'fullscreen'
                };
                if (this.modalRef) this.modalRef.close();
                this.modalRef = this.modalService.open(this.cardDetailTemplate, options);
            }

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
        return DateTimeFormatterService.getFormattedDate(date);
    }

    getFormattedTime(date: number): any {
        return DateTimeFormatterService.getFormattedTime(date);
    }

    getEntityRecipientsNames(entityRecipients: string[], maxLength?: number): string[] {
        if (entityRecipients) {
            let entityRecipientsNames = [];

            entityRecipients.forEach((entityId) => {
                entityRecipientsNames.push(EntitiesService.getEntityName(entityId));
            });

            if (maxLength && entityRecipientsNames.length > maxLength) {
                entityRecipientsNames = entityRecipientsNames.slice(0, maxLength);
                entityRecipientsNames[entityRecipientsNames.length - 1] += ' ...';
            }
            return entityRecipientsNames;
        }
        return [];
    }

    getProcessName(processId: string): string {
        const process = ProcessesService.getProcess(processId);
        return process?.name ?? processId;
    }

    getEntityName(name: string) {
        return EntitiesService.getEntityName(name);
    }

    findProcessGroupLabelForProcess(process: string) {
        return ProcessesService.findProcessGroupLabelForProcess(process);
    }

    ngOnDestroy() {
        if (this.modalRef) {
            this.modalRef.close();
        }
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
