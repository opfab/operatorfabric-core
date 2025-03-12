/* Copyright (c) 2021-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AcknowledgePermission} from './AcknowledgePermission';
import {AcknowledgmentAllowedEnum, Process, Response, State} from '@ofServices/processes/model/Processes';
import {getOneCard} from '@tests/helpers';
import {Card} from 'app/model/Card';
import {UserWithPerimeters} from '@ofServices/users/model/UserWithPerimeters';
import {User} from '@ofServices/users/model/User';
import {RightEnum} from '@ofServices/perimeters/model/Perimeter';
import {EntitiesService} from '@ofServices/entities/EntitiesService';
import {EntitiesServerMock} from '@tests/mocks/entitiesServer.mock';
import {Entity} from '@ofServices/entities/model/Entity';
import {RoleEnum} from '@ofServices/entities/model/RoleEnum';

describe('AcknowledgePermission testing ', () => {
    let card: Card;
    let userMemberOfEntity1: User, userMemberOfEntity2: User;
    let statesList: Map<string, State>;

    beforeEach(async () => {
        userMemberOfEntity1 = new User('userMemberOfEntity1', 'firstName', 'lastName', null, ['group1'], ['ENTITY1']);
        userMemberOfEntity2 = new User('userMemberOfEntity2', 'firstName', 'lastName', null, ['group1'], ['ENTITY2']);

        statesList = new Map<string, State>();

        const mockEntitiesServer = new EntitiesServerMock();
        mockEntitiesServer.setEntities([
            new Entity('ENTITY1', 'ENTITY 1', '', [RoleEnum.CARD_SENDER], null, null),
            new Entity('ENTITY2', 'ENTITY 2', '', [RoleEnum.CARD_SENDER], null, null),
            new Entity('ENTITY3', 'ENTITY 3', '', [RoleEnum.CARD_SENDER], null, null),
            new Entity('ENTITY_FR', 'ENTITY FR', '', [RoleEnum.CARD_SENDER], null, null)
        ]);
        EntitiesService.setEntitiesServer(mockEntitiesServer);
        EntitiesService.loadAllEntitiesData().subscribe();

        card = getOneCard({
            process: 'testProcess',
            processVersion: '1',
            state: 'testState',
            entitiesAllowedToRespond: ['ENTITY1']
        });
    });

    function getOneProcess(processTemplate?: any): Process {
        processTemplate = processTemplate ?? {};
        const states = new Map();

        states.set(1, new State('template1', ['style1', 'style2']));
        states.set(2, new State('template1', ['style1', 'style2']));

        return new Process(
            processTemplate.id ?? 'testId',
            processTemplate.version ?? 'testVersion',
            processTemplate.name ?? 'testName',
            processTemplate.locales ?? undefined,
            processTemplate.states ?? states
        );
    }

    it('acknowledgmentAllowed of the state is not present , isAcknowledgmentAllowed() must return true (default value)', () => {
        statesList.set('testState', new State(null, null, null, null));
        const processDefinition = getOneProcess({id: 'testProcess', version: '1', states: statesList});
        const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1, [
            {process: 'testProcess', state: 'testState', rights: RightEnum.Receive, filteringNotificationAllowed: true}
        ]);

        const res = AcknowledgePermission.isAcknowledgmentAllowed(userWithPerimeters, card, processDefinition);
        expect(res).toBeTrue();
    });

    it('process does not exist , isAcknowledgmentAllowed() must return true (default value)', () => {
        const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1, [
            {process: 'testProcess', state: 'testState', rights: RightEnum.Receive, filteringNotificationAllowed: true}
        ]);
        const res = AcknowledgePermission.isAcknowledgmentAllowed(userWithPerimeters, card, null);
        expect(res).toBeTrue();
    });

    it('state does not exist , isAcknowledgmentAllowed() must return true (default value)', () => {
        statesList.set('dummyState', new State(null, null, null, null));
        const processDefinition = getOneProcess({id: 'testProcess', version: '1', states: statesList});
        const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1, [
            {process: 'testProcess', state: 'testState', rights: RightEnum.Receive, filteringNotificationAllowed: true}
        ]);

        const res = AcknowledgePermission.isAcknowledgmentAllowed(userWithPerimeters, card, processDefinition);
        expect(res).toBeTrue();
    });

    it('acknowledgmentAllowed of the state is Never, isAcknowledgmentAllowed() must return false', () => {
        statesList.set('testState', new State(null, null, null, AcknowledgmentAllowedEnum.NEVER));
        const processDefinition = getOneProcess({id: 'testProcess', version: '1', states: statesList});

        const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1, [
            {process: 'testProcess', state: 'testState', rights: RightEnum.Receive, filteringNotificationAllowed: true}
        ]);

        const res = AcknowledgePermission.isAcknowledgmentAllowed(userWithPerimeters, card, processDefinition);
        expect(res).toBeFalse();
    });

    it('acknowledgmentAllowed of the state is Always, isAcknowledgmentAllowed() must return true', () => {
        statesList.set('testState', new State(null, null, null, AcknowledgmentAllowedEnum.ALWAYS));
        const processDefinition = getOneProcess({id: 'testProcess', version: '1', states: statesList});
        const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1, [
            {process: 'testProcess', state: 'testState', rights: RightEnum.Receive, filteringNotificationAllowed: true}
        ]);

        const res = AcknowledgePermission.isAcknowledgmentAllowed(userWithPerimeters, card, processDefinition);
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
            const processDefinition = getOneProcess({id: 'testProcess', version: '1', states: statesList});
            const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1, [
                {
                    process: 'testProcess',
                    state: 'responseState',
                    rights: RightEnum.Receive,
                    filteringNotificationAllowed: true
                }
            ]);

            const res = AcknowledgePermission.isAcknowledgmentAllowed(userWithPerimeters, card, processDefinition);
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
            const processDefinition = getOneProcess({id: 'testProcess', version: '1', states: statesList});
            const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1, [
                {
                    process: 'testProcess',
                    state: 'responseState',
                    rights: RightEnum.ReceiveAndWrite,
                    filteringNotificationAllowed: true
                }
            ]);

            const res = AcknowledgePermission.isAcknowledgmentAllowed(userWithPerimeters, card, processDefinition);
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
            const processDefinition = getOneProcess({id: 'testProcess', version: '1', states: statesList});
            const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1, [
                {
                    process: 'testProcess',
                    state: 'responseState',
                    rights: RightEnum.ReceiveAndWrite,
                    filteringNotificationAllowed: true
                }
            ]);

            const res = AcknowledgePermission.isAcknowledgmentAllowed(userWithPerimeters, card, processDefinition);
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
            const processDefinition = getOneProcess({id: 'testProcess', version: '1', states: statesList});
            const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity2, [
                {
                    process: 'testProcess',
                    state: 'responseState',
                    rights: RightEnum.Receive,
                    filteringNotificationAllowed: true
                }
            ]);

            const res = AcknowledgePermission.isAcknowledgmentAllowed(userWithPerimeters, card, processDefinition);
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
            const processDefinition = getOneProcess({id: 'testProcess', version: '1', states: statesList});
            const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity2, [
                {
                    process: 'testProcess',
                    state: 'responseState',
                    rights: RightEnum.ReceiveAndWrite,
                    filteringNotificationAllowed: true
                }
            ]);

            const res = AcknowledgePermission.isAcknowledgmentAllowed(userWithPerimeters, card, processDefinition);
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
            const processDefinition = getOneProcess({id: 'testProcess', version: '1', states: statesList});
            const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity2, [
                {
                    process: 'testProcess',
                    state: 'responseState',
                    rights: RightEnum.ReceiveAndWrite,
                    filteringNotificationAllowed: true
                }
            ]);

            const res = AcknowledgePermission.isAcknowledgmentAllowed(userWithPerimeters, card, processDefinition);
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
            const processDefinition = getOneProcess({id: 'testProcess', version: '1', states: statesList});
            const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1, [
                {
                    process: 'testProcess',
                    state: 'responseState',
                    rights: RightEnum.ReceiveAndWrite,
                    filteringNotificationAllowed: true
                }
            ]);

            const res = AcknowledgePermission.isAcknowledgmentAllowed(userWithPerimeters, card, processDefinition);
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
            const processDefinition = getOneProcess({id: 'testProcess', version: '1', states: statesList});
            const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1, [
                {
                    process: 'testProcess',
                    state: 'responseState',
                    rights: RightEnum.Receive,
                    filteringNotificationAllowed: true
                }
            ]);

            const res = AcknowledgePermission.isAcknowledgmentAllowed(userWithPerimeters, card, processDefinition);
            expect(res).toBeTrue();
        }
    );

    it(
        'acknowledgmentAllowed of the state is OnlyWhenResponseDisabledForUser, ' +
            'user can respond (user is a member of entity allowed to respond and user rights for the state of the response is Write), ' +
            'lttd is not reached, isAcknowledgmentAllowed() must return false',
        () => {
            const lttdInTheFuture = new Date().valueOf() + 100000;
            const cardWithLttd = getOneCard({
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
            const processDefinition = getOneProcess({id: 'testProcess', version: '1', states: statesList});
            const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1, [
                {
                    process: 'testProcess',
                    state: 'responseState',
                    rights: RightEnum.ReceiveAndWrite,
                    filteringNotificationAllowed: true
                }
            ]);

            const res = AcknowledgePermission.isAcknowledgmentAllowed(
                userWithPerimeters,
                cardWithLttd,
                processDefinition
            );
            expect(res).toBeFalse();
        }
    );

    it(
        'acknowledgmentAllowed of the state is OnlyWhenResponseDisabledForUser, ' +
            'user can respond (user is a member of entity allowed to respond and user rights for the state of the response is Write), ' +
            'lttd is reached, isAcknowledgmentAllowed() must return true',
        () => {
            const lttdInThePast = new Date().valueOf() - 100000;
            const cardWithLttd = getOneCard({
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
            const processDefinition = getOneProcess({id: 'testProcess', version: '1', states: statesList});
            const userWithPerimeters = new UserWithPerimeters(userMemberOfEntity1, [
                {
                    process: 'testProcess',
                    state: 'responseState',
                    rights: RightEnum.ReceiveAndWrite,
                    filteringNotificationAllowed: true
                }
            ]);

            const res = AcknowledgePermission.isAcknowledgmentAllowed(
                userWithPerimeters,
                cardWithLttd,
                processDefinition
            );
            expect(res).toBeTrue();
        }
    );
});
