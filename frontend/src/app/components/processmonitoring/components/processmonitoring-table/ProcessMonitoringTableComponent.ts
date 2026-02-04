/* Copyright (c) 2023-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    ViewChild,
    inject
} from '@angular/core';
import {TranslateService, TranslateModule} from '@ngx-translate/core';
import {
    ColDef,
    GridOptions,
    AllCommunityModule,
    ModuleRegistry,
    provideGlobalGridOptions,
    FilterModel,
    ColumnResizedEvent,
    ColumnMovedEvent
} from 'ag-grid-community';
import {Card} from 'app/model/Card';
import {TimeCellRendererComponent} from '../cell-renderers/TimeCellRendererComponent';
import {SenderCellRendererComponent} from '../cell-renderers/SenderCellRendererComponent';
import {NgbModal, NgbModalOptions, NgbModalRef, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {SelectedCardService} from '@ofServices/selectedCard/SelectedCardService';
import {AgGridAngular} from 'ag-grid-angular';

import {CardComponent} from '../../../card/CardComponent';
import {ProcessMonitoringField, ProcessMonitoringFieldEnum} from '@ofServices/config/model/ProcessMonitoringConfig';
import {AgGrid} from 'app/utils/AgGrid';
import {UserPreferencesService} from '@ofServices/userPreferences/UserPreferencesService';
import {LoggerService as logger} from '@ofServices/logs/LoggerService';
import {SetFilterComponent} from './SetFilterComponent';

@Component({
    selector: 'of-processmonitoring-table',
    templateUrl: './ProcessMonitoringTableComponent.html',
    styleUrls: ['./ProcessMonitoringTableComponent.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [AgGridAngular, TranslateModule, NgbPagination, CardComponent]
})
export class ProcessmonitoringTableComponent {
    private readonly translate = inject(TranslateService);
    private readonly modalService = inject(NgbModal);

    @ViewChild('cardDetail') cardDetailTemplate: ElementRef;
    @Input() result: Card[];
    @Input() processGroupVisible: boolean;
    @Input() totalElements: number;
    @Input() totalPages: number;
    @Input() page: number;
    @Input() pageSize: number;
    @Input() processStateNameMap: Map<string, string>;
    @Input() processStateDescriptionMap: Map<string, string>;
    @Input() processMonitoringFields: ProcessMonitoringField[];
    @Input() selectedProcessIfOnlyOneIsSelected: string;

    @Output() pageChange = new EventEmitter<number>();
    @Output() filterChange = new EventEmitter<{filterModel: FilterModel; colId: string}>();
    @Output() export = new EventEmitter<string[]>();

    modalRef: NgbModalRef;

    // ag-grid configuration objects
    gridOptions;
    public gridApi;

    protected columnDefs: ColDef[] = [];

    protected showColumnPanel = false;
    private columnsVisibilityPreference: {
        fields?: {field: string; visible: boolean; width?: number}[];
        columnOrder?: any;
        fieldsForProcesses?: {
            process: string;
            columnOrder?: any;
            fields: {field: string; visible: boolean; width?: number}[];
        }[];
    } = {};

    constructor() {
        ModuleRegistry.registerModules([AllCommunityModule]);
        provideGlobalGridOptions({theme: 'legacy'});

        this.gridOptions = <GridOptions>{
            ...AgGrid.getDefaultGridOptions(),
            suppressHorizontalScroll: false,
            context: {
                componentParent: this
            },
            components: {
                timeCellRenderer: TimeCellRendererComponent,
                senderCellRenderer: SenderCellRendererComponent
            },
            defaultColDef: {
                editable: false,
                wrapHeaderText: true,
                filterParams: {
                    // the backend filtering supports only one condition
                    maxNumConditions: 1
                }
            },
            columnTypes: {
                summaryColumn: {
                    sortable: false,
                    filter: true,
                    wrapText: false,
                    autoHeight: true,
                    resizable: true
                },
                severityColumn: {
                    sortable: false,
                    filter: false,
                    wrapText: false,
                    autoHeight: false,
                    maxWidth: 36,
                    resizable: false
                }
            },
            columnDefs: this.columnDefs,
            popupParent: document.querySelector('body')
        };
    }

    onFilterChanged(ev) {
        this.filterChange.next({filterModel: this.gridApi.getFilterModel(), colId: ev?.columns[0]?.colId});
    }

    onColumnResized(event: ColumnResizedEvent) {
        if (!event.finished || !event.column) {
            return;
        }

        const colId = event.column.getColId();
        const width = event.column.getActualWidth();

        if (this.selectedProcessIfOnlyOneIsSelected?.length > 0) {
            const index = this.findProcessInColumnsVisibilityPreference(this.selectedProcessIfOnlyOneIsSelected);

            if (index >= 0) {
                const field = this.columnsVisibilityPreference.fieldsForProcesses[index].fields.find(
                    (field) => field.field === colId
                );
                if (field) {
                    field.width = width;
                }
            }
        } else {
            const field = this.columnsVisibilityPreference.fields?.find((field) => field.field === colId);
            if (field) {
                field.width = width;
            }
        }

        UserPreferencesService.setPreference(
            'opfab.processMonitoring.columnsVisibility',
            JSON.stringify(this.columnsVisibilityPreference)
        );
    }

    onColumnMoved(event: ColumnMovedEvent) {
        if (!event.finished || !event.column) {
            return;
        }

        const columnState = this.gridApi.getColumnState();
        const orderOnly = columnState.map((col: any) => ({
            colId: col.colId
        }));
        if (this.selectedProcessIfOnlyOneIsSelected?.length > 0) {
            const index = this.findProcessInColumnsVisibilityPreference(this.selectedProcessIfOnlyOneIsSelected);
            if (index >= 0) {
                this.columnsVisibilityPreference.fieldsForProcesses[index].columnOrder = JSON.stringify(orderOnly);
            }
        } else {
            this.columnsVisibilityPreference.columnOrder = JSON.stringify(orderOnly);
        }

        UserPreferencesService.setPreference(
            'opfab.processMonitoring.columnsVisibility',
            JSON.stringify(this.columnsVisibilityPreference)
        );
    }

    onGridReady(params) {
        this.gridApi = params.api;

        this.columnDefs = [
            {
                type: 'severityColumn',
                headerName: '',
                field: 'severityNumber',
                headerClass: 'opfab-ag-header-with-no-padding',
                cellStyle: {
                    border: 'none'
                },
                cellRenderer: (params) => {
                    const severityClassMap = {
                        1: 'opfab-sev-alarm',
                        2: 'opfab-sev-action',
                        3: 'opfab-sev-compliant',
                        4: 'opfab-sev-information'
                    };
                    const appliedClass = severityClassMap[params.value] || '';

                    return `
                        <div style="
                            width: 18px; 
                            height: 100%;
                            float: right;"
                            class="${appliedClass}">
                        </div>
                    `;
                }
            }
        ];

        if (this.processMonitoringFields) {
            const stored = UserPreferencesService.getPreference('opfab.processMonitoring.columnsVisibility');
            try {
                this.columnsVisibilityPreference = stored ? JSON.parse(stored) : {};
            } catch (error) {
                logger.error('Failed to parse columns visibility from user preferences:' + error);
                this.columnsVisibilityPreference = {};
            }
            this.fillColumnsVisibilityPreferenceIfNotExist();

            let columnsVisibility = this.columnsVisibilityPreference.fields;
            let columnOrder = this.columnsVisibilityPreference.columnOrder;

            if (this.selectedProcessIfOnlyOneIsSelected?.length > 0) {
                const index = this.findProcessInColumnsVisibilityPreference(this.selectedProcessIfOnlyOneIsSelected);
                if (index >= 0) {
                    columnsVisibility = this.columnsVisibilityPreference.fieldsForProcesses[index].fields;
                    columnOrder = this.columnsVisibilityPreference.fieldsForProcesses[index].columnOrder;
                }
            }

            this.processMonitoringFields.forEach((column) => {
                if (column.type === ProcessMonitoringFieldEnum.DATE) {
                    this.columnDefs.push({
                        type: 'summaryColumn',
                        headerName: column.colName,
                        cellRenderer: 'timeCellRenderer',
                        field: column.field,
                        headerClass: 'opfab-ag-cheader-with-left-and-right-padding',
                        cellClass: 'opfab-ag-cell-with-left-padding',
                        resizable: true,
                        colId: column.field,
                        hide: columnsVisibility?.find((element) => element.field === column.field)?.visible === false,
                        width:
                            columnsVisibility?.find((element) => element.field === column.field)?.width ?? column.size
                    });
                } else {
                    this.columnDefs.push({
                        type: 'summaryColumn',
                        headerName: column.colName,
                        field: column.field === 'entityRecipients' ? 'entityRecipientsNames' : column.field,
                        headerClass: 'opfab-ag-cheader-with-left-and-right-padding',
                        cellClass: 'opfab-ag-cell-with-left-padding',
                        resizable: true,
                        colId: column.field,
                        hide: columnsVisibility?.find((element) => element.field === column.field)?.visible === false,
                        width:
                            columnsVisibility?.find((element) => element.field === column.field)?.width ?? column.size
                    });
                }

                if (column.type === ProcessMonitoringFieldEnum.SET && column.possibleValues?.length > 0) {
                    this.columnDefs[this.columnDefs.length - 1] = {
                        ...this.columnDefs.at(-1),
                        filter: {
                            component: SetFilterComponent
                        },
                        filterParams: {
                            possibleValues: column.possibleValues
                        }
                    };
                }
            });

            this.gridApi.setGridOption('columnDefs', this.columnDefs);

            if (columnOrder) {
                try {
                    const columnState = JSON.parse(columnOrder);
                    this.gridApi.applyColumnState({
                        state: columnState,
                        applyOrder: true
                    });
                } catch (error) {
                    logger.error('Failed to apply column order from user preferences: ' + error);
                }
            }
        }
    }

    private findProcessInColumnsVisibilityPreference(processToFind: string): number {
        return (
            this.columnsVisibilityPreference?.fieldsForProcesses?.findIndex(
                (element) => element.process === processToFind
            ) ?? -1
        );
    }

    private fillColumnsVisibilityPreferenceIfNotExist() {
        if (this.selectedProcessIfOnlyOneIsSelected?.length > 0) {
            const index = this.findProcessInColumnsVisibilityPreference(this.selectedProcessIfOnlyOneIsSelected);

            if (index === -1) {
                this.columnsVisibilityPreference = {
                    ...this.columnsVisibilityPreference,
                    fieldsForProcesses: this.columnsVisibilityPreference.fieldsForProcesses ?? []
                };
                this.columnsVisibilityPreference.fieldsForProcesses.push({
                    process: this.selectedProcessIfOnlyOneIsSelected,
                    fields: this.computeFieldsVisibility()
                });
            }
        } else if (!this.columnsVisibilityPreference.fields || this.columnsVisibilityPreference.fields.length === 0) {
            this.columnsVisibilityPreference.fields = this.computeFieldsVisibility();
        }
    }

    private computeFieldsVisibility(): {field: string; visible: boolean}[] {
        const fields = [];
        this.processMonitoringFields.forEach((column) => {
            fields.push({
                field: column.field,
                visible: column.defaultVisibility !== false
            });
        });
        return fields;
    }

    updateResultPage(currentPage): void {
        this.pageChange.next(currentPage);
    }

    exportToExcel() {
        const visibleColumns = this.gridApi.getAllDisplayedColumns().map((col) => col.getColDef().headerName);
        this.export.next(visibleColumns);
    }

    selectCard(info) {
        SelectedCardService.setSelectedCardId(info);
        const options: NgbModalOptions = {
            size: 'fullscreen'
        };
        this.modalRef = this.modalService.open(this.cardDetailTemplate, options);

        // Clear card selection when modal is dismissed by pressing the escape key or clicking outside modal
        // Closing event is already handled in the card detail component
        this.modalRef.dismissed.subscribe(() => {
            SelectedCardService.clearSelectedCardId();
        });
    }

    protected toggleColumnVisible(col: ColDef) {
        col.hide = !col.hide;
        this.gridApi.setColumnsVisible([col.colId], !col.hide);

        if (this.selectedProcessIfOnlyOneIsSelected?.length > 0) {
            const index = this.findProcessInColumnsVisibilityPreference(this.selectedProcessIfOnlyOneIsSelected);

            if (index >= 0) {
                const field = this.columnsVisibilityPreference.fieldsForProcesses[index].fields.find(
                    (field) => field.field === col.colId
                );
                if (field) {
                    field.visible = !col.hide;
                }
            }
        } else {
            const field = this.columnsVisibilityPreference.fields?.find((field) => field.field === col.colId);
            if (field) {
                field.visible = !col.hide;
            }
        }

        UserPreferencesService.setPreference(
            'opfab.processMonitoring.columnsVisibility',
            JSON.stringify(this.columnsVisibilityPreference)
        );
    }

    public resetAllAgGridFilters() {
        if (this.gridApi) {
            this.gridApi.setFilterModel(null);
            this.onFilterChanged(null);
        }
    }
}
