/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ConfigServerMock} from '@tests/mocks/configServer.mock';
import {ServerResponse, ServerResponseStatus} from '../server/serverResponse';
import {MenuService} from './menu.service';
import {ConfigService} from '../../services/config/ConfigService';
import {firstValueFrom} from 'rxjs';
import {UserServerMock} from '@tests/mocks/userServer.mock';
import {UserService} from './users/user.service';
import {User} from '@ofModel/user.model';
import {UserWithPerimeters} from '@ofModel/userWithPerimeters.model';

describe('MenuService', () => {
    async function setMenuConfig(config: any) {
        const configServerMock = new ConfigServerMock();
        configServerMock.setResponseForMenuConfiguration(new ServerResponse(config, ServerResponseStatus.OK, ''));
        ConfigService.setConfigServer(configServerMock);
        await firstValueFrom(ConfigService.loadUiMenuConfig());
    }

    async function setCurrentUser(userGroups: string[]) {
        const user = new User('currentUser', 'firstname', 'lastname', null, userGroups, []);
        const userServerMock = new UserServerMock();
        userServerMock.setResponseForUser(new ServerResponse(user, ServerResponseStatus.OK, null));
        const userForPerimeter = new User('currentUser', 'firstname', 'lastname', null, userGroups, []);
        const userWithPerimeters = new UserWithPerimeters(userForPerimeter, new Array(), null, new Map());
        userServerMock.setResponseForCurrentUserWithPerimeter(
            new ServerResponse(userWithPerimeters, ServerResponseStatus.OK, null)
        );
        UserService.setUserServer(userServerMock);
        await firstValueFrom(UserService.loadUserWithPerimetersData());
    }

    describe('Night day mode menu', () => {
        it('night day mode menu is not visible if not define in ui-menu.json', async () => {
            await setMenuConfig({navigationBar: [], topRightMenus: []});

            const isNightDayModeMenuVisible = MenuService.isNightDayModeMenuVisible();

            expect(isNightDayModeMenuVisible).toBeFalsy();
        });

        it('night day mode menu is visible if define in ui-menu.json', async () => {
            await setMenuConfig({
                navigationBar: [],
                topRightMenus: [
                    {
                        opfabCoreMenuId: 'nightdaymode',
                        visible: true
                    }
                ]
            });

            const isNightDayModeMenuVisible = MenuService.isNightDayModeMenuVisible();

            expect(isNightDayModeMenuVisible).toBeTruthy();
        });
        it('night day mode menu is visible if define in ui-menu.json with user in groups define showOnlyForGroups', async () => {
            await setMenuConfig({
                navigationBar: [],
                topRightMenus: [
                    {
                        opfabCoreMenuId: 'nightdaymode',
                        visible: true,
                        showOnlyForGroups: ['user_group']
                    }
                ]
            });
            await setCurrentUser(['user_group']);

            const isNightDayModeMenuVisible = MenuService.isNightDayModeMenuVisible();

            expect(isNightDayModeMenuVisible).toBeTruthy();
        });
        it('night day mode menu is not visible if define in ui-menu.json with user not in groups define showOnlyForGroups', async () => {
            await setMenuConfig({
                navigationBar: [],
                topRightMenus: [
                    {
                        opfabCoreMenuId: 'nightdaymode',
                        visible: true,
                        showOnlyForGroups: ['not_user_group']
                    }
                ]
            });
            await setCurrentUser(['user_group']);
            const isNightDayModeMenuVisible = MenuService.isNightDayModeMenuVisible();
            expect(isNightDayModeMenuVisible).toBeFalsy();
        });
        it('night day mode menu is visible if define in ui-menu.json with  showOnlyForGroups = []', async () => {
            await setMenuConfig({
                navigationBar: [],
                topRightMenus: [
                    {
                        opfabCoreMenuId: 'nightdaymode',
                        visible: true,
                        showOnlyForGroups: []
                    }
                ]
            });
            await setCurrentUser(['user_group']);
            const isNightDayModeMenuVisible = MenuService.isNightDayModeMenuVisible();
            expect(isNightDayModeMenuVisible).toBeTruthy();
        });
    });

    describe('Query menu entry URL', () => {
        it('GIVEN_A_Menu_Configuration_File_WHEN_Getting_Url_For_Custom_Menu_THEN_Url_Is_Provided', async () => {
            await setMenuConfig({
                navigationBar: [
                    {
                        opfabCoreMenuId: 'feed',
                        visible: true
                    },
                    {
                        id: 'menu1',
                        label: 'title.single',
                        entries: [
                            {
                                customMenuId: 'entry1',
                                url: 'https://test',
                                label: 'entry.single',
                                linkType: 'BOTH'
                            }
                        ]
                    }
                ]
            });
            const url = MenuService.queryMenuEntryURL('entry1');
            expect(url).toEqual('https://test');
        });
    });
});
