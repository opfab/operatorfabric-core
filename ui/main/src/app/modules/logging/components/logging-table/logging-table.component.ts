/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
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
import { CardService } from '../../../../services/card.service';
import { selectLoggingCount } from '@ofSelectors/logging.selectors';
import { Store, select } from '@ngrx/store';
import { Page } from '@ofModel/page.model';
import { AppState } from '@ofStore/index';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ExportService } from '@ofServices/export.service';


@Component({
    selector: 'of-logging-table',
    templateUrl: './logging-table.component.html',
    styleUrls: ['./logging-table.component.scss']
})
export class LoggingTableComponent implements OnInit, OnDestroy {


    @Input() results: LineOfLoggingResult[];
    displayedResult: string;
    exportLoggingData: Array<any> ;
    unsubscribe$: Subject<void> = new Subject<void>();


    constructor(public timeService: TimeService, private cardService: CardService,
        private store: Store<AppState>, private translate: TranslateService, private exportService: ExportService) {
    }



    ngOnInit() {
        this.displayedResult = JSON.stringify(this.results);

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

                lines.forEach( (line: LineOfLoggingResult) => {
                    if (typeof line !== undefined) {
                        this.exportLoggingData.push({
                            timeOfAction: this.timeService.formatDateTime(line.businessDate),
                            processName: this.translateColomn(line.i18nKeyForProcessName.key, line.i18nKeyForProcessName.parameters),
                            description: this.translateColomn(line.i18nKeyForDescription.key, line.i18nKeyForDescription.parameters),
                            sender: line.sender
                        });
                    }
                });
                this.exportService.exportAsExcelFile(this.exportLoggingData, 'Logging');
            });
    }

    export(): void {
        this.initExportLoggingData();
    }

    translateColomn(key: string | Array<string>, interpolateParams?: Object): any {
        let translatedColomn: number;

        this.translate.get(key, interpolateParams)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((translate) => { translatedColomn = translate; });

        return translatedColomn;
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
