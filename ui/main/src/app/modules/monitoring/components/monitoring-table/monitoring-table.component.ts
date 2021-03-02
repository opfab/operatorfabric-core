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
import {ProcessesService} from "@ofServices/processes.service";

@Component({
    selector: 'of-monitoring-table',
    templateUrl: './monitoring-table.component.html',
    styleUrls: ['./monitoring-table.component.scss']
})
export class MonitoringTableComponent implements OnDestroy {

    @ViewChild('cardDetail') cardDetailTemplate: ElementRef;
    @Input() result: LineOfMonitoringResult[];
    @Input() displayProcessGroupColumn: boolean;
    exportMonitoringData: Array<any> = [];
    unsubscribe$: Subject<void> = new Subject<void>();
    modalRef: NgbModalRef;


    constructor(readonly timeService: TimeService
                , private translate: TranslateService
                , private store: Store<AppState>
                , private modalService: NgbModal
                , private processesService: ProcessesService
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

        const timeColumnName = this.translateColumn('monitoring.time');
        const businessPeriodColumnName = this.translateColumn('monitoring.businessPeriod');
        const processGroupColumnName = this.translateColumn('monitoring.filters.processGroup');
        const processColumnName = this.translateColumn('monitoring.filters.process');
        const titleColumnName = this.translateColumn('monitoring.title');
        const summaryColumnName = this.translateColumn('monitoring.summary');
        const typeOfStateColumnName = this.translateColumn('monitoring.typeOfState');
        const severityColumnName = this.translateColumn('monitoring.severity');

        this.result.forEach((line: LineOfMonitoringResult) => {
            if (typeof line !== undefined) {
                if (this.displayProcessGroupColumn)
                    this.exportMonitoringData.push({
                        [timeColumnName]: this.displayTime(line.creationDateTime),
                        [businessPeriodColumnName]: this.displayTime(line.beginningOfBusinessPeriod).concat(this.displayTime(line.endOfBusinessPeriod)),
                        [processGroupColumnName]: this.translateColumn(this.processesService.findProcessGroupLabelForProcess(line.processId)),
                        [processColumnName]: this.translateColumn(line.processName),
                        [titleColumnName]: this.translateColumn(line.title.key, line.title.parameters),
                        [summaryColumnName]: this.translateColumn(line.summary.key, line.summary.parameters),
                        [typeOfStateColumnName]: this.translateColumn('monitoring.filters.typeOfState.' + line.typeOfState),
                        [severityColumnName]: line.severity
                    });
                else
                    this.exportMonitoringData.push({
                        [timeColumnName]: this.displayTime(line.creationDateTime),
                        [businessPeriodColumnName]: this.displayTime(line.beginningOfBusinessPeriod).concat(this.displayTime(line.endOfBusinessPeriod)),
                        [processColumnName]: this.translateColumn(line.processName),
                        [titleColumnName]: this.translateColumn(line.title.key, line.title.parameters),
                        [summaryColumnName]: this.translateColumn(line.summary.key, line.summary.parameters),
                        [typeOfStateColumnName]: this.translateColumn('monitoring.filters.typeOfState.' + line.typeOfState),
                        [severityColumnName]: line.severity
                    });
            }
        });
    }

    export(): void {
        this.initExportMonitoringData();
        ExportService.exportAsExcelFile(this.exportMonitoringData, 'Monitoring');
    }

    translateColumn(key: string | Array<string>, interpolateParams?: Object): any {
        let translatedColumn: number;

        this.translate.get(key, interpolateParams)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((translate) => {
                translatedColumn = translate;
            });

        return translatedColumn;
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
