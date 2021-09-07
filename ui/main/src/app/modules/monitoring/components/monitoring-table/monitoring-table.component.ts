/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
* Copyright (c) 2020, RTEi (http://www.rte-international.com)
* See AUTHORS.txt
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
* SPDX-License-Identifier: MPL-2.0
* This file is part of the OperatorFabric project.
*/

import {Component, ElementRef, Input, OnChanges, OnDestroy, ViewChild} from '@angular/core';
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
import {MonitoringConfig} from '@ofModel/monitoringConfig.model';
import {JsonToArray} from 'app/common/jsontoarray/json-to-array';
import {CardService} from '@ofServices/card.service';
import {Process} from '@ofModel/processes.model';
import {EntitiesService} from '@ofServices/entities.service';
import {DisplayContext} from '@ofModel/templateGateway.model';


@Component({
    selector: 'of-monitoring-table',
    templateUrl: './monitoring-table.component.html',
    styleUrls: ['./monitoring-table.component.scss']
})
export class MonitoringTableComponent implements OnChanges, OnDestroy {

    @ViewChild('cardDetail') cardDetailTemplate: ElementRef;
    @Input() result: LineOfMonitoringResult[];
    @Input() displayProcessGroupColumn: boolean;
    @Input() maxNbOfRowsToDisplay: number;

    displayContext = DisplayContext.REALTIME;

    exportMonitoringData: Array<any> = [];
    jsonToArray : JsonToArray;
    monitoringConfig: MonitoringConfig ; 
    unsubscribe$: Subject<void> = new Subject<void>();
    modalRef: NgbModalRef;
    displayedResults : LineOfMonitoringResult[];

    constructor(readonly timeService: TimeService
                , private translate: TranslateService
                , private store: Store<AppState>
                , private modalService: NgbModal
                , private processesService: ProcessesService
                , private cardService : CardService
                , private entitiesService: EntitiesService
    ) {
        this.monitoringConfig = processesService.getMonitoringConfig();
    }

    ngOnChanges(): void {
        this.displayedResults = this.result.length > this.maxNbOfRowsToDisplay ? this.result.slice(0, this.maxNbOfRowsToDisplay) : this.result;
    }

    displayTime(moment: Moment) {

        if (!!moment) {
            return this.timeService.formatDateTime(moment);
        }
        return '';
    }

    initStandardExportMonitoringData(): void {

        this.exportMonitoringData = [];

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
        // if monitoring has a specific configuration 
        if (this.monitoringConfig && this.monitoringConfig.export && this.monitoringConfig.export.fields ) {
            this.jsonToArray = new JsonToArray(this.monitoringConfig.export.fields);
            this.processMonitoringForExport(0);
        }
        // generic export 
        else {
            this.initStandardExportMonitoringData();
            ExportService.exportJsonToExcelFile(this.exportMonitoringData, 'Monitoring');
        }
    }

    processMonitoringForExport(lineNumber: number) {
        if (lineNumber === this.result.length) ExportService.exportArrayToExcelFile(this.jsonToArray.getJsonAsArray(), 'Monitoring');
        else {
            this.cardService.loadCard(this.result[lineNumber].cardId).subscribe( card => {
                this.jsonToArray.add(this.cardPreprocessingBeforeExport(card));
                this.processMonitoringForExport(++lineNumber);
            });
        }
    }

    cardPreprocessingBeforeExport(card: any): any {
        const prefix =  `${card.card.process}.${card.card.processVersion}`;
        card.card.processGroup = this.translateValue(this.processesService.findProcessGroupLabelForProcess(card.card.process));
        const process:Process = this.processesService.getProcess(card.card.process);
        if (!!process) {
                card.card.processName = this.translateValue(`${prefix}.${process.name}`);
                const state = process.states[card.card.state];
                if (!!state) card.card.typeOfState = this.translateValue('monitoring.filters.typeOfState.' + state.type);
        }
        card.card.title = this.translateValue(`${prefix}.${card.card.title.key}`, card.card.title.parameters);
        card.card.summary =  this.translateValue(`${prefix}.${card.card.summary.key}`, card.card.summary.parameters);

        card.childCards.forEach(childCard => {
            if (childCard.publisherType==="ENTITY") childCard.publisherName= this.entitiesService.getEntityName(childCard.publisher);
            else childCard.publisherName = childCard.publisher;
        });
        return card;
    }

    translateValue(key: string, interpolateParams?: Object): any {
        return this.translate.instant(key, interpolateParams); // we can use synchronous method as translation has already been load for UI before
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
        if (!!this.modalRef) {
            this.modalRef.close();
        }
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
