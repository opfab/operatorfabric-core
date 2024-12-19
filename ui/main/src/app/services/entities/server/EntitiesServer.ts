/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Entity} from '@ofServices/entities/model/Entity';
import {Observable} from 'rxjs';
import {ServerResponse} from '../../../business/server/serverResponse';

export abstract class EntitiesServer {
    abstract deleteById(id: string): Observable<ServerResponse<any>>;
    abstract queryAllEntities(): Observable<ServerResponse<Entity[]>>;
    abstract updateEntity(entityData: Entity): Observable<ServerResponse<Entity>>;
}
