/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Observable} from 'rxjs';
import {Group} from '@ofModel/group.model';
import {GroupsServer} from 'app/business/server/groups.server'
import {environment} from '@env/environment';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {AngularServer} from './angular.server';
import {ServerResponse} from 'app/business/server/serverResponse';
@Injectable({
    providedIn: 'root'
})
export class AngularGroupsServer extends AngularServer implements GroupsServer {
    readonly groupsUrl: string;

    /**
     * @constructor
     * @param httpClient - Angular build-in
     */
    constructor( private httpClient: HttpClient) {
        super();
        this.groupsUrl = `${environment.url}/users/groups`;
    }

    deleteById(id: string): Observable<ServerResponse<any>> {
        const url = `${this.groupsUrl}/${id}`;
        return this.processHttpResponse(this.httpClient.delete(url));
    }

    queryAllGroups(): Observable<ServerResponse<Group[]>> {
        return this.processHttpResponse(this.httpClient.get<Group[]>(`${this.groupsUrl}`));
    }

    updateGroup(groupData: Group): Observable<ServerResponse<Group>> {
        return this.processHttpResponse(this.httpClient.post<Group>(`${this.groupsUrl}`, groupData));
    }
}
