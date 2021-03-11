/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
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
import {FormControl, FormGroup} from '@angular/forms';
import {ConfigService} from '@ofServices/config.service';
import {TimeService} from '@ofServices/time.service';
import {NgbModal, NgbModalOptions, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {CardService} from '@ofServices/card.service';
import {LightCard} from '@ofModel/light-card.model';
import {Page} from '@ofModel/page.model';
import {ExportService} from '@ofServices/export.service';
import {TranslateService} from '@ngx-translate/core';
import {Card} from '@ofModel/card.model';
import {ArchivesLoggingFiltersComponent} from '../share/archives-logging-filters/archives-logging-filters.component';
import { EntitiesService } from '@ofServices/entities.service';


@Component({
    selector: 'of-archives',
    templateUrl: './archives.component.html',
    styleUrls: ['./archives.component.scss']
})
export class ArchivesComponent implements OnDestroy, OnInit {

    unsubscribe$: Subject<void> = new Subject<void>();

    tags: any[];
    size: number;
    archiveForm: FormGroup;

    results: LightCard[];
    currentPage = 0;
    resultsNumber = 0;
    hasResult = false;
    firstQueryHasBeenDone = false;

    // View card
    modalRef: NgbModalRef;
    @ViewChild('cardDetail') cardDetailTemplate: ElementRef;
    @ViewChild('filters') filtersTemplate: ArchivesLoggingFiltersComponent;
    selectedCard: Card;
    fromEntitySelectedCard = null;

    constructor(private store: Store<AppState>,
                private processesService: ProcessesService,
                private configService: ConfigService,
                private timeService: TimeService,
                private cardService: CardService,
                private translate: TranslateService,
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
            activeTo: new FormControl(''),
        });
    }

    ngOnInit() {
        this.size = this.configService.getConfigValue('archive.filters.page.size', 10);
        this.results = [];
    }

    resetForm() {
        this.archiveForm.reset();
        this.firstQueryHasBeenDone = false;
        this.hasResult = false;
        this.resultsNumber = 0;
    }

    sendQuery(page_number): void {
        const { value } = this.archiveForm;
        this.filtersTemplate.filtersToMap(value);
        this.filtersTemplate.filters.set('size', [this.size.toString()]);
        this.filtersTemplate.filters.set('page', [page_number]);
        this.cardService.fetchArchivedCards(this.filtersTemplate.filters)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((page: Page<LightCard>) => {
                this.resultsNumber = page.totalElements;
                this.currentPage = page_number + 1; // page on ngb-pagination component start at 1 , and page on backend start at 0
                this.firstQueryHasBeenDone = true;
                this.hasResult = page.content.length > 0;
                page.content.forEach(card => this.loadTranslationForCardIfNeeded(card));
                this.results = page.content;
            });
    }

    loadTranslationForCardIfNeeded(card: LightCard) {
        this.processesService.loadTranslationsForProcess(card.process, card.processVersion);
    }

    updateResultPage(currentPage): void {
        // page on ngb-pagination component start at 1 , and page on backend start at 0
        this.sendQuery(currentPage - 1);
    }

    displayTime(date) {
        return this.timeService.formatDateTime(date);
    }


    // EXPORT TO EXCEL
    initExportArchiveData(): void {
        const exportArchiveData = [];

        this.filtersTemplate.filters.set('size', [this.resultsNumber.toString()]);
        this.filtersTemplate.filters.set('page', [0]);

        this.cardService.fetchArchivedCards(this.filtersTemplate.filters).pipe(takeUntil(this.unsubscribe$))
            .subscribe((page: Page<LightCard>) => {
                const lines = page.content;

                const severityColumnName = this.translateColumn('archive.result.severity');
                const publishDateColumnName = this.translateColumn('archive.result.publishDate');
                const businessDateColumnName = this.translateColumn('archive.result.businessPeriod');
                const titleColumnName = this.translateColumn('archive.result.title');
                const summaryColumnName = this.translateColumn('archive.result.summary');
                const processGroupColumnName = this.translateColumn('archive.result.processGroup');

                lines.forEach((card: LightCard) => {
                    if (typeof card !== undefined) {
                        // TO DO translation for old process should be done  , but loading local arrive to late , solution to find
                        if (this.filtersTemplate.displayProcessGroupFilter())
                            exportArchiveData.push({
                                [severityColumnName]: card.severity,
                                [publishDateColumnName]: this.timeService.formatDateTime(card.publishDate),
                                [businessDateColumnName]: this.displayTime(card.startDate) + '-' + this.displayTime(card.endDate),
                                [titleColumnName]: this.translateColumn(card.process + '.' + card.processVersion + '.' + card.title.key, card.title.parameters),
                                [summaryColumnName]: this.translateColumn(card.process + '.' + card.processVersion + '.' + card.summary.key, card.summary.parameters),
                                [processGroupColumnName]: this.translateColumn(this.processesService.findProcessGroupLabelForProcess(card.process))
                            });
                        else
                            exportArchiveData.push({
                                [severityColumnName]: card.severity,
                                [publishDateColumnName]: this.timeService.formatDateTime(card.publishDate),
                                [businessDateColumnName]: this.displayTime(card.startDate) + '-' + this.displayTime(card.endDate),
                                [titleColumnName]: this.translateColumn(card.process + '.' + card.processVersion + '.' + card.title.key, card.title.parameters),
                                [summaryColumnName]: this.translateColumn(card.process + '.' + card.processVersion + '.' + card.summary.key, card.summary.parameters)
                            });
                    }
                });
                ExportService.exportAsExcelFile(exportArchiveData, 'Archive');
            });
    }

    export(): void {
        this.initExportArchiveData();
    }

    translateColumn(key: string | Array<string>, interpolateParams?: Object): any {
        let translatedColumn: number;

        this.translate.get(key, interpolateParams)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((translate) => { translatedColumn = translate; });

        return translatedColumn;
    }


    openCard(cardId) {
        this.cardService.loadArchivedCard(cardId).subscribe((card: Card) => {
                this.selectedCard = card;
                const options: NgbModalOptions = {
                    size: 'fullscreen'
                };
                this.computeFromEntity();
                this.modalRef = this.modalService.open(this.cardDetailTemplate, options);
            }
        );
    }

    private computeFromEntity()
    {
        if (this.selectedCard.publisherType === 'ENTITY' )  this.fromEntitySelectedCard = this.entitiesService.getEntityName(this.selectedCard.publisher);
        else this.fromEntitySelectedCard = null;
    }

    getFormattedPublishDate(): any {
        return this.timeService.formatDate(this.selectedCard.publishDate)
    }

    getFormattedPublishTime(): any {
        return this.timeService.formatTime(this.selectedCard.publishDate)
    }
    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
