/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Observable} from 'rxjs';
import {ServerResponse} from '../../../business/server/serverResponse';
import {SupervisedEntity} from '@ofServices/admin/model/SupervisedEntity';

export abstract class SupervisedEntitiesServer {
    abstract deleteById(id: string): Observable<ServerResponse<any>>;
    abstract queryAllSupervisedEntities(): Observable<ServerResponse<SupervisedEntity[]>>;
    abstract updateSupervisedEntity(
        supervisedEntityData: SupervisedEntity
    ): Observable<ServerResponse<SupervisedEntity>>;
}
