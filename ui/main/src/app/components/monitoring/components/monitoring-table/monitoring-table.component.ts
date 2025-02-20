/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * Copyright (c) 2020, RTEi (http://www.rte-international.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, ElementRef, Input, OnChanges, OnDestroy, ViewChild} from '@angular/core';
import {LineOfMonitoringResult} from 'app/components/monitoring/model/LineOfMonitoringResult';
import {ExcelExport} from '../../../../utils/excel-export';
import {Observable, Subject} from 'rxjs';
import {NgbModal, NgbModalOptions, NgbModalRef, NgbPagination, NgbProgressbar} from '@ng-bootstrap/ng-bootstrap';
import {ProcessesService} from '@ofServices/processes/ProcessesService';
import {MonitoringConfig} from '@ofServices/config/model/MonitoringConfig';
import {JsonToArray} from '../../../../utils/jsontoarray/json-to-array';
import {Process} from '@ofServices/processes/model/Processes';
import {EntitiesService} from '@ofServices/entities/EntitiesService';
import {ColDef, GridOptions, AllCommunityModule, ModuleRegistry, provideGlobalGridOptions} from 'ag-grid-community';
import {AnswerCellRendererComponent} from '../cell-renderers/answer-cell-renderer.component';
import {ResponsesCellRendererComponent} from '../cell-renderers/responses-cell-renderer.component';
import {Card} from 'app/model/Card';
import {DateTimeFormatterService} from 'app/services/dateTimeFormatter/DateTimeFormatterService';
import {SelectedCardService} from '@ofServices/selectedCard/SelectedCardService';
import {CardsService} from '@ofServices/cards/CardsService';
import {ConfigService} from 'app/services/config/ConfigService';
import {OpfabStore} from '../../../../store/opfabStore';
import {AgGridAngular} from 'ag-grid-angular';
import {NgIf, AsyncPipe} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {CardComponent} from '../../../card/card.component';
import {TranslationService} from '@ofServices/translation/TranslationService';
import {Utilities} from '../../../../utils/utilities';
import {AgGrid} from '../../../../utils/AgGrid';

@Component({
    selector: 'of-monitoring-table',
    templateUrl: './monitoring-table.component.html',
    styleUrls: ['./monitoring-table.component.scss'],
    standalone: true,
    imports: [AgGridAngular, NgIf, TranslateModule, NgbPagination, CardComponent, NgbProgressbar, AsyncPipe]
})
export class MonitoringTableComponent implements OnChanges, OnDestroy {
    @ViewChild('cardDetail') cardDetailTemplate: ElementRef;
    @ViewChild('exportInProgress') exportInProgressTemplate: ElementRef;
    @Input() result: LineOfMonitoringResult[];

    exportMonitoringData: Array<any> = [];
    jsonToArray: JsonToArray;
    monitoringConfig: MonitoringConfig;
    unsubscribe$: Subject<void> = new Subject<void>();
    modalRef: NgbModalRef;
    exportModalRef: NgbModalRef;
    displayedResults: LineOfMonitoringResult[];
    exportInProgress = false;
    exportCancelled = false;
    exportProgress: number;

    // ag-grid configuration objects
    gridOptions;
    public gridApi;
    public page = 1;
    private columnDefs: ColDef[] = [];
    private rowData = [];
    rowData$: Observable<any>;
    private readonly rowDataSubject = new Subject();
    private firstNgOnChange = true;

    private readonly timeColumnName;
    private readonly titleColumnName;
    private readonly summaryColumnName;
    private readonly typeOfStateColumnName;
    private readonly businessPeriodColumnName;
    private readonly severityColumnName;
    private readonly answerColumnName;
    private readonly emitterColumnName;
    private readonly entitiesResponsesColumnName;
    private readonly requiredResponsesColumnName;

    private readonly mapSeverity = new Map([
        ['alarm', 1],
        ['action', 2],
        ['compliant', 3],
        ['information', 4]
    ]);

    constructor(private readonly modalService: NgbModal) {
        ModuleRegistry.registerModules([AllCommunityModule]);
        provideGlobalGridOptions({theme: 'legacy'});

        this.monitoringConfig = ConfigService.getMonitoringConfig();

        this.timeColumnName = this.translateColumn('shared.result.time');
        this.titleColumnName = this.translateColumn('shared.result.title');
        this.summaryColumnName = this.translateColumn('shared.result.summary');
        this.typeOfStateColumnName = this.translateColumn('shared.typeOfState.typeOfState');
        this.businessPeriodColumnName = this.translateColumn('shared.result.businessPeriod');
        this.severityColumnName = this.translateColumn('shared.result.severity');
        this.answerColumnName = this.translateColumn('shared.result.answer');
        this.emitterColumnName = this.translateColumn('shared.result.emitter');
        this.entitiesResponsesColumnName = this.translateColumn('shared.result.entitiesResponses');
        this.requiredResponsesColumnName = this.translateColumn('shared.result.requiredResponses');

        this.gridOptions = <GridOptions>{
            ...AgGrid.getDefaultGridOptions(),
            context: {
                componentParent: this
            },
            components: {
                answerCellRenderer: AnswerCellRendererComponent,
                responsesCellRenderer: ResponsesCellRendererComponent
            },
            defaultColDef: {
                editable: false
            },
            columnTypes: {
                timeColumn: {
                    sortable: true,
                    filter: true,
                    wrapText: false,
                    autoHeight: false,
                    width: 150,
                    resizable: false
                },
                emitterColumn: {
                    sortable: true,
                    filter: true,
                    wrapText: false,
                    autoHeight: false,
                    flex: 0.75,
                    resizable: false
                },
                dataColumn: {
                    sortable: true,
                    filter: true,
                    filterParams: {
                        textMatcher: ({filterOption, value, filterText}) => {
                            return AgGrid.getTextMatcherWithEmojis(filterOption, value, filterText);
                        }
                    },
                    wrapText: false,
                    autoHeight: false,
                    flex: 1,
                    resizable: false
                },
                processColumn: {
                    sortable: true,
                    filter: true,
                    wrapText: false,
                    autoHeight: false,
                    minWidth: 180,
                    resizable: false
                },
                severityColumn: {
                    sortable: true,
                    filter: false,
                    wrapText: false,
                    autoHeight: false,
                    maxWidth: 18,
                    resizable: false
                },
                answerColumn: {
                    sortable: false,
                    filter: false,
                    wrapText: false,
                    autoHeight: false,
                    width: 30,
                    resizable: false
                }
            },
            columnDefs: this.columnDefs,
            popupParent: document.querySelector('body'),
            rowClass: 'opfab-monitoring-ag-grid-row'
        };
        this.rowData$ = this.rowDataSubject.asObservable();
    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.gridApi.setGridOption('paginationPageSize', 10);

        const severityCellClassRules = {
            'opfab-sev-alarm': (field) => field.value === 1,
            'opfab-sev-action': (field) => field.value === 2,
            'opfab-sev-compliant': (field) => field.value === 3,
            'opfab-sev-information': (field) => field.value === 4
        };
        const typeOfStateCellClassRules = {
            'opfab-type-of-state-INPROGRESS': (parameters) => parameters.data.typeOfState === 'INPROGRESS',
            'opfab-type-of-state-FINISHED': (parameters) => parameters.data.typeOfState === 'FINISHED',
            'opfab-type-of-state-CANCELED': (parameters) => parameters.data.typeOfState === 'CANCELED'
        };

        this.columnDefs = [
            {
                type: 'severityColumn',
                headerName: '',
                field: 'severityNumber',
                headerClass: 'opfab-ag-header-with-no-padding',
                cellClassRules: severityCellClassRules
            },
            {type: 'timeColumn', headerName: this.timeColumnName, field: 'time'},
            {type: 'answerColumn', headerName: '', field: 'answer', cellRenderer: 'answerCellRenderer'},
            {
                type: 'dataColumn',
                headerName: this.titleColumnName,
                field: 'title',
                comparator: (valueA, valueB) => {
                    return Utilities.compareObj(valueA, valueB);
                }
            },
            {
                type: 'dataColumn',
                headerName: this.summaryColumnName,
                field: 'summary',
                comparator: (valueA, valueB) => {
                    return Utilities.compareObj(valueA, valueB);
                }
            },
            {
                type: 'processColumn',
                headerName: this.typeOfStateColumnName,
                field: 'processStatus',
                cellClassRules: typeOfStateCellClassRules
            },
            {type: 'emitterColumn', headerName: this.emitterColumnName, field: 'emitter'},
            {
                type: 'dataColumn',
                headerName: this.entitiesResponsesColumnName,
                field: 'entitiesNamesResponses',
                cellRenderer: 'responsesCellRenderer'
            }
        ];

        this.gridApi.setGridOption('columnDefs', this.columnDefs);
        this.refreshData();
    }

    updateResultPage(currentPage): void {
        this.gridApi.paginationGoToPage(currentPage - 1);
        this.page = currentPage;
    }

    ngOnChanges(): void {
        if (!this.firstNgOnChange) this.refreshData(); //to avoid double refresh at startup of the page , important when there is a lot of card to show
        this.firstNgOnChange = false;
    }

    refreshData(): void {
        if (this.result) {
            this.displayedResults = this.result;
            this.rowData = [];
            this.displayedResults.forEach((line) => {
                const entitiesNamesResponses = [];
                const entitiesResponses = line.requiredResponses?.length
                    ? line.requiredResponses
                    : line.allowedOrRequiredResponses;

                entitiesResponses.forEach((entityId) => {
                    entitiesNamesResponses.push(EntitiesService.getEntityName(entityId));
                });

                this.rowData.push({
                    severityNumber: this.mapSeverity.get(line.severity),
                    time: this.getFormattedDateTime(line.creationDateTime),
                    title: line.titleTranslated,
                    summary: line.summaryTranslated,
                    processStatus: this.translateValue('shared.typeOfState.' + line.typeOfState),
                    typeOfState: line.typeOfState,
                    cardId: line.cardId,
                    cardUid: line.cardUid,
                    severity: line.severity,
                    answer: line.answer,
                    emitter: line.emitter,
                    requiredResponses: line.requiredResponses,
                    entitiesResponses: entitiesResponses,
                    entitiesNamesResponses: entitiesNamesResponses,
                    beginningOfBusinessPeriod: line.beginningOfBusinessPeriod,
                    endOfBusinessPeriod: line.endOfBusinessPeriod
                });
            });
        }
        this.rowDataSubject.next(this.rowData);
    }

    getFormattedDateTime(epochDate: number): string {
        return DateTimeFormatterService.getFormattedDateAndTime(epochDate);
    }

    getResponses(cardId: string, entities: string[]) {
        return this.getEntitiesNames(
            this.getEntitiesResponses(OpfabStore.getLightCardStore().getChildCards(cardId), entities)
        );
    }

    getEntitiesResponses(childCards: Card[], entities: string[]) {
        if (childCards)
            return entities.filter((entity) => childCards.some((childCard) => childCard.publisher === entity));
        else return [];
    }

    getEntitiesNames(entitiesIds: string[]) {
        const entityNames = [];
        if (entitiesIds)
            entitiesIds.forEach((entityId) => {
                entityNames.push(EntitiesService.getEntityName(entityId));
            });
        return entityNames;
    }

    initStandardExportMonitoringData() {
        this.exportMonitoringData = [];

        this.gridApi.forEachNode((line) => {
            if (line) {
                const responses = this.getResponses(line.data.cardId, line.data.entitiesResponses);
                this.exportMonitoringData.push({
                    [this.timeColumnName]: line.data.time,
                    [this.answerColumnName]: line.data.answer ? line.data.answer : false,
                    [this.businessPeriodColumnName]: this.getFormattedDateTime(line.data.beginningOfBusinessPeriod)
                        .concat('-')
                        .concat(this.getFormattedDateTime(line.data.endOfBusinessPeriod)),
                    [this.titleColumnName]: line.data.title,
                    [this.summaryColumnName]: line.data.summary,
                    [this.typeOfStateColumnName]: line.data.processStatus,
                    [this.severityColumnName]: TranslationService.translateSeverity(line.data.severity),
                    [this.emitterColumnName]: line.data.emitter,
                    [this.requiredResponsesColumnName]: line.data.requiredResponses
                        ? this.getEntitiesNames(line.data.requiredResponses).join()
                        : '',
                    [this.entitiesResponsesColumnName]: responses ? responses.join() : ''
                });
            }
        });
    }

    export(): void {
        this.exportCancelled = false;
        // if monitoring has a specific configuration
        if (this.monitoringConfig?.export?.fields) {
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
            ExcelExport.exportJsonToExcelFile(this.exportMonitoringData, 'Monitoring');
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
                ExcelExport.exportArrayToExcelFile(this.jsonToArray.getJsonAsArray(), 'Monitoring');
                this.exportInProgress = false;
            } else {
                this.exportInProgress = true;
                CardsService.loadCard(this.gridApi.getRowNode(lineNumber).data.cardId).subscribe((card) => {
                    this.jsonToArray.add(this.cardPreprocessingBeforeExport(card));
                    this.processMonitoringForExport(++lineNumber);
                });
            }
        } else {
            this.exportInProgress = false;
        }

        if (!this.exportInProgress) this.exportModalRef.close();
    }

    cardPreprocessingBeforeExport(card: any): any {
        card.card.processGroup = this.translateValue(
            ProcessesService.findProcessGroupLabelForProcess(card.card.process)
        );
        const process: Process = ProcessesService.getProcess(card.card.process);
        if (process) {
            card.card.processName = process.name;
            const state = process.states.get(card.card.state);
            if (state) card.card.typeOfState = this.translateValue('shared.typeOfState.' + state.type);
        }
        card.card.title = card.card.titleTranslated;
        card.card.summary = card.card.summaryTranslated;
        card.card.severity = TranslationService.translateSeverity(card.card.severity);
        if (card.childCards) {
            card.childCards.forEach((childCard) => {
                if (childCard.publisherType === 'ENTITY')
                    childCard.publisherName = EntitiesService.getEntityName(childCard.publisher);
                else childCard.publisherName = childCard.publisher;
            });
        }
        return card;
    }

    translateValue(key: string, interpolateParams?: Map<string, string>): any {
        return TranslationService.getTranslation(key, interpolateParams); // we can use synchronous method as translation has already been load for UI before
    }

    translateColumn(key: string, interpolateParams?: Map<string, string>): any {
        return TranslationService.getTranslation(key, interpolateParams);
    }

    ngOnDestroy() {
        if (this.modalRef) {
            this.modalRef.close();
        }
        if (this.exportModalRef) {
            this.exportModalRef.close();
        }
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    selectCard(info) {
        SelectedCardService.setSelectedCardId(info);
        const options: NgbModalOptions = {
            size: 'fullscreen'
        };
        this.modalRef = this.modalService.open(this.cardDetailTemplate, options);

        // Clear card selection when modal is dismissed by pressing escape key or clicking outside of modal
        // Closing event is already handled in card detail component
        this.modalRef.dismissed.subscribe(() => {
            SelectedCardService.clearSelectedCardId();
        });
    }
}
