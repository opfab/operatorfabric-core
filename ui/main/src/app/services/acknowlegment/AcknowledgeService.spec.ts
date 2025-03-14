/* Copyright (c) 2025, RTE (http://www.rte-france.com)

 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {getOneCard, setUserPerimeter, sendLightCard, setEntities, sendLightCards} from '@tests/helpers';
import {UserWithPerimeters} from '@ofServices/users/model/UserWithPerimeters';
import {User} from '@ofServices/users/model/User';
import {Entity} from '@ofServices/entities/model/Entity';
import {AcknowledgeServer} from './server/AcknowledgeServer';
import {AcknowledgeService} from './AcknowledgeService';
import {OpfabStore} from '@ofStore/OpfabStore';
import {Observable, firstValueFrom, of} from 'rxjs';
import {ServerResponse, ServerResponseStatus} from 'app/server/ServerResponse';
import {PermissionEnum} from '@ofServices/groups/model/PermissionEnum';
import {CardAction} from 'app/model/CardAction';

class AcknowledgeServerMock implements AcknowledgeServer {
    public ackPosted = new Array<{cardUid: string; entitiesAcks: string[]}>();
    public ackDeleted = new Array<{cardUid: string; entitiesAcks: string[]}>();
    public serverResponseStatus = ServerResponseStatus.OK;

    postUserAcknowledgement(cardUid: string, entitiesAcks: string[]): Observable<ServerResponse<void>> {
        this.ackPosted.push({cardUid, entitiesAcks});
        return of(new ServerResponse<void>(null, this.serverResponseStatus, 'OK'));
    }
    deleteUserAcknowledgement(cardUid: string, entitiesAcks: string[]): Observable<ServerResponse<void>> {
        this.ackDeleted.push({cardUid, entitiesAcks});
        return of(new ServerResponse<void>(null, this.serverResponseStatus, 'OK'));
    }
}

describe('AcknowledgeService testing ', () => {
    let acknowledgeServerMock: AcknowledgeServerMock;
    beforeEach(() => {
        acknowledgeServerMock = new AcknowledgeServerMock();
        AcknowledgeService.setAcknowledgeServer(acknowledgeServerMock);

        setEntities([
            new Entity('ENTITY1', 'ENTITY 1', '', [], null, null),
            new Entity('ENTITY2', 'ENTITY 2', '', [], null, null),
            new Entity('ENTITY3', 'ENTITY 3', '', [], null, ['ENTITY_FR']),
            new Entity('ENTITY_FR', 'ENTITY FR', '', [], null, null)
        ]);
    });

    it('should ack at the entity level', async () => {
        const user = new User('user', 'firstName', 'lastName', null, ['group1'], ['ENTITY1', 'ENTITY2']);
        const userWithPerimeters = new UserWithPerimeters(user, [], []);
        await setUserPerimeter(userWithPerimeters);

        AcknowledgeService.postAcknowledgement(getOneCard({id: 'testId', uid: 'testUid'}));
        expect(acknowledgeServerMock.ackPosted[0].cardUid).toEqual('testUid');
        expect(acknowledgeServerMock.ackPosted[0].entitiesAcks).toEqual(['ENTITY1', 'ENTITY2']);
    });

    it('should not ack at the entity level is user is readonly ', async () => {
        const user = new User('user', 'firstName', 'lastName', null, ['group1'], ['ENTITY1']);
        const userWithPerimeters = new UserWithPerimeters(user, [], [PermissionEnum.READONLY]);
        await setUserPerimeter(userWithPerimeters);

        AcknowledgeService.postAcknowledgement(getOneCard({id: 'testId', uid: 'testUid'}));
        expect(acknowledgeServerMock.ackPosted[0].cardUid).toEqual('testUid');
        expect(acknowledgeServerMock.ackPosted[0].entitiesAcks).toEqual([]);
    });
    it('Should not ack at the parent entity level', async () => {
        const user = new User('user', 'firstName', 'lastName', null, ['group1'], ['ENTITY2', 'ENTITY3', 'ENTITY_FR']);
        const userWithPerimeters = new UserWithPerimeters(user, [], []);
        await setUserPerimeter(userWithPerimeters);
        AcknowledgeService.postAcknowledgement(getOneCard({id: 'testId', uid: 'testUid'}));
        expect(acknowledgeServerMock.ackPosted[0].cardUid).toEqual('testUid');
        expect(acknowledgeServerMock.ackPosted[0].entitiesAcks).toEqual(['ENTITY2', 'ENTITY3']);
    });
    it('should unack at the entity level', async () => {
        const user = new User('user', 'firstName', 'lastName', null, ['group1'], ['ENTITY1', 'ENTITY2']);
        const userWithPerimeters = new UserWithPerimeters(user, [], []);
        await setUserPerimeter(userWithPerimeters);

        AcknowledgeService.deleteAcknowledgement(getOneCard({id: 'testId', uid: 'testUid'}));
        expect(acknowledgeServerMock.ackDeleted[0].cardUid).toEqual('testUid');
        expect(acknowledgeServerMock.ackDeleted[0].entitiesAcks).toEqual(['ENTITY1', 'ENTITY2']);
    });

    it('should not unack at the entity level is user is readonly ', async () => {
        const user = new User('user', 'firstName', 'lastName', null, ['group1'], ['ENTITY1']);
        const userWithPerimeters = new UserWithPerimeters(user, [], [PermissionEnum.READONLY]);
        await setUserPerimeter(userWithPerimeters);

        AcknowledgeService.deleteAcknowledgement(getOneCard({id: 'testId', uid: 'testUid'}));
        expect(acknowledgeServerMock.ackDeleted[0].cardUid).toEqual('testUid');
        expect(acknowledgeServerMock.ackDeleted[0].entitiesAcks).toEqual([]);
    });
    it('Should not unack at the parent entity level', async () => {
        const user = new User('user', 'firstName', 'lastName', null, ['group1'], ['ENTITY2', 'ENTITY3', 'ENTITY_FR']);
        const userWithPerimeters = new UserWithPerimeters(user, [], []);
        await setUserPerimeter(userWithPerimeters);
        AcknowledgeService.deleteAcknowledgement(getOneCard({id: 'testId', uid: 'testUid'}));
        expect(acknowledgeServerMock.ackDeleted[0].cardUid).toEqual('testUid');
        expect(acknowledgeServerMock.ackDeleted[0].entitiesAcks).toEqual(['ENTITY2', 'ENTITY3']);
    });
    describe('Should in the store', () => {
        it('set the card as acked', async () => {
            const user = new User('user', 'firstName', 'lastName', null, ['group1'], ['ENTITY1', 'ENTITY2']);
            const userWithPerimeters = new UserWithPerimeters(user, [], []);
            await setUserPerimeter(userWithPerimeters);
            sendLightCard(getOneCard({id: 'testId', uid: 'testUid', hasBeenAcknowledged: false}));
            expect(OpfabStore.getLightCardStore().getLightCard('testId').hasBeenAcknowledged).toEqual(false);
            await firstValueFrom(AcknowledgeService.postAcknowledgement(getOneCard({id: 'testId', uid: 'testUid'})));
            expect(OpfabStore.getLightCardStore().getLightCard('testId').hasBeenAcknowledged).toEqual(true);
        });
        it('not set the card as acked if ack server request fail', async () => {
            const user = new User('user', 'firstName', 'lastName', null, ['group1'], ['ENTITY1', 'ENTITY2']);
            const userWithPerimeters = new UserWithPerimeters(user, [], []);
            await setUserPerimeter(userWithPerimeters);
            sendLightCard(getOneCard({id: 'testId', uid: 'testUid', hasBeenAcknowledged: false}));
            expect(OpfabStore.getLightCardStore().getLightCard('testId').hasBeenAcknowledged).toEqual(false);
            acknowledgeServerMock.serverResponseStatus = ServerResponseStatus.UNKNOWN_ERROR;
            await firstValueFrom(AcknowledgeService.postAcknowledgement(getOneCard({id: 'testId', uid: 'testUid'})));
            expect(OpfabStore.getLightCardStore().getLightCard('testId').hasBeenAcknowledged).toEqual(false);
        });
        it('set the card as unacked', async () => {
            const user = new User('user', 'firstName', 'lastName', null, ['group1'], ['ENTITY1', 'ENTITY2']);
            const userWithPerimeters = new UserWithPerimeters(user, [], []);
            await setUserPerimeter(userWithPerimeters);
            sendLightCard(getOneCard({id: 'testId', uid: 'testUid', hasBeenAcknowledged: true}));
            expect(OpfabStore.getLightCardStore().getLightCard('testId').hasBeenAcknowledged).toEqual(true);
            await firstValueFrom(AcknowledgeService.deleteAcknowledgement(getOneCard({id: 'testId', uid: 'testUid'})));
            expect(OpfabStore.getLightCardStore().getLightCard('testId').hasBeenAcknowledged).toEqual(false);
        });
        it('not set the card as unacked if unack server request fail', async () => {
            const user = new User('user', 'firstName', 'lastName', null, ['group1'], ['ENTITY1', 'ENTITY2']);
            const userWithPerimeters = new UserWithPerimeters(user, [], []);
            await setUserPerimeter(userWithPerimeters);
            sendLightCard(getOneCard({id: 'testId', uid: 'testUid', hasBeenAcknowledged: true}));
            expect(OpfabStore.getLightCardStore().getLightCard('testId').hasBeenAcknowledged).toEqual(true);
            acknowledgeServerMock.serverResponseStatus = ServerResponseStatus.UNKNOWN_ERROR;
            await firstValueFrom(AcknowledgeService.deleteAcknowledgement(getOneCard({id: 'testId', uid: 'testUid'})));
            expect(OpfabStore.getLightCardStore().getLightCard('testId').hasBeenAcknowledged).toEqual(true);
        });
    });
    describe('When card has child cards', () => {
        beforeEach(async () => {
            const user = new User('user', 'firstName', 'lastName', null, ['group1'], ['ENTITY1', 'ENTITY2']);
            const userWithPerimeters = new UserWithPerimeters(user, [], []);
            await setUserPerimeter(userWithPerimeters);

            sendLightCards([
                getOneCard({id: 'testId', uid: 'testUid', hasBeenAcknowledged: false}),
                getOneCard({
                    uid: 'child1Uid',
                    id: 'child1Id',
                    parentCardId: 'testId',
                    hasBeenAcknowledged: false,
                    actions: [CardAction.PROPAGATE_READ_ACK_TO_PARENT_CARD]
                }),
                getOneCard({
                    uid: 'child2Uid',
                    id: 'child2Id',
                    parentCardId: 'testId',
                    hasBeenAcknowledged: false,
                    actions: [CardAction.PROPAGATE_READ_ACK_TO_PARENT_CARD]
                }),
                getOneCard({
                    uid: 'child3Uid',
                    id: 'child3Id',
                    parentCardId: 'testId',
                    hasBeenAcknowledged: false
                })
            ]);
        });
        it('should ack all the child cardsi with action PROPAGATE_READ_ACK_TO_PARENT_CARD', async () => {
            await firstValueFrom(AcknowledgeService.postAcknowledgement(getOneCard({id: 'testId', uid: 'testUid'})));
            expect(acknowledgeServerMock.ackPosted.length).toEqual(3);
            expect(acknowledgeServerMock.ackPosted[0].cardUid).toEqual('testUid');
            expect(acknowledgeServerMock.ackPosted[0].entitiesAcks).toEqual(['ENTITY1', 'ENTITY2']);
            expect(acknowledgeServerMock.ackPosted[1].cardUid).toEqual('child1Uid');
            expect(acknowledgeServerMock.ackPosted[1].entitiesAcks).toEqual(['ENTITY1', 'ENTITY2']);
            expect(acknowledgeServerMock.ackPosted[2].cardUid).toEqual('child2Uid');
            expect(acknowledgeServerMock.ackPosted[2].entitiesAcks).toEqual(['ENTITY1', 'ENTITY2']);
        });
        it('should unack all the child cards with action PROPAGATE_READ_ACK_TO_PARENT_CARD', async () => {
            await firstValueFrom(AcknowledgeService.deleteAcknowledgement(getOneCard({id: 'testId', uid: 'testUid'})));
            expect(acknowledgeServerMock.ackDeleted.length).toEqual(3);
            expect(acknowledgeServerMock.ackDeleted[0].cardUid).toEqual('testUid');
            expect(acknowledgeServerMock.ackDeleted[0].entitiesAcks).toEqual(['ENTITY1', 'ENTITY2']);
            expect(acknowledgeServerMock.ackDeleted[1].cardUid).toEqual('child1Uid');
            expect(acknowledgeServerMock.ackDeleted[1].entitiesAcks).toEqual(['ENTITY1', 'ENTITY2']);
            expect(acknowledgeServerMock.ackDeleted[2].cardUid).toEqual('child2Uid');
            expect(acknowledgeServerMock.ackDeleted[2].entitiesAcks).toEqual(['ENTITY1', 'ENTITY2']);
        });
    });
});
