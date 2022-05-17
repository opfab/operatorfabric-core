/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component} from '@angular/core';
import {NgbModal, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';
import {TranslateService} from '@ngx-translate/core';
import {UserConfiguration} from '@ofModel/external-devices.model';
import {ExternalDevicesService} from '@ofServices/external-devices.service';
import {ColDef, GridOptions, ICellRendererParams} from 'ag-grid-community';
import {AppError} from 'app/common/error/app-error';
import {throwError} from 'rxjs';
import {ActionCellRendererComponent} from '../admin/components/cell-renderers/action-cell-renderer.component';
import {ConfirmationDialogService} from '../admin/services/confirmation-dialog.service';
import {ExternaldevicesconfigurationModalComponent} from './editModal/externaldevicesconfiguration-modal.component';

@Component({
  selector: 'of-externaldevices',
  templateUrl: './externaldevicesconfiguration.component.html',
  styleUrls: ['./externaldevicesconfiguration.component.scss']
})
export class ExternaldevicesconfigurationComponent {

  userConfigurations: UserConfiguration[];
  gridOptions: GridOptions;
  public gridApi;
  public pageSize = 10;
  public page = 1;
  private columnDefs: ColDef[] = [];
  editModalComponent = ExternaldevicesconfigurationModalComponent;
  modalOptions: NgbModalOptions = {
    backdrop: 'static', // Modal shouldn't close even if we click outside it
    size: 'lg'
  };
  i18NPrefix = 'externalDevicesConfiguration.';
  technicalError = false;

  constructor(private externalDevicesService: ExternalDevicesService,
              protected confirmationDialogService: ConfirmationDialogService,
              private translateService: TranslateService,
              protected modalService: NgbModal) {
    this.gridOptions = <GridOptions>{
      context: {
        componentParent: this
      },
      domLayout: 'autoHeight',
      defaultColDef : {
          editable: false,
          headerValueGetter: this.localizeHeader.bind(this)

      },
      components : {
        actionCellRenderer: ActionCellRendererComponent
      },
      pagination : true,
      suppressCellFocus: true,
      headerHeight: 70,
      suppressPaginationPanel: true,
      suppressHorizontalScroll: true,
      columnDefs: this.columnDefs,
      rowHeight: 45,
      columnTypes: {
        'dataColumn': {
          sortable: true,
          filter: true,
          wrapText: true,
          autoHeight: true,
          flex: 1,
        },
        'actionColumn': {
          field: '',
          sortable: false,
          filter: false,
          minWidth: 90,
          flex: 1,
          cellRenderer: 'actionCellRenderer',
        },
      },
      localeTextFunc : function (key) {
        // To avoid clashing with opfab assets, all keys defined by ag-grid are prefixed with "ag-grid."
        // e.g. key "to" defined by ag-grid for use with pagination can be found under "ag-grid.to" in assets
        return translateService.instant('ag-grid.' + key);
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


        this.columnDefs = [
            {type: 'dataColumn', headerName: 'userLogin', field: 'userLogin',   headerClass: 'opfab-ag-header-with-no-padding'},
            {type: 'dataColumn', headerName: 'externalDeviceIds', field: 'externalDeviceIds'},
            {type: 'actionColumn', headerName: 'edit', colId: 'edit'},
            {type: 'actionColumn', headerName: 'delete', colId: 'delete'},

        ];

        this.gridApi.setColumnDefs(this.columnDefs);
        this.refreshData();
  }

  updateResultPage(currentPage): void {
    this.gridApi.paginationGoToPage(currentPage - 1);
    this.page = currentPage;
  }

  refreshData() {
    this.externalDevicesService.queryAllUserConfigurations().subscribe(
        {
           next: (configurations) => {
              this.technicalError = false;
              this.userConfigurations = configurations;
           },
           error: () => {
             this.technicalError = true;
           }
        });
  }

  createNewItem() {
    const modalRef = this.modalService.open(this.editModalComponent, this.modalOptions);
    modalRef.componentInstance.configurations = this.userConfigurations;
    modalRef.result.then(
        // Hooking the refresh of the data to the closing of the modal seemed simpler than setting up
        // NGRX actions and effects for this sole purpose
        () => { // If modal is closed
          this.refreshData(); // This refreshes the data when the modal is closed after a change
        },
        () => {
          // If modal is dismissed (by clicking the "close" button, the top right cross icon
          // or clicking outside the modal, there is no need to refresh the data
        });
  }

  openActionModal(params) {
    // This method might be flagged as "unused" by IDEs, but it's actually called through the ActionCellRendererComponent
    const columnId = params.colDef.colId;

    if (columnId === 'edit') {
      const modalRef = this.modalService.open(this.editModalComponent, this.modalOptions);
      modalRef.componentInstance.row = params.data; // This passes the data from the edited row to the modal to initialize input values.

      modalRef.result.then(
          () => { // If modal is closed
            this.refreshData(); // This refreshes the data when the modal is closed after a change
          },
          () => {
            // If the modal is dismissed (by clicking the "close" button, the top right cross icon
            // or clicking outside the modal, there is no need to refresh the data
          });
    }

    if (columnId === 'delete') {
      this.openDeleteConfirmationDialog(params.data);
    }
  }

  openDeleteConfirmationDialog(row: any): any {
    this.confirmationDialogService.confirm(
        this.translateService.instant('externalDevicesConfiguration.input.confirm'),
        this.translateService.instant('externalDevicesConfiguration.input.confirmDelete') + ' ' + row['userLogin'] + '?',
        'OK',
        this.translateService.instant('admin.input.cancel')
    ).then((confirmed) => {
      if (confirmed) {
        // The data refresh is launched inside the subscribe to make sure that the deletion request has been (correctly)
        // handled first
        this.externalDevicesService.deleteByUserLogin(row['userLogin'])
            .subscribe(() => {
              this.refreshData();
            });
      }
    }).catch(() => throwError(() => new AppError(null)));
  }

}
