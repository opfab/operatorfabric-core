/* Copyright (c) 2021-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AcknowledgeStatus} from './AcknowledgeStatus';
import {
    AcknowledgmentAllowedEnum,
    ConsideredAcknowledgedForUserWhenEnum,
    Process,
    State
} from '@ofServices/processes/model/Processes';
import {getOneCard} from '@tests/helpers';
import {UserWithPerimeters} from '@ofServices/users/model/UserWithPerimeters';
import {User} from '@ofServices/users/model/User';
import {RightEnum} from '@ofServices/perimeters/model/Perimeter';
import {EntitiesService} from '@ofServices/entities/EntitiesService';
import {ProcessesServerMock} from '@tests/mocks/processesServer.mock';
import {UsersService} from '../users/UsersService';
import {UsersServerMock} from '@tests/mocks/UsersServer.mock';
import {EntitiesServerMock} from '@tests/mocks/entitiesServer.mock';
import {Entity} from '@ofServices/entities/model/Entity';
import {ServerResponse, ServerResponseStatus} from '../../server/ServerResponse';
import {ProcessesService} from '../processes/ProcessesService';
import {PermissionEnum} from '@ofServices/groups/model/PermissionEnum';
import {RoleEnum} from '@ofServices/entities/model/RoleEnum';

describe('AcknowledgeStatus testing ', () => {
    let userMemberOfEntity1: User, userMemberOfEntity1AndEntity3: User;
    let usersServerMock: UsersServerMock;

    beforeEach(() => {
        userMemberOfEntity1 = new User('userMemberOfEntity1', 'firstName', 'lastName', null, ['group1'], ['ENTITY1']);
        userMemberOfEntity1AndEntity3 = new User(
            'userMemberOfEntity1AndEntity3',
            'firstName',
            null,
            'lastName',
            ['group1'],
            ['ENTITY1', 'ENTITY3']
        );

        usersServerMock = new UsersServerMock();
        usersServerMock.setResponseForCurrentUserWithPerimeter(
            new ServerResponse(getUserMemberOfEntity1WithPerimeter(), ServerResponseStatus.OK, '')
        );
        UsersService.setUsersServer(usersServerMock);

        const processesServerMock = new ProcessesServerMock();
        processesServerMock.setResponseForProcessesDefinition(
            new ServerResponse(getTestProcesses(), ServerResponseStatus.OK, '')
        );
        processesServerMock.setResponseForProcessesWithAllVersions(
            new ServerResponse(getTestProcesses(), ServerResponseStatus.OK, '')
        );
        ProcessesService.setProcessServer(processesServerMock);
        ProcessesService.loadAllProcessesWithLatestVersion().subscribe();
        ProcessesService.loadAllProcessesWithAllVersions().subscribe();
        UsersService.loadUserWithPerimetersData().subscribe();

        const mockEntitiesServer = new EntitiesServerMock();
        mockEntitiesServer.setEntities([
            new Entity('ENTITY1', 'ENTITY 1', '', [RoleEnum.CARD_SENDER], null, null),
            new Entity('ENTITY2', 'ENTITY 2', '', [RoleEnum.CARD_SENDER], null, null),
            new Entity('ENTITY3', 'ENTITY 3', '', [RoleEnum.CARD_SENDER], null, null),
            new Entity('ENTITY_FR', 'ENTITY FR', '', [RoleEnum.CARD_SENDER], null, null)
        ]);
        EntitiesService.setEntitiesServer(mockEntitiesServer);
        EntitiesService.loadAllEntitiesData().subscribe();
    });

    function getTestProcesses(): Process[] {
        const state1 = new State();
        state1.acknowledgmentAllowed = AcknowledgmentAllowedEnum.ALWAYS;
        state1.consideredAcknowledgedForUserWhen = ConsideredAcknowledgedForUserWhenEnum.USER_HAS_ACKNOWLEDGED;

        const state2 = new State();
        state2.acknowledgmentAllowed = AcknowledgmentAllowedEnum.ALWAYS;
        state2.consideredAcknowledgedForUserWhen =
            ConsideredAcknowledgedForUserWhenEnum.ALL_ENTITIES_OF_USER_HAVE_ACKNOWLEDGED;

        const statesList = new Map();
        statesList.set('state1', state1);
        statesList.set('state2', state2);

        const testProcess = new Process('testProcess', '1', null, null, statesList);
        return [testProcess];
    }

    function getUserMemberOfEntity1WithPerimeter(): UserWithPerimeters {
        return new UserWithPerimeters(userMemberOfEntity1, [
            {
                process: 'testProcess',
                state: 'state1',
                rights: RightEnum.ReceiveAndWrite,
                filteringNotificationAllowed: true
            },
            {
                process: 'testProcess',
                state: 'state2',
                rights: RightEnum.ReceiveAndWrite,
                filteringNotificationAllowed: true
            }
        ]);
    }

    function getUserMemberOfEntity1AndEntity3WithPerimeter(): UserWithPerimeters {
        return new UserWithPerimeters(userMemberOfEntity1AndEntity3, [
            {
                process: 'testProcess',
                state: 'state1',
                rights: RightEnum.ReceiveAndWrite,
                filteringNotificationAllowed: true
            },
            {
                process: 'testProcess',
                state: 'state2',
                rights: RightEnum.ReceiveAndWrite,
                filteringNotificationAllowed: true
            }
        ]);
    }

    function getUserMemberOfEntity1WithPerimeterAndReadonly(): UserWithPerimeters {
        return new UserWithPerimeters(
            userMemberOfEntity1,
            [
                {
                    process: 'testProcess',
                    state: 'state1',
                    rights: RightEnum.ReceiveAndWrite,
                    filteringNotificationAllowed: true
                },
                {
                    process: 'testProcess',
                    state: 'state2',
                    rights: RightEnum.ReceiveAndWrite,
                    filteringNotificationAllowed: true
                }
            ],
            [PermissionEnum.READONLY]
        );
    }

    it(
        'consideredAcknowledgedForUserWhen of the state is UserHasAcknowledged, ' +
            'no user has ack the card, no entity has ack the card, ' +
            'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return false',
        () => {
            const cardWithoutAcks = getOneCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state1',
                entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR'],
                hasBeenAcknowledged: false,
                entitiesAcks: []
            });

            const res = AcknowledgeStatus.hasLightCardBeenAcknowledgedByUserOrByUserEntity(cardWithoutAcks);
            expect(res).toBeFalse();
        }
    );

    it(
        'consideredAcknowledgedForUserWhen of the state is UserHasAcknowledged, ' +
            'user has ack the card, no other entity has ack the card, ' +
            'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return true',
        () => {
            const cardWithAck = getOneCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state1',
                entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR'],
                hasBeenAcknowledged: true,
                entitiesAcks: ['ENTITY1']
            });

            const res = AcknowledgeStatus.hasLightCardBeenAcknowledgedByUserOrByUserEntity(cardWithAck);
            expect(res).toBeTrue();
        }
    );

    it(
        'consideredAcknowledgedForUserWhen of the state is UserHasAcknowledged, ' +
            'other user (userMemberOfEntity2) has ack the card,' +
            'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return false',
        () => {
            const cardWithoutAcks = getOneCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state1',
                entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR'],
                hasBeenAcknowledged: false,
                entitiesAcks: ['ENTITY2']
            });

            const res = AcknowledgeStatus.hasLightCardBeenAcknowledgedByUserOrByUserEntity(cardWithoutAcks);
            expect(res).toBeFalse();
        }
    );

    it(
        'consideredAcknowledgedForUserWhen of the state is UserHasAcknowledged, ' +
            'other user member of ENTITY1 has ack the card,' +
            'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return false',
        () => {
            const cardWithoutAcks = getOneCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state1',
                entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR'],
                hasBeenAcknowledged: false,
                entitiesAcks: ['ENTITY1']
            });

            const res = AcknowledgeStatus.hasLightCardBeenAcknowledgedByUserOrByUserEntity(cardWithoutAcks);
            expect(res).toBeFalse();
        }
    );
    /*****  tests with consideredAcknowledgedForUserWhen = AllEntitiesOfUserHaveAcknowledged  **************************/

    it(
        'consideredAcknowledgedForUserWhen of the state is AllEntitiesOfUserHaveAcknowledged, ' +
            'no user has ack the card, no entity has ack the card, ' +
            'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return false',
        () => {
            const cardWithoutAcks = getOneCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state2',
                entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR'],
                hasBeenAcknowledged: false,
                entitiesAcks: []
            });

            const res = AcknowledgeStatus.hasLightCardBeenAcknowledgedByUserOrByUserEntity(cardWithoutAcks);
            expect(res).toBeFalse();
        }
    );

    it(
        'consideredAcknowledgedForUserWhen of the state is AllEntitiesOfUserHaveAcknowledged, ' +
            'user has ack the card with only ENTITY1 connected, no other entity has ack the card, ' +
            'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return false',
        () => {
            usersServerMock.setResponseForCurrentUserWithPerimeter(
                new ServerResponse(getUserMemberOfEntity1AndEntity3WithPerimeter(), ServerResponseStatus.OK, '')
            );
            UsersService.loadUserWithPerimetersData().subscribe();
            const cardWithAck = getOneCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state2',
                entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR', 'ENTITY3'],
                hasBeenAcknowledged: true,
                entitiesAcks: ['ENTITY1']
            });

            const res = AcknowledgeStatus.hasLightCardBeenAcknowledgedByUserOrByUserEntity(cardWithAck);
            expect(res).toBeFalse();
        }
    );

    it(
        'consideredAcknowledgedForUserWhen of the state is AllEntitiesOfUserHaveAcknowledged, ' +
            'user has ack the card with only ENTITY1 connected, other entity has ack the card, ' +
            'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return false',
        () => {
            usersServerMock.setResponseForCurrentUserWithPerimeter(
                new ServerResponse(getUserMemberOfEntity1AndEntity3WithPerimeter(), ServerResponseStatus.OK, '')
            );
            UsersService.loadUserWithPerimetersData().subscribe();
            const cardWithAck = getOneCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state2',
                entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR', 'ENTITY3'],
                hasBeenAcknowledged: true,
                entitiesAcks: ['ENTITY1', 'ENTITY2']
            });

            const res = AcknowledgeStatus.hasLightCardBeenAcknowledgedByUserOrByUserEntity(cardWithAck);
            expect(res).toBeFalse();
        }
    );

    it(
        'consideredAcknowledgedForUserWhen of the state is AllEntitiesOfUserHaveAcknowledged, ' +
            'user has ack the card with all of its entities (ENTITY1 and ENTITY3), no other entity has ack the card, ' +
            'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return true',
        () => {
            usersServerMock.setResponseForCurrentUserWithPerimeter(
                new ServerResponse(getUserMemberOfEntity1AndEntity3WithPerimeter(), ServerResponseStatus.OK, '')
            );
            UsersService.loadUserWithPerimetersData().subscribe();
            const cardWithAck = getOneCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state2',
                entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR', 'ENTITY3'],
                hasBeenAcknowledged: true,
                entitiesAcks: ['ENTITY1', 'ENTITY3']
            });

            const res = AcknowledgeStatus.hasLightCardBeenAcknowledgedByUserOrByUserEntity(cardWithAck);
            expect(res).toBeTrue();
        }
    );

    it(
        'consideredAcknowledgedForUserWhen of the state is AllEntitiesOfUserHaveAcknowledged, ' +
            'user has not ack the card but its entities (ENTITY1 and ENTITY3) have ack the card (other members dit it), ' +
            'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return true',
        () => {
            usersServerMock.setResponseForCurrentUserWithPerimeter(
                new ServerResponse(getUserMemberOfEntity1AndEntity3WithPerimeter(), ServerResponseStatus.OK, '')
            );
            UsersService.loadUserWithPerimetersData().subscribe();
            const cardWithAck = getOneCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state2',
                entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR', 'ENTITY3'],
                hasBeenAcknowledged: false,
                entitiesAcks: ['ENTITY1', 'ENTITY2', 'ENTITY3']
            });

            const res = AcknowledgeStatus.hasLightCardBeenAcknowledgedByUserOrByUserEntity(cardWithAck);
            expect(res).toBeTrue();
        }
    );

    it(
        'consideredAcknowledgedForUserWhen of the state is AllEntitiesOfUserHaveAcknowledged, ' +
            'user has not ack the card but one of his entities (ENTITY3) have ack the card (other members dit it), ' +
            'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return false',
        () => {
            usersServerMock.setResponseForCurrentUserWithPerimeter(
                new ServerResponse(getUserMemberOfEntity1AndEntity3WithPerimeter(), ServerResponseStatus.OK, '')
            );
            UsersService.loadUserWithPerimetersData().subscribe();
            const cardWithAck = getOneCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state2',
                entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR', 'ENTITY3'],
                hasBeenAcknowledged: false,
                entitiesAcks: ['ENTITY2', 'ENTITY3']
            });

            const res = AcknowledgeStatus.hasLightCardBeenAcknowledgedByUserOrByUserEntity(cardWithAck);
            expect(res).toBeFalse();
        }
    );

    it(
        'consideredAcknowledgedForUserWhen of the state is AllEntitiesOfUserHaveAcknowledged, ' +
            'the card has no entity recipients, ' +
            'user has not ack the card but one of his entities (ENTITY3) have ack the card (other members dit it), ' +
            'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return false',
        () => {
            usersServerMock.setResponseForCurrentUserWithPerimeter(
                new ServerResponse(getUserMemberOfEntity1AndEntity3WithPerimeter(), ServerResponseStatus.OK, '')
            );
            UsersService.loadUserWithPerimetersData().subscribe();
            const cardWithAck = getOneCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state2',
                userRecipients: ['userMemberOfEntity1', 'userMemberOfEntity2', 'userMemberOfEntity1AndEntity3'],
                entityRecipients: [],
                hasBeenAcknowledged: false,
                entitiesAcks: ['ENTITY2', 'ENTITY3']
            });

            const res = AcknowledgeStatus.hasLightCardBeenAcknowledgedByUserOrByUserEntity(cardWithAck);
            expect(res).toBeFalse();
        }
    );

    it(
        'consideredAcknowledgedForUserWhen of the state is AllEntitiesOfUserHaveAcknowledged, ' +
            'the card has no entity recipients, ' +
            'user has not ack the card but all of his entities (ENTITY1 and ENTITY3) have ack the card (other members dit it), ' +
            'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return false',
        () => {
            usersServerMock.setResponseForCurrentUserWithPerimeter(
                new ServerResponse(getUserMemberOfEntity1AndEntity3WithPerimeter(), ServerResponseStatus.OK, '')
            );
            UsersService.loadUserWithPerimetersData().subscribe();
            const cardWithAck = getOneCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state2',
                userRecipients: ['userMemberOfEntity1', 'userMemberOfEntity2', 'userMemberOfEntity1AndEntity3'],
                entityRecipients: [],
                hasBeenAcknowledged: false,
                entitiesAcks: ['ENTITY1', 'ENTITY2', 'ENTITY3']
            });

            const res = AcknowledgeStatus.hasLightCardBeenAcknowledgedByUserOrByUserEntity(cardWithAck);
            expect(res).toBeFalse();
        }
    );

    it(
        'consideredAcknowledgedForUserWhen of the state is AllEntitiesOfUserHaveAcknowledged, ' +
            'the card has no entity recipients, ' +
            'user has ack the card with all of his entities (ENTITY1 and ENTITY3), ' +
            'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return true',
        () => {
            usersServerMock.setResponseForCurrentUserWithPerimeter(
                new ServerResponse(getUserMemberOfEntity1AndEntity3WithPerimeter(), ServerResponseStatus.OK, '')
            );
            UsersService.loadUserWithPerimetersData().subscribe();
            const cardWithAck = getOneCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state2',
                userRecipients: ['userMemberOfEntity1', 'userMemberOfEntity2', 'userMemberOfEntity1AndEntity3'],
                entityRecipients: [],
                hasBeenAcknowledged: true,
                entitiesAcks: ['ENTITY1', 'ENTITY3']
            });

            const res = AcknowledgeStatus.hasLightCardBeenAcknowledgedByUserOrByUserEntity(cardWithAck);
            expect(res).toBeTrue();
        }
    );

    it(
        'consideredAcknowledgedForUserWhen of the state is AllEntitiesOfUserHaveAcknowledged, ' +
            'the card has no entity recipients, ' +
            'user has ack the card with only one of his entities (ENTITY3), ' +
            'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return true',
        () => {
            usersServerMock.setResponseForCurrentUserWithPerimeter(
                new ServerResponse(getUserMemberOfEntity1AndEntity3WithPerimeter(), ServerResponseStatus.OK, '')
            );
            UsersService.loadUserWithPerimetersData().subscribe();
            const cardWithAck = getOneCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state2',
                userRecipients: ['userMemberOfEntity1', 'userMemberOfEntity2', 'userMemberOfEntity1AndEntity3'],
                entityRecipients: [],
                hasBeenAcknowledged: true,
                entitiesAcks: ['ENTITY3']
            });

            const res = AcknowledgeStatus.hasLightCardBeenAcknowledgedByUserOrByUserEntity(cardWithAck);
            expect(res).toBeTrue();
        }
    );

    it(
        'consideredAcknowledgedForUserWhen of the state is AllEntitiesOfUserHaveAcknowledged, ' +
            'the card has entity recipients but none of those of the current user, ' +
            'user has not ack the card but one of his entities (ENTITY3) have ack the card (other members dit it), ' +
            'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return false',
        () => {
            usersServerMock.setResponseForCurrentUserWithPerimeter(
                new ServerResponse(getUserMemberOfEntity1AndEntity3WithPerimeter(), ServerResponseStatus.OK, '')
            );
            UsersService.loadUserWithPerimetersData().subscribe();
            const cardWithAck = getOneCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state2',
                userRecipients: ['userMemberOfEntity1', 'userMemberOfEntity2', 'userMemberOfEntity1AndEntity3'],
                entityRecipients: ['ENTITY2'],
                hasBeenAcknowledged: false,
                entitiesAcks: ['ENTITY2', 'ENTITY3']
            });

            const res = AcknowledgeStatus.hasLightCardBeenAcknowledgedByUserOrByUserEntity(cardWithAck);
            expect(res).toBeFalse();
        }
    );

    it(
        'consideredAcknowledgedForUserWhen of the state is AllEntitiesOfUserHaveAcknowledged, ' +
            'the card has entity recipients but none of those of the current user, ' +
            'user has not ack the card but all of his entities (ENTITY1 and ENTITY3) have ack the card (other members dit it), ' +
            'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return false',
        () => {
            usersServerMock.setResponseForCurrentUserWithPerimeter(
                new ServerResponse(getUserMemberOfEntity1AndEntity3WithPerimeter(), ServerResponseStatus.OK, '')
            );
            UsersService.loadUserWithPerimetersData().subscribe();
            const cardWithAck = getOneCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state2',
                userRecipients: ['userMemberOfEntity1', 'userMemberOfEntity2', 'userMemberOfEntity1AndEntity3'],
                entityRecipients: ['ENTITY2'],
                hasBeenAcknowledged: false,
                entitiesAcks: ['ENTITY1', 'ENTITY2', 'ENTITY3']
            });

            const res = AcknowledgeStatus.hasLightCardBeenAcknowledgedByUserOrByUserEntity(cardWithAck);
            expect(res).toBeFalse();
        }
    );

    it(
        'consideredAcknowledgedForUserWhen of the state is AllEntitiesOfUserHaveAcknowledged, ' +
            'the card has entity recipients but none of those of the current user, ' +
            'user has ack the card with all of his entities (ENTITY1 and ENTITY3), ' +
            'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return true',
        () => {
            usersServerMock.setResponseForCurrentUserWithPerimeter(
                new ServerResponse(getUserMemberOfEntity1AndEntity3WithPerimeter(), ServerResponseStatus.OK, '')
            );
            UsersService.loadUserWithPerimetersData().subscribe();
            const cardWithAck = getOneCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state2',
                userRecipients: ['userMemberOfEntity1', 'userMemberOfEntity2', 'userMemberOfEntity1AndEntity3'],
                entityRecipients: ['ENTITY2'],
                hasBeenAcknowledged: true,
                entitiesAcks: ['ENTITY1', 'ENTITY3']
            });

            const res = AcknowledgeStatus.hasLightCardBeenAcknowledgedByUserOrByUserEntity(cardWithAck);
            expect(res).toBeTrue();
        }
    );

    it(
        'consideredAcknowledgedForUserWhen of the state is AllEntitiesOfUserHaveAcknowledged, ' +
            'the card has entity recipients but none of those of the current user, ' +
            'user has ack the card with only one of his entities (ENTITY3), ' +
            'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return true',
        () => {
            usersServerMock.setResponseForCurrentUserWithPerimeter(
                new ServerResponse(getUserMemberOfEntity1AndEntity3WithPerimeter(), ServerResponseStatus.OK, '')
            );
            UsersService.loadUserWithPerimetersData().subscribe();
            const cardWithAck = getOneCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state2',
                userRecipients: ['userMemberOfEntity1', 'userMemberOfEntity2', 'userMemberOfEntity1AndEntity3'],
                entityRecipients: ['ENTITY2'],
                hasBeenAcknowledged: true,
                entitiesAcks: ['ENTITY3']
            });

            const res = AcknowledgeStatus.hasLightCardBeenAcknowledgedByUserOrByUserEntity(cardWithAck);
            expect(res).toBeTrue();
        }
    );

    it(
        'consideredAcknowledgedForUserWhen of the state is AllEntitiesOfUserHaveAcknowledged, ' +
            'user is member of publisher entity ENTITY1, ' +
            'user has ack the card with only ENTITY3 connected, other entity has ack the card, ' +
            'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return false',
        () => {
            usersServerMock.setResponseForCurrentUserWithPerimeter(
                new ServerResponse(getUserMemberOfEntity1AndEntity3WithPerimeter(), ServerResponseStatus.OK, '')
            );
            UsersService.loadUserWithPerimetersData().subscribe();
            const cardWithAck = getOneCard({
                publisher: 'ENTITY1',
                publisherType: 'ENTITY',
                process: 'testProcess',
                processVersion: '1',
                state: 'state2',
                entityRecipients: ['ENTITY2', 'ENTITY3'],
                hasBeenAcknowledged: true,
                entitiesAcks: ['ENTITY2', 'ENTITY3']
            });

            const res = AcknowledgeStatus.hasLightCardBeenAcknowledgedByUserOrByUserEntity(cardWithAck);
            expect(res).toBeFalse();
        }
    );

    it(
        'consideredAcknowledgedForUserWhen of the state is AllEntitiesOfUserHaveAcknowledged, ' +
            'user is member of publisher entity ENTITY1, ' +
            'user has ack the card with all of his entities (publisher ENTITY1 and ENTITY3), other entity has ack the card, ' +
            'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return true',
        () => {
            usersServerMock.setResponseForCurrentUserWithPerimeter(
                new ServerResponse(getUserMemberOfEntity1AndEntity3WithPerimeter(), ServerResponseStatus.OK, '')
            );
            UsersService.loadUserWithPerimetersData().subscribe();
            const cardWithAck = getOneCard({
                publisher: 'ENTITY1',
                publisherType: 'ENTITY',
                process: 'testProcess',
                processVersion: '1',
                state: 'state2',
                entityRecipients: ['ENTITY2', 'ENTITY3'],
                hasBeenAcknowledged: true,
                entitiesAcks: ['ENTITY1', 'ENTITY2', 'ENTITY3']
            });

            const res = AcknowledgeStatus.hasLightCardBeenAcknowledgedByUserOrByUserEntity(cardWithAck);
            expect(res).toBeTrue();
        }
    );

    it(
        'consideredAcknowledgedForUserWhen of the state is AllEntitiesOfUserHaveAcknowledged, ' +
            'user has Readonly permissions, ' +
            'user has ack the card, no other entity has ack the card, ' +
            'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return true',
        () => {
            usersServerMock.setResponseForCurrentUserWithPerimeter(
                new ServerResponse(getUserMemberOfEntity1WithPerimeterAndReadonly(), ServerResponseStatus.OK, '')
            );
            UsersService.loadUserWithPerimetersData().subscribe();
            const cardWithAck = getOneCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state2',
                entityRecipients: ['ENTITY1'],
                hasBeenAcknowledged: true,
                entitiesAcks: []
            });

            const res = AcknowledgeStatus.hasLightCardBeenAcknowledgedByUserOrByUserEntity(cardWithAck);
            expect(res).toBeTrue();
        }
    );
});
