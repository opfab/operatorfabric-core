/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {TranslateService, TranslateModule} from '@ngx-translate/core';
import {
    ColDef,
    GridOptions,
    AllCommunityModule,
    ModuleRegistry,
    provideGlobalGridOptions,
    FilterModel,
    DoesFilterPassParams
} from 'ag-grid-community';
import {Card} from 'app/model/Card';
import {TimeCellRendererComponent} from '../cell-renderers/TimeCellRendererComponent';
import {SenderCellRendererComponent} from '../cell-renderers/SenderCellRendererComponent';
import {NgbModal, NgbModalOptions, NgbModalRef, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {SelectedCardService} from '@ofServices/selectedCard/SelectedCardService';
import {AgGridAngular} from 'ag-grid-angular';
import {NgForOf, NgIf} from '@angular/common';
import {CardComponent} from '../../../card/CardComponent';
import {ProcessMonitoringField, ProcessMonitoringFieldEnum} from '@ofServices/config/model/ProcessMonitoringConfig';
import {AgGrid} from 'app/utils/AgGrid';
import {UserPreferencesService} from '@ofServices/userPreferences/UserPreferencesService';
import {LoggerService as logger} from '@ofServices/logs/LoggerService';
import {CustomFilterComponent} from './CustomFilterComponent';

@Component({
    selector: 'of-processmonitoring-table',
    templateUrl: './ProcessMonitoringTableComponent.html',
    styleUrls: ['./ProcessMonitoringTableComponent.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [AgGridAngular, NgIf, TranslateModule, NgbPagination, CardComponent, NgForOf]
})
export class ProcessmonitoringTableComponent {
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
    @Output() export = new EventEmitter<number>();

    modalRef: NgbModalRef;

    // ag-grid configuration objects
    gridOptions;
    public gridApi;

    protected columnDefs: ColDef[] = [];

    protected showColumnPanel = false;
    private columnsVisibilityPreference: {
        fields?: {field: string; visible: boolean}[];
        fieldsForProcesses?: {process: string; fields: {field: string; visible: boolean}[]}[];
    } = {};

    constructor(
        private readonly translate: TranslateService,
        private readonly modalService: NgbModal
    ) {
        ModuleRegistry.registerModules([AllCommunityModule]);
        provideGlobalGridOptions({theme: 'legacy'});

        this.gridOptions = <GridOptions>{
            ...AgGrid.getDefaultGridOptions(),
            context: {
                componentParent: this
            },
            components: {
                timeCellRenderer: TimeCellRendererComponent,
                senderCellRenderer: SenderCellRendererComponent
            },
            defaultColDef: {
                editable: false,
                wrapHeaderText: true
            },
            columnTypes: {
                summaryColumn: {
                    sortable: false,
                    filter: true,
                    filterParams: {
                        suppressAndOrCondition: true
                    },
                    wrapText: false,
                    autoHeight: true,
                    flex: 1,
                    resizable: false
                },
                severityColumn: {
                    sortable: false,
                    filter: false,
                    wrapText: false,
                    autoHeight: false,
                    maxWidth: 18,
                    resizable: false
                }
            },
            columnDefs: this.columnDefs,
            popupParent: document.querySelector('body')
        };
    }

    onFilterChanged(ev) {
        this.filterChange.next({filterModel: this.gridApi.getFilterModel(), colId: ev.columns[0]?.colId});
    }

    onGridReady(params) {
        this.gridApi = params.api;

        const severityCellClassRules = {
            'opfab-sev-alarm': (field) => field.value === 1,
            'opfab-sev-action': (field) => field.value === 2,
            'opfab-sev-compliant': (field) => field.value === 3,
            'opfab-sev-information': (field) => field.value === 4
        };

        this.columnDefs = [
            {
                type: 'severityColumn',
                headerName: '',
                field: 'severityNumber',
                headerClass: 'opfab-ag-header-with-no-padding',
                cellClassRules: severityCellClassRules
            }
        ];

        if (this.processMonitoringFields) {
            const columnSizeAverage = this.computeColumnSizeAverage();

            const stored = UserPreferencesService.getPreference('opfab.processMonitoring.columnsVisibility');
            try {
                this.columnsVisibilityPreference = stored ? JSON.parse(stored) : {};
            } catch (error) {
                logger.error('Failed to parse columns visibility from user preferences:' + error);
                this.columnsVisibilityPreference = {};
            }
            this.fillColumnsVisibilityPreferenceIfNotExist();

            let columnsVisibility = this.columnsVisibilityPreference.fields;

            if (this.selectedProcessIfOnlyOneIsSelected?.length > 0) {
                const index = this.findProcessInColumnsVisibilityPreference(this.selectedProcessIfOnlyOneIsSelected);
                if (index >= 0) {
                    columnsVisibility = this.columnsVisibilityPreference.fieldsForProcesses[index].fields;
                }
            }

            this.processMonitoringFields.forEach((column) => {
                if (column.type === ProcessMonitoringFieldEnum.DATE) {
                    this.columnDefs.push({
                        type: 'summaryColumn',
                        headerName: column.colName,
                        cellRenderer: 'timeCellRenderer',
                        field: String(column.field).split('.').pop(),
                        headerClass: 'opfab-ag-cheader-with-right-padding',
                        flex: isNaN(Number(column.size)) ? 1 : Number(column.size) / columnSizeAverage,
                        resizable: false,
                        colId: column.field,
                        hide: columnsVisibility?.find((element) => element.field === column.field)?.visible === false
                    });
                } else {
                    this.columnDefs.push({
                        type: 'summaryColumn',
                        headerName: column.colName,
                        field: String(column.field).split('.').pop(),
                        headerClass: 'opfab-ag-cheader-with-right-padding',
                        cellClass: 'opfab-ag-cell-with-no-padding',
                        flex: isNaN(Number(column.size)) ? 1 : Number(column.size) / columnSizeAverage,
                        resizable: false,
                        colId: column.field,
                        hide: columnsVisibility?.find((element) => element.field === column.field)?.visible === false
                    });
                }

                if (column.type === ProcessMonitoringFieldEnum.SET && column.possibleValues?.length > 0) {
                    this.columnDefs[this.columnDefs.length - 1] = {
                        ...this.columnDefs.at(this.columnDefs.length - 1),
                        filter: {
                            component: CustomFilterComponent,
                            doesFilterPass: this.doesFilterPass
                        },
                        filterParams: {
                            possibleValues: column.possibleValues
                        }
                    };
                }
            });
        }

        this.gridApi.setGridOption('columnDefs', this.columnDefs);
    }

    private doesFilterPass({model, node, handlerParams}: DoesFilterPassParams<any, any, string>): boolean {
        if (!model) {
            return true;
        }

        const tokens = model
            .toLowerCase()
            .split(';')
            .map((t) => t.trim())
            .filter((t) => t.length > 0);

        if (tokens.length === 0) {
            return true;
        }

        const cell = handlerParams.getValue(node);
        if (cell == null) {
            return false;
        }
        const haystack = Array.isArray(cell) ? cell.join(',').toLowerCase() : cell.toString().toLowerCase();
        return tokens.some((t) => haystack.includes(t));
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

    computeColumnSizeAverage(): number {
        let columnSizeAverage = 0;
        this.processMonitoringFields.forEach((column) => {
            columnSizeAverage += isNaN(Number(column.size)) ? 1 : Number(column.size);
        });
        return columnSizeAverage / this.processMonitoringFields.length;
    }

    updateResultPage(currentPage): void {
        this.pageChange.next(currentPage);
    }

    exportToExcel() {
        this.export.next(null);
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
}
