/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {AppState} from '@ofStore/index';
import {ProcessesService} from '@ofServices/processes.service';
import {Store} from '@ngrx/store';
import {takeUntil} from 'rxjs/operators';
import {FormControl, FormGroup} from '@angular/forms';
import {ConfigService} from '@ofServices/config.service';
import {TimeService} from '@ofServices/time.service';
import {NgbDateStruct, NgbModal, NgbModalOptions, NgbModalRef, NgbTimeStruct} from '@ng-bootstrap/ng-bootstrap';
import {DateTimeNgb} from '@ofModel/datetime-ngb.model';
import {CardService} from '@ofServices/card.service';
import {LightCard} from '@ofModel/light-card.model';
import {Page} from '@ofModel/page.model';
import {ExportService} from '@ofServices/export.service';
import {TranslateService} from '@ngx-translate/core';
import {Card} from '@ofModel/card.model';
import {buildSettingsOrConfigSelector} from '@ofStore/selectors/settings.x.config.selectors';

export enum FilterDateTypes {
    PUBLISH_DATE_FROM_PARAM = 'publishDateFrom',
    PUBLISH_DATE_TO_PARAM = 'publishDateTo',
    ACTIVE_FROM_PARAM = 'activeFrom',
    ACTIVE_TO_PARAM = 'activeTo'

}

export const checkElement = (enumeration: typeof FilterDateTypes, value: string): boolean => {
    let result = false;
    if (Object.values(enumeration).map(enumValue => enumValue.toString()).includes(value)) {
        result = true;
    }
    return result;
};

export const transformToTimestamp = (date: NgbDateStruct, time: NgbTimeStruct): string => {
    return new DateTimeNgb(date, time).formatDateTime();
};

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

    filters;
    results: LightCard[];
    currentPage = 0;
    resultsNumber: number = 0;
    hasResult = false;
    firstQueryHasBeenDone = false;

    // Filter values 
    processDropdownList = [];
    processDropdownSettings = {};
    tagsDropdownList = [];
    tagsDropdownSettings = {};

    // View card 
    modalRef: NgbModalRef;
    @ViewChild('cardDetail') cardDetailTemplate: ElementRef;
    selectedCard : Card; 

    constructor(private store: Store<AppState>,
        private processesService: ProcessesService,
        private configService: ConfigService,
        private timeService: TimeService,
        private cardService: CardService,
        private exportService: ExportService,
        private translate: TranslateService,
        private modalService: NgbModal
    ) {

        this.archiveForm = new FormGroup({
            tags: new FormControl([]),
            process: new FormControl([]),
            publishDateFrom: new FormControl(),
            publishDateTo: new FormControl(''),
            activeFrom: new FormControl(''),
            activeTo: new FormControl(''),
        });


    }

    ngOnInit() {
        this.tags = this.configService.getConfigValue('archive.filters.tags.list');
        this.size = this.configService.getConfigValue('archive.filters.page.size', 10);
        this.results = new Array();
        this.processesService.getAllProcesses().forEach((process) => {
            const id = process.id;
            let itemName = process.name;
            if (!itemName) {
                itemName = id;
            }
            this.processDropdownList.push({ id: id, itemName: itemName, i18nPrefix: `${process.id}.${process.version}` });
        });

        if (!!this.tags) {
            this.tags.forEach(tag => this.tagsDropdownList.push({ id: tag.value, itemName: tag.label }));
        }

        this.getLocale().pipe(takeUntil(this.unsubscribe$)).subscribe(locale => {
            this.translate.use(locale);
            this.translate.get(['archive.selectProcessText','archive.selectTagText'])
              .subscribe(translations => {
                this.processDropdownSettings = {
                    text: translations['archive.selectProcessText'],
                    badgeShowLimit: 3,
                    enableSearchFilter: true
                }
                this.tagsDropdownSettings = {
                    text: translations['archive.selectTagText'],
                    badgeShowLimit: 3,
                    enableSearchFilter: true
                };
              })
            });
    }

    protected getLocale(): Observable<string> {
        return this.store.select(buildSettingsOrConfigSelector('locale'));
    }
    
    /**
     * Transforms the filters list to Map
     */
    filtersToMap = (filters: any): Map<string, string[]> => {
        const params = new Map();
        Object.keys(filters).forEach(key => {
            const element = filters[key];
            // if the form element is date
            if (element) {
                if (checkElement(FilterDateTypes, key)) {
                    const { date, time } = element;
                    if (date) {
                        const timeStamp = this.timeService.toNgBTimestamp(transformToTimestamp(date, time));
                        if (timeStamp !== 'NaN') {
                            params.set(key, [timeStamp]);
                        }
                    }
                } else {
                    if (element.length) {
                        const ids = [];
                        element.forEach(val => ids.push(val.id));
                        params.set(key, ids);
                    }
                }
            }
        });
        return params;
    }

    resetForm() {
        this.archiveForm.reset();
        this.firstQueryHasBeenDone = false;
        this.hasResult = false;
        this.resultsNumber = 0;
    }


    sendQuery(page_number): void {
        const { value } = this.archiveForm;
        this.filters = this.filtersToMap(value);
        this.filters.set('size', [this.size.toString()]);
        this.filters.set('page', [page_number]);
        this.cardService.fetchArchivedCards(this.filters)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((page: Page<LightCard>) => {
                this.resultsNumber = page.totalElements;
                this.currentPage = page_number + 1; // page on ngb-pagination component start at 1 , and page on backend start at 0
                this.firstQueryHasBeenDone = true;
                if (page.content.length > 0) this.hasResult = true;
                else this.hasResult = false;
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

       
        this.filters.set('size', [this.resultsNumber.toString()]);
        this.filters.set('page', [0]);

        this.cardService.fetchArchivedCards(this.filters).pipe(takeUntil(this.unsubscribe$))
            .subscribe((page: Page<LightCard>) => {
                const lines = page.content;

                lines.forEach((card: LightCard) => {
                    if (typeof card !== undefined) {
                        // TO DO translation for old process should be done  , but loading local arrive to late , solution to find 
                        exportArchiveData.push({
                            severity: card.severity,
                            publishDate: this.timeService.formatDateTime(card.publishDate),
                            businessDate: this.displayTime(card.startDate) + '-' + this.displayTime(card.endDate),
                            title: this.translateColomn(card.process + '.' + card.processVersion + '.' + card.title.key, card.title.parameters),
                            summary: this.translateColomn(card.process + '.' + card.processVersion + '.' + card.summary.key, card.summary.parameters),
                        });
                    }
                });
                this.exportService.exportAsExcelFile(exportArchiveData, 'Archive');
            });
    }

    export(): void {
        this.initExportArchiveData();
    }

    translateColomn(key: string | Array<string>, interpolateParams?: Object): any {
        let translatedColomn: number;

        this.translate.get(key, interpolateParams)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((translate) => { translatedColomn = translate; });

        return translatedColomn;
    }


    openCard(cardId) {
        this.cardService.loadArchivedCard(cardId).subscribe((card: Card) => {
            this.selectedCard = card;
            const options: NgbModalOptions = {
                size: 'fullscreen'
            };
            this.modalRef = this.modalService.open(this.cardDetailTemplate, options);
        }
        );
    }

    getPublishDateTranslationParams(): any {
        const param = {
            'time': this.timeService.formatDateTime(this.selectedCard.publishDate)
        }
        return param;
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
