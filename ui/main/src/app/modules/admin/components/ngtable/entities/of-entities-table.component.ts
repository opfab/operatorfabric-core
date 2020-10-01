/* Copyright (c) 2018-2020, RTEI (http://www.rte-international.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { EntitiesService } from '@ofServices/entities.service';
import { AppState } from '@ofStore/index';
import { AppError } from 'app/common/error/app-error';
import { ConfirmationDialogService } from 'app/modules/admin/services/confirmation-dialog.service';
import { DataTableShareService } from 'app/modules/admin/services/data.service';
import { Observable, throwError } from 'rxjs';
import { EditEntityGroupModalComponent } from '../../editmodal/groups-entities/edit-entity-group-modal.component';
import { OfTableComponent } from '../oftable/oftable.component';

@Component({
  selector: 'of-entities-table',
  templateUrl: '../oftable/oftable.component.html'
})
export class OfEntitiesTableComponent extends OfTableComponent implements OnInit {

  modalComponent = EditEntityGroupModalComponent;
  typeModal = 'entity';
  constructor(
    protected crudService: EntitiesService,
    protected modalService: NgbModal,
    protected dataService: DataTableShareService,
    protected translate: TranslateService,
    private confirmationDialogService: ConfirmationDialogService,
    protected store: Store<AppState>
  ) {
    super(modalService, dataService, store);
    this.crudService = crudService;
    this.config.sorting = { columns: this.columns };
    this.getLocale().subscribe(locale => {
      this.translate.use(locale);
      this.translate.get(['admin.input.id.label', 'admin.input.name.label', 'admin.input.description',
        'admin.input.user.edit', 'admin.input.user.delete', 'admin.input.user.filter', 'admin.pagination.firstText',
        'admin.pagination.lastText', 'admin.pagination.nextText', 'admin.pagination.prevText'
        , 'admin.input.entity.add', 'admin.input.lines', 'admin.input.user.filter', 'admin.input.user.filterAll'])
        .subscribe(translations => {
          this.columns = [
            {
              title: translations['admin.input.id.label'],
              name: 'id',
              filtering: {
                filterString: '', placeholder: translations['admin.input.user.filter'] +
                  translations['admin.input.id.label']
              },
            },
            {
              title: translations['admin.input.name.label'],
              name: 'name',
              filtering: {
                filterString: '', placeholder: translations['admin.input.user.filter'] +
                  translations['admin.input.name.label']
              },
            },
            {
              title: translations['admin.input.description'],
              name: 'description',
              filtering: {
                filterString: '', placeholder: translations['admin.input.user.filter'] +
                  translations['admin.input.description']
              }
            },
            {
              title: translations['admin.input.user.edit'],
              name: 'edit'
            },
            {
              title: translations['admin.input.user.delete'],
              name: 'delete'
            }
          ];
          this.firstText = translations['admin.pagination.firstText'];
          this.lastText = translations['admin.pagination.lastText'];
          this.nextText = translations['admin.pagination.nextText'];
          this.prevText = translations['admin.pagination.prevText'];
          this.addLabel = translations['admin.input.entity.add'];
          this.lineLabel = translations['admin.input.lines'];
          this.filterAll = translations['admin.input.user.filterAll'];

        });
    });
  }


  openDeleteConfirmationDialog(row: any): any {
    this.confirmationDialogService.confirm(
      this.translate.instant('admin.input.user.confirm'),
      this.translate.instant('admin.input.entity.delete') + ' ' + row.id + '?',
      'OK',
      this.translate.instant('admin.input.user.cancel')
    ).then((confirmed) => {
      if (confirmed) {
        this.deleteItem(row.id, 'id');
      }
    }).catch(() => throwError(new AppError(null)));
  }

  getObservableRow(): Observable<any> {
    return this.dataService.getEntityRowEvent();
  }


}
