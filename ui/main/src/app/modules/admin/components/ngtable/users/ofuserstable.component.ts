import { Component, OnInit } from '@angular/core';
import { UserService } from '@ofServices/user.service';
import { EditUsermodalComponent } from '../../editmodal/users/editusermodal.component';
import { DataTableShareService } from '../../../services/data.service';
import { OfTableComponent } from '../oftable/oftable.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationDialogService } from 'app/modules/admin/services/confirmation-dialog.service';
import { AppState } from '@ofStore/index';
import { Store } from '@ngrx/store';
import { throwError } from 'rxjs';
import { AppError } from 'app/common/error/app-error';


@Component({
  selector: 'of-users-table',
  templateUrl: './ofuserstable.component.html'
})
export class OfUsersTableComponent extends OfTableComponent implements OnInit {

  addLabel: string;
  lineLabel: string;
  filterAll: any;

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
    this.getLocale().subscribe(locale => {
      this.translate.use(locale);
      this.translate.get(['admin.input.user.login', 'admin.input.user.firstname', 'admin.input.user.lastname',
        'admin.input.user.groups', 'admin.input.user.entities', 'admin.input.user.edit', 'admin.input.user.delete',
        'admin.pagination.firstText', 'admin.pagination.lastText', 'admin.pagination.nextText', 'admin.pagination.prevText'
        , 'admin.input.user.add', 'admin.input.lines', 'admin.input.user.filter' , 'admin.input.user.filterAll'])
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


  onCellClick(data: any): any {
    const column = data.column;
    if (column === 'edit') {
      const modalRef = this.modalService.open(EditUsermodalComponent);
      modalRef.componentInstance.user = data['row'];
    }
    if (column === 'delete') {
      this.openDeleteConfirmationDialog(data.row);
    }
  }

  openDeleteConfirmationDialog(row: any) {
    this.confirmationDialogService.confirm(
      this.translate.instant('admin.input.user.confirm'),
      this.translate.instant('admin.input.delete') + ' ' + row.login + '?',
      'OK',
      this.translate.instant('admin.input.user.cancel')
    ).then((confirmed) => {
      if (confirmed) {
        this.deleteItem(row);
      }
    }).catch(() => throwError(new AppError(null)));
  }

  createNewItem() {
    this.modalService.open(EditUsermodalComponent);
  }

  subscribeTable(): void {
    this.dataService.getUserEvent().subscribe((user) => {
      if (user) {
        const itemIndex = this.data.findIndex((item) => item.login === user.login);
        if (itemIndex >= 0) {
          this.data[itemIndex] = user;
        } else {
          this.data.push(user);
        }
        this.onChangeTable(this.config);
      }
    });
  }
}
