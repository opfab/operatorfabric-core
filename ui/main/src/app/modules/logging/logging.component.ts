/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';

import {ProcessesService} from '@ofServices/processes.service';
import {takeUntil} from 'rxjs/operators';
import {FormControl, FormGroup} from '@angular/forms';
import {ConfigService} from '@ofServices/config.service';
import {TimeService} from '@ofServices/time.service';
import {CardService} from '@ofServices/card.service';
import {LightCard} from '@ofModel/light-card.model';
import {Page} from '@ofModel/page.model';
import {ExportService} from '@ofServices/export.service';
import {TranslateService} from '@ngx-translate/core';
import {ArchivesLoggingFiltersComponent} from '../share/archives-logging-filters/archives-logging-filters.component';
import {EntitiesService } from '@ofServices/entities.service';
import {Utilities} from 'app/common/utilities';


@Component({
    selector: 'of-logging',
    templateUrl: './logging.component.html',
    styleUrls: ['./logging.component.scss']
})
export class LoggingComponent implements OnDestroy, OnInit {

    unsubscribe$: Subject<void> = new Subject<void>();

    tags: any[];
    size: number;
    loggingForm: FormGroup;

    results: LightCard[];
    currentPage = 0;
    resultsNumber = 0;
    hasResult = false;
    firstQueryHasBeenDone = false;

    processStateDescription = new Map();
    processNames = new Map();
    stateColors = new Map();

    @ViewChild('filters') filtersTemplate: ArchivesLoggingFiltersComponent;
    listOfProcessesForFilter = [];
    listOfProcessesForRequest = []; 

    constructor(
                private processesService: ProcessesService,
                private configService: ConfigService,
                private timeService: TimeService,
                private cardService: CardService,
                private translate: TranslateService,
                private entitiesService: EntitiesService
    ) {

        this.loggingForm = new FormGroup({
            tags: new FormControl([]),
            state: new FormControl([]),
            process: new FormControl([]),
            processGroup: new FormControl([]),
            publishDateFrom: new FormControl(),
            publishDateTo: new FormControl(''),
            activeFrom: new FormControl(''),
            activeTo: new FormControl(''),
        });

        processesService.getAllProcesses().forEach((process) => {
            if (!!process.uiVisibility && !!process.uiVisibility.logging) {
                let itemName = process.name;
                if (!itemName)
                    itemName = process.id;
                this.processNames.set(process.id, `${process.id}.${process.version}.${itemName}`);
                for (const key in process.states) {
                    this.processStateDescription.set(process.id + '.' + key,
                        Utilities.getI18nPrefixFromProcess(process) + process.states[key].description);
                    this.stateColors.set(process.id + '.' + key, process.states[key].color);
                }

                this.listOfProcessesForRequest.push(process.id);
                this.listOfProcessesForFilter.push({
                    id: process.id,
                    itemName: itemName,
                    i18nPrefix: `${process.id}.${process.version}`
                });
            }
        });
    }

    ngOnInit() {
        this.size = this.configService.getConfigValue('logging.filters.page.size', 10);
        this.results = [];
    }

    resetForm() {
        this.loggingForm.reset();
        this.firstQueryHasBeenDone = false;
        this.hasResult = false;
        this.resultsNumber = 0;
    }

    sendQuery(page_number): void {
        const { value } = this.loggingForm;
        this.filtersTemplate.filtersToMap(value);
        this.filtersTemplate.filters.set('size', [this.size.toString()]);
        this.filtersTemplate.filters.set('page', [page_number]);
        this.filtersTemplate.filters.set('childCards', ['true']);
        // if no process selected , set the filter to the list of process that shall be visible on the UI 
        if (this.listOfProcessesForRequest.length && !this.filtersTemplate.filters.has('process')) this.filtersTemplate.filters.set('process', this.listOfProcessesForRequest);
        this.cardService.fetchArchivedCards(this.filtersTemplate.filters)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((page: Page<any>) => {
                this.resultsNumber = page.totalElements;
                this.currentPage = page_number + 1; // page on ngb-pagination component start at 1 , and page on backend start at 0
                this.firstQueryHasBeenDone = true;
                this.hasResult = page.content.length > 0;
                page.content.forEach(card => {
                    this.cardPostProcessing(card);
                });
                this.results = page.content;
            });
    }

    cardPostProcessing(card) {
        this.loadTranslationForCardIfNeeded(card);
        const isThirdPartyPublisher = card.publisherType === 'EXTERNAL';
        const sender = (isThirdPartyPublisher) ? card.publisher : this.entitiesService.getEntityName(card.publisher);

        let representative = '';
        if (!!card.representativeType && !!card.representative) {
            const isThirdPartyRepresentative = card.representativeType === 'EXTERNAL';
            representative = (isThirdPartyRepresentative) ? card.representative : this.entitiesService.getEntityName(card.representative);
        }
        card.sender = sender;
        card.representative = representative;

        card.processName=  this.processNames.get(card.process);
        card.stateColor = this.stateColors.get(card.process + '.' + card.state);
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

    exportToExcel(): void {
        const exportArchiveData = [];

        this.filtersTemplate.filters.set('size', [this.resultsNumber.toString()]);
        this.filtersTemplate.filters.set('page', [0]);

        this.cardService.fetchArchivedCards(this.filtersTemplate.filters).pipe(takeUntil(this.unsubscribe$))
            .subscribe((page: Page<LightCard>) => {
                const lines = page.content;

                const severityColumnName = this.translateColumn('logging.result.severity');
                const timeOfActionColumnName = this.translateColumn('logging.result.timeOfAction');
                const processGroupColumnName = this.translateColumn('logging.result.processGroup');
                const processColumnName = this.translateColumn('logging.result.process');
                const titleColumnName = this.translateColumn('logging.result.title');
                const summaryColumnName = this.translateColumn('logging.result.summary');
                const descriptionColumnName = this.translateColumn('logging.result.description');
                const senderColumnName = this.translateColumn('logging.result.sender');
                const representativeColumnName = this.translateColumn('logging.result.representative');
               

                lines.forEach((card:any) => {
                        this.cardPostProcessing(card);
                        // TO DO translation for old process should be done  , but loading local arrive to late , solution to find
                        if (this.filtersTemplate.displayProcessGroupFilter())
                            exportArchiveData.push({
                                [severityColumnName]: card.severity,
                                [timeOfActionColumnName]: this.timeService.formatDateTime(card.publishDate),
                                [processGroupColumnName]: this.translateColumn(this.processesService.findProcessGroupLabelForProcess(card.process)),
                                [processColumnName]:  this.translateColumn(card.processName),
                                [titleColumnName]: this.translateColumn(card.process + '.' + card.processVersion + '.' + card.title.key, card.title.parameters),
                                [summaryColumnName]: this.translateColumn(card.process + '.' + card.processVersion + '.' + card.summary.key, card.summary.parameters),
                                [descriptionColumnName]:  this.translateColumn(this.processStateDescription.get(card.process + '.' + card.state)),
                                [senderColumnName]:  this.translateColumn(card.sender),
                                [representativeColumnName]:  this.translateColumn(card.representative)
                            });
                        else
                            exportArchiveData.push({
                                [severityColumnName]: card.severity,
                                [timeOfActionColumnName]: this.timeService.formatDateTime(card.publishDate),
                                [processColumnName]: this.translateColumn(card.processName),
                                [titleColumnName]: this.translateColumn(card.process + '.' + card.processVersion + '.' + card.title.key, card.title.parameters),
                                [summaryColumnName]: this.translateColumn(card.process + '.' + card.processVersion + '.' + card.summary.key, card.summary.parameters),
                                [descriptionColumnName]:  this.translateColumn(this.processStateDescription.get(card.process + '.' + card.state)),
                                [senderColumnName]:  this.translateColumn(card.sender),
                                [representativeColumnName]:  this.translateColumn(card.representative)
                            });
                });
                ExportService.exportJsonToExcelFile(exportArchiveData, 'Archive');
            });
    }

    translateColumn(key: string | Array<string>, interpolateParams?: Object): any {
        if (!key) return '';
        let translatedColumn: number;

        this.translate.get(key, interpolateParams)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((translate) => { translatedColumn = translate; });

        return translatedColumn;
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
