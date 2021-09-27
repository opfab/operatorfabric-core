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
import {Observable, Subject} from 'rxjs';
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
import {ColDef, GridOptions} from "ag-grid-community";

@Component({
    selector: 'of-monitoring-table',
    templateUrl: './monitoring-table.component.html',
    styleUrls: ['./monitoring-table.component.scss']
})
export class MonitoringTableComponent implements OnChanges, OnDestroy {

    @ViewChild('cardDetail') cardDetailTemplate: ElementRef;
    @ViewChild('exportInProgress') exportInProgressTemplate: ElementRef;
    @Input() result: LineOfMonitoringResult[];
    @Input() displayProcessGroupColumn: boolean;


    displayContext = DisplayContext.REALTIME;

    exportMonitoringData: Array<any> = [];
    jsonToArray : JsonToArray;
    monitoringConfig: MonitoringConfig ; 
    unsubscribe$: Subject<void> = new Subject<void>();
    modalRef: NgbModalRef;
    exportModalRef: NgbModalRef;
    displayedResults : LineOfMonitoringResult[];
    exportInProgress: boolean = false;
    exportCancelled: boolean = false;
    exportProgress: number;

    // ag-grid configuration objects
    gridOptions;
    public gridApi;
    public page: number = 1;
    private columnDefs: ColDef[] = [];
    private rowData = [];
    rowData$: Observable<any>;
    private rowDataSubject = new Subject();
    private firstNgOnChange = true;

    private readonly timeColumnName;
    private readonly processGroupColumnName;
    private readonly processColumnName;
    private readonly titleColumnName;
    private readonly summaryColumnName;
    private readonly typeOfStateColumnName;
    private readonly businessPeriodColumnName;
    private readonly severityColumnName;

    private mapSeverity = new Map([
        ["alarm", 1],
        ["action", 2],
        ["compliant", 3],
        ["information", 4]
    ]);

    constructor(readonly timeService: TimeService
                , private translate: TranslateService
                , private store: Store<AppState>
                , private modalService: NgbModal
                , private processesService: ProcessesService
                , private cardService : CardService
                , private entitiesService: EntitiesService
    ) {
        this.monitoringConfig = processesService.getMonitoringConfig();

        this.timeColumnName = this.translateColumn('monitoring.time');
        this.processGroupColumnName = this.translateColumn('monitoring.filters.processGroup');
        this.processColumnName = this.translateColumn('monitoring.filters.process');
        this.titleColumnName = this.translateColumn('monitoring.title');
        this.summaryColumnName = this.translateColumn('monitoring.summary');
        this.typeOfStateColumnName = this.translateColumn('monitoring.typeOfState');
        this.businessPeriodColumnName = this.translateColumn('monitoring.businessPeriod');
        this.severityColumnName = this.translateColumn('monitoring.severity');

        this.gridOptions = <GridOptions>{
            context: {
                componentParent: this
            },
            frameworkComponents : {},
            domLayout: 'autoHeight',
            defaultColDef : {
                editable: false
            },
            columnTypes: {
                'dataColumn': {
                    sortable: true,
                    filter: true,
                    wrapText: false,
                    autoHeight: false,
                    flex: 1,
                },
                'severityColumn': {
                    sortable: true,
                    filter: false,
                    wrapText: false,
                    autoHeight: false,
                    maxWidth: 18
                }
            },
            pagination : true,
            suppressCellSelection: true,
            headerHeight: 70,
            suppressPaginationPanel: true,
            suppressHorizontalScroll: true,
            columnDefs: this.columnDefs,
            rowHeight: 45  
        };
        this.rowData$ = this.rowDataSubject.asObservable();
    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.gridApi.paginationSetPageSize(10);

        const severityCellClassRules = {
            "opfab-sev-alarm": field => field.value === 1,
            "opfab-sev-action": field => field.value === 2,
            "opfab-sev-compliant": field => field.value === 3,
            "opfab-sev-information": field => field.value === 4
        };
        const typeOfStateCellClassRules = {
            "opfab-typeOfState-INPROGRESS": parameters => parameters.data.typeOfState === 'INPROGRESS',
            "opfab-typeOfState-FINISHED": parameters => parameters.data.typeOfState === 'FINISHED',
            "opfab-typeOfState-CANCELED": parameters => parameters.data.typeOfState === 'CANCELED'
        };

        this.columnDefs = [{ type: 'severityColumn', headerName: '', field: 'severityNumber', headerClass: 'header-with-no-padding' , cellClassRules: severityCellClassRules },
                           { type: 'dataColumn', headerName: this.timeColumnName, field: 'time' }];

        if (this.displayProcessGroupColumn)
            this.columnDefs.push({ type: 'dataColumn', headerName: this.processGroupColumnName, field: 'service' });

        this.columnDefs.push({ type: 'dataColumn', headerName: this.processColumnName, field: 'process' },
                             { type: 'dataColumn', headerName: this.titleColumnName, field: 'title' },
                             { type: 'dataColumn', headerName: this.summaryColumnName, field: 'summary' },
                             { type: 'dataColumn', headerName: this.typeOfStateColumnName, field: 'processStatus',
                                 cellClassRules: typeOfStateCellClassRules });

        this.gridApi.setColumnDefs(this.columnDefs);
        this.refreshData();
    }

    updateResultPage(currentPage): void {
        this.gridApi.paginationGoToPage(currentPage-1);
        this.page = currentPage;
      }
    

    ngOnChanges(): void {
        if (!this.firstNgOnChange) this.refreshData(); //to avoid double refresh at startup of the page , important when there is a lot of card to show 
        this.firstNgOnChange = false;
    }

    refreshData(): void {

        this.displayedResults = this.result;
        this.rowData = [];
        this.displayedResults.forEach(line => {
            if (this.displayProcessGroupColumn)
                this.rowData.push({ severityNumber: this.mapSeverity.get(line.severity),
                                    time: this.displayTime(line.creationDateTime),
                                    service: this.translateValue(this.processesService.findProcessGroupLabelForProcess(line.processId)),
                                    process: this.translateValue(line.processName),
                                    title: this.translateValue(line.title.key, line.title.parameters),
                                    summary: this.translateValue(line.summary.key, line.summary.parameters),
                                    processStatus: this.translateValue('monitoring.filters.typeOfState.' + line.typeOfState),
                                    typeOfState: line.typeOfState,
                                    cardId: line.cardId,
                                    severity: line.severity,
                                    beginningOfBusinessPeriod: line.beginningOfBusinessPeriod,
                                    endOfBusinessPeriod: line.endOfBusinessPeriod });
            else
                this.rowData.push({ severityNumber: this.mapSeverity.get(line.severity),
                                    time: this.displayTime(line.creationDateTime),
                                    process: this.translateValue(line.processName),
                                    title: this.translateValue(line.title.key, line.title.parameters),
                                    summary: this.translateValue(line.summary.key, line.summary.parameters),
                                    processStatus: this.translateValue('monitoring.filters.typeOfState.' + line.typeOfState),
                                    typeOfState: line.typeOfState,
                                    cardId: line.cardId,
                                    severity: line.severity,
                                    beginningOfBusinessPeriod: line.beginningOfBusinessPeriod,
                                    endOfBusinessPeriod: line.endOfBusinessPeriod });

        });
        this.rowDataSubject.next(this.rowData);
    }

    displayTime(moment: Moment) {

        if (!!moment) {
            return this.timeService.formatDateTime(moment);
        }
        return '';
    }

    initStandardExportMonitoringData(): void {

        this.exportMonitoringData = [];

        this.gridApi.rowModel.rowsToDisplay.forEach((line) => {
            if (typeof line !== undefined) {
                if (this.displayProcessGroupColumn)
                    this.exportMonitoringData.push({
                        [this.timeColumnName]: line.data.time,
                        [this.businessPeriodColumnName]: this.displayTime(line.data.beginningOfBusinessPeriod).concat(this.displayTime(line.data.endOfBusinessPeriod)),
                        [this.processGroupColumnName]: line.data.service,
                        [this.processColumnName]: line.data.process,
                        [this.titleColumnName]: line.data.title,
                        [this.summaryColumnName]: line.data.summary,
                        [this.typeOfStateColumnName]: line.data.processStatus,
                        [this.severityColumnName]: line.data.severity
                    });
                else
                    this.exportMonitoringData.push({
                        [this.timeColumnName]: line.data.time,
                        [this.businessPeriodColumnName]: this.displayTime(line.data.beginningOfBusinessPeriod).concat(this.displayTime(line.data.endOfBusinessPeriod)),
                        [this.processColumnName]: line.data.process,
                        [this.titleColumnName]: line.data.title,
                        [this.summaryColumnName]: line.data.summary,
                        [this.typeOfStateColumnName]: line.data.processStatus,
                        [this.severityColumnName]: line.data.severity
                    });
            }
        });
    }

    export(): void {
        this.exportCancelled = false;
        // if monitoring has a specific configuration
        if (this.monitoringConfig && this.monitoringConfig.export && this.monitoringConfig.export.fields ) {
            this.jsonToArray = new JsonToArray(this.monitoringConfig.export.fields);
            const modalOptions: NgbModalOptions = {
                centered: true,
                backdrop: 'static', // Modal shouldn't close even if we click outside it
                size: 'sm'
              };

            this.exportModalRef = this.modalService.open(this.exportInProgressTemplate, modalOptions);
            this.exportProgress = 0;
            this.processMonitoringForExport(0);

        }
        // generic export 
        else {
            this.initStandardExportMonitoringData();
            ExportService.exportJsonToExcelFile(this.exportMonitoringData, 'Monitoring');
        }
    }

    cancelExport() {
        this.exportCancelled = true;
    }

    processMonitoringForExport(lineNumber: number) {

        if (!this.exportCancelled) {
            // round by ten to slow progressbar updates
            this.exportProgress = 10 * Math.round(lineNumber / 10);

            if (lineNumber === this.result.length) {
                ExportService.exportArrayToExcelFile(this.jsonToArray.getJsonAsArray(), 'Monitoring');
                this.exportInProgress = false;
            } else {
                this.exportInProgress = true;
                this.cardService.loadCard(this.gridApi.rowModel.rowsToDisplay[lineNumber].data.cardId).subscribe( card => {
                    this.jsonToArray.add(this.cardPreprocessingBeforeExport(card));
                    this.processMonitoringForExport(++lineNumber);
                });
            }
        } else {
            this.exportInProgress = false;
        }

        if (!this.exportInProgress)
            this.exportModalRef.close();
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
        if (!!this.exportModalRef) {
            this.exportModalRef.close();
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
