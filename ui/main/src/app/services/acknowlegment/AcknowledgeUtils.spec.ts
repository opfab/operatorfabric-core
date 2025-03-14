/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Entity} from '@ofServices/entities/model/Entity';
import {RoleEnum} from '@ofServices/entities/model/RoleEnum';
import {UserWithPerimeters} from '@ofServices/users/model/UserWithPerimeters';
import {setEntities, setUserPerimeter} from '@tests/helpers';
import {AcknowledgeUtils} from './AcknowledgeUtils';
import {User} from '@ofServices/users/model/User';

describe('AcknowledgeUtils testing ', () => {
    describe('getCurrentUserEntitiesAllowedToAcknowledge', () => {
        beforeAll(async () => {
            await setEntities([
                new Entity('ENTITY1', 'ENTITY 1', '', [RoleEnum.CARD_SENDER], null, null),
                new Entity('ENTITY2', 'ENTITY 2', '', [RoleEnum.CARD_SENDER], null, null),
                new Entity('ENTITY3', 'ENTITY 3', '', [RoleEnum.CARD_SENDER], null, ['ENTITY_FR']),
                new Entity('ENTITY_FR', 'ENTITY FR', '', [RoleEnum.CARD_SENDER], null, null)
            ]);
        });
        it('should return empty array if user has no entities', async () => {
            const user = new User('user', 'firstName', 'lastName', null, ['group1'], []);
            const userWithPerimeters = new UserWithPerimeters(user, [], []);
            await setUserPerimeter(userWithPerimeters);
            const result = AcknowledgeUtils.getCurrentUserEntitiesAllowedToAcknowledge();
            expect(result).toEqual([]);
        });
        it('should return all user entities if user has no parent entities', async () => {
            const user = new User('user', 'firstName', 'lastName', null, ['group1'], ['ENTITY1', 'ENTITY2']);
            const userWithPerimeters = new UserWithPerimeters(user, [], []);
            await setUserPerimeter(userWithPerimeters);
            const result = AcknowledgeUtils.getCurrentUserEntitiesAllowedToAcknowledge();
            expect(result).toEqual(['ENTITY1', 'ENTITY2']);
        });

        it('Should exclude parent entities', async () => {
            const user = new User(
                'user',
                'firstName',
                'lastName',
                null,
                ['group1'],
                ['ENTITY2', 'ENTITY3', 'ENTITY_FR']
            );
            const userWithPerimeters = new UserWithPerimeters(user, [], []);
            await setUserPerimeter(userWithPerimeters);
            const result = AcknowledgeUtils.getCurrentUserEntitiesAllowedToAcknowledge();
            expect(result).toEqual(['ENTITY2', 'ENTITY3']);
        });
    });
    describe('getEntitiesAllowedToAcknowledge', () => {
        beforeAll(async () => {
            await setEntities([
                new Entity('ENTITY1', 'ENTITY 1', '', null, null, null),
                new Entity('ENTITY2', 'ENTITY 2', '', null, null, ['PARENT']),
                new Entity('ENTITY3', 'ENTITY 3', '', null, null, ['PARENT']),
                new Entity('PARENT', 'PARENT', '', null, null, ['GRANDPARENT']),
                new Entity('GRANDPARENT', 'GRANDPARENT', '', null, null, ['GRANDGRANDPARENT']),
                new Entity('GRANDGRANDPARENT', 'GRANDGRANDPARENT', '', null, null, null)
            ]);
        });
        it('should return empty array if no entity ids array is undefined', () => {
            const result = AcknowledgeUtils.getEntitiesAllowedToAcknowledge(undefined);
            expect(result).toEqual([]);
        });
        it('should return empty array if no entity ids array is empty', () => {
            const result = AcknowledgeUtils.getEntitiesAllowedToAcknowledge([]);
            expect(result).toEqual([]);
        });
        it('should return entity if entity has no parents and no children entities', () => {
            const result = AcknowledgeUtils.getEntitiesAllowedToAcknowledge(['ENTITY1']);
            expect(result).toEqual(['ENTITY1']);
        });
        it('should return entity if entity has no chidren and has a parent', () => {
            const result = AcknowledgeUtils.getEntitiesAllowedToAcknowledge(['ENTITY2']);
            expect(result).toEqual(['ENTITY2']);
        });
        it('should return child entities if entity has children', () => {
            const result = AcknowledgeUtils.getEntitiesAllowedToAcknowledge(['PARENT']);
            expect(result).toEqual(['ENTITY2', 'ENTITY3']);
        });
        it('should exclude parent entities', () => {
            const result = AcknowledgeUtils.getEntitiesAllowedToAcknowledge(['ENTITY1', 'GRANDGRANDPARENT']);
            expect(result).toEqual(['ENTITY1', 'ENTITY2', 'ENTITY3']);
        });
    });
});
