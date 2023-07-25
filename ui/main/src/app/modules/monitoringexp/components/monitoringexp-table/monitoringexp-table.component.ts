/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {takeUntil} from 'rxjs/operators';
import {ColDef, GridOptions} from 'ag-grid-community';
import {LightCard} from '@ofModel/light-card.model';
import {TimeCellRendererComponent} from '../cell-renderers/time-cell-renderer.component';
import {StateCellRendererComponent} from '../cell-renderers/state-cell-renderer.component';
import {StateDescriptionCellRendererComponent} from '../cell-renderers/state-description-cell-renderer.component';
import {SenderCellRendererComponent} from '../cell-renderers/sender-cell-renderer.component';
import {Subject} from 'rxjs';

@Component({
    selector: 'of-monitoringexp-table',
    templateUrl: './monitoringexp-table.component.html'
})
export class MonitoringexpTableComponent implements OnDestroy {

    @Input() result: LightCard[];
    @Input() processGroupVisible: boolean;
    @Input() totalElements: number;
    @Input() totalPages: number;
    @Input() page: number;
    @Input() processStateNameMap: Map<string, string>;
    @Input() processStateDescriptionMap: Map<string, string>;
    @Input() processMonitoring: any[];

    @Output() pageChange = new EventEmitter<number>();
    @Output() filterChange = new EventEmitter<number>();
    @Output() export = new EventEmitter<number>();

    unsubscribe$: Subject<void> = new Subject<void>();

    // ag-grid configuration objects
    gridOptions;
    public gridApi;

    private columnDefs: ColDef[] = [];

    constructor(private translate: TranslateService) {

        this.gridOptions = <GridOptions>{
            context: {
                componentParent: this
            },
            components: {
                timeCellRenderer: TimeCellRendererComponent,
                stateCellRenderer: StateCellRendererComponent,
                stateDescriptionCellRenderer: StateDescriptionCellRendererComponent,
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
                timeColumn: {
                    sortable: false,
                    filter: false,
                    wrapText: false,
                    autoHeight: false,
                    width: 130
                },
                noFiltersDataColumn: {
                    sortable: false,
                    filter: false,
                    wrapText: false,
                    autoHeight: false,
                    flex: 1,
                    maxWidth: 150,
                    resizable: false
                },
                titleColumn: {
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
                stateDataColumn: {
                    sortable: false,
                    filter: false,
                    wrapText: false,
                    autoHeight: false,
                    width: 190,
                    resizable: false
                },
                senderColumn: {
                    sortable: false,
                    filter: false,
                    wrapText: false,
                    autoHeight: false,
                    minWidth: 120,
                    flex: 0.6,
                    resizable: false
                },
                severityColumn: {
                    sortable: false,
                    filter: false,
                    wrapText: false,
                    autoHeight: false,
                    maxWidth: 18
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

        if (!!this.processMonitoring) {
            this.processMonitoring.forEach(column => {
                this.columnDefs.push({type: 'summaryColumn', headerName: column.colName, field: String(column.field).split(".").pop(),
                    headerClass: 'opfab-ag-cheader-with-right-padding', cellClass: 'opfab-ag-cell-with-no-padding'});
            });
        }

        this.gridApi.setColumnDefs(this.columnDefs);
    }

    updateResultPage(currentPage): void {
        this.pageChange.next(currentPage);
    }

    exportToExcel() {
        this.export.next(null);
    }

    translateValue(key: string, interpolateParams?: Object): any {
        return this.translate.instant(key, interpolateParams); // we can use synchronous method as translation has already been load for UI before
    }

    translateColumn(key: string | Array<string>, interpolateParams?: Object): any {
        let translatedColumn: number;

        this.translate
            .get(key, interpolateParams)
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

}
