/* Copyright (c) 2018-2020, RTEI (http://www.rte-international.com)
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from '@ofServices/user.service';
import { DataTableShareService } from '../../../services/data.service';
import { OfTableComponent } from '../oftable/oftable.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationDialogService } from 'app/modules/admin/services/confirmation-dialog.service';
import { AppState } from '@ofStore/index';
import { Store } from '@ngrx/store';
import { Observable, Subject, throwError } from 'rxjs';
import { AppError } from 'app/common/error/app-error';
import { EditUsermodalComponent } from '../../editmodal/users/edit-user-modal.component';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'of-users-table',
  templateUrl: '../oftable/oftable.component.html'
})
export class OfUsersTableComponent extends OfTableComponent implements OnInit, OnDestroy {

  unsubscribe$: Subject<void> = new Subject<void>();

  modalComponent = EditUsermodalComponent;
  typeModal = 'user';

  constructor(
    protected crudService: UserService,
    protected modalService: NgbModal,
    protected dataService: DataTableShareService,
    protected translate: TranslateService,
    private confirmationDialogService: ConfirmationDialogService,
    protected store: Store<AppState>
  ) {

    super(modalService, dataService, store);
    this.crudService = crudService;
    this.config.sorting = { columns: this.columns };
    this.getLocale().pipe(takeUntil(this.unsubscribe$)).subscribe(locale => {
      this.translate.use(locale);
      this.translate.get(['admin.input.user.login', 'admin.input.user.firstname', 'admin.input.user.lastname',
        'admin.input.user.groups', 'admin.input.user.entities', 'admin.input.user.edit', 'admin.input.user.delete',
        'admin.pagination.firstText', 'admin.pagination.lastText', 'admin.pagination.nextText', 'admin.pagination.prevText'
        , 'admin.input.user.add', 'admin.input.lines', 'admin.input.user.filter', 'admin.input.user.filterAll'])
        .subscribe(translations => {
          this.columns = [
            {
              title: translations['admin.input.user.login'],
              name: 'login',
              filtering: {
                filterString: '', placeholder: translations['admin.input.user.filter'] +
                  translations['admin.input.user.login']
              },
            },
            {
              title: translations['admin.input.user.firstname'],
              name: 'firstName',
              filtering: {
                filterString: '', placeholder: translations['admin.input.user.filter'] +
                  translations['admin.input.user.firstname']
              },
            },
            {
              title: translations['admin.input.user.lastname'],
              name: 'lastName',
              filtering: {
                filterString: '', placeholder: translations['admin.input.user.filter'] +
                  translations['admin.input.user.lastname']
              },
            },
            {
              title: translations['admin.input.user.groups'],
              name: 'groups',
              filtering: {
                filterString: '', placeholder: translations['admin.input.user.filter'] +
                  translations['admin.input.user.groups']
              },
            },
            {
              title: translations['admin.input.user.entities'],
              name: 'entities',
              filtering: {
                filterString: '', placeholder: translations['admin.input.user.filter'] +
                  translations['admin.input.user.entities']
              },
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
          this.addLabel = translations['admin.input.user.add'];
          this.lineLabel = translations['admin.input.lines'];
          this.filterAll = translations['admin.input.user.filterAll'];

        });
    });
  }

  openDeleteConfirmationDialog(row: any): any {
    this.confirmationDialogService.confirm(
      this.translate.instant('admin.input.user.confirm'),
      this.translate.instant('admin.input.delete') + ' ' + row.login + '?',
      'OK',
      this.translate.instant('admin.input.user.cancel')
    ).then((confirmed) => {
      if (confirmed) {
        this.deleteItem(row.login, 'login');
      }
    }).catch(() => throwError(new AppError(null)));
  }


  protected subscribeTable(): void {
    super.subscribeTable();
    //regresh all users event
    this.dataService.getUsersEvent().subscribe(() => {
      this.crudService.getAll().subscribe((response) => {
        this.data = response;
        this.onChangeTable(this.config);
      });
    });
  }

  getObservableRow(): Observable<any> {
    return this.dataService.getUserRowEvent();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
