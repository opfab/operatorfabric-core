/* Copyright (c) 2023-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {EntitiesService} from '@ofServices/entities/EntitiesService';
import {UsersService} from '@ofServices/users/UsersService';

declare const opfab: any;

export function initUserAPI() {
    opfab.users = {
        entities: {
            getEntityName: function (entityId: string) {
                return EntitiesService.getEntityName(entityId);
            },
            getEntity: function (entityId: string) {
                const entity = EntitiesService.getEntity(entityId);
                if (entity) return {...entity};
                else return undefined;
            },
            getAllEntities: function () {
                const entities = [];
                EntitiesService.getEntities().forEach((entity) => entities.push({...entity}));
                return entities;
            }
        },
        currentUser: {
            getLogin: function () {
                return UsersService.getCurrentUserWithPerimeters()?.userData?.login;
            },
            getFirstName: function () {
                return UsersService.getCurrentUserWithPerimeters()?.userData?.firstName;
            },
            getLastName: function () {
                return UsersService.getCurrentUserWithPerimeters()?.userData?.lastName;
            },
            getGroups: function () {
                const groups = UsersService.getCurrentUserWithPerimeters()?.userData?.groups;
                return groups ? [...groups] : [];
            },
            getEntities: function () {
                const entities = UsersService.getCurrentUserWithPerimeters()?.userData?.entities;
                return entities ? [...entities] : [];
            }
        }
    };
    // prevent unwanted modifications from templates code
    Object.freeze(opfab.users);
    Object.freeze(opfab.users.entities);
    Object.freeze(opfab.users.currentUser);
}
