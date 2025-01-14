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
import {ColDef, GridOptions, AllCommunityModule, ModuleRegistry, provideGlobalGridOptions} from 'ag-grid-community';
import {LightCard} from '@ofModel/light-card.model';
import {TimeCellRendererComponent} from '../cell-renderers/time-cell-renderer.component';
import {SenderCellRendererComponent} from '../cell-renderers/sender-cell-renderer.component';
import {NgbModal, NgbModalOptions, NgbModalRef, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {SelectedCardService} from '../../../../services/selectedCard/SelectedCardService';
import {AgGridAngular} from 'ag-grid-angular';
import {NgIf} from '@angular/common';
import {CardComponent} from '../../../card/card.component';
import {ProcessMonitoringField, ProcessMonitoringFieldEnum} from '@ofServices/config/model/ProcessMonitoringConfig';

@Component({
    selector: 'of-processmonitoring-table',
    templateUrl: './processmonitoring-table.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [AgGridAngular, NgIf, TranslateModule, NgbPagination, CardComponent]
})
export class ProcessmonitoringTableComponent {
    @ViewChild('cardDetail') cardDetailTemplate: ElementRef;
    @Input() result: LightCard[];
    @Input() processGroupVisible: boolean;
    @Input() totalElements: number;
    @Input() totalPages: number;
    @Input() page: number;
    @Input() pageSize: number;
    @Input() processStateNameMap: Map<string, string>;
    @Input() processStateDescriptionMap: Map<string, string>;
    @Input() processMonitoringFields: ProcessMonitoringField[];

    @Output() pageChange = new EventEmitter<number>();
    @Output() filterChange = new EventEmitter<number>();
    @Output() export = new EventEmitter<number>();

    modalRef: NgbModalRef;

    // ag-grid configuration objects
    gridOptions;
    public gridApi;

    private columnDefs: ColDef[] = [];

    constructor(
        private readonly translate: TranslateService,
        private readonly modalService: NgbModal
    ) {
        ModuleRegistry.registerModules([AllCommunityModule]);
        provideGlobalGridOptions({theme: 'legacy'});

        this.gridOptions = <GridOptions>{
            context: {
                componentParent: this
            },
            components: {
                timeCellRenderer: TimeCellRendererComponent,
                senderCellRenderer: SenderCellRendererComponent
            },
            domLayout: 'autoHeight',
            defaultColDef: {
                editable: false,
                wrapHeaderText: true
            },
            getLocaleText: function (params) {
                // To avoid clashing with opfab assets, all keys defined by ag-grid are prefixed with "ag-grid."
                // e.g. key "to" defined by ag-grid for use with pagination can be found under "ag-grid.to" in assets
                return translate.instant('ag-grid.' + params.key);
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
            ensureDomOrder: true, // rearrange row-index of rows when sorting cards (used for cypress)
            pagination: true,
            suppressCellFocus: true,
            headerHeight: 70,
            suppressPaginationPanel: true,
            suppressHorizontalScroll: true,
            columnDefs: this.columnDefs,
            rowHeight: 45,
            popupParent: document.querySelector('body')
        };
    }

    onFilterChanged(ev) {
        this.filterChange.next(this.gridApi.getFilterModel());
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

            this.processMonitoringFields.forEach((column) => {
                if (column.type === ProcessMonitoringFieldEnum.DATE) {
                    this.columnDefs.push({
                        type: 'summaryColumn',
                        headerName: column.colName,
                        cellRenderer: 'timeCellRenderer',
                        field: String(column.field).split('.').pop(),
                        headerClass: 'opfab-ag-cheader-with-right-padding',
                        flex: isNaN(Number(column.size)) ? 1 : Number(column.size) / columnSizeAverage,
                        resizable: false
                    });
                } else {
                    this.columnDefs.push({
                        type: 'summaryColumn',
                        headerName: column.colName,
                        field: String(column.field).split('.').pop(),
                        headerClass: 'opfab-ag-cheader-with-right-padding',
                        cellClass: 'opfab-ag-cell-with-no-padding',
                        flex: isNaN(Number(column.size)) ? 1 : Number(column.size) / columnSizeAverage,
                        resizable: false
                    });
                }
            });
        }

        this.gridApi.setGridOption('columnDefs', this.columnDefs);
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

        // Clear card selection when modal is dismissed by pressing escape key or clicking outside of modal
        // Closing event is already handled in card detail component
        this.modalRef.dismissed.subscribe(() => {
            SelectedCardService.clearSelectedCardId();
        });
    }
}
