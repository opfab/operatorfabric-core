/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {environment} from '@env/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Entity} from '@ofModel/entity.model';
import {Injectable} from '@angular/core';
import {ServerResponse} from 'app/business/server/serverResponse';
import {AngularServer} from './angular.server';
import {EntitiesServer} from 'app/business/server/entities.server';


@Injectable({
    providedIn: 'root'
})
export class AngularEntitiesServer extends AngularServer implements EntitiesServer{
    readonly entitiesUrl: string;
    protected _entities: Entity[];
    /**
     * @constructor
     * @param httpClient - Angular build-in
     */
    constructor(private httpClient: HttpClient) {
        super();
        this.entitiesUrl = `${environment.url}/users/entities`;
    }

    deleteById(id: string): Observable<ServerResponse<any>> {
        const url = `${this.entitiesUrl}/${id}`;
        return this.processHttpResponse(this.httpClient.delete(url));
    }

    queryAllEntities(): Observable<ServerResponse<Entity[]>> {
        return this.processHttpResponse(this.httpClient.get<Entity[]>(`${this.entitiesUrl}`))
    }

    updateEntity(entityData: Entity): Observable<ServerResponse<Entity>> {
        return this.processHttpResponse(this.httpClient.post<Entity>(`${this.entitiesUrl}`, entityData))
    }
}
