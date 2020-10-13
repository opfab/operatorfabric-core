/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
* Copyright (c) 2020, RTEi (http://www.rte-international.com)
* See AUTHORS.txt
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
* SPDX-License-Identifier: MPL-2.0
* This file is part of the OperatorFabric project.
*/

import {Component, Input, OnInit, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import { LineOfMonitoringResult } from '@ofModel/line-of-monitoring-result.model';
import { TimeService } from '@ofServices/time.service';
import { Moment } from 'moment-timezone';
import { TranslateService } from '@ngx-translate/core';
import { ExportService } from '@ofServices/export.service';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'of-monitoring-table',
    templateUrl: './monitoring-table.component.html',
    styleUrls: ['./monitoring-table.component.scss']
})
export class MonitoringTableComponent implements OnDestroy{

    @Input() result: LineOfMonitoringResult[];
    exportMonitoringData: Array<any> = [];
    unsubscribe$: Subject<void> = new Subject<void>();


    constructor(readonly timeService: TimeService, private translate: TranslateService, private exportService: ExportService) {
    }


    displayTime(moment: Moment) {

        if (!!moment) {
            return this.timeService.formatDateTime(moment);
        }
        return '';
    }

    initExportMonitoringData(): void {

        this.exportMonitoringData = [];
        let time: string, businessPeriod: string, processName: any, title: any, summary: any, status: any;

        this.result.forEach( (line: LineOfMonitoringResult) => {
            if (typeof line !== undefined) {
                time = this.displayTime(line.creationDateTime);
                businessPeriod = this.displayTime(line.beginningOfBusinessPeriod).concat(this.displayTime(line.endOfBusinessPeriod));
                processName = this.translateColomn(line.processName);
                title = this.translateColomn(line.title.key, line.title.parameters);
                summary = this.translateColomn(line.summary.key, line.summary.parameters);
                status = this.translateColomn(line.coordinationStatus);

                this.exportMonitoringData.push({
                    time: time,
                    businessPeriod: businessPeriod,
                    process: processName,
                    title: title,
                    summary: summary,
                    status: status
                });
            }
        });
    }

    export(): void {
        this.initExportMonitoringData();
        this.exportService.exportAsExcelFile(this.exportMonitoringData, 'Monitoring');
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
