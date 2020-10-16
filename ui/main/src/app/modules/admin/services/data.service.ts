import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class DataTableShareService {

  private userRow = new Subject<any>();
  private groupRow = new Subject<any>();
  private entityRow = new Subject<any>();

  private userRowData = this.userRow.asObservable();
  private groupRowData = this.groupRow.asObservable();
  private entityRowData = this.entityRow.asObservable();

  private refreshUsers = new Subject<boolean>();




  constructor() { }

  changeUserRow(row: any) {
    this.userRow.next(row);
  }
  changeGroupRow(row: any) {
    this.groupRow.next(row);
  }
  changeEntityRow(row: any) {
    this.entityRow.next(row);
  }

  getUserRowEvent(): Observable<any> {
    return this.userRowData;
  }
  getGroupRowEvent(): Observable<any> {
    return this.groupRowData;
  }
  getEntityRowEvent(): Observable<any> {
    return this.entityRowData;
  }

  changeUsers(user: boolean) {
    this.refreshUsers.next(true);
  }
  getUsersEvent(): Observable<boolean> {
    return this.refreshUsers;
  }

}
