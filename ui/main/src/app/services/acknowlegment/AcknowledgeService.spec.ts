/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {setUserPerimeter} from '@tests/helpers';
import {UserWithPerimeters} from '@ofServices/users/model/UserWithPerimeters';
import {User} from '@ofServices/users/model/User';
import {EntitiesService} from '@ofServices/entities/EntitiesService';
import {EntitiesServerMock} from '@tests/mocks/entitiesServer.mock';
import {Entity} from '@ofServices/entities/model/Entity';
import {RoleEnum} from '@ofServices/entities/model/RoleEnum';
import {AcknowledgeServer} from './server/AcknowledgeServer';
import {AcknowledgeService} from './AcknowledgeService';
import {PermissionEnum} from '@ofServices/groups/model/PermissionEnum';

class AcknowledgeServerMock implements AcknowledgeServer {
    public entitiesAcksPosted: string[] = undefined;
    public cardUidPosted: string = undefined;
    public entitiesAcksDeleted: string[] = undefined;
    public cardUidDeleted: string = undefined;

    postUserAcknowledgement(cardUid: string, entitiesAcks: string[]): any {
        this.entitiesAcksPosted = entitiesAcks;
        this.cardUidPosted = cardUid;
        return null;
    }
    deleteUserAcknowledgement(cardUid: string, entitiesAcks: string[]): any {
        this.entitiesAcksDeleted = entitiesAcks;
        this.cardUidDeleted = cardUid;
        return null;
    }
}

describe('AcknowledgeService testing ', () => {
    let acknowledgeServerMock: AcknowledgeServerMock;
    beforeEach(() => {
        acknowledgeServerMock = new AcknowledgeServerMock();
        AcknowledgeService.setAcknowledgeServer(acknowledgeServerMock);

        const mockEntitiesServer = new EntitiesServerMock();
        mockEntitiesServer.setEntities([
            new Entity('ENTITY1', 'ENTITY 1', '', [RoleEnum.CARD_SENDER], null, null),
            new Entity('ENTITY2', 'ENTITY 2', '', [RoleEnum.CARD_SENDER], null, null),
            new Entity('ENTITY3', 'ENTITY 3', '', [RoleEnum.CARD_SENDER], null, ['ENTITY_FR']),
            new Entity('ENTITY_FR', 'ENTITY FR', '', [RoleEnum.CARD_SENDER], null, null)
        ]);
        EntitiesService.setEntitiesServer(mockEntitiesServer);
        EntitiesService.loadAllEntitiesData().subscribe();
    });

    it('should ack at the entity level', async () => {
        const user = new User('user', 'firstName', 'lastName', null, ['group1'], ['ENTITY1', 'ENTITY2']);
        const userWithPerimeters = new UserWithPerimeters(user, [], []);
        await setUserPerimeter(userWithPerimeters);

        AcknowledgeService.postAcknowledgement('test');
        expect(acknowledgeServerMock.cardUidPosted).toEqual('test');
        expect(acknowledgeServerMock.entitiesAcksPosted).toEqual(['ENTITY1', 'ENTITY2']);
    });

    it('should not ack at the entity level is user is readonly ', async () => {
        const user = new User('user', 'firstName', 'lastName', null, ['group1'], ['ENTITY1']);
        const userWithPerimeters = new UserWithPerimeters(user, [], [PermissionEnum.READONLY]);
        await setUserPerimeter(userWithPerimeters);

        AcknowledgeService.postAcknowledgement('test');
        expect(acknowledgeServerMock.cardUidPosted).toEqual('test');
        expect(acknowledgeServerMock.entitiesAcksPosted).toEqual([]);
    });
    it('Should not ack at the parent entity level', async () => {
        const user = new User('user', 'firstName', 'lastName', null, ['group1'], ['ENTITY2', 'ENTITY3', 'ENTITY_FR']);
        const userWithPerimeters = new UserWithPerimeters(user, [], []);
        await setUserPerimeter(userWithPerimeters);
        AcknowledgeService.postAcknowledgement('test');
        expect(acknowledgeServerMock.cardUidPosted).toEqual('test');
        expect(acknowledgeServerMock.entitiesAcksPosted).toEqual(['ENTITY2', 'ENTITY3']);
    });

    it('should unack at the entity level', async () => {
        const user = new User('user', 'firstName', 'lastName', null, ['group1'], ['ENTITY1', 'ENTITY2']);
        const userWithPerimeters = new UserWithPerimeters(user, [], []);
        await setUserPerimeter(userWithPerimeters);

        AcknowledgeService.deleteAcknowledgement('test');
        expect(acknowledgeServerMock.cardUidDeleted).toEqual('test');
        expect(acknowledgeServerMock.entitiesAcksDeleted).toEqual(['ENTITY1', 'ENTITY2']);
    });

    it('should not unack at the entity level is user is readonly ', async () => {
        const user = new User('user', 'firstName', 'lastName', null, ['group1'], ['ENTITY1']);
        const userWithPerimeters = new UserWithPerimeters(user, [], [PermissionEnum.READONLY]);
        await setUserPerimeter(userWithPerimeters);

        AcknowledgeService.deleteAcknowledgement('test');
        expect(acknowledgeServerMock.cardUidDeleted).toEqual('test');
        expect(acknowledgeServerMock.entitiesAcksDeleted).toEqual([]);
    });
    it('Should not unack at the parent entity level', async () => {
        const user = new User('user', 'firstName', 'lastName', null, ['group1'], ['ENTITY2', 'ENTITY3', 'ENTITY_FR']);
        const userWithPerimeters = new UserWithPerimeters(user, [], []);
        await setUserPerimeter(userWithPerimeters);
        AcknowledgeService.deleteAcknowledgement('test');
        expect(acknowledgeServerMock.cardUidDeleted).toEqual('test');
        expect(acknowledgeServerMock.entitiesAcksDeleted).toEqual(['ENTITY2', 'ENTITY3']);
    });
});
