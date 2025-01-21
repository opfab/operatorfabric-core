/* Copyright (c) 2022-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {TranslateService, TranslateModule} from '@ngx-translate/core';
import {takeUntil} from 'rxjs/operators';
import {ColDef, GridOptions, AllCommunityModule, ModuleRegistry, provideGlobalGridOptions} from 'ag-grid-community';
import {Card} from 'app/model/Card';
import {TimeCellRendererComponent} from '../cell-renderers/time-cell-renderer.component';
import {ProcessGroupCellRendererComponent} from '../cell-renderers/process-group-cell-renderer.component';
import {StateCellRendererComponent} from '../cell-renderers/state-cell-renderer.component';
import {StateDescriptionCellRendererComponent} from '../cell-renderers/state-description-cell-renderer.component';
import {SenderCellRendererComponent} from '../cell-renderers/sender-cell-renderer.component';
import {Subject} from 'rxjs';
import {AgGridAngular} from 'ag-grid-angular';
import {NgFor, NgIf} from '@angular/common';
import {NgbPagination} from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'of-logging-table',
    templateUrl: './logging-table.component.html',
    standalone: true,
    imports: [AgGridAngular, NgIf, NgFor, TranslateModule, NgbPagination]
})
export class LoggingTableComponent implements OnDestroy {
    @Input() result: Card[];
    @Input() processGroupVisible: boolean;
    @Input() totalElements: number;
    @Input() totalPages: number;
    @Input() page: number;
    @Input() pageSize: number = 10;
    @Input() processStateNameMap: Map<string, string>;
    @Input() processStateDescriptionMap: Map<string, string>;

    @Output() pageSizeChange = new EventEmitter<number>();
    @Output() pageChange = new EventEmitter<number>();
    @Output() filterChange = new EventEmitter<number>();
    @Output() export = new EventEmitter<number>();

    unsubscribe$: Subject<void> = new Subject<void>();

    // ag-grid configuration objects
    gridOptions;
    public gridApi;

    private columnDefs: ColDef[] = [];

    private readonly timeColumnName;
    private readonly titleColumnName;
    private readonly summaryColumnName;
    private readonly processGroupColumnName;
    private readonly processColumnName;
    private readonly stateColumnName;
    private readonly descriptionColumnName;
    private readonly senderColumnName;

    readonly paginationPageSizeOptions = [10, 20, 50, 100];

    constructor(private readonly translate: TranslateService) {
        ModuleRegistry.registerModules([AllCommunityModule]);
        provideGlobalGridOptions({theme: 'legacy'});

        this.timeColumnName = this.translateColumn('shared.result.timeOfAction');
        this.processGroupColumnName = this.translateColumn('shared.result.processGroup');
        this.processColumnName = this.translateColumn('shared.result.process');
        this.titleColumnName = this.translateColumn('shared.result.title');
        this.summaryColumnName = this.translateColumn('shared.result.summary');
        this.stateColumnName = this.translateColumn('shared.result.state');
        this.descriptionColumnName = this.translateColumn('shared.result.description');
        this.senderColumnName = this.translateColumn('shared.result.sender');

        this.gridOptions = <GridOptions>{
            context: {
                componentParent: this
            },
            components: {
                timeCellRenderer: TimeCellRendererComponent,
                processGroupCellRenderer: ProcessGroupCellRendererComponent,
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
                    width: 130,
                    resizable: false
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
            },
            {
                type: 'timeColumn',
                headerName: this.timeColumnName,
                field: 'publishDate',
                cellRenderer: 'timeCellRenderer',
                headerClass: 'opfab-ag-header-with-no-padding',
                cellClass: 'opfab-ag-cell-with-left-padding'
            }
        ];
        if (this.processGroupVisible)
            this.columnDefs.push({
                type: 'noFiltersDataColumn',
                headerName: this.processGroupColumnName,
                field: 'process',
                cellRenderer: 'processGroupCellRenderer',
                headerClass: 'opfab-ag-header-with-no-padding',
                cellClass: 'opfab-ag-cell-with-no-padding'
            });

        this.columnDefs.push({
            type: 'noFiltersDataColumn',
            headerName: this.processColumnName,
            field: 'processName',
            headerClass: 'opfab-ag-header-with-no-padding',
            cellClass: 'opfab-ag-cell-with-no-padding'
        });
        this.columnDefs.push({
            type: 'titleColumn',
            headerName: this.titleColumnName,
            field: 'titleTranslated',
            headerClass: 'opfab-ag-cheader-with-right-padding',
            cellClass: 'opfab-ag-cell-with-no-padding'
        });
        this.columnDefs.push({
            type: 'summaryColumn',
            headerName: this.summaryColumnName,
            field: 'summaryTranslated',
            headerClass: 'opfab-ag-cheader-with-right-padding',
            cellClass: 'opfab-ag-cell-with-no-padding'
        });
        this.columnDefs.push({
            type: 'stateDataColumn',
            headerName: this.stateColumnName,
            field: 'state',
            cellRenderer: 'stateCellRenderer',
            headerClass: 'opfab-ag-header-with-no-padding',
            cellClass: 'opfab-ag-cell-with-no-padding'
        });
        this.columnDefs.push({
            type: 'stateDataColumn',
            headerName: this.descriptionColumnName,
            field: 'state',
            cellRenderer: 'stateDescriptionCellRenderer',
            headerClass: 'opfab-ag-header-with-no-padding',
            cellClass: 'opfab-ag-cell-with-no-padding'
        });
        this.columnDefs.push({
            type: 'senderColumn',
            headerName: this.senderColumnName,
            field: 'state',
            cellRenderer: 'senderCellRenderer',
            headerClass: 'opfab-ag-header-with-no-padding',
            cellClass: 'opfab-ag-cell-with-no-padding'
        });

        this.gridApi.setGridOption('columnDefs', this.columnDefs);
    }

    updateResultPage(currentPage): void {
        this.pageChange.next(currentPage);
    }

    onPageSizeChanged(target: EventTarget | null) {
        if (target) {
            this.pageSize = Number((<HTMLSelectElement>target).value);
            this.pageSizeChange.next(this.pageSize);
        }
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
