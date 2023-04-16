/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ServerResponse, ServerResponseStatus} from 'app/business/server/serverResponse';
import {Observable, ReplaySubject} from 'rxjs';
import {EntitiesServer} from 'app/business/server/entities.server';
import {Entity} from '@ofModel/entity.model';

export class EntitiesServerMock implements EntitiesServer {
    private entitiesSubject = new ReplaySubject<ServerResponse<Entity[]>>();

    setEntities(entities: Entity[]) {
        this.entitiesSubject.next(new ServerResponse(entities, ServerResponseStatus.OK, ''));
    }

    deleteById(id: string): Observable<ServerResponse<any>> {
        throw new Error('Method not implemented.');
    }
    queryAllEntities(): Observable<ServerResponse<Entity[]>> {
        return this.entitiesSubject.asObservable();
    }
    updateEntity(entityData: Entity): Observable<ServerResponse<Entity>> {
        throw new Error('Method not implemented.');
    }
}
