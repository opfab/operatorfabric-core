/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CrudService} from './crud-service';
import {Observable} from 'rxjs';
import {Group} from '@ofModel/group.model';
import {environment} from '@env/environment';
import {HttpClient} from '@angular/common/http';
import {catchError} from 'rxjs/operators';
import {Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class GroupsService extends CrudService {

  readonly groupsUrl: string;

  /**
   * @constructor
   * @param httpClient - Angular build-in
   */
  constructor(private httpClient: HttpClient) {
    super();
    this.groupsUrl = `${environment.urls.groups}`;
  }
  deleteById(id: string) {
    const url = `${this.groupsUrl}/groups/${id}`;
    return this.httpClient.delete(url).pipe(
      catchError((error: Response) => this.handleError(error))
    );
  }

  getAllGroups(): Observable<Group[]> {
    return this.httpClient.get<Group[]>(`${this.groupsUrl}`).pipe(
      catchError((error: Response) => this.handleError)
    );
  }



  updateGroup(groupsData: Group): Observable<Group> {
    return this.httpClient.post<Group>(`${this.groupsUrl}`, groupsData).pipe(
      catchError((error: Response) => this.handleError)
    );
  }


  getAll(): Observable<any[]> {
    return this.getAllGroups();
  }

  update(data: any): Observable<any> {
    return this.updateGroup(data);
  }

}
