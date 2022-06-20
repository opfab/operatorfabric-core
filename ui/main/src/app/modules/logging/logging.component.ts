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

import {ProcessesService} from '@ofServices/processes.service';
import {takeUntil} from 'rxjs/operators';
import {AbstractControl, FormControl, FormGroup} from '@angular/forms';
import {ConfigService} from '@ofServices/config.service';
import {TimeService} from '@ofServices/time.service';
import {CardService} from '@ofServices/card.service';
import {LightCard} from '@ofModel/light-card.model';
import {Page} from '@ofModel/page.model';
import {ExportService} from '@ofServices/export.service';
import {TranslateService} from '@ngx-translate/core';
import {ArchivesLoggingFiltersComponent} from '../share/archives-logging-filters/archives-logging-filters.component';
import {EntitiesService} from '@ofServices/entities.service';
import {MessageLevel} from '@ofModel/message.model';
import {AlertMessageAction} from '@ofStore/actions/alert.actions';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {DateTimeNgb} from '@ofModel/datetime-ngb.model';
import {Utilities} from 'app/common/utilities';
import {NgbModal, NgbModalOptions, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';



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
    loadingInProgress: boolean = false;
    loadingIsTakingMoreThanOneSecond: boolean = false;
    technicalError = false;

    processStateDescription = new Map();
    processStateName = new Map();
    processNames = new Map();
    stateColors = new Map();

    @ViewChild('filters') filtersTemplate: ArchivesLoggingFiltersComponent;

    modalRef: NgbModalRef;
    @ViewChild('exportInProgress') exportTemplate: ElementRef;

    listOfProcessesForFilter = [];
    listOfProcessesForRequest = [];

    isThereProcessStateToDisplay: boolean;

    constructor(private store: Store<AppState>,
        private processesService: ProcessesService,
        private configService: ConfigService,
        private timeService: TimeService,
        private cardService: CardService,
        private translate: TranslateService,
        private entitiesService: EntitiesService,
        private modalService: NgbModal
    ) {
        this.loggingForm = new FormGroup({
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
            if (!!process.uiVisibility && !!process.uiVisibility.logging) {
                let itemName = !!process.name ? process.name : process.id;
                this.processNames.set(process.id, itemName);
                for (const key in process.states) {
                    this.processStateDescription.set(process.id + '.' + key, process.states[key].description);
                    this.processStateName.set(process.id + '.' + key, process.states[key].name);
                    this.stateColors.set(process.id + '.' + key, process.states[key].color);
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
        this.size = this.configService.getConfigValue('logging.filters.page.size', 10);
        this.tags = this.configService.getConfigValue('logging.filters.tags.list');

        this.results = [];

        this.isThereProcessStateToDisplay = this.processesService.getStatesListPerProcess(false).size > 0;
    }

    resetForm() {
        this.loggingForm.reset();
        this.firstQueryHasBeenDone = false;
        this.hasResult = false;
        this.resultsNumber = 0;
    }

    private displayMessage(i18nKey: string, msg: string, severity: MessageLevel = MessageLevel.ERROR) {
        this.store.dispatch(
            new AlertMessageAction({alertMessage: {message: msg, level: severity, i18n: {key: i18nKey}}})
        );
    }

    sendQuery(page_number): void {
        this.technicalError = false;
        const publishStart = this.extractTime(this.loggingForm.get('publishDateFrom'));
        const publishEnd = this.extractTime(this.loggingForm.get('publishDateTo'));

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

        const activeStart = this.extractTime(this.loggingForm.get('activeFrom'));
        const activeEnd = this.extractTime(this.loggingForm.get('activeTo'));

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
        this.checkIfLoadingIsTakingMoreThanOneSecond();

        const {value} = this.loggingForm;
        this.filtersTemplate.transformFiltersListToMap(value);
        this.filtersTemplate.filters.set('size', [this.size.toString()]);
        this.filtersTemplate.filters.set('page', [page_number]);
        this.filtersTemplate.filters.set('childCards', ['true']);
        // if no process selected , set the filter to the list of process that shall be visible on the UI
        if (this.listOfProcessesForRequest.length && !this.filtersTemplate.filters.has('process'))
            this.filtersTemplate.filters.set('process', this.listOfProcessesForRequest);
        this.cardService
            .fetchArchivedCards(this.filtersTemplate.filters)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
                next: (page: Page<any>) => {
                    this.loadingInProgress = false;
                    this.loadingIsTakingMoreThanOneSecond = false;

                    this.resultsNumber = page.totalElements;
                    this.currentPage = page_number + 1; // page on ngb-pagination component start at 1 , and page on backend start at 0
                    this.firstQueryHasBeenDone = true;
                    this.hasResult = page.content.length > 0;
                    page.content.forEach((card) => {
                        this.cardPostProcessing(card);
                    });
                    this.results = page.content;
                },
                error: () => {
                    this.firstQueryHasBeenDone = false;
                    this.loadingInProgress = false;
                    this.technicalError = true;
                }
            });
    }

    private checkIfLoadingIsTakingMoreThanOneSecond() {
        setTimeout(() => {
            this.loadingIsTakingMoreThanOneSecond = this.loadingInProgress;
        }, 1000);
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

    cardPostProcessing(card) {
        const isThirdPartyPublisher = card.publisherType === 'EXTERNAL';
        const sender = isThirdPartyPublisher ? card.publisher : this.entitiesService.getEntityName(card.publisher);

        let representative = '';
        if (!!card.representativeType && !!card.representative) {
            const isThirdPartyRepresentative = card.representativeType === 'EXTERNAL';
            representative = isThirdPartyRepresentative
                ? card.representative
                : this.entitiesService.getEntityName(card.representative);
        }
        card.sender = sender;
        card.representative = representative;

        card.processName = this.processNames.get(card.process);
        card.stateColor = this.stateColors.get(card.process + '.' + card.state);
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

        const modalOptions: NgbModalOptions = {
            centered: true,
            backdrop: 'static', // Modal shouldn't close even if we click outside it
            size: 'sm'
          };
        this.modalRef = this.modalService.open(this.exportTemplate, modalOptions);

        this.cardService
            .fetchArchivedCards(this.filtersTemplate.filters)
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
                    // TO DO translation for old process should be done  , but loading local arrive to late , solution to find
                    if (this.filtersTemplate.displayProcessGroupFilter())
                        exportArchiveData.push({
                            [severityColumnName]: Utilities.translateSeverity(this.translate, card.severity),
                            [timeOfActionColumnName]: this.timeService.formatDateTime(card.publishDate),
                            [processGroupColumnName]: this.translateColumn(
                                this.processesService.findProcessGroupLabelForProcess(card.process)
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
                            [timeOfActionColumnName]: this.timeService.formatDateTime(card.publishDate),
                            [processColumnName]: card.processName,
                            [titleColumnName]: card.titleTranslated,
                            [summaryColumnName]: card.summaryTranslated,
                            [stateColumnName]: this.processStateName.get(card.process + '.' + card.state),
                            [descriptionColumnName]: this.processStateDescription.get(card.process + '.' + card.state),
                            [senderColumnName]: this.translateColumn(card.sender),
                            [representativeColumnName]: this.translateColumn(card.representative)
                        });
                });
                ExportService.exportJsonToExcelFile(exportArchiveData, 'Logging');
                this.modalRef.close();
            });
    }

    translateColumn(key: string | Array<string>, interpolateParams?: Object): any {
        if (!key) return '';
        let translatedColumn: number;

        this.translate
            .get(key, interpolateParams)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((translate) => {
                translatedColumn = translate;
            });

        return translatedColumn;
    }

    ngOnDestroy() {
        if (!!this.modalRef) {
            this.modalRef.close();
        }
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
