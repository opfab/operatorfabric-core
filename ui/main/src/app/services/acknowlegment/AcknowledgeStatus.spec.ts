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
import {getOneCard, setEntities, setProcessConfiguration} from '@tests/helpers';
import {UserWithPerimeters} from '@ofServices/users/model/UserWithPerimeters';
import {User} from '@ofServices/users/model/User';
import {RightEnum} from '@ofServices/perimeters/model/Perimeter';
import {UsersService} from '../users/UsersService';
import {UsersServerMock} from '@tests/mocks/UsersServer.mock';
import {Entity} from '@ofServices/entities/model/Entity';
import {ServerResponse, ServerResponseStatus} from '../../server/ServerResponse';
import {PermissionEnum} from '@ofServices/groups/model/PermissionEnum';

describe('AcknowledgeStatus', () => {
    let userMemberOfEntity1: User, userMemberOfEntity1AndEntity3: User;
    let usersServerMock: UsersServerMock;

    beforeAll(async () => {
        setEntities([
            new Entity('ENTITY1', 'ENTITY 1', '', [], null, null),
            new Entity('ENTITY2', 'ENTITY 2', '', [], null, ['PARENT']),
            new Entity('ENTITY3', 'ENTITY 3', '', [], null, ['PARENT']),
            new Entity('ENTITY_FR', 'ENTITY FR', '', [], null, null),
            new Entity('PARENT', 'PARENT', '', [], null, null)
        ]);
        setProcessConfiguration(getTestProcesses());

        userMemberOfEntity1 = new User('userMemberOfEntity1', '', '', null, [], ['ENTITY1']);
        userMemberOfEntity1AndEntity3 = new User(
            'userMemberOfEntity1AndEntity3',
            '',
            null,
            '',
            [],
            ['ENTITY1', 'ENTITY3', 'PARENT']
        );
    });

    beforeEach(() => {
        usersServerMock = new UsersServerMock();
        usersServerMock.setResponseForCurrentUserWithPerimeter(
            new ServerResponse(getUserMemberOfEntity1WithPerimeter(), ServerResponseStatus.OK, '')
        );
        UsersService.setUsersServer(usersServerMock);

        UsersService.loadUserWithPerimetersData().subscribe();
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
    describe('ConsideredAcknowledgedForUserWhen of the state is UserHasAcknowledged', () => {
        it('the card is not acknowledged if no user has ack the card, no entity has ack the card', () => {
            const cardWithoutAcks = getOneCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state1',
                entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR'],
                hasBeenAcknowledged: false,
                entitiesAcks: []
            });

            const res = AcknowledgeStatus.isCardAcknowledgedForCurrentUser(cardWithoutAcks);
            expect(res).toBeFalse();
        });

        it('the card is acknowledged if user has ack the card and no entity has ack the card', () => {
            const cardWithAck = getOneCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state1',
                entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR'],
                hasBeenAcknowledged: true,
                entitiesAcks: ['ENTITY1']
            });

            const res = AcknowledgeStatus.isCardAcknowledgedForCurrentUser(cardWithAck);
            expect(res).toBeTrue();
        });

        it('the card is not acknowledged id other user (userMemberOfEntity2) has ack the card', () => {
            const cardWithoutAcks = getOneCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state1',
                entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR'],
                hasBeenAcknowledged: false,
                entitiesAcks: ['ENTITY2']
            });

            const res = AcknowledgeStatus.isCardAcknowledgedForCurrentUser(cardWithoutAcks);
            expect(res).toBeFalse();
        });
        it('the card is not acknowledged if another user member of ENTITY1 has ack the card', () => {
            const cardWithoutAcks = getOneCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state1',
                entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR'],
                hasBeenAcknowledged: false,
                entitiesAcks: ['ENTITY1']
            });

            const res = AcknowledgeStatus.isCardAcknowledgedForCurrentUser(cardWithoutAcks);
            expect(res).toBeFalse();
        });
    });
    describe('ConsideredAcknowledgedForUserWhen of the state is AllEntitiesOfUserHaveAcknowledged', () => {
        function isCardAcknowledge(cardTemplate: any) {
            return AcknowledgeStatus.isCardAcknowledgedForCurrentUser(
                getOneCard({
                    process: 'testProcess',
                    processVersion: '1',
                    state: 'state2',
                    publisher: cardTemplate.publisher ?? 'test',
                    publisherType: 'ENTITY',
                    userRecipients: cardTemplate.userRecipients ?? [],
                    entityRecipients: cardTemplate.entityRecipients,
                    hasBeenAcknowledged: cardTemplate.hasBeenAcknowledged,
                    entitiesAcks: cardTemplate.entitiesAcks
                })
            );
        }
        beforeEach(() => {
            usersServerMock.setResponseForCurrentUserWithPerimeter(
                new ServerResponse(getUserMemberOfEntity1AndEntity3WithPerimeter(), ServerResponseStatus.OK, '')
            );
            UsersService.loadUserWithPerimetersData().subscribe();
        });
        describe('card has entityRecipients of the user', () => {
            it('the card is not acknowledged if no user has ack the card, no entity has ack the card', () => {
                expect(
                    isCardAcknowledge({
                        entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR', 'ENTITY3'],
                        hasBeenAcknowledged: false,
                        entitiesAcks: []
                    })
                ).toBeFalse();
            });

            it('the card is not acknowledged if no user has ack the card, no entity has ack the card , field is undefined', () => {
                expect(
                    isCardAcknowledge({
                        entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR', 'ENTITY3'],
                        hasBeenAcknowledged: false,
                        entitiesAcks: undefined
                    })
                ).toBeFalse();
            });

            it('the card is not acknowledged if user has ack the card with only ENTITY1 connected and  no other entity has ack the card', () => {
                expect(
                    isCardAcknowledge({
                        entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR', 'ENTITY3'],
                        hasBeenAcknowledged: true,
                        entitiesAcks: ['ENTITY1']
                    })
                ).toBeFalse();
            });

            it('the card is not acknowledged if user has ack the card with only ENTITY1 connected and other entity has ack the card', () => {
                expect(
                    isCardAcknowledge({
                        entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR', 'ENTITY3'],
                        hasBeenAcknowledged: true,
                        entitiesAcks: ['ENTITY1', 'ENTITY2']
                    })
                ).toBeFalse();
            });

            it('the card is acknowledged if user has ack the card with all of its entities (ENTITY1 and ENTITY3), no other entity has ack the card', () => {
                expect(
                    isCardAcknowledge({
                        entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR', 'ENTITY3'],
                        hasBeenAcknowledged: true,
                        entitiesAcks: ['ENTITY1', 'ENTITY3']
                    })
                ).toBeTrue();
            });
            it('the card is acknowledged if user has ack the card with all of its entities except parent entity', () => {
                expect(
                    isCardAcknowledge({
                        entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY3', 'PARENT'],
                        hasBeenAcknowledged: true,
                        entitiesAcks: ['ENTITY1', 'ENTITY3']
                    })
                ).toBeTrue();
            });

            it('the card is acknowledged if user has not ack the card but its entities (ENTITY1 and ENTITY3) have ack the card (other members dit it)', () => {
                expect(
                    isCardAcknowledge({
                        entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR', 'ENTITY3'],
                        hasBeenAcknowledged: false,
                        entitiesAcks: ['ENTITY1', 'ENTITY2', 'ENTITY3']
                    })
                ).toBeTrue();
            });

            it('the card is not acknowledged if user has not ack the card but one of his entities (ENTITY3) have ack the card (other members dit it)', () => {
                expect(
                    isCardAcknowledge({
                        entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR', 'ENTITY3'],
                        hasBeenAcknowledged: false,
                        entitiesAcks: ['ENTITY2', 'ENTITY3']
                    })
                ).toBeFalse();
            });
        });
        describe('card has no entity recipients', () => {
            it('the card is not acknowledged if user has not ack the card but one of his entities (ENTITY3) has been acked by other members)', () => {
                expect(
                    isCardAcknowledge({
                        entityRecipients: [],
                        hasBeenAcknowledged: false,
                        entitiesAcks: ['ENTITY2', 'ENTITY3']
                    })
                );
            });

            it('the card is not acknowledged if user has not ack the card but all of his entities (ENTITY1 and ENTITY3) have been acked by other members', () => {
                expect(
                    isCardAcknowledge({
                        entityRecipients: [],
                        hasBeenAcknowledged: false,
                        entitiesAcks: ['ENTITY1', 'ENTITY2', 'ENTITY3']
                    })
                ).toBeFalse();
            });

            it('the card is acknowledged if user has ack the card with all of his entities (ENTITY1 and ENTITY3)', () => {
                expect(
                    isCardAcknowledge({
                        entityRecipients: [],
                        hasBeenAcknowledged: true,
                        entitiesAcks: ['ENTITY1', 'ENTITY3']
                    })
                ).toBeTrue();
            });

            it('the card is acknowledged if user has ack the card with only one of his entities (ENTITY3)', () => {
                expect(
                    isCardAcknowledge({
                        entityRecipients: [],
                        hasBeenAcknowledged: true,
                        entitiesAcks: ['ENTITY3']
                    })
                ).toBeTrue();
            });
        });
        describe('card has entity recipients but none of the current user', () => {
            it('the card is not acknowledged if user has not ack the card but one of his entities (ENTITY3) have been acked other members', () => {
                expect(
                    isCardAcknowledge({
                        entityRecipients: ['ENTITY2'],
                        hasBeenAcknowledged: false,
                        entitiesAcks: ['ENTITY2', 'ENTITY3']
                    })
                ).toBeFalse();
            });

            it('the card is not acknowledged if user has not ack the card but all of his entities (ENTITY1 and ENTITY3) have been acked by other members', () => {
                expect(
                    isCardAcknowledge({
                        userRecipients: ['userMemberOfEntity1', 'userMemberOfEntity2', 'userMemberOfEntity1AndEntity3'],
                        entityRecipients: ['ENTITY2'],
                        hasBeenAcknowledged: false,
                        entitiesAcks: ['ENTITY1', 'ENTITY2', 'ENTITY3']
                    })
                ).toBeFalse();
            });

            it('the card is acknowledged if user has ack the card with all of his entities (ENTITY1 and ENTITY3)', () => {
                expect(
                    isCardAcknowledge({
                        userRecipients: ['userMemberOfEntity1', 'userMemberOfEntity2', 'userMemberOfEntity1AndEntity3'],
                        entityRecipients: ['ENTITY2'],
                        hasBeenAcknowledged: true,
                        entitiesAcks: ['ENTITY1', 'ENTITY3']
                    })
                ).toBeTrue();
            });

            it(`the card is acknowledged if user has ack the card with only one of his entities (ENTITY3) `, () => {
                expect(
                    isCardAcknowledge({
                        userRecipients: ['userMemberOfEntity1', 'userMemberOfEntity2', 'userMemberOfEntity1AndEntity3'],
                        entityRecipients: ['ENTITY2'],
                        hasBeenAcknowledged: true,
                        entitiesAcks: ['ENTITY3']
                    })
                ).toBeTrue();
            });
        });
        describe('user is member of publisher entity which is not recipient of the card', () => {
            it(`the card is not acknowledged if user has ack the card with only ENTITY3 connected and other entity has ack the card`, () => {
                expect(
                    isCardAcknowledge({
                        publisher: 'ENTITY1',
                        entityRecipients: ['ENTITY2', 'ENTITY3'],
                        hasBeenAcknowledged: true,
                        entitiesAcks: ['ENTITY2', 'ENTITY3']
                    })
                ).toBeFalse();
            });

            it(`the card is acknowleded if user has ack the card with all of his entities (publisher ENTITY1 and ENTITY3) and other entity has ack the card, `, () => {
                expect(
                    isCardAcknowledge({
                        publisher: 'ENTITY1',
                        entityRecipients: ['ENTITY2', 'ENTITY3'],
                        hasBeenAcknowledged: true,
                        entitiesAcks: ['ENTITY1', 'ENTITY2', 'ENTITY3']
                    })
                ).toBeTrue();
            });
            it('the card is acknowledged if user has not ack the card but others did it for all his entities (ENTITY1 and ENTITY3)', () => {
                expect(
                    isCardAcknowledge({
                        publisher: 'ENTITY1',
                        entityRecipients: ['ENTITY2', 'ENTITY3'],
                        hasBeenAcknowledged: false,
                        entitiesAcks: ['ENTITY1', 'ENTITY2', 'ENTITY3']
                    })
                ).toBeTrue();
            });
            it('the card is acknowledged if user has not ack the card , card has no entity recipients and card has been ack by another user of the publisher entity', () => {
                expect(
                    isCardAcknowledge({
                        publisher: 'ENTITY1',
                        entityRecipients: [],
                        hasBeenAcknowledged: false,
                        entitiesAcks: ['ENTITY1']
                    })
                ).toBeTrue();
            });
        });
        describe('user has Readonly permissions', () => {
            it('the card is acknowledged if user has ack the card, no other entity has ack the card', () => {
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

                const res = AcknowledgeStatus.isCardAcknowledgedForCurrentUser(cardWithAck);
                expect(res).toBeTrue();
            });
        });
    });
});
