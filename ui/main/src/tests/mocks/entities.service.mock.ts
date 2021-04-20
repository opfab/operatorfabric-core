/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Entity} from '@ofModel/entity.model';

export class EntitiesServiceMock {

    private readonly _entities: Entity[];

    constructor() {
        this._entities = new Array<Entity>();
        let entityAllControlRooms: Entity, entity1: Entity, entity2: Entity;

        entityAllControlRooms = new Entity('ALLCONTROLROOMS', 'All Control Rooms', 'All Control Rooms', false, []);
        entity1 = new Entity('ENTITY1', 'Control Room 1', 'Control Room 1', true, ['ALLCONTROLROOMS']);
        entity2 = new Entity('ENTITY2', 'Control Room 2', 'Control Room 2', true, []);
        this._entities.push(entity1);
        this._entities.push(entity2);
        this._entities.push(entityAllControlRooms);
    }

    public resolveEntitiesAllowedToSendCards(selected: Entity[]): Entity[] {
        const allowed = new Set<Entity>();
        selected.forEach(entity => {
            if (entity.entityAllowedToSendCard) {
                allowed.add(entity);
            } else {
                let children: Entity[];
                children = this._entities.filter(child => child.parents.includes(entity.id));
                const childrenAllowed = this.resolveEntitiesAllowedToSendCards(children);
                childrenAllowed.forEach(c => allowed.add(c));
            }
        });
        return Array.from(allowed);
    }

    public getEntities(): Entity[] {
        return this._entities;
    }
}
