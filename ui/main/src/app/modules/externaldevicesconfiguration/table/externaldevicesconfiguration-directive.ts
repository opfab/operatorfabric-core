/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Directive, Injectable} from '@angular/core';
import {NgbModal, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';
import {TranslateService} from '@ngx-translate/core';
import {MessageLevel} from '@ofModel/message.model';
import {AlertMessageService} from 'app/business/services/alert-message.service';
import {ExternalDevicesService} from 'app/business/services/notifications/external-devices.service';
import {ColDef, GridOptions, ICellRendererParams} from 'ag-grid-community';
import {CheckboxCellRendererComponent} from 'app/modules/admin/components/cell-renderers/checkbox-cell-renderer.component';
import {Observable, throwError} from 'rxjs';
import {ActionCellRendererComponent} from '../../admin/components/cell-renderers/action-cell-renderer.component';
import {ConfirmationDialogService} from '../../admin/services/confirmation-dialog.service';
import {ExternaldevicesconfigurationModalComponent} from '../editModal/externaldevicesconfiguration-modal.component';
import {ExternaldevicesModalComponent} from '../editModal/externaldevices-modal.component';

@Directive()
@Injectable()
export abstract class ExternalDevicesConfigurationDirective {
    configurations: any[];
    gridOptions: GridOptions;
    public gridApi;
    public pageSize = 10;
    public page = 1;
    private columnDefs: ColDef[] = [];
    addDeviceModalComponent = ExternaldevicesModalComponent;
    editModalComponent = ExternaldevicesconfigurationModalComponent;
    modalOptions: NgbModalOptions = {
        backdrop: 'static', // Modal shouldn't close even if we click outside it
        size: 'lg'
    };
    i18NPrefix = 'externalDevicesConfiguration.';
    technicalError = false;

    protected fields: Field[];
    protected canAddItems: boolean;
    private isLoadingData = true;

    constructor(
        protected confirmationDialogService: ConfirmationDialogService,
        protected translateService: TranslateService,
        protected modalService: NgbModal
    ) {
        this.gridOptions = <GridOptions>{
            context: {
                componentParent: this
            },
            domLayout: 'autoHeight',
            defaultColDef: {
                editable: false,
                headerValueGetter: this.localizeHeader.bind(this)
            },
            components: {
                actionCellRenderer: ActionCellRendererComponent,
                checkboxCellRenderer: CheckboxCellRendererComponent
            },
            pagination: true,
            suppressCellFocus: true,
            headerHeight: 70,
            suppressPaginationPanel: true,
            suppressHorizontalScroll: true,
            columnDefs: this.columnDefs,
            rowHeight: 45,
            columnTypes: {
                dataColumn: {
                    sortable: true,
                    filter: true,
                    wrapText: true,
                    autoHeight: true,
                    flex: 1,
                    resizable: false
                },
                actionColumn: {
                    field: '',
                    sortable: false,
                    filter: false,
                    minWidth: 90,
                    flex: 1,
                    cellRenderer: 'actionCellRenderer',
                    resizable: false
                },
                checkboxColumn: {
                    field: '',
                    sortable: false,
                    filter: false,
                    minWidth: 90,
                    flex: 1,
                    cellRenderer: 'checkboxCellRenderer',
                    resizable: false
                }
            },
            getLocaleText: function (params) {
                // To avoid clashing with opfab assets, all keys defined by ag-grid are prefixed with "ag-grid."
                // e.g. key "to" defined by ag-grid for use with pagination can be found under "ag-grid.to" in assets
                return translateService.instant('ag-grid.' + params.key);
                // Not this.translateService otherwise "undefined" error
            },
            popupParent: document.querySelector('body')
        };
    }

    public localizeHeader(parameters: ICellRendererParams): string {
        const headerIdentifier = parameters.colDef.headerName;
        return this.translateService.instant(this.i18NPrefix + headerIdentifier);
    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.gridApi.paginationSetPageSize(this.pageSize);

        this.gridApi.setColumnDefs(this.createColumnDefs(this.fields));

        this.refreshData();
    }

    /** This function generates the ag-grid `ColumnDefs` for the grid from a list of fields
     * @param fields: string[] containing the name of the fields to display as columns in the table. They should match the
     * name of the fields returned by the API for the type in question.
     * @return ColDef[] object containing the column definitions for the grid
     * */
    createColumnDefs(fields: Field[]): ColDef[] {
        // Create data columns from fields
        const columnDefs = new Array(fields.length);

        fields.forEach((field: Field, index: number) => {
            const columnDef = {
                type: field.type,
                headerName: field.name,
                field: field.name,
                colId: field.name
            };

            columnDefs[index] = columnDef;
        });

        return columnDefs;
    }

    updateResultPage(currentPage): void {
        this.refreshData();
        this.gridApi.paginationGoToPage(currentPage - 1);
        this.page = currentPage;
    }

    refreshData() {
        this.isLoadingData = true;
        this.queryData().subscribe({
            next: (configurations) => {
                this.technicalError = false;
                this.configurations = configurations;
                this.isLoadingData = false;
            },
            error: () => {
                this.technicalError = true;
                this.isLoadingData = false;
            }
        });
    }

    abstract queryData(): Observable<any[]>;

    createNewItem() {
        const modalRef = this.modalService.open(this.editModalComponent, this.modalOptions);
        modalRef.componentInstance.configurations = this.configurations;
        modalRef.result.then(
            // Hooking the refresh of the data to the closing of the modal seemed simpler than setting up
            // NGRX actions and effects for this sole purpose
            () => {
                // If modal is closed
                this.refreshData(); // This refreshes the data when the modal is closed after a change
            },
            () => {
                // If modal is dismissed (by clicking the "close" button, the top right cross icon
                // or clicking outside the modal, there is no need to refresh the data
            }
        );
    }

    openActionModal(params) {
        // This method might be flagged as "unused" by IDEs, but it's actually called through the ActionCellRendererComponent
        const columnId = params.colDef.colId;

        if (columnId === 'edit') {
            const modalRef = this.modalService.open(this.editModalComponent, this.modalOptions);
            modalRef.componentInstance.row = params.data; // This passes the data from the edited row to the modal to initialize input values.

            modalRef.result.then(
                () => {
                    // If modal is closed
                    this.refreshData(); // This refreshes the data when the modal is closed after a change
                },
                () => {
                    // If the modal is dismissed (by clicking the "close" button, the top right cross icon
                    // or clicking outside the modal, there is no need to refresh the data
                }
            );
        }

        if (columnId === 'delete') {
            this.openDeleteConfirmationDialog(params.data);
        }
    }

    openDeleteConfirmationDialog(row: any): any {
        this.confirmationDialogService
            .confirm(
                this.translateService.instant('externalDevicesConfiguration.input.confirm'),
                this.translateService.instant('externalDevicesConfiguration.input.confirmDelete') +
                    ' ' +
                    row['userLogin'] +
                    ' ?',
                'OK',
                this.translateService.instant('admin.input.cancel')
            )
            .then((confirmed) => {
                if (confirmed) {
                    // The data refresh is launched inside the subscribe to make sure that the deletion request has been (correctly)
                    // handled first
                    ExternalDevicesService.deleteByUserLogin(row['userLogin']).subscribe(() => {
                        this.refreshData();
                    });
                }
            })
            .catch((error) => throwError(() => error));
    }

    protected displayMessage(i18nKey: string, msg: string, severity: MessageLevel = MessageLevel.ERROR) {
        AlertMessageService.sendAlertMessage({message: msg, level: severity, i18n: {key: i18nKey}});
    }
}

export class Field {
    public name: string;
    public type: string;

    /**
     * @param name: should match the property name in the underlying row data. Will be used as key to find i18n label for the column header.
     * @param fieldType: the type of the input in the ag grid
     **/
    constructor(name: string, fieldType: FieldType = FieldType.DATA_COLUMN) {
        this.name = name;
        this.type = fieldType;
    }
}

export enum FieldType {
    DATA_COLUMN = 'dataColumn',
    ACTION_COLUMN = 'actionColumn',
    CHECKBOX_COLUMN = 'checkboxColumn'
}
