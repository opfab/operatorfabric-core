/*
 * Copyright (c) 2021-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ChangeDetectorRef, Directive, Injectable, OnDestroy} from '@angular/core';
import {ColDef, GridOptions, ICellRendererParams, ValueFormatterParams} from 'ag-grid-community';
import {TranslateService} from '@ngx-translate/core';
import {NgbModal, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';
import {Subject} from 'rxjs';
import {CrudService} from 'app/business/services/admin/crud-service';
import {ActionButton, ActionCellRendererComponent} from '../cell-renderers/action-cell-renderer.component';
import {AdminItemType, SharingService} from '../../services/sharing.service';
import {takeUntil} from 'rxjs/operators';
import {StateRightsCellRendererComponent} from '../cell-renderers/state-rights-cell-renderer.component';
import {RoleCellRendererComponent} from '../cell-renderers/role-cell-renderer.component';
import {ProcessesService} from '@ofServices/processes/ProcessesService';
import {Process} from '@ofServices/processes/model/Processes';
import {GroupsService} from '@ofServices/groups/GroupsService';
import {Group} from '@ofServices/groups/model/Group';
import {Entity} from '@ofServices/entities/model/Entity';
import {ExcelExport} from 'app/business/common/excel-export';
import {saveAs} from 'file-saver-es';
import {BusinessDataService} from '@ofServices/businessdata/businessdata.service';
import {EntitiesService} from '@ofServices/entities/EntitiesService';
import {PermissionEnum} from '@ofServices/groups/model/PermissionEnum';
import {UserService} from 'app/business/services/users/user.service';
import {ModalService} from 'app/business/services/modal.service';
import {I18n} from '@ofModel/i18n.model';
import {IdCellRendererComponent} from '../cell-renderers/id-cell-renderer.component';

export class ActionColumn {
    colId: any;
    type: any;
    headerClass: any;
    cellStyle: any;
    maxWidth: any;
    cellClassRules: any;
    constructor(colId: string) {
        this.colId = colId;
        this.type = 'actionColumn';
        this.headerClass = 'action-cell-column-header';
        this.cellStyle = {'padding-left': '0', 'padding-right': '0'};
        this.maxWidth = 50;
    }
}

@Directive()
@Injectable()
export abstract class AdminTableDirective implements OnDestroy {
    actionButtonsDisplayed: any;
    showAddButton = true;
    processesDefinition: Process[];
    groupsDefinition: Group[];
    entitiesDefinition: Entity[];

    unsubscribe$: Subject<void> = new Subject<void>();

    // These fields will be initialized in the concrete classes extending `AdminTableDirective`
    // (e.g. EntitiesTableComponent) as they depend on the type of the table
    /** Modal component to open when editing an item from the table (e.g. `EditEntityGroupModal`) */
    public editModalComponent;

    /** Type of data managed by the table (e.g. `AdminItemType.ENTITY`) */
    protected tableType: AdminItemType;
    /** Relevant fields for this data type. They will be used to populate the table columns */
    protected fields: Field[];
    /** Among these fields, which one represents an item's unique id (e.g. `id`) */
    protected idField: string;

    // ag-grid configuration objects
    public gridOptions;
    public gridApi;
    public rowData: any[];
    public page = 1;

    ADMIN_PERMISSION: PermissionEnum = PermissionEnum.ADMIN;
    BUSINESS_PROCESS_PERMISSION: PermissionEnum = PermissionEnum.ADMIN_BUSINESS_PROCESS;

    protected static defaultEditionModalOptions: NgbModalOptions = {
        backdrop: 'static', // Modal shouldn't close even if we click outside it
        size: 'lg'
    };
    /** Default modal options can be added to or overridden using this property in the xxx-table components extending the directive. */
    public modalOptions: NgbModalOptions = AdminTableDirective.defaultEditionModalOptions;

    protected i18NPrefix = 'admin.input.';
    protected crudService: CrudService;
    private readonly currentUserLogin;

    constructor(
        protected translateService: TranslateService,
        protected modalService: NgbModal,
        protected dataHandlingService: SharingService,
        private readonly changeDetector: ChangeDetectorRef
    ) {
        this.currentUserLogin = UserService.getCurrentUserWithPerimeters().userData.login;
        this.processesDefinition = ProcessesService.getAllProcesses();
        this.gridOptions = <GridOptions>{
            context: {
                componentParent: this
            },
            components: {
                actionCellRenderer: ActionCellRendererComponent,
                idCellRenderer: IdCellRendererComponent,
                stateRightsCellRenderer: StateRightsCellRendererComponent,
                roleCellRenderer: RoleCellRendererComponent
            },
            domLayout: 'autoHeight',
            rowHeight: 50,
            defaultColDef: {
                editable: false,
                headerValueGetter: this.localizeHeader.bind(this)
            },
            columnTypes: {
                actionColumn: {
                    field: '',
                    sortable: false,
                    filter: false,
                    minWidth: 90,
                    flex: 1,
                    cellRenderer: 'actionCellRenderer'
                },
                dataColumn: {
                    sortable: true,
                    filter: true,
                    wrapText: true,
                    autoHeight: true,
                    maxWidth: 400,
                    flex: 4
                }
            },
            getLocaleText: function (params) {
                // To avoid clashing with opfab assets, all keys defined by ag-grid are prefixed with "ag-grid."
                // e.g. key "to" defined by ag-grid for use with pagination can be found under "ag-grid.to" in assets
                return translateService.instant('ag-grid.' + params.key);
            },
            pagination: true,
            suppressCellFocus: true,
            headerHeight: 70,
            suppressPaginationPanel: true,
            suppressHorizontalScroll: true,
            popupParent: document.querySelector('body')
        };
    }

    initCrudService() {
        this.crudService = this.dataHandlingService.resolveCrudServiceDependingOnType(this.tableType);
    }

    public localizeHeader(parameters: ICellRendererParams): string {
        const headerIdentifier = parameters.colDef.headerName;
        return this.translateService.instant(this.i18NPrefix + headerIdentifier);
    }

    onFilterChanged(event) {
        this.page = 1;
        this.gridApi.paginationGoToPage(0);
    }

    onGridReady(params) {
        this.gridApi = params.api;
        // Column definitions can't be managed in the constructor like the other grid options because they rely on the `fields`
        // property that is defined in the classes implementing AdminTableDirective. As such, it is still undefined when the
        // constructor from the supertype is called.
        this.gridApi.setGridOption('columnDefs', this.createColumnDefs(this.fields, this.tableType + '.'));
        this.dataHandlingService.paginationPageSize$.pipe(takeUntil(this.unsubscribe$)).subscribe((pageSize) => {
            this.gridApi.setGridOption('paginationPageSize', pageSize);
        });
        this.groupsDefinition = GroupsService.getGroups();
        this.entitiesDefinition = EntitiesService.getEntities();
        this.refreshData();
    }

    /** This function generates the ag-grid `ColumnDefs` for the grid from a list of fields
     * @param fields: string[] containing the name of the fields to display as columns in the table. They should match the
     * name of the fields returned by the API for the type in question.
     * @param i18nPrefixForHeader: optional prefix to add to the field name to create the relevant i18nKey
     * @return ColDef[] object containing the column definitions for the grid
     * */
    createColumnDefs(fields: Field[], i18nPrefixForHeader?: string): ColDef[] {
        // if provided, i18nPrefixForHeader should have trailing dot

        // Create data columns from fields
        const columnDefs: ColDef[] = new Array(fields.length);

        fields.forEach((field: Field, index: number) => {
            const columnDef = {
                type: field.type,
                headerName: i18nPrefixForHeader + field.name,
                field: field.name
            };
            if (field.flex) columnDef['flex'] = field.flex;
            if (field.cellRendererName) columnDef['cellRenderer'] = field.cellRendererName;
            if (field.valueFormatter) {
                columnDef['valueFormatter'] = field.valueFormatter;
            }
            columnDefs[index] = columnDef;
        });

        const deleteActionCellClassRules = {
            'action-cell-delete-admin': (params) =>
                params.context.componentParent.tableType === AdminItemType.USER &&
                params.data.login.toLowerCase() === this.currentUserLogin
        };

        // Add action columns
        const edit_col = new ActionColumn('edit');
        const delete_col = new ActionColumn('delete');
        delete_col.cellClassRules = deleteActionCellClassRules;
        const update_col = new ActionColumn('update');
        const download_col = new ActionColumn('download');

        this.actionButtonsDisplayed.forEach((actionButton) => {
            switch (actionButton) {
                case ActionButton.UPDATE:
                    columnDefs.push(update_col);
                    break;
                case ActionButton.DOWNLOAD:
                    columnDefs.push(download_col);
                    break;

                case ActionButton.DELETE:
                    columnDefs.push(delete_col);
                    break;
                case ActionButton.EDIT:
                    columnDefs.push(edit_col);
                    break;
                default:
                    return;
            }
        });

        return columnDefs;
    }

    translateValue(params: ValueFormatterParams): string {
        return params.context.componentParent.translateService.instant(
            params.context.componentParent.i18NPrefix + params.context.componentParent.tableType + '.' + params.value
        );
    }

    openActionModal(params) {
        // This method might be flagged as "unused" by IDEs, but it's actually called through the ActionCellRendererComponent
        const columnId = params.colDef.colId;
        if (columnId === 'edit') {
            const modalRef = this.modalService.open(this.editModalComponent, this.modalOptions);
            modalRef.componentInstance.type = this.tableType;
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
        if (columnId === 'download') {
            const fileName = params.data[this.idField];
            BusinessDataService.getBusinessData(fileName).then((resource) => {
                const fileToSave = new Blob([JSON.stringify(resource, undefined, 2)], {
                    type: 'application/json;charset=UTF-8'
                });
                saveAs(fileToSave, fileName);
            });
        }
        if (columnId === 'update') {
            this.updateItem();
        }
    }
    openDeleteConfirmationDialog(row: any): any {
        const confirmDeleteMessage = `${this.translateService.instant('admin.input.' + this.tableType + '.confirmDelete')} ${row[this.idField]} ?`;

        ModalService.openConfirmationModal(new I18n('userCard.deleteCard.title'), confirmDeleteMessage).then(
            (confirmed) => {
                if (confirmed) {
                    // The data refresh is launched inside the subscribe to make sure that the deletion request has been (correctly)
                    // handled first
                    this.crudService.deleteById(row[this.idField]).subscribe(() => {
                        this.refreshData();
                    });
                }
            }
        );
    }

    createNewItem(): void {
        if (this.tableType === AdminItemType.BUSINESSDATA) {
            document.getElementById('fileUploader').click();
        } else {
            const modalRef = this.modalService.open(this.editModalComponent, this.modalOptions);
            modalRef.componentInstance.type = this.tableType;
            modalRef.result.then(
                // Hooking the refresh of the data to the closing of the modal seemed simpler than setting up
                // NGRX actions and effects for this sole purpose
                () => {
                    // If modal is closed
                    this.refreshData(); // This refreshes the data when the modal is closed after a change
                    // Data creation doesn't need to be propagated to the user table
                },
                () => {
                    // If modal is dismissed (by clicking the "close" button, the top right cross icon
                    // or clicking outside the modal, there is no need to refresh the data
                }
            );
        }
    }

    updateItem(): void {
        document.getElementById('fileUpdater').click();
    }

    onFileSelected(event) {
        const file: File = event.target.files[0];
        if (file) {
            this.uploadFile(file);
        }
    }

    uploadFile(file: File, resourceName?: string) {
        const read = new FileReader();
        const formData = new FormData();
        formData.append('file', file);
        read.readAsBinaryString(file);
        let fileName = file.name;

        if (resourceName !== undefined) {
            fileName = resourceName;
        }

        read.onload = (e) => {
            BusinessDataService.updateBusinessData(fileName, formData).subscribe(() => {
                this.refreshData();
            });
        };
    }

    refreshData() {
        this.crudService.getAll().subscribe((result) => {
            this.rowData = result;

            // if the total number of pages is lower than the index of the current page, it means that we have returned to the
            // previous page
            if (this.gridApi.paginationGetTotalPages() < this.page) this.page--;
            this.gridApi.paginationGoToPage(this.page - 1);
            this.gridApi.redrawRows();
            this.changeDetector.markForCheck();
        });
    }

    updateResultPage(currentPage): void {
        this.gridApi.paginationGoToPage(currentPage - 1);
        this.page = currentPage;
    }

    export(): void {
        ExcelExport.exportJsonToExcelFile(this.getDataForExportFile(), this.tableType);
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    private getDataForExportFile(): Array<any> {
        const exportData = [];
        this.gridApi.forEachNode((line) => {
            if (line) {
                const item = {};
                this.fields.forEach((field) => {
                    if (Array.isArray(line.data[field.name]))
                        item[this.getTranslatedHeaderName(field.name)] = this.arrayToString(
                            line.data[field.name],
                            field.cellRendererName,
                            line.data
                        );
                    else
                        item[this.getTranslatedHeaderName(field.name)] =
                            field.valueFormatter && field.valueFormatter.name === 'translateValue'
                                ? this.translateService.instant(
                                      this.i18NPrefix + this.tableType + '.' + line.data[field.name]
                                  )
                                : line.data[field.name];
                });
                exportData.push(item);
            }
        });
        return exportData;
    }

    private getTranslatedHeaderName(header: string): string {
        return this.translateService.instant(this.i18NPrefix + this.tableType + '.' + header).toUpperCase();
    }

    private arrayToString(arr: any, renderer: string, data: any): string {
        if (arr.length === 0) return '';
        if (this.isStringArray(arr))
            return arr
                .map((element) => this.getNameFromId(element, renderer))
                .sort()
                .join();
        else return this.removeSquareBraketsInArrayAsString(this.objectArrayToString(arr, renderer, data));
    }

    private isStringArray(arr): boolean {
        return arr.every((value) => {
            return typeof value === 'string';
        });
    }

    private getNameFromId(id: string, renderer: string): string {
        if (renderer) {
            const cellRenderer = new this.gridOptions.components[renderer].prototype.constructor();
            if (cellRenderer.itemType) {
                const found = this.dataHandlingService
                    .resolveCrudServiceDependingOnType(cellRenderer.itemType)
                    .getCachedValues()
                    .find((e) => e.id === id);
                return found?.name ? found.name : id;
            }
        }
        return id;
    }

    // Method to be overridden by extending classes to customize objects to string conversion
    objectArrayToString(arr: any, renderer: string, data: any): string {
        return JSON.stringify(arr);
    }

    removeSquareBraketsInArrayAsString(arrayAsString: string): string {
        if (arrayAsString.length > 1) {
            arrayAsString = arrayAsString.substring(1, arrayAsString.length - 1);
        }
        return arrayAsString;
    }

    hasAnyPermission(permissions: PermissionEnum[]) {
        return UserService.hasCurrentUserAnyPermission(permissions);
    }
}

export class Field {
    public name: string;
    public flex: number;
    public cellRendererName: string;
    public valueFormatter: any;
    public type: string;

    /**@param name: should match the property name in the underlying row data. Will be used as key to find i18n label for the column header.
   @param flex: Sets the column size relative to others
   @param cellRendererName: needs to match one of the renderers defined under `components` in the `gridOptions` above.
   * */
    constructor(
        name: string,
        flex?: number,
        cellRendererName?: string,
        valueFormatter?: any,
        type: string = 'dataColumn'
    ) {
        this.name = name;
        this.flex = flex;
        this.cellRendererName = cellRendererName;
        this.valueFormatter = valueFormatter;
        this.type = type;
    }
}
