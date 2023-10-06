/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ConfigServerMock} from '@tests/mocks/configServer.mock';
import {ConfigService} from 'app/business/services/config.service';
import {RemoteLoggerServiceMock} from '@tests/mocks/remote-logger.service.mock';
import {OpfabLoggerService} from 'app/business/services/logs/opfab-logger.service';
import {UserServerMock} from '@tests/mocks/userServer.mock';
import {UserService} from 'app/business/services/users/user.service';
import {EntitiesServerMock} from '@tests/mocks/entitiesServer.mock';
import {EntitiesService} from 'app/business/services/users/entities.service';
import {ServerResponse, ServerResponseStatus} from 'app/business/server/serverResponse';
import {Entity} from '@ofModel/entity.model';
import {RealtimeUsersView} from './realtimeusers.view';
import {RealtimePage} from './realtimePage';

describe('Realtimeusers', () => {
    let view: RealtimeUsersView;
    let page: RealtimePage;
    let clock: jasmine.Clock;

    let configServerMock: ConfigServerMock;
    let opfabLoggerService: OpfabLoggerService;
    let userServerMock: UserServerMock;
    let userService: UserService;
    let entitiesServerMock: EntitiesServerMock;
    let entitiesService: EntitiesService;

    beforeEach(() => {
        mockLoggerService();
        mockUserService();
        mockEntitiesService();

        const connectedUsers = [{login: 'user1', entitiesConnected: ['ENTITY1_FR', 'IT_SUPERVISOR_ENTITY']},
                                {login: 'user1', entitiesConnected: ['ENTITY1_FR', 'ENTITY1_NL'], groups: ['group1']},
                                {login: 'user2', entitiesConnected: ['ENTITY1_FR', 'ENTITY1_NL'], groups: ['group2']},
                                {login: 'user3', entitiesConnected: ['ENTITY1_NL'], groups: ['group2', 'group3']},
                                {login: 'user4'}];
        userServerMock.setResponseForConnectedUsers(new ServerResponse(connectedUsers, ServerResponseStatus.OK, null));

        const entities: Entity[] = [
            new Entity('ENTITY1_FR', 'ENTITY1_FR_NAME', '', true, [], []),
            new Entity('ENTITY1_IT', 'ENTITY1_IT_NAME', '', true, [], [])
        ];
        entitiesServerMock.setEntities(entities);

        clock = jasmine.clock();
        clock.install();

        view = new RealtimeUsersView(configServerMock, opfabLoggerService, userService, entitiesService);
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
        opfabLoggerService = new OpfabLoggerService(
            new RemoteLoggerServiceMock(new ConfigService(configServerMock), null)
        );
    }

    function mockUserService() {
        userServerMock = new UserServerMock();
        userService = new UserService(userServerMock, opfabLoggerService);
    }

    function mockEntitiesService() {
        entitiesServerMock = new EntitiesServerMock();
        entitiesService = new EntitiesService(opfabLoggerService, entitiesServerMock);
        entitiesService.loadAllEntitiesData().subscribe();
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
        expect(page.currentScreen.columns[0].entitiesGroups[0].name).toEqual('French Control Centers');
        expect(page.currentScreen.columns[0].entitiesGroups[0].lines[0].entityId).toEqual('ENTITY1_FR');
        expect(page.currentScreen.columns[0].entitiesGroups[0].lines[0].entityName).toEqual('ENTITY1_FR_NAME');

        view.setSelectedScreen('2');
        expect(page.currentScreen.name).toEqual('Italian Control Centers');
        expect(page.currentScreen.columns.length).toEqual(2);
        expect(page.currentScreen.columns[0].entitiesGroups[0].name).toEqual('Italian Control Centers');
        expect(page.currentScreen.columns[0].entitiesGroups[0].lines[0].entityId).toEqual('ENTITY1_IT');
        expect(page.currentScreen.columns[0].entitiesGroups[0].lines[0].entityName).toEqual('ENTITY1_IT_NAME');
    });

    it('When connected users are updated (on view init), the label and count should be computed', () => {
        expect(page.currentScreen.columns[0].entitiesGroups[0].lines[0].connectedUsersCount).toEqual(2);
        expect(page.currentScreen.columns[0].entitiesGroups[0].lines[0].connectedUsers).toEqual('user1, user2');
        expect(page.currentScreen.columns[1].entitiesGroups[0].lines[0].connectedUsersCount).toEqual(1);
        expect(page.currentScreen.columns[1].entitiesGroups[0].lines[0].connectedUsers).toEqual('user1');
        expect(page.currentScreen.columns[0].entitiesGroups[0].lines[1].connectedUsersCount).toEqual(0);
        expect(page.currentScreen.columns[0].entitiesGroups[0].lines[1].connectedUsers).toEqual('');
    });

    it('When a screen config has onlyDisplayUsersInGroups, only users in specified groups should be considered', () => {
        view.setSelectedScreen('3');
        expect(page.currentScreen.columns[0].entitiesGroups[0].lines[0].connectedUsersCount).toEqual(2);
        expect(page.currentScreen.columns[0].entitiesGroups[0].lines[0].connectedUsers).toEqual('user2, user3');
    });

    it('After view is initialized, connected users should be updated every 2 seconds', () => {
        expect(page.currentScreen.columns[1].entitiesGroups[0].lines[0].connectedUsersCount).toEqual(1);
        expect(page.currentScreen.columns[1].entitiesGroups[0].lines[0].connectedUsers).toEqual('user1');

        const connectedUsers = [{login: 'user1', entitiesConnected: ['IT_SUPERVISOR_ENTITY']},
                                {login: 'user2', entitiesConnected: ['IT_SUPERVISOR_ENTITY']}];
        userServerMock.setResponseForConnectedUsers(new ServerResponse(connectedUsers, ServerResponseStatus.OK, null));
        
        clock.tick(2500);
        expect(page.currentScreen.columns[1].entitiesGroups[0].lines[0].connectedUsersCount).toEqual(2);
        expect(page.currentScreen.columns[1].entitiesGroups[0].lines[0].connectedUsers).toEqual('user1, user2');
    });



    const realtimeScreensTestConfig = {
        realTimeScreens: [
            {
                screenName: 'All Control Centers',
                screenColumns: [
                    {
                        entitiesGroups: [
                            {
                                name: 'French Control Centers',
                                entities: ['ENTITY1_FR', 'ENTITY2_FR', 'ENTITY3_FR', 'ENTITY4_FR']
                            },
                            {
                                name: 'Italian Control Centers',
                                entities: ['ENTITY1_IT', 'ENTITY2_IT', 'ENTITY3_IT']
                            },
                            {
                                name: 'Dutch Control Centers',
                                entities: ['ENTITY1_NL', 'ENTITY2_NL']
                            }
                        ]
                    },
                    {
                        entitiesGroups: [
                            {
                                name: 'Central Supervision Centers',
                                entities: ['IT_SUPERVISOR_ENTITY']
                            }
                        ]
                    }
                ]
            },
            {
                screenName: 'French Control Centers',
                screenColumns: [
                    {
                        entitiesGroups: [
                            {
                                name: 'French Control Centers',
                                entities: ['ENTITY1_FR', 'ENTITY2_FR', 'ENTITY3_FR', 'ENTITY4_FR']
                            }
                        ]
                    },
                    {
                        entitiesGroups: [
                            {
                                name: 'Central Supervision Centers',
                                entities: ['IT_SUPERVISOR_ENTITY']
                            }
                        ]
                    }
                ]
            },
            {
                screenName: 'Italian Control Centers',
                screenColumns: [
                    {
                        entitiesGroups: [
                            {
                                name: 'Italian Control Centers',
                                entities: ['ENTITY1_IT', 'ENTITY2_IT', 'ENTITY3_IT']
                            }
                        ]
                    },
                    {
                        entitiesGroups: [
                            {
                                name: 'Central Supervision Centers',
                                entities: ['IT_SUPERVISOR_ENTITY']
                            }
                        ]
                    }
                ]
            },
            {
                screenName: 'Dutch Control Centers',
                onlyDisplayUsersInGroups: ['group2', 'group3'],
                screenColumns: [
                    {
                        entitiesGroups: [
                            {
                                name: 'Dutch Control Centers',
                                entities: ['ENTITY1_NL', 'ENTITY2_NL']
                            }
                        ]
                    },
                    {
                        entitiesGroups: [
                            {
                                name: 'Central Supervision Centers',
                                entities: ['IT_SUPERVISOR_ENTITY']
                            }
                        ]
                    }
                ]
            }
        ]
    };
});
