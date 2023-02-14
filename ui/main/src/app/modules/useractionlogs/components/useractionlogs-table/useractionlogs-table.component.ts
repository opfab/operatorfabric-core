/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 *  See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {UserActionLog} from "@ofModel/user-action-log.model";
import {ColDef, GridOptions} from "ag-grid-community";
import {EntitiesCellRendererComponent} from "./cell-renderers/entities-cell-renderer.component";
import moment from "moment";
import {NgbModalRef, NgbModalOptions, NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {Card, CardData} from "@ofModel/card.model";
import {CardService} from "app/business/services/card.service";


@Component({
    selector: 'of-useractionlogs-table',
    templateUrl: './useractionlogs-table.component.html'
})
export class UserActionLogsTableComponent {

    @Input() actions: UserActionLog[];
    @Input() totalElements: number;
    @Input() totalPages: number;
    @Input() page: number;

    @Output() pageChange = new EventEmitter<number>();

    // View card
    modalRef: NgbModalRef;
    @ViewChild('cardDetail') cardDetailTemplate: ElementRef;
    @ViewChild('cardLoadingInProgress') cardLoadingTemplate: ElementRef;

    // ag-grid configuration objects
    public gridOptions;
    public gridApi;
    private columnDefs: ColDef[] = [];

    private dateColumnName: string;
    private actionColumnName: string;
    private loginColumnName: string;
    private entitiesColumnName: string;
    private cardUidColumnName: string;
    private commentColumnName: string;

    cardLoadingInProgress = false;
    cardLoadingIsTakingMoreThanOneSecond = false;
    selectedCard: Card;
    selectedChildCards: Card[];

    constructor( private translate: TranslateService,
        private cardService: CardService,
        private modalService: NgbModal) {

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
            components: {
                entitiesCellRenderer: EntitiesCellRendererComponent
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
            getRowStyle:  function (params) {
                if (params.data.cardUid !== null) {
                    return {'cursor': 'pointer'}
                }
                return null;
            },
            columnTypes: {
                timeColumn: {
                    sortable: false,
                    filter: false,
                    wrapText: false,
                    autoHeight: false,
                    width: 180,
                    valueGetter: params => {
                        return this.getFormattedDateTime(params.data.date);
                    }
                },
                dataColumn: {
                    sortable: false,
                    filter: false,
                    wrapText: false,
                    autoHeight: false,
                    width: 190,
                    resizable: false
                },
                entitiesColumn: {
                    sortable: false,
                    filter: false,
                    wrapText: true,
                    autoHeight: true,
                    flex: 3,
                    resizable: false
                },
                cardUidColumn: {
                    sortable: false,
                    filter: false,
                    wrapText: false,
                    autoHeight: false,
                    flex: 2,
                    resizable: false
                },
                commentColumn: {
                    sortable: false,
                    filter: false,
                    wrapText: false,
                    autoHeight: false,
                    flex: 1,
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

        this.columnDefs = [
            {type: 'timeColumn', headerName: this.dateColumnName, field: 'date'},
            {type: 'dataColumn', headerName: this.actionColumnName, field: 'action'},
            {type: 'dataColumn', headerName: this.loginColumnName, field: 'login'},
            {type: 'entitiesColumn', headerName: this.entitiesColumnName, field: 'entities', cellRenderer: 'entitiesCellRenderer'},
            {type: 'cardUidColumn', headerName: this.cardUidColumnName, field: 'cardUid'},
            {type: 'commentColumn', headerName: this.commentColumnName, field: 'comment'}
        ];

        this.gridApi.setColumnDefs(this.columnDefs);
    }

    updateResultPage(currentPage): void {
        this.pageChange.emit(currentPage);
    }

    getFormattedDateTime(epochDate: number):string {
        return moment(epochDate).format('HH:mm:ss DD/MM/YYYY');
    }

    selectRow(action: UserActionLog) {
        if (action.cardUid) this.openCardDetail(action.cardUid);
    }

    private openCardDetail(cardId: string) {
        this.cardLoadingInProgress = true;
        if (!this.cardLoadingIsTakingMoreThanOneSecond) this.checkForCardLoadingInProgressForMoreThanOneSecond();
        this.cardService.loadArchivedCard(cardId).subscribe((card: CardData) => {
            if (card.card.initialParentCardUid)
                this.openCardDetail(card.card.initialParentCardUid);
            else {
                this.selectedCard = card.card;
                this.selectedChildCards = card.childCards;

                const options: NgbModalOptions = {
                    size: 'fullscreen'
                };
                if (!!this.modalRef) this.modalRef.close();
                this.modalRef = this.modalService.open(this.cardDetailTemplate, options);
                this.cardLoadingInProgress = false;
                this.cardLoadingIsTakingMoreThanOneSecond = false;
            }

        });

    }

    // we show a spinner on screen if archives loading takes more than 1 second
    private checkForCardLoadingInProgressForMoreThanOneSecond() {
        setTimeout(() => {
            this.cardLoadingIsTakingMoreThanOneSecond = this.cardLoadingInProgress;
            if (this.cardLoadingIsTakingMoreThanOneSecond) {
                const modalOptions: NgbModalOptions = {
                    centered: true,
                    backdrop: 'static', // Modal shouldn't close even if we click outside it
                    size: 'sm'
                };
                this.modalRef = this.modalService.open(this.cardLoadingTemplate, modalOptions);
            }
        }, 1000);
    }
}