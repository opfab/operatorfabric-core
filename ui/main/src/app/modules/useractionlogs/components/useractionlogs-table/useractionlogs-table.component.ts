/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 *  See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {UserActionLog} from "@ofModel/user-action-log.model";
import {DateTimeFormatterService} from "@ofServices/date-time-formatter.service";
import {ColDef, GridOptions} from "ag-grid-community";


@Component({
    selector: 'of-useractionlogs-table',
    templateUrl: './useractionlogs-table.component.html'
})
export class UserActionLogsTableComponent {

    @Input() actions: UserActionLog[];

    // ag-grid configuration objects
    public gridOptions;
    public gridApi;
    public rowData: any[];
    public page = 1;
    private columnDefs: ColDef[] = [];

    private dateColumnName: string;
    private actionColumnName: string;
    private loginColumnName: string;
    private entitiesColumnName: string;
    private cardUidColumnName: string;
    private commentColumnName: string;

    constructor( private translate: TranslateService, private dateTimeFormatter: DateTimeFormatterService) {

        this.dateColumnName = this.translate.instant('useractionlogs.date');
        this.actionColumnName = this.translate.instant('useractionlogs.action');
        this.loginColumnName = this.translate.instant('useractionlogs.login');
        this.entitiesColumnName = this.translate.instant('useractionlogs.entities');
        this.cardUidColumnName = this.translate.instant('useractionlogs.cardUid');
        this.commentColumnName = this.translate.instant('useractionlogs.comment');

        this.gridOptions = <GridOptions>{
            context: {
                componentParent: this
            },
            domLayout: 'autoHeight',
            defaultColDef: {
                editable: false
            },
            getLocaleText: function (params) {
                // To avoid clashing with opfab assets, all keys defined by ag-grid are prefixed with "ag-grid."
                // e.g. key "to" defined by ag-grid for use with pagination can be found under "ag-grid.to" in assets
                return translate.instant('ag-grid.' + params.key);
            },
            columnTypes: {
                timeColumn: {
                    sortable: true,
                    filter: true,
                    wrapText: false,
                    autoHeight: false,
                    width: 150,
                    valueGetter: params => {
                        return this.getFormattedDateTime(params.data.date);
                    }
                },
                dataColumn: {
                    sortable: true,
                    filter: true,
                    wrapText: false,
                    autoHeight: false,
                    flex: 1,
                    resizable: false
                },
                entitiesColumn: {
                    sortable: true,
                    filter: true,
                    wrapText: false,
                    autoHeight: false,
                    flex: 3,
                    resizable: false
                },
                cardUidColumn: {
                    sortable: true,
                    filter: true,
                    wrapText: false,
                    autoHeight: false,
                    flex: 2,
                    resizable: false
                }
            },
            ensureDomOrder: true, // rearrange row-index of rows when sorting cards (used for cypress)
            pagination: true,
            suppressCellFocus: true,
            suppressRowHoverHighlight: true,
            headerHeight: 70,
            suppressPaginationPanel: true,
            suppressHorizontalScroll: true,
            columnDefs: this.columnDefs,
            rowHeight: 45
        };
    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.gridApi.paginationSetPageSize(10);

        this.columnDefs = [
            {type: 'timeColumn', headerName: this.dateColumnName, field: 'date'},
            {type: 'dataColumn', headerName: this.actionColumnName, field: 'action'},
            {type: 'dataColumn', headerName: this.loginColumnName, field: 'login'},
            {type: 'entitiesColumn', headerName: this.entitiesColumnName, field: 'entities'},
            {type: 'cardUidColumn', headerName: this.cardUidColumnName, field: 'cardUid'},
            {type: 'dataColumn', headerName: this.commentColumnName, field: 'comment'}
        ];

        this.gridApi.setColumnDefs(this.columnDefs);
    }

    updateResultPage(currentPage): void {
        this.gridApi.paginationGoToPage(currentPage - 1);
        this.page = currentPage;
    }

    getFormattedDateTime(epochDate: number):string {
        return this.dateTimeFormatter.getFormattedDateAndTimeFromEpochDate(epochDate);
    }
}