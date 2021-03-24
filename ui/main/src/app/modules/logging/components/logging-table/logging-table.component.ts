/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * Copyright (c) 2020, RTEi (http://www.rte-international.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { LineOfLoggingResult } from '@ofModel/line-of-logging-result.model';
import { TimeService } from '@ofServices/time.service';
import { Moment } from 'moment-timezone';
import { CardService } from '@ofServices/card.service';
import { selectLoggingCount, selectLoggingFilter } from '@ofSelectors/logging.selectors';
import { Store, select } from '@ngrx/store';
import { Page } from '@ofModel/page.model';
import { AppState } from '@ofStore/index';
import { catchError, takeUntil } from 'rxjs/operators';
import { Observable, of, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ExportService } from '@ofServices/export.service';
import { FlushLoggingResult, UpdateLoggingPage } from '@ofStore/actions/logging.actions';
import { ConfigService } from '@ofServices/config.service';
import { LoggingComponent } from '../../logging.component';
import {ProcessesService} from "@ofServices/processes.service";


@Component({
    selector: 'of-logging-table',
    templateUrl: './logging-table.component.html',
    styleUrls: ['./logging-table.component.scss']
})
export class LoggingTableComponent implements OnInit, OnDestroy {

    @Input() results: LineOfLoggingResult[];
    @Input() processStateDescription: Map<string, string>;
    @Input() displayProcessGroupColumn: boolean;
    displayedResult: string;
    exportLoggingData: Array<any> ;
    page = 0;
    collectionSize$: Observable<number>;
    size: number;

    unsubscribe$: Subject<void> = new Subject<void>();


    constructor(public timeService: TimeService,
                private cardService: CardService,
                private store: Store<AppState>,
                private translate: TranslateService,
                private configService: ConfigService,
                private parentComponent: LoggingComponent,
                private processesService: ProcessesService) {
    }

    ngOnInit() {
        this.displayedResult = JSON.stringify(this.results);
        this.collectionSize$ = this.store.pipe(
            select(selectLoggingCount),
            catchError(err => of(0))
        );
        this.size = this.configService.getConfigValue('archive.filters.page.size', 10);

        this.store.select(selectLoggingFilter)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(filters => {
              const pageFilter = filters.get('page');
              // page on ngb-pagination component start at 1 , and page on backend start at 0
              if (pageFilter) {
                this.page = +pageFilter[0] + 1;
              }
            });

    }

    displayTime(moment: Moment) {
        return this.timeService.formatDateTime(moment);
    }

    initExportLoggingData(): void {
        this.exportLoggingData = [];

        let totalElements;
        this.store.pipe(select(selectLoggingCount)).subscribe((result) => {
            totalElements = result;
        });

        const filters = new Map<string, string[]>();
        filters.set('size', [totalElements]);

        this.cardService.fetchLoggingResults(filters).pipe(takeUntil(this.unsubscribe$))
            .subscribe((page: Page<LineOfLoggingResult>) => {
                const lines = page.content;

                const timeOfActionColumnName = this.translateColumn('logging.timeOfAction');
                const titleColumnName = this.translateColumn('logging.title');
                const summaryColumnName = this.translateColumn('logging.summary');
                const descriptionColumnName = this.translateColumn('logging.description');
                const senderColumnName = this.translateColumn('logging.sender');
                const processGroupColumnName = this.translateColumn('logging.processGroup');

                lines.forEach( (line: LineOfLoggingResult) => {
                    if (typeof line !== undefined) {
                        if (this.displayProcessGroupColumn)
                            this.exportLoggingData.push({
                                [timeOfActionColumnName]: this.timeService.formatDateTime(line.businessDate),
                                [titleColumnName]: this.translateColumn(line.i18nKeyForTitle.key, line.i18nKeyForTitle.parameters),
                                [summaryColumnName]: this.translateColumn(line.i18nKeyForSummary.key, line.i18nKeyForSummary.parameters),
                                [descriptionColumnName]: !!this.processStateDescription.get(line.process + '.' + line.state) ? this.translateColumn(this.processStateDescription.get(line.process + '.' + line.state)) : '',
                                [senderColumnName]: line.sender,
                                [processGroupColumnName]: this.translateColumn(this.processesService.findProcessGroupLabelForProcess(line.process))
                            });
                        else
                            this.exportLoggingData.push({
                                [timeOfActionColumnName]: this.timeService.formatDateTime(line.businessDate),
                                [titleColumnName]: this.translateColumn(line.i18nKeyForTitle.key, line.i18nKeyForTitle.parameters),
                                [summaryColumnName]: this.translateColumn(line.i18nKeyForSummary.key, line.i18nKeyForSummary.parameters),
                                [descriptionColumnName]: !!this.processStateDescription.get(line.process + '.' + line.state) ? this.translateColumn(this.processStateDescription.get(line.process + '.' + line.state)) : '',
                                [senderColumnName]: line.sender
                            });
                    }
                });
                ExportService.exportAsExcelFile(this.exportLoggingData, 'Logging');
            });
    }

    export(): void {
        this.initExportLoggingData();
    }

    translateColumn(key: string | Array<string>, interpolateParams?: Object): any {
        let translatedColumn: number;

        this.translate.get(key, interpolateParams)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((translate) => { translatedColumn = translate; });

        return translatedColumn;
    }


    updateResultPage(currentPage): void {

    // page on ngb-pagination component start at 1 , and page on backend start at 0
    this.store.dispatch(new UpdateLoggingPage({page: currentPage - 1}));
  }


    ngOnDestroy() {
        this.store.dispatch(new FlushLoggingResult());
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
