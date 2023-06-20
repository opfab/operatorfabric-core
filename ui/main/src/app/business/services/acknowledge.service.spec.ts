/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AcknowledgeService} from './acknowledge.service';
import {
    AcknowledgmentAllowedEnum,
    ConsideredAcknowledgedForUserWhenEnum,
    Process,
    Response,
    State
} from '@ofModel/processes.model';
import {getOneRandomCard, getOneRandomProcess} from '@tests/helpers';
import {Card} from '@ofModel/card.model';
import {UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {User} from '@ofModel/user.model';
import {RightsEnum} from '@ofModel/perimeter.model';
import {ConfigService} from 'app/business/services/config.service';
import {EntitiesService} from 'app/business/services/users/entities.service';
import {ConfigServerMock} from '@tests/mocks/configServer.mock';
import {ProcessServerMock} from '@tests/mocks/processServer.mock';
import {UserPermissionsService} from './user-permissions.service';
import {ProcessesService} from './processes.service';
import {UserService} from './users/user.service';
import {OpfabLoggerService} from './logs/opfab-logger.service';
import {RemoteLoggerServiceMock} from '@tests/mocks/remote-logger.service.mock';
import {UserServerMock} from '@tests/mocks/userServer.mock';
import {AlertMessageService} from './alert-message.service';
import {EntitiesServerMock} from '@tests/mocks/entitiesServer.mock';
import {Entity} from '@ofModel/entity.model';
import {ServerResponse, ServerResponseStatus} from '../server/serverResponse';

describe('AcknowledgeService testing ', () => {
    let acknowledgeService: AcknowledgeService;
    let entitiesService: EntitiesService;
    let card: Card;
    let userMemberOfEntity1: User, userMemberOfEntity2: User, userMemberOfEntity1AndEntity3: User;
    let statesList: Map<string, State>;
    let userServerMock: UserServerMock;
    let userService: UserService;

    beforeEach(() => {
        userMemberOfEntity1 = new User('userMemberOfEntity1', 'firstName', 'lastName', ['group1'], ['ENTITY1']);
        userMemberOfEntity2 = new User('userMemberOfEntity2', 'firstName', 'lastName', ['group1'], ['ENTITY2']);
        userMemberOfEntity1AndEntity3 = new User('userMemberOfEntity1AndEntity3', 'firstName', 'lastName', ['group1'], ['ENTITY1', 'ENTITY3']);

        statesList = new Map<string, State>();
        const configServerMock = new ConfigServerMock();
        const opfabLoggerService = new OpfabLoggerService(
            new RemoteLoggerServiceMock(new ConfigService(configServerMock), null)
        );
        userServerMock = new UserServerMock();
        userServerMock.setResponseForCurrentUserWithPerimeter(new ServerResponse(getUserMemberOfEntity1WithPerimeter(), ServerResponseStatus.OK, ""));
        userService = new UserService(userServerMock, opfabLoggerService, null);

        const processServerMock = new ProcessServerMock();
        processServerMock.setResponseForAllProcessDefinition(new ServerResponse(getTestProcesses(), ServerResponseStatus.OK, ""));
        const processesService = new ProcessesService(null, processServerMock, configServerMock);
        processesService.loadAllProcesses().subscribe();
        userService.loadUserWithPerimetersData().subscribe();

        const mockEntitiesServer = new EntitiesServerMock();
        mockEntitiesServer.setEntities([new Entity("ENTITY1", "ENTITY 1", "", true, null, null),
                                        new Entity("ENTITY2", "ENTITY 2", "", true, null, null),
                                        new Entity("ENTITY3", "ENTITY 3", "", true, null, null),
                                        new Entity("ENTITY_FR", "ENTITY FR", "", true, null, null)]);
        entitiesService = new EntitiesService(opfabLoggerService, mockEntitiesServer, new AlertMessageService());

        const userPermissionService = new UserPermissionsService(entitiesService, processesService);

        acknowledgeService = new AcknowledgeService(null, userPermissionService, userService, processesService, entitiesService);


        entitiesService.loadAllEntitiesData().subscribe();

        card = getOneRandomCard({
            process: 'testProcess',
            processVersion: '1',
            state: 'testState',
            entitiesAllowedToRespond: ['ENTITY1']
        });
    });

    function getTestProcesses(): Process[] {
        const state1 = new State();
        state1.acknowledgmentAllowed = AcknowledgmentAllowedEnum.ALWAYS;
        state1.consideredAcknowledgedForUserWhen = ConsideredAcknowledgedForUserWhenEnum.USER_HAS_ACKNOWLEDGED;

        const state2 = new State();
        state2.acknowledgmentAllowed = AcknowledgmentAllowedEnum.ALWAYS;
        state2.consideredAcknowledgedForUserWhen = ConsideredAcknowledgedForUserWhenEnum.ALL_ENTITIES_OF_USER_HAVE_ACKNOWLEDGED;

        const statesList = new Map();
        statesList.set('state1', state1);
        statesList.set('state2', state2);

        const testProcess = new Process("testProcess", "1", null, null, statesList);
        return [testProcess];
    }

    function getUserMemberOfEntity1WithPerimeter(): UserWithPerimeters {
        return  new UserWithPerimeters(userMemberOfEntity1, [
            {
                process: 'testProcess',
                state: 'state1',
                rights: RightsEnum.ReceiveAndWrite,
                filteringNotificationAllowed: true
            },
            {
                process: 'testProcess',
                state: 'state2',
                rights: RightsEnum.ReceiveAndWrite,
                filteringNotificationAllowed: true
            }
        ]);
    }

    function getUserMemberOfEntity1AndEntity3WithPerimeter(): UserWithPerimeters {
        return  new UserWithPerimeters(userMemberOfEntity1AndEntity3, [
            {
                process: 'testProcess',
                state: 'state1',
                rights: RightsEnum.ReceiveAndWrite,
                filteringNotificationAllowed: true
            },
            {
                process: 'testProcess',
                state: 'state2',
                rights: RightsEnum.ReceiveAndWrite,
                filteringNotificationAllowed: true
            }
        ]);
    }

    it('acknowledgmentAllowed of the state is not present , isAcknowledgmentAllowed() must return true (default value)', () => {
        statesList.set('testState', new State(null, null, null, null));
        const processDefinition = getOneRandomProcess({id: 'testProcess', version: '1', states: statesList});
        const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1, [
            {process: 'testProcess', state: 'testState', rights: RightsEnum.Receive, filteringNotificationAllowed: true}
        ]);

        const res = acknowledgeService.isAcknowledgmentAllowed(userWithPerimeters, card, processDefinition);
        expect(res).toBeTrue();
    });

    it('process does not exist , isAcknowledgmentAllowed() must return true (default value)', () => {
        const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1, [
            {process: 'testProcess', state: 'testState', rights: RightsEnum.Receive, filteringNotificationAllowed: true}
        ]);
        const res = acknowledgeService.isAcknowledgmentAllowed(userWithPerimeters, card, null);
        expect(res).toBeTrue();
    });

    it('state does not exist , isAcknowledgmentAllowed() must return true (default value)', () => {
        statesList.set('dummyState', new State(null, null, null, null));
        const processDefinition = getOneRandomProcess({id: 'testProcess', version: '1', states: statesList});
        const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1, [
            {process: 'testProcess', state: 'testState', rights: RightsEnum.Receive, filteringNotificationAllowed: true}
        ]);

        const res = acknowledgeService.isAcknowledgmentAllowed(userWithPerimeters, card, processDefinition);
        expect(res).toBeTrue();
    });

    it('acknowledgmentAllowed of the state is Never, isAcknowledgmentAllowed() must return false', () => {
        statesList.set('testState', new State(null, null, null, AcknowledgmentAllowedEnum.NEVER));
        const processDefinition = getOneRandomProcess({id: 'testProcess', version: '1', states: statesList});

        const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1, [
            {process: 'testProcess', state: 'testState', rights: RightsEnum.Receive, filteringNotificationAllowed: true}
        ]);

        const res = acknowledgeService.isAcknowledgmentAllowed(userWithPerimeters, card, processDefinition);
        expect(res).toBeFalse();
    });

    it('acknowledgmentAllowed of the state is Always, isAcknowledgmentAllowed() must return true', () => {
        statesList.set('testState', new State(null, null, null, AcknowledgmentAllowedEnum.ALWAYS));
        const processDefinition = getOneRandomProcess({id: 'testProcess', version: '1', states: statesList});
        const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1, [
            {process: 'testProcess', state: 'testState', rights: RightsEnum.Receive, filteringNotificationAllowed: true}
        ]);

        const res = acknowledgeService.isAcknowledgmentAllowed(userWithPerimeters, card, processDefinition);
        expect(res).toBeTrue();
    });

    it(
        'acknowledgmentAllowed of the state is OnlyWhenResponseDisabledForUser, ' +
            'user cannot respond (user is a member of entity allowed to respond but user rights for the state of the response is Receive), ' +
            'isAcknowledgmentAllowed() must return true',
        () => {
            statesList.set(
                'testState',
                new State(
                    null,
                    null,
                    new Response(null, 'responseState'),
                    AcknowledgmentAllowedEnum.ONLY_WHEN_RESPONSE_DISABLED_FOR_USER
                )
            );
            const processDefinition = getOneRandomProcess({id: 'testProcess', version: '1', states: statesList});
            const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1, [
                {
                    process: 'testProcess',
                    state: 'responseState',
                    rights: RightsEnum.Receive,
                    filteringNotificationAllowed: true
                }
            ]);

            const res = acknowledgeService.isAcknowledgmentAllowed(userWithPerimeters, card, processDefinition);
            expect(res).toBeTrue();
        }
    );

    it(
        'acknowledgmentAllowed of the state is OnlyWhenResponseDisabledForUser, ' +
            'user can respond (user is a member of entity allowed to respond and user rights for the state of the response is Write), ' +
            'isAcknowledgmentAllowed() must return false',
        () => {
            statesList.set(
                'testState',
                new State(
                    null,
                    null,
                    new Response(null, 'responseState'),
                    AcknowledgmentAllowedEnum.ONLY_WHEN_RESPONSE_DISABLED_FOR_USER
                )
            );
            const processDefinition = getOneRandomProcess({id: 'testProcess', version: '1', states: statesList});
            const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1, [
                {
                    process: 'testProcess',
                    state: 'responseState',
                    rights: RightsEnum.ReceiveAndWrite,
                    filteringNotificationAllowed: true
                }
            ]);

            const res = acknowledgeService.isAcknowledgmentAllowed(userWithPerimeters, card, processDefinition);
            expect(res).toBeFalse();
        }
    );

    it(
        'acknowledgmentAllowed of the state is OnlyWhenResponseDisabledForUser, ' +
            'user can respond (user is a member of entity allowed to respond and user rights for the state of the response is ReceiveAndWrite), ' +
            'isAcknowledgmentAllowed() must return false',
        () => {
            statesList.set(
                'testState',
                new State(
                    null,
                    null,
                    new Response(null, 'responseState'),
                    AcknowledgmentAllowedEnum.ONLY_WHEN_RESPONSE_DISABLED_FOR_USER
                )
            );
            const processDefinition = getOneRandomProcess({id: 'testProcess', version: '1', states: statesList});
            const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1, [
                {
                    process: 'testProcess',
                    state: 'responseState',
                    rights: RightsEnum.ReceiveAndWrite,
                    filteringNotificationAllowed: true
                }
            ]);

            const res = acknowledgeService.isAcknowledgmentAllowed(userWithPerimeters, card, processDefinition);
            expect(res).toBeFalse();
        }
    );

    it(
        'acknowledgmentAllowed of the state is OnlyWhenResponseDisabledForUser, ' +
            'user cannot respond (user is not a member of entity allowed to respond and user rights for the state of the response is Receive), ' +
            'isAcknowledgmentAllowed() must return true',
        () => {
            statesList.set(
                'testState',
                new State(
                    null,
                    null,
                    new Response(null, 'responseState'),
                    AcknowledgmentAllowedEnum.ONLY_WHEN_RESPONSE_DISABLED_FOR_USER
                )
            );
            const processDefinition = getOneRandomProcess({id: 'testProcess', version: '1', states: statesList});
            const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity2, [
                {
                    process: 'testProcess',
                    state: 'responseState',
                    rights: RightsEnum.Receive,
                    filteringNotificationAllowed: true
                }
            ]);

            const res = acknowledgeService.isAcknowledgmentAllowed(userWithPerimeters, card, processDefinition);
            expect(res).toBeTrue();
        }
    );

    it(
        'acknowledgmentAllowed of the state is OnlyWhenResponseDisabledForUser, ' +
            'user cannot respond (user is not a member of entity allowed to respond and user rights for the state of the response is Write), ' +
            'isAcknowledgmentAllowed() must return true',
        () => {
            statesList.set(
                'testState',
                new State(
                    null,
                    null,
                    new Response(null, 'responseState'),
                    AcknowledgmentAllowedEnum.ONLY_WHEN_RESPONSE_DISABLED_FOR_USER
                )
            );
            const processDefinition = getOneRandomProcess({id: 'testProcess', version: '1', states: statesList});
            const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity2, [
                {
                    process: 'testProcess',
                    state: 'responseState',
                    rights: RightsEnum.ReceiveAndWrite,
                    filteringNotificationAllowed: true
                }
            ]);

            const res = acknowledgeService.isAcknowledgmentAllowed(userWithPerimeters, card, processDefinition);
            expect(res).toBeTrue();
        }
    );

    it(
        'acknowledgmentAllowed of the state is OnlyWhenResponseDisabledForUser, ' +
            'user cannot respond (user is not a member of entity allowed to respond and user rights for the state of the response is ReceiveAndWrite), ' +
            'isAcknowledgmentAllowed() must return true',
        () => {
            statesList.set(
                'testState',
                new State(
                    null,
                    null,
                    new Response(null, 'responseState'),
                    AcknowledgmentAllowedEnum.ONLY_WHEN_RESPONSE_DISABLED_FOR_USER
                )
            );
            const processDefinition = getOneRandomProcess({id: 'testProcess', version: '1', states: statesList});
            const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity2, [
                {
                    process: 'testProcess',
                    state: 'responseState',
                    rights: RightsEnum.ReceiveAndWrite,
                    filteringNotificationAllowed: true
                }
            ]);

            const res = acknowledgeService.isAcknowledgmentAllowed(userWithPerimeters, card, processDefinition);
            expect(res).toBeTrue();
        }
    );

    it(
        'acknowledgmentAllowed of the state is OnlyWhenResponseDisabledForUser, ' +
            'user can respond (user is a member of entity allowed to respond (ENTITY_1) and user rights for the state of the response is Write), ' +
            'isAcknowledgmentAllowed() must return false',
        () => {
            statesList.set(
                'testState',
                new State(
                    null,
                    null,
                    new Response(null, 'responseState'),
                    AcknowledgmentAllowedEnum.ONLY_WHEN_RESPONSE_DISABLED_FOR_USER
                )
            );
            const processDefinition = getOneRandomProcess({id: 'testProcess', version: '1', states: statesList});
            const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1, [
                {
                    process: 'testProcess',
                    state: 'responseState',
                    rights: RightsEnum.ReceiveAndWrite,
                    filteringNotificationAllowed: true
                }
            ]);

            const res = acknowledgeService.isAcknowledgmentAllowed(
                userWithPerimeters,
                card,
                processDefinition
            );
            expect(res).toBeFalse();
        }
    );

    it(
        'acknowledgmentAllowed of the state is OnlyWhenResponseDisabledForUser, ' +
            'user cannot respond (user is a member of entity allowed to respond (ENTITY1) rights for the state of the response is Receive), ' +
            'isAcknowledgmentAllowed() must return true',
        () => {
            statesList.set(
                'testState',
                new State(
                    null,
                    null,
                    new Response(null, 'responseState'),
                    AcknowledgmentAllowedEnum.ONLY_WHEN_RESPONSE_DISABLED_FOR_USER
                )
            );
            const processDefinition = getOneRandomProcess({id: 'testProcess', version: '1', states: statesList});
            const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1, [
                {
                    process: 'testProcess',
                    state: 'responseState',
                    rights: RightsEnum.Receive,
                    filteringNotificationAllowed: true
                }
            ]);

            const res = acknowledgeService.isAcknowledgmentAllowed(
                userWithPerimeters,
                card,
                processDefinition
            );
            expect(res).toBeTrue();
        }
    );

    it(
        'acknowledgmentAllowed of the state is OnlyWhenResponseDisabledForUser, ' +
            'user can respond (user is a member of entity allowed to respond and user rights for the state of the response is Write), ' +
            'lttd is not reached, isAcknowledgmentAllowed() must return false',
        () => {
            const lttdInTheFuture = new Date().valueOf() + 100000;
            const cardWithLttd = getOneRandomCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'testState',
                entitiesAllowedToRespond: ['ENTITY1'],
                lttd: lttdInTheFuture
            });
            statesList.set(
                'testState',
                new State(
                    null,
                    null,
                    new Response(null, 'responseState'),
                    AcknowledgmentAllowedEnum.ONLY_WHEN_RESPONSE_DISABLED_FOR_USER
                )
            );
            const processDefinition = getOneRandomProcess({id: 'testProcess', version: '1', states: statesList});
            const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1, [
                {
                    process: 'testProcess',
                    state: 'responseState',
                    rights: RightsEnum.ReceiveAndWrite,
                    filteringNotificationAllowed: true
                }
            ]);

            const res = acknowledgeService.isAcknowledgmentAllowed(userWithPerimeters, cardWithLttd, processDefinition);
            expect(res).toBeFalse();
        }
    );

    it(
        'acknowledgmentAllowed of the state is OnlyWhenResponseDisabledForUser, ' +
            'user can respond (user is a member of entity allowed to respond and user rights for the state of the response is Write), ' +
            'lttd is reached, isAcknowledgmentAllowed() must return true',
        () => {
            const lttdInThePast = new Date().valueOf() - 100000;
            const cardWithLttd = getOneRandomCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'testState',
                entitiesAllowedToRespond: ['ENTITY1'],
                lttd: lttdInThePast
            });
            statesList.set(
                'testState',
                new State(
                    null,
                    null,
                    new Response(null, 'responseState'),
                    AcknowledgmentAllowedEnum.ONLY_WHEN_RESPONSE_DISABLED_FOR_USER
                )
            );
            const processDefinition = getOneRandomProcess({id: 'testProcess', version: '1', states: statesList});
            const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1, [
                {
                    process: 'testProcess',
                    state: 'responseState',
                    rights: RightsEnum.ReceiveAndWrite,
                    filteringNotificationAllowed: true
                }
            ]);

            const res = acknowledgeService.isAcknowledgmentAllowed(userWithPerimeters, cardWithLttd, processDefinition);
            expect(res).toBeTrue();
        }
    );
    /*****  tests with consideredAcknowledgedForUserWhen = UserHasAcknowledged  ****************************************/

    it('consideredAcknowledgedForUserWhen of the state is UserHasAcknowledged, ' +
       'no user has ack the card, no entity has ack the card, ' +
       'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return false',
        () => {
            const cardWithoutAcks = getOneRandomCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state1',
                entityRecipients: ["ENTITY1", "ENTITY2", "ENTITY_FR"],
                hasBeenAcknowledged: false,
                entitiesAcks: []
            });

            const res = acknowledgeService.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(cardWithoutAcks);
            expect(res).toBeFalse();
        }
    );

    it('consideredAcknowledgedForUserWhen of the state is UserHasAcknowledged, ' +
       'user has ack the card, no other entity has ack the card, ' +
       'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return true',
        () => {
            const cardWithAck = getOneRandomCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state1',
                entityRecipients: ["ENTITY1", "ENTITY2", "ENTITY_FR"],
                hasBeenAcknowledged: true,
                entitiesAcks: ["ENTITY1"]
            });

            const res = acknowledgeService.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(cardWithAck);
            expect(res).toBeTrue();
        }
    );

    it('consideredAcknowledgedForUserWhen of the state is UserHasAcknowledged, ' +
       'other user (userMemberOfEntity2) has ack the card,' +
       'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return false',
        () => {
            const cardWithoutAcks = getOneRandomCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state1',
                entityRecipients: ["ENTITY1", "ENTITY2", "ENTITY_FR"],
                hasBeenAcknowledged: false,
                entitiesAcks: ["ENTITY2"]
            });

            const res = acknowledgeService.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(cardWithoutAcks);
            expect(res).toBeFalse();
        }
    );

    it('consideredAcknowledgedForUserWhen of the state is UserHasAcknowledged, ' +
       'other user member of ENTITY1 has ack the card,' +
       'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return false',
        () => {
            const cardWithoutAcks = getOneRandomCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state1',
                entityRecipients: ["ENTITY1", "ENTITY2", "ENTITY_FR"],
                hasBeenAcknowledged: false,
                entitiesAcks: ["ENTITY1"]
            });

            const res = acknowledgeService.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(cardWithoutAcks);
            expect(res).toBeFalse();
        }
    );
    /*****  tests with consideredAcknowledgedForUserWhen = AllEntitiesOfUserHaveAcknowledged  **************************/

    it('consideredAcknowledgedForUserWhen of the state is AllEntitiesOfUserHaveAcknowledged, ' +
       'no user has ack the card, no entity has ack the card, ' +
       'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return false',
        () => {
            const cardWithoutAcks = getOneRandomCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state2',
                entityRecipients: ["ENTITY1", "ENTITY2", "ENTITY_FR"],
                hasBeenAcknowledged: false,
                entitiesAcks: []
            });

            const res = acknowledgeService.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(cardWithoutAcks);
            expect(res).toBeFalse();
        }
    );

    it('consideredAcknowledgedForUserWhen of the state is AllEntitiesOfUserHaveAcknowledged, ' +
       'user has ack the card with only ENTITY1 connected, no other entity has ack the card, ' +
       'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return false',
        () => {
            userServerMock.setResponseForCurrentUserWithPerimeter(new ServerResponse(getUserMemberOfEntity1AndEntity3WithPerimeter(), ServerResponseStatus.OK, ""));
            userService.loadUserWithPerimetersData().subscribe();
            const cardWithAck = getOneRandomCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state2',
                entityRecipients: ["ENTITY1", "ENTITY2", "ENTITY_FR", "ENTITY3"],
                hasBeenAcknowledged: true,
                entitiesAcks: ["ENTITY1"]
            });

            const res = acknowledgeService.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(cardWithAck);
            expect(res).toBeFalse();
        }
    );

    it('consideredAcknowledgedForUserWhen of the state is AllEntitiesOfUserHaveAcknowledged, ' +
        'user has ack the card with only ENTITY1 connected, other entity has ack the card, ' +
        'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return false',
        () => {
            userServerMock.setResponseForCurrentUserWithPerimeter(new ServerResponse(getUserMemberOfEntity1AndEntity3WithPerimeter(), ServerResponseStatus.OK, ""));
            userService.loadUserWithPerimetersData().subscribe();
            const cardWithAck = getOneRandomCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state2',
                entityRecipients: ["ENTITY1", "ENTITY2", "ENTITY_FR", "ENTITY3"],
                hasBeenAcknowledged: true,
                entitiesAcks: ["ENTITY1", "ENTITY2"]
            });

            const res = acknowledgeService.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(cardWithAck);
            expect(res).toBeFalse();
        }
    );

    it('consideredAcknowledgedForUserWhen of the state is AllEntitiesOfUserHaveAcknowledged, ' +
        'user has ack the card with all of its entities (ENTITY1 and ENTITY3), no other entity has ack the card, ' +
        'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return true',
        () => {
            userServerMock.setResponseForCurrentUserWithPerimeter(new ServerResponse(getUserMemberOfEntity1AndEntity3WithPerimeter(), ServerResponseStatus.OK, ""));
            userService.loadUserWithPerimetersData().subscribe();
            const cardWithAck = getOneRandomCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state2',
                entityRecipients: ["ENTITY1", "ENTITY2", "ENTITY_FR", "ENTITY3"],
                hasBeenAcknowledged: true,
                entitiesAcks: ["ENTITY1", "ENTITY3"]
            });

            const res = acknowledgeService.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(cardWithAck);
            expect(res).toBeTrue();
        }
    );

    it('consideredAcknowledgedForUserWhen of the state is AllEntitiesOfUserHaveAcknowledged, ' +
        'user has not ack the card but its entities (ENTITY1 and ENTITY3) have ack the card (other members dit it), ' +
        'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return true',
        () => {
            userServerMock.setResponseForCurrentUserWithPerimeter(new ServerResponse(getUserMemberOfEntity1AndEntity3WithPerimeter(), ServerResponseStatus.OK, ""));
            userService.loadUserWithPerimetersData().subscribe();
            const cardWithAck = getOneRandomCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state2',
                entityRecipients: ["ENTITY1", "ENTITY2", "ENTITY_FR", "ENTITY3"],
                hasBeenAcknowledged: false,
                entitiesAcks: ["ENTITY1", "ENTITY2", "ENTITY3"]
            });

            const res = acknowledgeService.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(cardWithAck);
            expect(res).toBeTrue();
        }
    );

    it('consideredAcknowledgedForUserWhen of the state is AllEntitiesOfUserHaveAcknowledged, ' +
        'user has not ack the card but one of his entities (ENTITY3) have ack the card (other members dit it), ' +
        'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return false',
        () => {
            userServerMock.setResponseForCurrentUserWithPerimeter(new ServerResponse(getUserMemberOfEntity1AndEntity3WithPerimeter(), ServerResponseStatus.OK, ""));
            userService.loadUserWithPerimetersData().subscribe();
            const cardWithAck = getOneRandomCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state2',
                entityRecipients: ["ENTITY1", "ENTITY2", "ENTITY_FR", "ENTITY3"],
                hasBeenAcknowledged: false,
                entitiesAcks: ["ENTITY2", "ENTITY3"]
            });

            const res = acknowledgeService.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(cardWithAck);
            expect(res).toBeFalse();
        }
    );

    it('consideredAcknowledgedForUserWhen of the state is AllEntitiesOfUserHaveAcknowledged, ' +
        'the card has no entity recipients, ' +
        'user has not ack the card but one of his entities (ENTITY3) have ack the card (other members dit it), ' +
        'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return false',
        () => {
            userServerMock.setResponseForCurrentUserWithPerimeter(new ServerResponse(getUserMemberOfEntity1AndEntity3WithPerimeter(), ServerResponseStatus.OK, ""));
            userService.loadUserWithPerimetersData().subscribe();
            const cardWithAck = getOneRandomCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state2',
                userRecipients: ["userMemberOfEntity1", "userMemberOfEntity2", "userMemberOfEntity1AndEntity3"],
                entityRecipients: [],
                hasBeenAcknowledged: false,
                entitiesAcks: ["ENTITY2", "ENTITY3"]
            });

            const res = acknowledgeService.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(cardWithAck);
            expect(res).toBeFalse();
        }
    );

    it('consideredAcknowledgedForUserWhen of the state is AllEntitiesOfUserHaveAcknowledged, ' +
        'the card has no entity recipients, ' +
        'user has not ack the card but all of his entities (ENTITY1 and ENTITY3) have ack the card (other members dit it), ' +
        'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return false',
        () => {
            userServerMock.setResponseForCurrentUserWithPerimeter(new ServerResponse(getUserMemberOfEntity1AndEntity3WithPerimeter(), ServerResponseStatus.OK, ""));
            userService.loadUserWithPerimetersData().subscribe();
            const cardWithAck = getOneRandomCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state2',
                userRecipients: ["userMemberOfEntity1", "userMemberOfEntity2", "userMemberOfEntity1AndEntity3"],
                entityRecipients: [],
                hasBeenAcknowledged: false,
                entitiesAcks: ["ENTITY1", "ENTITY2", "ENTITY3"]
            });

            const res = acknowledgeService.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(cardWithAck);
            expect(res).toBeFalse();
        }
    );

    it('consideredAcknowledgedForUserWhen of the state is AllEntitiesOfUserHaveAcknowledged, ' +
        'the card has no entity recipients, ' +
        'user has ack the card with all of his entities (ENTITY1 and ENTITY3), ' +
        'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return true',
        () => {
            userServerMock.setResponseForCurrentUserWithPerimeter(new ServerResponse(getUserMemberOfEntity1AndEntity3WithPerimeter(), ServerResponseStatus.OK, ""));
            userService.loadUserWithPerimetersData().subscribe();
            const cardWithAck = getOneRandomCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state2',
                userRecipients: ["userMemberOfEntity1", "userMemberOfEntity2", "userMemberOfEntity1AndEntity3"],
                entityRecipients: [],
                hasBeenAcknowledged: true,
                entitiesAcks: ["ENTITY1", "ENTITY3"]
            });

            const res = acknowledgeService.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(cardWithAck);
            expect(res).toBeTrue();
        }
    );

    it('consideredAcknowledgedForUserWhen of the state is AllEntitiesOfUserHaveAcknowledged, ' +
        'the card has no entity recipients, ' +
        'user has ack the card with only one of his entities (ENTITY3), ' +
        'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return true',
        () => {
            userServerMock.setResponseForCurrentUserWithPerimeter(new ServerResponse(getUserMemberOfEntity1AndEntity3WithPerimeter(), ServerResponseStatus.OK, ""));
            userService.loadUserWithPerimetersData().subscribe();
            const cardWithAck = getOneRandomCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state2',
                userRecipients: ["userMemberOfEntity1", "userMemberOfEntity2", "userMemberOfEntity1AndEntity3"],
                entityRecipients: [],
                hasBeenAcknowledged: true,
                entitiesAcks: ["ENTITY3"]
            });

            const res = acknowledgeService.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(cardWithAck);
            expect(res).toBeTrue();
        }
    );

    it('consideredAcknowledgedForUserWhen of the state is AllEntitiesOfUserHaveAcknowledged, ' +
        'the card has entity recipients but none of those of the current user, ' +
        'user has not ack the card but one of his entities (ENTITY3) have ack the card (other members dit it), ' +
        'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return false',
        () => {
            userServerMock.setResponseForCurrentUserWithPerimeter(new ServerResponse(getUserMemberOfEntity1AndEntity3WithPerimeter(), ServerResponseStatus.OK, ""));
            userService.loadUserWithPerimetersData().subscribe();
            const cardWithAck = getOneRandomCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state2',
                userRecipients: ["userMemberOfEntity1", "userMemberOfEntity2", "userMemberOfEntity1AndEntity3"],
                entityRecipients: ["ENTITY2"],
                hasBeenAcknowledged: false,
                entitiesAcks: ["ENTITY2", "ENTITY3"]
            });

            const res = acknowledgeService.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(cardWithAck);
            expect(res).toBeFalse();
        }
    );

    it('consideredAcknowledgedForUserWhen of the state is AllEntitiesOfUserHaveAcknowledged, ' +
        'the card has entity recipients but none of those of the current user, ' +
        'user has not ack the card but all of his entities (ENTITY1 and ENTITY3) have ack the card (other members dit it), ' +
        'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return false',
        () => {
            userServerMock.setResponseForCurrentUserWithPerimeter(new ServerResponse(getUserMemberOfEntity1AndEntity3WithPerimeter(), ServerResponseStatus.OK, ""));
            userService.loadUserWithPerimetersData().subscribe();
            const cardWithAck = getOneRandomCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state2',
                userRecipients: ["userMemberOfEntity1", "userMemberOfEntity2", "userMemberOfEntity1AndEntity3"],
                entityRecipients: ["ENTITY2"],
                hasBeenAcknowledged: false,
                entitiesAcks: ["ENTITY1", "ENTITY2", "ENTITY3"]
            });

            const res = acknowledgeService.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(cardWithAck);
            expect(res).toBeFalse();
        }
    );

    it('consideredAcknowledgedForUserWhen of the state is AllEntitiesOfUserHaveAcknowledged, ' +
        'the card has entity recipients but none of those of the current user, ' +
        'user has ack the card with all of his entities (ENTITY1 and ENTITY3), ' +
        'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return true',
        () => {
            userServerMock.setResponseForCurrentUserWithPerimeter(new ServerResponse(getUserMemberOfEntity1AndEntity3WithPerimeter(), ServerResponseStatus.OK, ""));
            userService.loadUserWithPerimetersData().subscribe();
            const cardWithAck = getOneRandomCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state2',
                userRecipients: ["userMemberOfEntity1", "userMemberOfEntity2", "userMemberOfEntity1AndEntity3"],
                entityRecipients: ["ENTITY2"],
                hasBeenAcknowledged: true,
                entitiesAcks: ["ENTITY1", "ENTITY3"]
            });

            const res = acknowledgeService.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(cardWithAck);
            expect(res).toBeTrue();
        }
    );

    it('consideredAcknowledgedForUserWhen of the state is AllEntitiesOfUserHaveAcknowledged, ' +
        'the card has entity recipients but none of those of the current user, ' +
        'user has ack the card with only one of his entities (ENTITY3), ' +
        'isLightCardHasBeenAcknowledgedByUserOrByUserEntity() must return true',
        () => {
            userServerMock.setResponseForCurrentUserWithPerimeter(new ServerResponse(getUserMemberOfEntity1AndEntity3WithPerimeter(), ServerResponseStatus.OK, ""));
            userService.loadUserWithPerimetersData().subscribe();
            const cardWithAck = getOneRandomCard({
                process: 'testProcess',
                processVersion: '1',
                state: 'state2',
                userRecipients: ["userMemberOfEntity1", "userMemberOfEntity2", "userMemberOfEntity1AndEntity3"],
                entityRecipients: ["ENTITY2"],
                hasBeenAcknowledged: true,
                entitiesAcks: ["ENTITY3"]
            });

            const res = acknowledgeService.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(cardWithAck);
            expect(res).toBeTrue();
        }
    );
});
