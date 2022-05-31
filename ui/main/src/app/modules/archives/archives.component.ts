/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {AppState} from '@ofStore/index';
import {ProcessesService} from '@ofServices/processes.service';
import {Store} from '@ngrx/store';
import {takeUntil} from 'rxjs/operators';
import {AbstractControl, FormControl, FormGroup} from '@angular/forms';
import {ConfigService} from '@ofServices/config.service';
import {TimeService} from '@ofServices/time.service';
import {NgbModal, NgbModalOptions, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {CardService} from '@ofServices/card.service';
import {LightCard} from '@ofModel/light-card.model';
import {Page} from '@ofModel/page.model';
import {ExportService} from '@ofServices/export.service';
import {TranslateService} from '@ngx-translate/core';
import {UserPreferencesService} from '@ofServices/user-preference.service';
import {Utilities} from 'app/common/utilities';
import {Card, CardData} from '@ofModel/card.model';
import {ArchivesLoggingFiltersComponent} from '../share/archives-logging-filters/archives-logging-filters.component';
import {EntitiesService} from '@ofServices/entities.service';
import {MessageLevel} from '@ofModel/message.model';
import {AlertMessage} from '@ofStore/actions/alert.actions';
import {DateTimeNgb} from '@ofModel/datetime-ngb.model';
import {DisplayContext} from '@ofModel/templateGateway.model';

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
    archiveForm: FormGroup;

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
    loadingIsTakingMoreThanOneSecond = false;
    isCollapsibleUpdatesActivated = false;
    technicalError = false;

    // View card
    modalRef: NgbModalRef;
    @ViewChild('cardDetail') cardDetailTemplate: ElementRef;
    @ViewChild('filters') filtersTemplate: ArchivesLoggingFiltersComponent;
    selectedCard: Card;
    selectedChildCards: Card[];
    fromEntityOrRepresentativeSelectedCard = null;
    listOfProcesses = [];

    lastRequestID: number;

    displayContext: any = DisplayContext.ARCHIVE;

    isThereProcessStateToDisplay: boolean;

    constructor(
        private store: Store<AppState>,
        private processesService: ProcessesService,
        private configService: ConfigService,
        private timeService: TimeService,
        private cardService: CardService,
        private translate: TranslateService,
        private userPreferences: UserPreferencesService,
        private modalService: NgbModal,
        private entitiesService: EntitiesService
    ) {
        this.archiveForm = new FormGroup({
            tags: new FormControl([]),
            state: new FormControl([]),
            process: new FormControl([]),
            processGroup: new FormControl([]),
            publishDateFrom: new FormControl(),
            publishDateTo: new FormControl(''),
            activeFrom: new FormControl(''),
            activeTo: new FormControl('')
        });

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

        this.isThereProcessStateToDisplay = this.processesService.getStatesListPerProcess(true).size > 0;
    }

    toggleCollapsibleUpdates() {
        this.isCollapsibleUpdatesActivated = !this.isCollapsibleUpdatesActivated;
        this.userPreferences.setPreference(
            'opfab.archives.isCollapsibleUpdatesActivated',
            String(this.isCollapsibleUpdatesActivated)
        );
        this.sendQuery(0);
    }

    resetForm() {
        this.archiveForm.reset();
        this.firstQueryHasBeenDone = false;
        this.hasResult = false;
        this.resultsNumber = 0;
    }

    private displayMessage(i18nKey: string, msg: string, severity: MessageLevel = MessageLevel.ERROR) {
        this.store.dispatch(new AlertMessage({alertMessage: {message: msg, level: severity, i18n: {key: i18nKey}}}));
    }

    sendQuery(page_number): void {
        this.technicalError = false;
        const publishStart = this.extractTime(this.archiveForm.get('publishDateFrom'));
        const publishEnd = this.extractTime(this.archiveForm.get('publishDateTo'));

        if (
            publishStart != null &&
            !isNaN(publishStart) &&
            publishEnd != null &&
            !isNaN(publishEnd) &&
            publishStart > publishEnd
        ) {
            this.displayMessage('shared.filters.publishEndDateBeforeStartDate', '', MessageLevel.ERROR);
            return;
        }

        const activeStart = this.extractTime(this.archiveForm.get('activeFrom'));
        const activeEnd = this.extractTime(this.archiveForm.get('activeTo'));

        if (
            activeStart != null &&
            !isNaN(activeStart) &&
            activeEnd != null &&
            !isNaN(activeEnd) &&
            activeStart > activeEnd
        ) {
            this.displayMessage('shared.filters.activeEndDateBeforeStartDate', '', MessageLevel.ERROR);
            return;
        }

        this.loadingInProgress = true;
        this.checkForArchiveLoadingInProgressForMoreThanOneSecond();
        const {value} = this.archiveForm;
        this.filtersTemplate.transformFiltersListToMap(value);
        this.filtersTemplate.filters.set('size', [this.size.toString()]);
        this.filtersTemplate.filters.set('page', [page_number]);
        this.filtersTemplate.filters.set('latestUpdateOnly', [String(this.isCollapsibleUpdatesActivated)]);
        this.cardService
            .fetchArchivedCards(this.filtersTemplate.filters)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
                next: (page: Page<LightCard>) => {
                    this.resultsNumber = page.totalElements;
                    this.currentPage = page_number + 1; // page on ngb-pagination component start at 1 , and page on backend start at 0
                    this.firstQueryHasBeenDone = true;
                    this.loadingInProgress = false;
                    this.loadingIsTakingMoreThanOneSecond = false;
                    this.hasResult = page.content.length > 0;
                    this.results = page.content;

                    if (this.isCollapsibleUpdatesActivated) {
                        const requestID = new Date().valueOf();
                        this.lastRequestID = requestID;
                        this.loadUpdatesByCardId(requestID);
                    } else {
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

    // we show a spinner on screen if archives loading takes more than 1 second
    private checkForArchiveLoadingInProgressForMoreThanOneSecond() {
        setTimeout(() => {
            this.loadingIsTakingMoreThanOneSecond = this.loadingInProgress;
        }, 1000);
    }

    loadUpdatesByCardId(requestID: number) {
        this.updatesByCardId = [];
        this.results.forEach((lightCard, index) => {
            this.updatesByCardId.splice(index, 0, {
                mostRecent: lightCard,
                cardHistories: [],
                displayHistory: false,
                tooManyRows: false
            });
        });

        this.results.forEach((lightCard, index) => {
            const filters: Map<string, string[]> = new Map();
            filters.set('process', [lightCard.process]);
            filters.set('processInstanceId', [lightCard.processInstanceId]);
            filters.set('size', [(1 + this.historySize).toString()]);
            filters.set('page', ['0']);
            this.cardService
                .fetchArchivedCards(filters)
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe((page: Page<LightCard>) => {
                    this.removeMostRecentCardFromHistories(lightCard.id, page.content);

                    // since we are in asynchronous mode, we test requestId to avoid that the requests "overlap" and that the results appear in a wrong order
                    if (requestID === this.lastRequestID)
                        this.updatesByCardId.splice(index, 1, {
                            mostRecent: lightCard,
                            cardHistories: page.content,
                            displayHistory: false,
                            tooManyRows: page.totalPages > 1
                        });
                });
        });
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
        this.sendQuery(currentPage - 1);
    }

    displayTime(date) {
        return this.timeService.formatDateTime(date);
    }

    private extractTime(form: AbstractControl) {
        const val = form.value;
        if (!val || val == '') {
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

    // EXPORT TO EXCEL
    initExportArchiveData(): void {
        const exportArchiveData = [];

        this.filtersTemplate.filters.delete('size');
        this.filtersTemplate.filters.delete('page');
        this.filtersTemplate.filters.delete('latestUpdateOnly');

        this.cardService
            .fetchArchivedCards(this.filtersTemplate.filters)
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
                        // TO DO translation for old process should be done  , but loading local arrive to late , solution to find
                        if (this.filtersTemplate.displayProcessGroupFilter())
                            exportArchiveData.push({
                                [severityColumnName]: Utilities.translateSeverity(this.translate, card.severity),
                                [publishDateColumnName]: this.timeService.formatDateTime(card.publishDate),
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
                                [publishDateColumnName]: this.timeService.formatDateTime(card.publishDate),
                                [businessDateColumnName]:
                                    this.displayTime(card.startDate) + '-' + this.displayTime(card.endDate),
                                [titleColumnName]: card.titleTranslated,
                                [summaryColumnName]: card.summaryTranslated
                            });
                    }
                });
                ExportService.exportJsonToExcelFile(exportArchiveData, 'Archive');
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
        this.cardService.loadArchivedCard(cardId).subscribe((card: CardData) => {
            this.selectedCard = card.card;
            this.selectedChildCards = card.childCards;
            const options: NgbModalOptions = {
                size: 'fullscreen'
            };
            this.computeFromEntity();
            this.modalRef = this.modalService.open(this.cardDetailTemplate, options);
        });
    }

    private computeFromEntity() {
        if (this.selectedCard.publisherType === 'ENTITY') {
            this.fromEntityOrRepresentativeSelectedCard = this.entitiesService.getEntityName(
                this.selectedCard.publisher
            );

            if (!!this.selectedCard.representativeType && !!this.selectedCard.representative) {
                const representative =
                    this.selectedCard.representativeType === 'ENTITY'
                        ? this.entitiesService.getEntityName(this.selectedCard.representative)
                        : this.selectedCard.representative;

                this.fromEntityOrRepresentativeSelectedCard += ' (' + representative + ')';
            }
        } else this.fromEntityOrRepresentativeSelectedCard = null;
    }

    getFormattedPublishDate(): any {
        return this.timeService.formatDate(this.selectedCard.publishDate);
    }

    getFormattedPublishTime(): any {
        return this.timeService.formatTime(this.selectedCard.publishDate);
    }
    ngOnDestroy() {
        if (!!this.modalRef) {
            this.modalRef.close();
        }
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
