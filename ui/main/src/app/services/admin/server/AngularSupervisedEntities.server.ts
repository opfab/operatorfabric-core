/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
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
import {SupervisedEntity} from '@ofServices/admin/model/SupervisedEntity';
import {Injectable} from '@angular/core';
import {ServerResponse} from 'app/server/ServerResponse';
import {AngularServer} from '../../../server/AngularServer';
import {SupervisedEntitiesServer} from './SupervisedEntitiesServer';

@Injectable({
    providedIn: 'root'
})
export class AngularSupervisedEntitiesServer extends AngularServer implements SupervisedEntitiesServer {
    readonly supervisedEntitiesUrl: string;
    protected _entities: SupervisedEntity[];

    constructor(private readonly httpClient: HttpClient) {
        super();
        this.supervisedEntitiesUrl = `${environment.url}supervisor/supervisedEntities`;
    }

    deleteById(id: string): Observable<ServerResponse<any>> {
        const url = `${this.supervisedEntitiesUrl}/${id}`;
        return this.processHttpResponse(this.httpClient.delete(url));
    }

    queryAllSupervisedEntities(): Observable<ServerResponse<SupervisedEntity[]>> {
        return this.processHttpResponse(this.httpClient.get<SupervisedEntity[]>(`${this.supervisedEntitiesUrl}`));
    }

    updateSupervisedEntity(supervisedEntityData: SupervisedEntity): Observable<ServerResponse<SupervisedEntity>> {
        return this.processHttpResponse(
            this.httpClient.post<SupervisedEntity>(`${this.supervisedEntitiesUrl}`, supervisedEntityData)
        );
    }
}
