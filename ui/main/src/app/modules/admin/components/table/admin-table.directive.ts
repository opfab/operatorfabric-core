/*
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Directive, Injectable, Input, OnChanges, OnInit} from '@angular/core';
import {ColDef, GridOptions, ICellRendererParams} from 'ag-grid-community';
import {TranslateService} from '@ngx-translate/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {throwError} from 'rxjs';
import {ConfirmationDialogService} from '../../services/confirmation-dialog.service';
import {ActionCellRendererComponent} from './action-cell-renderer.component';
import {AppError} from '../../../../common/error/app-error';
import {CrudService} from '@ofServices/crud-service';

@Directive()
@Injectable()
export abstract class AdminTableDirective implements OnInit, OnChanges {

  // These fields will be initialized in the concrete classes extending `AdminTableDirective`
  // (e.g. EntitiesTableComponent) as they depend on the type of the table
  /** Modal component to open when editing an item from the table (e.g. `EditEntityGroupModal`) */
  public editModalComponent;
  /** Type of data managed by the table (e.g. `AdminTableType.ENTITY`) */
  protected tableType: AdminTableType;
  /** Relevant fields for this data type. They will be used to populate the table columns */
  protected fields: string[];
  /** Among these fields, which one represents an item's unique id (e.g. `id`) */
  protected idField: string;

  // ag-grid configuration objects
  public gridOptions;
  public gridApi;
  public rowData: any;

  @Input()
  public paginationPageSize;

  protected i18NPrefix = 'admin.input.';

  constructor(
      protected translateService: TranslateService,
      protected confirmationDialogService: ConfirmationDialogService,
      protected modalService: NgbModal,
      protected crudService: CrudService) {

    this.gridOptions = <GridOptions>{
      context: {
        componentParent: this
      },
      frameworkComponents : {
        actionCellRenderer: ActionCellRendererComponent
      },
      domLayout: 'autoHeight',
      defaultColDef : {
        editable: false,
        headerValueGetter: this.localizeHeader.bind(this)
      },
      columnTypes: {
        'actionColumn': {
          field: '',
          sortable: false,
          filter: false,
          minWidth: 90,
          flex: 1,
          cellRenderer: 'actionCellRenderer',
        },
        'dataColumn': {
          sortable: true,
          filter: true,
          flex: 3

        }
      },
      localeTextFunc : function (key) {
        // To avoid clashing with opfab assets, all keys defined by ag-grid are prefixed with "ag-grid."
        // e.g. key "to" defined by ag-grid for use with pagination can be found under "ag-grid.to" in assets
        return translateService.instant('ag-grid.' + key);
        // Not this.translateService otherwise "undefined" error
      },
      pagination : true,
      suppressCellSelection: true
    };
    // Defining a custom cellRenderer was necessary (instead of using onCellClicked & an inline cellRenderer) because of
    // the need to call a method from the parent component
  }

  ngOnInit() {
    this.refreshData();
  }

  ngOnChanges() {
    if (!!this.gridApi) this.gridApi.paginationSetPageSize(this.paginationPageSize);
  }

  public localizeHeader(parameters: ICellRendererParams): string {
    const headerIdentifier = parameters.colDef.headerName;
    return this.translateService.instant(this.i18NPrefix + headerIdentifier);
  }

  onGridReady(params) {
    this.gridApi = params.api;
    // Column definitions can't be managed in the constructor like the other grid options because they rely on the `fields`
    // property that is defined in the classes implementing AdminTableDirective. As such, it is still undefined when the
    // constructor from the supertype is called.
    this.gridApi.setColumnDefs(this.createColumnDefs(this.fields, this.tableType + '.'));
    this.gridApi.paginationSetPageSize(this.paginationPageSize);
  }

  /** This function generates the ag-grid `ColumnDefs` for the grid from a list of fields
   * @param fields: string[] containing the name of the fields to display as columns in the table. They should match the
   * name of the fields returned by the API for the type in question.
   * @param i18nPrefixForHeader: optional prefix to add to the field name to create the relevant i18nKey
   * @return ColDef[] object containing the column definitions for the grid
   * */
  createColumnDefs(fields: string[], i18nPrefixForHeader?: string): ColDef[] {
    // if provided, i18nPrefixForHeader should have trailing dot

    // Create data columns from fields
    let columnDefs: ColDef[];
    columnDefs = new Array(fields.length + 2); // +2 because 2 action columns (see below)

    fields.forEach((field: string, index: number) => {
      columnDefs[index] = { headerName: i18nPrefixForHeader + field, field: field, type: 'dataColumn'};
    });

    // Add action columns
    columnDefs[fields.length] = {
      headerName: 'edit',
      colId: 'edit',
      type: 'actionColumn'
    };
    columnDefs[fields.length + 1] = {
      headerName: 'delete',
      colId: 'delete',
      type: 'actionColumn'
    };

    return columnDefs;
  }

  openActionModal(params) {
    // This method might be flagged as "unused" by IDEs but it's actually called through the ActionCellRendererComponent
    const columnId = params.colDef.colId;
    if (columnId === 'edit') {
      const modalRef = this.modalService.open(this.editModalComponent);
      modalRef.componentInstance.type = this.tableType;
      modalRef.componentInstance.row = params.data; // This passes the data from the edited row to the modal to initialize input values.
      modalRef.result.then(
          (result: any) => {
            this.refreshData(); // This refreshes the data when the modal is closed after a change
          },
          (reason: any) => { }); // If the modal is dismissed (by clicking the "close" button, the top right cross icon
      // or clicking outside the modal, there is no need to refresh the data
    }
    if (columnId === 'delete') {
      this.openDeleteConfirmationDialog(params.data);
    }

  }

  openDeleteConfirmationDialog(row: any): any {
    this.confirmationDialogService.confirm(
        this.translateService.instant('admin.input.confirm'),
        this.translateService.instant('admin.input.' + this.tableType + '.confirmDelete') + ' ' + row[this.idField] + '?',
        'OK', // TODO Refactor to avoid translate.instant ? OK is not i18ed ?
        this.translateService.instant('admin.input.cancel')
    ).then((confirmed) => {
      if (confirmed) {
        // The data refresh is launched inside the subscribe to make sure that the deletion request has been (correctly)
        // handled first
        this.crudService.deleteById(row[this.idField]).subscribe(x => this.refreshData()); // TODO unsubscribe on destroy?
      }
    }).catch(() => throwError(new AppError(null)));
  }

  createNewItem(): void {
    const modalRef = this.modalService.open(this.editModalComponent);
    modalRef.componentInstance.type = this.tableType;
    modalRef.result.then(
        // Hooking the refresh of the data to the closing of the modal seemed simpler than setting up
        // NGRX actions and effects for this sole purpose
        (result: any) => {
          this.refreshData();
        },
        (reason: any) => { });
  }

  refreshData() {
    this.rowData = this.crudService.getAll();
  }

}

export enum AdminTableType {
  USER = 'user', ENTITY = 'entity', GROUP = 'group'
}

