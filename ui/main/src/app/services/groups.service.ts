/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CrudService} from './crud-service';
import {Observable, Subject} from 'rxjs';
import {Group} from '@ofModel/group.model';
import {environment} from '@env/environment';
import {HttpClient} from '@angular/common/http';
import {catchError, takeUntil, tap} from 'rxjs/operators';
import {Injectable, OnDestroy} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GroupsService extends CrudService implements OnDestroy {

  readonly groupsUrl: string;
  private _groups: Group[];

  private ngUnsubscribe$ = new Subject<void>();

  /**
   * @constructor
   * @param httpClient - Angular build-in
   */
  constructor(private httpClient: HttpClient) {
    super();
    this.groupsUrl = `${environment.urls.groups}`;
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  deleteById(id: string) {
    const url = `${this.groupsUrl}/${id}`;
    return this.httpClient.delete(url).pipe(
      catchError((error: Response) => this.handleError(error))
    );
  }

  private updateCachedGroups(groupData: Group): void {
    const updatedGroups = this._groups.filter(group => group.id !== groupData.id);
    updatedGroups.push(groupData);
    this._groups = updatedGroups;
  }

  getAllGroups(): Observable<Group[]> {
    return this.httpClient.get<Group[]>(`${this.groupsUrl}`).pipe(
      catchError((error: Response) => this.handleError(error))
    );
  }

  public loadAllGroupsData(): Observable<any> {
    return this.getAllGroups()
        .pipe(takeUntil(this.ngUnsubscribe$)
            , tap(
                (groups) => {
                  if (!!groups) {
                    this._groups = groups;
                    console.log(new Date().toISOString(), 'List of groups loaded');
                  }
                }, (error) => console.error(new Date().toISOString(), 'an error occurred', error)
            ));
  }

  public getGroups(): Group[] {
    return this._groups;
  }

  updateGroup(groupData: Group): Observable<Group> {
    return this.httpClient.post<Group>(`${this.groupsUrl}`, groupData).pipe(
      catchError((error: Response) => this.handleError(error)),
        tap(next => {
          this.updateCachedGroups(groupData);
        })
    );
  }


  getAll(): Observable<any[]> {
    return this.getAllGroups();
  }

  update(data: any): Observable<any> {
    return this.updateGroup(data);
  }

}
