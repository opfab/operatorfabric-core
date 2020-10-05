import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '@ofModel/user.model';

@Injectable()
export class DataTableShareService {
  private user = new BehaviorSubject<User>(null);
  private userData = this.user.asObservable();

  constructor() {}

  changeMessage(user: User) {
    this.user.next(user);
  }

  getUserEvent(): Observable<User> {
    return this.userData;
  }


}
