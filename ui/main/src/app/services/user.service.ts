/* Copyright (c) 2020, RTEi (http://www.rte-international.com)
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {environment} from '@env/environment';
import {Observable, Subject} from 'rxjs';
import {User} from '@ofModel/user.model';
import {UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {HttpClient} from '@angular/common/http';
import {catchError, takeUntil, tap} from 'rxjs/operators';
import {CrudService} from './crud-service';
import {Injectable} from '@angular/core';
import {Entity} from '@ofModel/entity.model';
import {RightsEnum} from '@ofModel/perimeter.model';

@Injectable({
  providedIn: 'root'
})
export class UserService extends CrudService {
  readonly userUrl: string;
  readonly connectionsUrl: string;
  private _userWithPerimeters: UserWithPerimeters;
  private ngUnsubscribe = new Subject<void>();
  private _userRightsPerProcessAndState: Map<string, RightsEnum>;
  private _receiveRightPerProcess: Map<string, number>;

  /**
   * @constructor
   * @param httpClient - Angular build-in
   */
  constructor(private httpClient: HttpClient) {
    super();
    this.userUrl = `${environment.urls.users}`;
    this.connectionsUrl = `${environment.urls.cards}/connections`;
    this._userRightsPerProcessAndState = new Map();
    this._receiveRightPerProcess = new Map();
  }

  deleteById(login: string) {
    const url = `${this.userUrl}/users/${login}`;
    return this.httpClient.delete(url).pipe(
      catchError((error: Response) => this.handleError(error))
    );
  }

  askUserApplicationRegistered(user: string): Observable<User> {
    return this.httpClient.get<User>(`${this.userUrl}/users/${user}`);
  }

  synchronizeWithToken(): Observable<User> {
    return this.httpClient.post<User>(`${this.userUrl}/users/synchronizeWithToken`, null);
  }

  currentUserWithPerimeters(): Observable<UserWithPerimeters> {
    return this.httpClient.get<UserWithPerimeters>(
      `${this.userUrl}/CurrentUserWithPerimeters`
    );
  }

  getAllUsers(): Observable<User[]> {
    return this.httpClient.get<User[]>(`${this.userUrl}`).pipe(
      catchError((error: Response) => this.handleError(error))
    );
  }

  getAll(): Observable<User[]> {
    return this.getAllUsers();
  }

  updateUser(userData: User): Observable<User> {
    return this.httpClient.post<User>(`${this.userUrl}`, userData).pipe(
      catchError((error: Response) => this.handleError(error))
    );
  }

  update(userData: User): Observable<User> {
    return this.updateUser(userData);
  }

  queryAllEntities(): Observable<Entity[]> {
    const url = `${this.userUrl}/entities`;
    return this.httpClient.get<Entity[]>(url).pipe(
      catchError((error: Response) => this.handleError(error))
    );

  }


  public loadUserWithPerimetersData(): Observable<any> {
    return this.currentUserWithPerimeters()
      .pipe(takeUntil(this.ngUnsubscribe)
      , tap(
        (userWithPerimeters) => {
          if (!!userWithPerimeters) {
            this._userWithPerimeters = userWithPerimeters;
            console.log(new Date().toISOString(), 'User perimeter loaded');
            this.loadUserRightsPerProcessAndState();
          }
        }, (error) => console.error(new Date().toISOString(), 'An error occurred when loading perimeter', error)
      ));
  }

  public getCurrentUserWithPerimeters(): UserWithPerimeters {
    return this._userWithPerimeters;
  }

  public isCurrentUserAdmin(): boolean {
    return this.isCurrentUserInAnyGroup(['ADMIN']);
  }

  public isCurrentUserInAnyGroup(groups: string[]): boolean {
    if (!groups)
      return false;
    return (this._userWithPerimeters.userData.groups.filter(group => groups.indexOf(group) >= 0).length > 0);
  }

  private loadUserRightsPerProcessAndState() {
    this._userRightsPerProcessAndState = new Map();
    this._userWithPerimeters.computedPerimeters.forEach(computedPerimeter => {
      this._userRightsPerProcessAndState.set(computedPerimeter.process + '.' + computedPerimeter.state, computedPerimeter.rights);
      if ((computedPerimeter.rights === RightsEnum.Receive) || (computedPerimeter.rights === RightsEnum.ReceiveAndWrite))
        this._receiveRightPerProcess.set(computedPerimeter.process, 1);
    });
  }

  public isReceiveRightsForProcessAndState(processId: string, stateId: string): boolean {
    const rights = this._userRightsPerProcessAndState.get(processId + '.' + stateId);
    if (rights && (rights === RightsEnum.Receive || rights === RightsEnum.ReceiveAndWrite))
      return true;
    return false;
  }

  public isReceiveRightsForProcess(processId: string): boolean {
    return !! this._receiveRightPerProcess.get(processId);
  }

  loadConnectedUsers(): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.connectionsUrl}`);
  }
}
