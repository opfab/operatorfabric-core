/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Entity} from '@ofModel/entity.model';
import {EntitiesService} from '@ofServices/entities.service';
import {Observable, of} from 'rxjs';
import {Injectable} from '@angular/core';

/** This mock of the EntitiesService relies on hardcoded entities rather than making an HTTP request to the API */

@Injectable()
export class EntitiesServiceMock extends EntitiesService {

    public getAllEntities(): Observable<Entity[]> {

        let entityAllControlRooms: Entity, entity1: Entity, entity2: Entity;

        entityAllControlRooms = new Entity('ALLCONTROLROOMS', 'All Control Rooms', 'All Control Rooms', false, []);
        entity1 = new Entity('ENTITY1', 'Control Room 1', 'Control Room 1', true, ['ALLCONTROLROOMS']);
        entity2 = new Entity('ENTITY2', 'Control Room 2', 'Control Room 2', true, []);

        const mockHttpResponse = new Array<Entity>();
        mockHttpResponse.push(entity1);
        mockHttpResponse.push(entity2);
        mockHttpResponse.push(entityAllControlRooms);

        return of(mockHttpResponse);
    }

}
