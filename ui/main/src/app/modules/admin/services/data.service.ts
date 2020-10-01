import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class DataTableShareService {

  private userRow = new BehaviorSubject<any>(null);
  private groupRow = new BehaviorSubject<any>(null);
  private entityRow = new BehaviorSubject<any>(null);

  private userRowData = this.userRow.asObservable();
  private groupRowData = this.groupRow.asObservable();
  private entityRowData = this.entityRow.asObservable();

  private refreshUsers = new BehaviorSubject<boolean>(false);




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
