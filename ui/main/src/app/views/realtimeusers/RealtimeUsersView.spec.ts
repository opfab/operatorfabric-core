/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ConfigServerMock} from '@tests/mocks/configServer.mock';
import {UsersServerMock} from '@tests/mocks/UsersServer.mock';
import {UsersService} from '@ofServices/users/UsersService';
import {EntitiesServerMock} from '@tests/mocks/entitiesServer.mock';
import {EntitiesService} from '@ofServices/entities/EntitiesService';
import {ServerResponse, ServerResponseStatus} from 'app/server/ServerResponse';
import {Entity} from '@ofServices/entities/model/Entity';
import {RealtimeUsersView} from './RealtimeUsersView';
import {RealtimePage} from './RealtimePage';
import {RoleEnum} from '@ofServices/entities/model/RoleEnum';

describe('Realtimeusers', () => {
    let view: RealtimeUsersView;
    let page: RealtimePage;
    let clock: jasmine.Clock;

    let configServerMock: ConfigServerMock;
    let usersServerMock: UsersServerMock;
    let entitiesServerMock: EntitiesServerMock;

    beforeEach(() => {
        mockLoggerService();
        mockUserService();
        mockEntitiesService();

        const connectedUsers = [
            {login: 'user1', entitiesConnected: ['ENTITY1_FR', 'IT_SUPERVISOR_ENTITY']},
            {login: 'user1', entitiesConnected: ['ENTITY1_FR', 'ENTITY1_NL'], groups: ['group1']},
            {login: 'user2', entitiesConnected: ['ENTITY1_FR', 'ENTITY1_NL'], groups: ['group2']},
            {login: 'user3', entitiesConnected: ['ENTITY1_NL'], groups: ['group2', 'group3']},
            {login: 'user4'}
        ];
        usersServerMock.setResponseForConnectedUsers(new ServerResponse(connectedUsers, ServerResponseStatus.OK, null));

        const entities: Entity[] = [
            new Entity('ENTITY_FR', 'French Control Centers', '', [RoleEnum.CARD_SENDER], [], []),
            new Entity('ENTITY1_FR', 'ENTITY1_FR_NAME', '', [RoleEnum.CARD_SENDER], [], ['ENTITY_FR']),
            new Entity('ENTITY2_FR', 'ENTITY2_FR_NAME', '', [RoleEnum.CARD_SENDER], [], ['ENTITY_FR']),
            new Entity('ENTITY_IT', 'Italian Control Centers', '', [RoleEnum.CARD_SENDER], [], []),
            new Entity(
                'EUROPEAN_SUPERVISION_CENTERS',
                'EUROPEAN_SUPERVISION_CENTERS',
                '',
                [RoleEnum.CARD_SENDER],
                [],
                []
            ),
            new Entity(
                'IT_SUPERVISOR_ENTITY',
                'IT SUPERVISION CENTER',
                '',
                [RoleEnum.CARD_SENDER],
                [],
                ['EUROPEAN_SUPERVISION_CENTERS']
            ),
            new Entity('ENTITY_NL', 'Dutch Control Centers', '', [RoleEnum.CARD_SENDER], [], []),
            new Entity('ENTITY1_NL', 'ENTITY1_NL_NAME', '', [RoleEnum.CARD_SENDER], [], ['ENTITY_NL']),
            new Entity('ENTITY1_IT', 'ENTITY1_IT_NAME', '', [RoleEnum.CARD_SENDER], [], ['ENTITY_IT'])
        ];
        entitiesServerMock.setEntities(entities);

        clock = jasmine.clock();
        clock.install();

        view = new RealtimeUsersView(configServerMock);
        view.getPage().subscribe((realtimePage) => {
            page = realtimePage;
            view.setSelectedScreen('0');
        });
    });

    afterEach(() => {
        clock.uninstall();
        view.stopUpdate();
    });

    function mockLoggerService() {
        configServerMock = new ConfigServerMock();
        configServerMock.setResponseForRealTimeScreenConfiguration(
            new ServerResponse(realtimeScreensTestConfig, ServerResponseStatus.OK, '')
        );
    }

    function mockUserService() {
        usersServerMock = new UsersServerMock();
        UsersService.setUsersServer(usersServerMock);
    }

    function mockEntitiesService() {
        entitiesServerMock = new EntitiesServerMock();
        EntitiesService.setEntitiesServer(entitiesServerMock);
        EntitiesService.loadAllEntitiesData().subscribe();
    }

    it('After view is initialized, screen options should be saved', () => {
        expect(page.screenOptions.length).toEqual(4);
        expect(page.screenOptions[0].value).toEqual('0');
        expect(page.screenOptions[0].label).toEqual('All Control Centers');
        expect(page.screenOptions[1].value).toEqual('1');
        expect(page.screenOptions[1].label).toEqual('French Control Centers');
    });

    it('When a screen is selected, the current screen should change', () => {
        view.setSelectedScreen('1');
        expect(page.currentScreen.name).toEqual('French Control Centers');
        expect(page.currentScreen.columns.length).toEqual(2);
        expect(page.currentScreen.columns[0].entityPages[0].name).toEqual('FRENCH CONTROL CENTERS');
        expect(page.currentScreen.columns[0].entityPages[0].lines[0].entityId).toEqual('ENTITY1_FR');
        expect(page.currentScreen.columns[0].entityPages[0].lines[0].entityName).toEqual('ENTITY1_FR_NAME');

        view.setSelectedScreen('2');
        expect(page.currentScreen.name).toEqual('Italian Control Centers');
        expect(page.currentScreen.columns.length).toEqual(2);
        expect(page.currentScreen.columns[0].entityPages[0].name).toEqual('ITALIAN CONTROL CENTERS');
        expect(page.currentScreen.columns[0].entityPages[0].lines[0].entityId).toEqual('ENTITY1_IT');
        expect(page.currentScreen.columns[0].entityPages[0].lines[0].entityName).toEqual('ENTITY1_IT_NAME');
    });

    it('When connected users are updated (on view init), the label and count should be computed', () => {
        expect(page.currentScreen.columns[0].entityPages[0].lines[0].connectedUsersCount).toEqual(2);
        expect(page.currentScreen.columns[0].entityPages[0].lines[0].connectedUsers).toEqual('user1, user2');
        expect(page.currentScreen.columns[1].entityPages[0].lines[0].connectedUsersCount).toEqual(1);
        expect(page.currentScreen.columns[1].entityPages[0].lines[0].connectedUsers).toEqual('user1');
        expect(page.currentScreen.columns[0].entityPages[0].lines[1].connectedUsersCount).toEqual(0);
        expect(page.currentScreen.columns[0].entityPages[0].lines[1].connectedUsers).toEqual('');
    });

    it('When a screen config has onlyDisplayUsersInGroups, only users in specified groups should be considered', () => {
        view.setSelectedScreen('3');
        expect(page.currentScreen.columns[0].entityPages[0].lines[0].connectedUsersCount).toEqual(2);
        expect(page.currentScreen.columns[0].entityPages[0].lines[0].connectedUsers).toEqual('user2, user3');
    });

    it('After view is initialized, connected users should be updated every 2 seconds', () => {
        expect(page.currentScreen.columns[1].entityPages[0].lines[0].connectedUsersCount).toEqual(1);
        expect(page.currentScreen.columns[1].entityPages[0].lines[0].connectedUsers).toEqual('user1');

        const connectedUsers = [
            {login: 'user1', entitiesConnected: ['IT_SUPERVISOR_ENTITY']},
            {login: 'user2', entitiesConnected: ['IT_SUPERVISOR_ENTITY']}
        ];
        usersServerMock.setResponseForConnectedUsers(new ServerResponse(connectedUsers, ServerResponseStatus.OK, null));

        clock.tick(2500);
        expect(page.currentScreen.columns[1].entityPages[0].lines[0].connectedUsersCount).toEqual(2);
        expect(page.currentScreen.columns[1].entityPages[0].lines[0].connectedUsers).toEqual('user1, user2');
    });

    it('If a user with first name and last name connects, they should be displayed instead of his login', () => {
        expect(page.currentScreen.columns[1].entityPages[0].lines[0].connectedUsersCount).toEqual(1);
        expect(page.currentScreen.columns[1].entityPages[0].lines[0].connectedUsers).toEqual('user1');

        const connectedUsers = [
            {login: 'user1', entitiesConnected: ['IT_SUPERVISOR_ENTITY']},
            {login: 'user2', firstName: 'John', lastName: 'Smith', entitiesConnected: ['IT_SUPERVISOR_ENTITY']}
        ];
        usersServerMock.setResponseForConnectedUsers(new ServerResponse(connectedUsers, ServerResponseStatus.OK, null));

        clock.tick(2500);
        expect(page.currentScreen.columns[1].entityPages[0].lines[0].connectedUsersCount).toEqual(2);
        expect(page.currentScreen.columns[1].entityPages[0].lines[0].connectedUsers).toEqual('user1, John Smith');
    });

    const realtimeScreensTestConfig = {
        realTimeScreens: [
            {
                screenName: 'All Control Centers',
                screenColumns: [
                    {
                        entitiesGroups: ['ENTITY_FR', 'ENTITY_IT', 'ENTITY_NL']
                    },
                    {
                        entitiesGroups: ['EUROPEAN_SUPERVISION_CENTERS']
                    }
                ]
            },
            {
                screenName: 'French Control Centers',
                screenColumns: [
                    {
                        entitiesGroups: ['ENTITY_FR']
                    },
                    {
                        entitiesGroups: ['EUROPEAN_SUPERVISION_CENTERS']
                    }
                ]
            },
            {
                screenName: 'Italian Control Centers',
                screenColumns: [
                    {
                        entitiesGroups: ['ENTITY_IT']
                    },
                    {
                        entitiesGroups: ['EUROPEAN_SUPERVISION_CENTERS']
                    }
                ]
            },
            {
                screenName: 'Dutch Control Centers',
                onlyDisplayUsersInGroups: ['group2', 'group3'],
                screenColumns: [
                    {
                        entitiesGroups: ['ENTITY_NL']
                    },
                    {
                        entitiesGroups: ['EUROPEAN_SUPERVISION_CENTERS']
                    }
                ]
            }
        ]
    };
});
