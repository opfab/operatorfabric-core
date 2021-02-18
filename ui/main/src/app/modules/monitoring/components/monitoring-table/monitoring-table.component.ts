/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
* Copyright (c) 2020, RTEi (http://www.rte-international.com)
* See AUTHORS.txt
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
* SPDX-License-Identifier: MPL-2.0
* This file is part of the OperatorFabric project.
*/

import {Component, ElementRef, Input, OnDestroy, ViewChild} from '@angular/core';
import {LineOfMonitoringResult} from '@ofModel/line-of-monitoring-result.model';
import {TimeService} from '@ofServices/time.service';
import {Moment} from 'moment-timezone';
import {TranslateService} from '@ngx-translate/core';
import {ExportService} from '@ofServices/export.service';

import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {SelectLightCard} from '@ofActions/light-card.actions';
import {LoadCard} from '@ofActions/card.actions';
import {NgbModal, NgbModalOptions, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';

@Component({
    selector: 'of-monitoring-table',
    templateUrl: './monitoring-table.component.html',
    styleUrls: ['./monitoring-table.component.scss']
})
export class MonitoringTableComponent implements OnDestroy {

    @ViewChild('cardDetail') cardDetailTemplate: ElementRef;
    @Input() result: LineOfMonitoringResult[];
    exportMonitoringData: Array<any> = [];
    unsubscribe$: Subject<void> = new Subject<void>();
    modalRef: NgbModalRef;


    constructor(readonly timeService: TimeService
                , private translate: TranslateService
                , private exportService: ExportService
                , private store: Store<AppState>
                , private modalService: NgbModal
    ) {
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

        const timeColumnName = this.translateColomn('monitoring.time');
        const businessPeriodColumnName = this.translateColomn('monitoring.businessPeriod');
        const processColumnName = this.translateColomn('monitoring.filters.process');
        const titleColumnName = this.translateColomn('monitoring.title');
        const summaryColumnName = this.translateColomn('monitoring.summary');
        const statusColumnName = this.translateColomn('monitoring.status');
        const severityColumnName = this.translateColomn('monitoring.severity');

        this.result.forEach((line: LineOfMonitoringResult) => {
            if (typeof line !== undefined) {
                time = this.displayTime(line.creationDateTime);
                businessPeriod = this.displayTime(line.beginningOfBusinessPeriod).concat(this.displayTime(line.endOfBusinessPeriod));
                processName = this.translateColomn(line.processName);
                title = this.translateColomn(line.title.key, line.title.parameters);
                summary = this.translateColomn(line.summary.key, line.summary.parameters);
                status = this.translateColomn(line.coordinationStatus);

                this.exportMonitoringData.push({
                    [timeColumnName]: time,
                    [businessPeriodColumnName]: businessPeriod,
                    [processColumnName]: processName,
                    [titleColumnName]: title,
                    [summaryColumnName]: summary,
                    [statusColumnName]: status,
                    [severityColumnName]: line.severity
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
            .subscribe((translate) => {
                translatedColomn = translate;
            });

        return translatedColomn;
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    selectCard(info) {
        this.store.dispatch(new SelectLightCard({ selectedCardId: info }));
        this.store.dispatch(new LoadCard({ id: info }));
        const options: NgbModalOptions = {
            size: 'fullscreen'
        };
        this.modalRef = this.modalService.open(this.cardDetailTemplate, options);

    }

}
