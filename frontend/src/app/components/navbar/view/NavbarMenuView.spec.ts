/* Copyright (c) 2024-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ConfigServerMock} from '@tests/mocks/configServer.mock';
import {ServerResponse, ServerResponseStatus} from 'app/server/ServerResponse';
import {ConfigService} from 'app/services/config/ConfigService';
import {firstValueFrom} from 'rxjs';
import {TranslationLibMock} from '@tests/mocks/TranslationLib.mock';
import {User} from '@ofServices/users/model/User';
import {UserWithPerimeters} from '@ofServices/users/model/UserWithPerimeters';
import {NavbarMenuView} from './NavbarMenuView';
import {MenuEntryLinkType} from 'app/model/MenuEntryLinkType';
import {PermissionEnum} from '@ofServices/groups/model/PermissionEnum';
import {GlobalStyleService} from '@ofServices/style/global-style.service';
import {resetServices, setUserPerimeter} from '@tests/helpers';
import {TranslationService} from '@ofServices/translation/TranslationService';
import {NavigationService} from '@ofServices/navigation/NavigationService';
import {ApplicationRouterMock} from '@tests/mocks/applicationRouter.mock';
import {ApplicationEventsService} from '@ofServices/events/ApplicationEventsService';

declare const opfabStyle;

async function stubMenuConfigLoading(menuConfig: any) {
    const configServerMock = new ConfigServerMock();
    configServerMock.setResponseForMenuConfiguration(new ServerResponse(menuConfig, ServerResponseStatus.OK, null));
    ConfigService.setConfigServer(configServerMock);
    await firstValueFrom(ConfigService.loadUiMenuConfig());
}

async function stubCurrentUserData(userGroups: string[], permissions: PermissionEnum[] = []) {
    const user = new User('currentUser', 'firstname', 'lastname', null, userGroups, []);
    const userWithPerimeters = new UserWithPerimeters(user, new Array(), permissions, new Map());
    await setUserPerimeter(userWithPerimeters);
}

describe('NavbarMenuView', () => {
    let navbarMenuView: NavbarMenuView;

    beforeEach(() => {
        resetServices();
        TranslationService.setTranslationLib(new TranslationLibMock());
    });

    afterEach(() => {
        if (navbarMenuView) {
            navbarMenuView.destroy();
        }
    });

    describe('get core navbar menus', () => {
        it('should get menus defined the ui menu configuration', async () => {
            stubMenuConfigLoading({
                navigationBar: [{opfabCoreMenuId: 'feed'}, {opfabCoreMenuId: 'archives'}]
            });
            navbarMenuView = new NavbarMenuView();
            const navBarMenuElements = navbarMenuView.getNavbarMenu().upperMenuElements;
            expect(navBarMenuElements.length).toEqual(2);
            expect(navBarMenuElements[0].id).toEqual('feed');
            expect(navBarMenuElements[1].id).toEqual('archives');
        });

        it('should get menu translations in labels', async () => {
            stubMenuConfigLoading({
                navigationBar: [{opfabCoreMenuId: 'feed'}, {opfabCoreMenuId: 'archives'}]
            });
            navbarMenuView = new NavbarMenuView();
            const navBarMenuElements = navbarMenuView.getNavbarMenu().upperMenuElements;
            expect(navBarMenuElements[0].label).toEqual('Translation (en) of menu.feed');
            expect(navBarMenuElements[1].label).toEqual('Translation (en) of menu.archives');
        });

        it('should get dropdown menus defined the ui menu configuration', async () => {
            stubMenuConfigLoading({
                navigationBar: [{entries: [{opfabCoreMenuId: 'feed'}, {opfabCoreMenuId: 'archives'}]}]
            });
            navbarMenuView = new NavbarMenuView();
            const navBarMenuElements = navbarMenuView.getNavbarMenu().upperMenuElements;
            expect(navBarMenuElements.length).toEqual(1);
            expect(navBarMenuElements[0].dropdownMenu[0].id).toEqual('feed');
            expect(navBarMenuElements[0].dropdownMenu[1].id).toEqual('archives');
        });

        it('should get dropdown menu translations in labels', async () => {
            stubMenuConfigLoading({
                navigationBar: [
                    {opfabCoreMenuId: 'feed', entries: [{opfabCoreMenuId: 'feed'}, {opfabCoreMenuId: 'archives'}]}
                ]
            });
            navbarMenuView = new NavbarMenuView();
            const navBarMenuElements = navbarMenuView.getNavbarMenu().upperMenuElements;
            expect(navBarMenuElements[0].dropdownMenu[0].label).toEqual('Translation (en) of menu.feed');
            expect(navBarMenuElements[0].dropdownMenu[1].label).toEqual('Translation (en) of menu.archives');
        });

        it('should not get menu if user is not member of showOnlyForGroups', async () => {
            stubMenuConfigLoading({
                navigationBar: [
                    {opfabCoreMenuId: 'feed'},
                    {opfabCoreMenuId: 'archives', showOnlyForGroups: ['groupUserIsNotMember']}
                ]
            });
            await stubCurrentUserData(['groupUserIsMember']);
            navbarMenuView = new NavbarMenuView();
            const navBarMenuElements = navbarMenuView.getNavbarMenu().upperMenuElements;
            expect(navBarMenuElements.length).toEqual(1);
            expect(navBarMenuElements[0].id).toEqual('feed');
        });

        it('should  get menu if user is member of showOnlyForGroups', async () => {
            stubMenuConfigLoading({
                navigationBar: [
                    {opfabCoreMenuId: 'feed'},
                    {opfabCoreMenuId: 'archives', showOnlyForGroups: ['groupUserIsMember', 'groupUserIsNotMember']}
                ]
            });
            await stubCurrentUserData(['groupUserIsMember']);
            navbarMenuView = new NavbarMenuView();
            const navBarMenuElements = navbarMenuView.getNavbarMenu().upperMenuElements;
            expect(navBarMenuElements.length).toEqual(2);
            expect(navBarMenuElements[0].id).toEqual('feed');
            expect(navBarMenuElements[1].id).toEqual('archives');
        });

        it('should  get menu if showOnlyForGroups = [] ', async () => {
            stubMenuConfigLoading({
                navigationBar: [{opfabCoreMenuId: 'feed'}, {opfabCoreMenuId: 'archives', showOnlyForGroups: []}]
            });
            await stubCurrentUserData(['groupUserIsMember']);
            navbarMenuView = new NavbarMenuView();
            const navBarMenuElements = navbarMenuView.getNavbarMenu().upperMenuElements;
            expect(navBarMenuElements.length).toEqual(2);
            expect(navBarMenuElements[0].id).toEqual('feed');
            expect(navBarMenuElements[1].id).toEqual('archives');
        });

        it('should not get dropdown menus if user is not member of showOnlyForGroups', async () => {
            stubMenuConfigLoading({
                showDropdownMenuEvenIfOnlyOneEntry: true,
                navigationBar: [
                    {
                        entries: [
                            {opfabCoreMenuId: 'feed', showOnlyForGroups: ['groupUserIsNotMember']},
                            {opfabCoreMenuId: 'archives'}
                        ]
                    }
                ]
            });
            await stubCurrentUserData(['groupUserIsMember']);
            navbarMenuView = new NavbarMenuView();
            const navBarMenuElements = navbarMenuView.getNavbarMenu().upperMenuElements;
            expect(navBarMenuElements[0].dropdownMenu.length).toEqual(1);
            expect(navBarMenuElements[0].dropdownMenu[0].id).toEqual('archives');
        });

        it('should get dropdown menus if user is  member of showOnlyForGroups', async () => {
            stubMenuConfigLoading({
                navigationBar: [
                    {
                        entries: [
                            {opfabCoreMenuId: 'feed', showOnlyForGroups: ['groupUserIsNotMember', 'groupUserIsMember']},
                            {opfabCoreMenuId: 'archives'}
                        ]
                    }
                ]
            });
            await stubCurrentUserData(['groupUserIsMember']);
            navbarMenuView = new NavbarMenuView();
            const navBarMenuElements = navbarMenuView.getNavbarMenu().upperMenuElements;
            expect(navBarMenuElements[0].dropdownMenu.length).toEqual(2);
            expect(navBarMenuElements[0].dropdownMenu[0].id).toEqual('feed');
            expect(navBarMenuElements[0].dropdownMenu[1].id).toEqual('archives');
        });
    });

    describe('get custom navbar menus', () => {
        it('should get menus defined the ui menu configuration', async () => {
            stubMenuConfigLoading({
                navigationBar: [
                    {
                        customMenuId: 'customMenu1',
                        label: 'customMenu1Label_translation_key',
                        url: 'url1',
                        linkType: MenuEntryLinkType.TAB
                    },
                    {
                        customMenuId: 'customMenu2',
                        label: 'customMenu2Label_translation_key',
                        url: 'url2',
                        linkType: MenuEntryLinkType.BOTH
                    }
                ]
            });
            navbarMenuView = new NavbarMenuView();
            const navBarMenuElements = navbarMenuView.getNavbarMenu().upperMenuElements;
            expect(navBarMenuElements.length).toEqual(2);
            expect(navBarMenuElements[0].id).toEqual('customMenu1');
            expect(navBarMenuElements[0].url).toEqual('url1');
            expect(navBarMenuElements[0].linkType).toEqual(MenuEntryLinkType.TAB);
            expect(navBarMenuElements[1].id).toEqual('customMenu2');
            expect(navBarMenuElements[1].url).toEqual('url2');
            expect(navBarMenuElements[1].linkType).toEqual(MenuEntryLinkType.BOTH);
        });

        it('should get menu translations in labels', async () => {
            stubMenuConfigLoading({
                navigationBar: [
                    {customMenuId: 'customMenu1', label: 'customMenu1Label_translation_key'},
                    {customMenuId: 'customMenu2', label: 'customMenu2Label_translation_key'}
                ]
            });
            navbarMenuView = new NavbarMenuView();
            const navBarMenuElements = navbarMenuView.getNavbarMenu().upperMenuElements;
            expect(navBarMenuElements[0].label).toEqual('Translation (en) of customMenu1Label_translation_key');
            expect(navBarMenuElements[1].label).toEqual('Translation (en) of customMenu2Label_translation_key');
        });

        it('should get dropdown menus defined the ui menu configuration', async () => {
            stubMenuConfigLoading({
                navigationBar: [
                    {
                        entries: [
                            {customMenuId: 'customMenu1', label: 'customMenu1Label_translation_key'},
                            {customMenuId: 'customMenu2', label: 'customMenu2Label_translation_key'}
                        ]
                    }
                ]
            });
            navbarMenuView = new NavbarMenuView();
            const navBarMenuElements = navbarMenuView.getNavbarMenu().upperMenuElements;
            expect(navBarMenuElements.length).toEqual(1);
            expect(navBarMenuElements[0].dropdownMenu[0].id).toEqual('customMenu1');
            expect(navBarMenuElements[0].dropdownMenu[1].id).toEqual('customMenu2');
        });

        it('should get dropdown menu translations in labels', async () => {
            stubMenuConfigLoading({
                navigationBar: [
                    {
                        entries: [
                            {customMenuId: 'customMenu1', label: 'customMenu1Label_translation_key'},
                            {customMenuId: 'customMenu2', label: 'customMenu2Label_translation_key'}
                        ]
                    }
                ]
            });
            navbarMenuView = new NavbarMenuView();
            const navBarMenuElements = navbarMenuView.getNavbarMenu().upperMenuElements;
            expect(navBarMenuElements[0].dropdownMenu[0].label).toEqual(
                'Translation (en) of customMenu1Label_translation_key'
            );
            expect(navBarMenuElements[0].dropdownMenu[1].label).toEqual(
                'Translation (en) of customMenu2Label_translation_key'
            );
        });

        it('should not get menu if user is not member of showOnlyForGroups', async () => {
            stubMenuConfigLoading({
                navigationBar: [
                    {customMenuId: 'customMenu1'},
                    {customMenuId: 'customMenu2', showOnlyForGroups: ['groupUserIsNotMember']}
                ]
            });
            await stubCurrentUserData(['groupUserIsMember']);
            navbarMenuView = new NavbarMenuView();
            const navBarMenuElements = navbarMenuView.getNavbarMenu().upperMenuElements;
            expect(navBarMenuElements.length).toEqual(1);
            expect(navBarMenuElements[0].id).toEqual('customMenu1');
        });

        it('should  get menu if user is member of showOnlyForGroups', async () => {
            stubMenuConfigLoading({
                navigationBar: [
                    {customMenuId: 'customMenu1'},
                    {customMenuId: 'customMenu2', showOnlyForGroups: ['groupUserIsMember', 'groupUserIsNotMember']}
                ]
            });
            await stubCurrentUserData(['groupUserIsMember']);
            navbarMenuView = new NavbarMenuView();
            const navBarMenuElements = navbarMenuView.getNavbarMenu().upperMenuElements;
            expect(navBarMenuElements.length).toEqual(2);
            expect(navBarMenuElements[0].id).toEqual('customMenu1');
            expect(navBarMenuElements[1].id).toEqual('customMenu2');
        });

        it('should not get dropdown menus if user is not member of showOnlyForGroups', async () => {
            stubMenuConfigLoading({
                showDropdownMenuEvenIfOnlyOneEntry: true,
                navigationBar: [
                    {
                        entries: [
                            {customMenuId: 'customMenu1', showOnlyForGroups: ['groupUserIsNotMember']},
                            {customMenuId: 'customMenu2'}
                        ]
                    }
                ]
            });
            await stubCurrentUserData(['groupUserIsMember']);
            navbarMenuView = new NavbarMenuView();
            const navBarMenuElements = navbarMenuView.getNavbarMenu().upperMenuElements;
            expect(navBarMenuElements[0].dropdownMenu.length).toEqual(1);
            expect(navBarMenuElements[0].dropdownMenu[0].id).toEqual('customMenu2');
        });

        it('should not get dropdown menus if user is  member of showOnlyForGroups', async () => {
            stubMenuConfigLoading({
                navigationBar: [
                    {
                        entries: [
                            {
                                customMenuId: 'customMenu1',
                                showOnlyForGroups: ['groupUserIsNotMember', 'groupUserIsMember']
                            },
                            {customMenuId: 'customMenu2'}
                        ]
                    }
                ]
            });
            await stubCurrentUserData(['groupUserIsMember']);
            navbarMenuView = new NavbarMenuView();
            const navBarMenuElements = navbarMenuView.getNavbarMenu().upperMenuElements;
            expect(navBarMenuElements[0].dropdownMenu.length).toEqual(2);
            expect(navBarMenuElements[0].dropdownMenu[0].id).toEqual('customMenu1');
            expect(navBarMenuElements[0].dropdownMenu[1].id).toEqual('customMenu2');
        });
    });

    describe('get mixed core and custom  navbar menus', () => {
        it('should get menus defined the ui menu configuration', async () => {
            stubMenuConfigLoading({
                navigationBar: [
                    {opfabCoreMenuId: 'feed'},
                    {opfabCoreMenuId: 'archives'},
                    {customMenuId: 'customMenu1', label: 'customMenu1Label_translation_key', url: 'url1'},
                    {customMenuId: 'customMenu2', label: 'customMenu2Label_translation_key', url: 'url2'}
                ]
            });
            navbarMenuView = new NavbarMenuView();
            const navBarMenuElements = navbarMenuView.getNavbarMenu().upperMenuElements;
            expect(navBarMenuElements.length).toEqual(4);
            expect(navBarMenuElements[0].id).toEqual('feed');
            expect(navBarMenuElements[1].id).toEqual('archives');
            expect(navBarMenuElements[2].id).toEqual('customMenu1');
            expect(navBarMenuElements[3].id).toEqual('customMenu2');
        });

        it('should get menu translation for dropdown menu title in label field', async () => {
            stubMenuConfigLoading({
                navigationBar: [
                    {
                        label: 'dropdownMenu_translation_key',
                        entries: [
                            {opfabCoreMenuId: 'feed'},
                            {opfabCoreMenuId: 'archives'},
                            {customMenuId: 'customMenu1', label: 'customMenu1Label_translation_key', url: 'url1'}
                        ]
                    }
                ]
            });
            navbarMenuView = new NavbarMenuView();
            const navBarMenuElements = navbarMenuView.getNavbarMenu().upperMenuElements;
            expect(navBarMenuElements[0].label).toEqual('Translation (en) of dropdownMenu_translation_key');
        });

        it('Should not get menu if sub menu is empty', async () => {
            stubMenuConfigLoading({
                navigationBar: [{entries: []}, {opfabCoreMenuId: 'feed'}]
            });
            navbarMenuView = new NavbarMenuView();
            const navBarMenuElements = navbarMenuView.getNavbarMenu().upperMenuElements;
            expect(navBarMenuElements.length).toEqual(1);
            expect(navBarMenuElements[0].id).toEqual('feed');
        });
        it('Should not get menu if sub menu is empty because he is not in the right groups', async () => {
            stubMenuConfigLoading({
                navigationBar: [
                    {
                        entries: [
                            {customMenuId: 'customMenu1', showOnlyForGroups: ['groupUserIsNotMember']},
                            {opfabCoreMenuId: 'archives', showOnlyForGroups: ['groupUserIsNotMember']}
                        ]
                    },
                    {opfabCoreMenuId: 'feed'}
                ]
            });
            await stubCurrentUserData(['groupUserIsMember']);
            navbarMenuView = new NavbarMenuView();
            const navBarMenuElements = navbarMenuView.getNavbarMenu().upperMenuElements;
            expect(navBarMenuElements.length).toEqual(1);
            expect(navBarMenuElements[0].id).toEqual('feed');
        });
        it('Should not show dropdown menu if sub menu contain only one entry and option showDropdownMenuEvenIfOnlyOneEntry is false', async () => {
            stubMenuConfigLoading({
                showDropdownMenuEvenIfOnlyOneEntry: false,
                navigationBar: [
                    {
                        entries: [
                            {customMenuId: 'customMenu1', showOnlyForGroups: ['groupUserIsNotMember']},
                            {opfabCoreMenuId: 'archives', showOnlyForGroups: ['groupUserIsMember']}
                        ]
                    },
                    {
                        opfabCoreMenuId: 'feed'
                    }
                ]
            });
            await stubCurrentUserData(['groupUserIsMember']);
            navbarMenuView = new NavbarMenuView();
            const navBarMenuElements = navbarMenuView.getNavbarMenu().upperMenuElements;
            expect(navBarMenuElements.length).toEqual(2);
            expect(navBarMenuElements[0].id).toEqual('archives');
            expect(navBarMenuElements[1].id).toEqual('feed');
        });
    });

    describe('Get right icons visibility', () => {
        it('Should have no icons visibility if not  configured in ui-menu config', async () => {
            await stubMenuConfigLoading({navigationBar: []});
            navbarMenuView = new NavbarMenuView();
            const navbarPage = navbarMenuView.getNavbarMenu();
            expect(navbarPage.isCalendarIconVisible).toBeFalsy();
            expect(navbarPage.isCreateUserCardIconVisible).toBeFalsy();
        });
        it('should have icons visibility if configured in ui-menu config', async () => {
            await stubMenuConfigLoading({
                navigationBar: [],
                topRightIconMenus: [
                    {opfabCoreMenuId: 'usercard', visible: true},
                    {opfabCoreMenuId: 'calendar', visible: true}
                ]
            });
            navbarMenuView = new NavbarMenuView();
            const navbarPage = navbarMenuView.getNavbarMenu();
            expect(navbarPage.isCalendarIconVisible).toBeTruthy();
            expect(navbarPage.isCreateUserCardIconVisible).toBeTruthy();
        });

        it('should have icons visibility set to false  if configured in ui-menu config with visible is false', async () => {
            await stubMenuConfigLoading({
                navigationBar: [],
                topRightIconMenus: [
                    {opfabCoreMenuId: 'usercard', visible: false},
                    {opfabCoreMenuId: 'calendar', visible: false}
                ]
            });
            navbarMenuView = new NavbarMenuView();
            const navbarPage = navbarMenuView.getNavbarMenu();
            expect(navbarPage.isCalendarIconVisible).toBeFalsy();
            expect(navbarPage.isCreateUserCardIconVisible).toBeFalsy();
        });
        it('should have icons visibility set to false  if configured in ui-menu config with user not member of showOnlyForGroups', async () => {
            await stubMenuConfigLoading({
                navigationBar: [],
                topRightIconMenus: [
                    {opfabCoreMenuId: 'usercard', visible: true, showOnlyForGroups: ['groupWhereUserIsNotMember']},
                    {opfabCoreMenuId: 'calendar', visible: true, showOnlyForGroups: ['groupWhereUserIsNotMember']}
                ]
            });
            await stubCurrentUserData(['groupWhereUserIsMember']);
            navbarMenuView = new NavbarMenuView();
            const navbarPage = navbarMenuView.getNavbarMenu();
            expect(navbarPage.isCalendarIconVisible).toBeFalsy();
            expect(navbarPage.isCreateUserCardIconVisible).toBeFalsy();
        });
        it('should have icons visibility set to true  if configured in ui-menu config with user  member of showOnlyForGroups', async () => {
            await stubMenuConfigLoading({
                navigationBar: [],
                topRightIconMenus: [
                    {opfabCoreMenuId: 'usercard', visible: true, showOnlyForGroups: ['groupWhereUserIsMember']},
                    {opfabCoreMenuId: 'calendar', visible: true, showOnlyForGroups: ['groupWhereUserIsMember']}
                ]
            });
            await stubCurrentUserData(['groupWhereUserIsMember']);
            navbarMenuView = new NavbarMenuView();
            const navbarPage = navbarMenuView.getNavbarMenu();
            expect(navbarPage.isCalendarIconVisible).toBeTruthy();
            expect(navbarPage.isCreateUserCardIconVisible).toBeTruthy();
        });
    });

    describe('Right menu', () => {
        const originalOpfabStyle_setOpfabTheme = opfabStyle.setOpfabTheme;
        let navbarMenuView: NavbarMenuView;

        beforeEach(async () => {
            opfabStyle.setOpfabTheme = () => {};
        });

        afterEach(() => {
            opfabStyle.setOpfabTheme = originalOpfabStyle_setOpfabTheme;
            if (navbarMenuView) {
                navbarMenuView.destroy();
            }
        });

        it('visible if configured in ui-menu config', async () => {
            await stubMenuConfigLoading({
                navigationBar: [],
                topRightMenus: [
                    {opfabCoreMenuId: 'realtimeusers', visible: true},
                    {opfabCoreMenuId: 'feedconfiguration', visible: true}
                ]
            });
            navbarMenuView = new NavbarMenuView();
            const rightMenuElements = navbarMenuView.getNavbarMenu().rightMenuElements;
            expect(rightMenuElements.length).toEqual(2);
            expect(rightMenuElements[0].id).toEqual('realtimeusers');
            expect(rightMenuElements[1].id).toEqual('feedconfiguration');
        });

        it('should get menu translations in labels', async () => {
            await stubMenuConfigLoading({
                navigationBar: [],
                topRightMenus: [
                    {opfabCoreMenuId: 'realtimeusers', visible: true},
                    {opfabCoreMenuId: 'feedconfiguration', visible: true}
                ]
            });
            navbarMenuView = new NavbarMenuView();
            const rightMenuElements = navbarMenuView.getNavbarMenu().rightMenuElements;
            expect(rightMenuElements.length).toEqual(2);
            expect(rightMenuElements[0].label).toEqual('Translation (en) of menu.realtimeusers');
            expect(rightMenuElements[1].label).toEqual('Translation (en) of menu.feedconfiguration');
        });

        it('daynightmode should have translation for day mode when current mode is night', async () => {
            await stubMenuConfigLoading({
                navigationBar: [],
                topRightMenus: [{opfabCoreMenuId: 'nightdaymode', visible: true}]
            });
            GlobalStyleService.init();
            GlobalStyleService.setStyle(GlobalStyleService.NIGHT);
            navbarMenuView = new NavbarMenuView();
            const rightMenuElements = navbarMenuView.getNavbarMenu().rightMenuElements;
            expect(rightMenuElements.length).toEqual(1);
            expect(rightMenuElements[0].label).toEqual('Translation (en) of menu.switchToDayMode');
        });

        it('daynightmode should have translation for night mode when current mode is day', async () => {
            await stubMenuConfigLoading({
                navigationBar: [],
                topRightMenus: [{opfabCoreMenuId: 'nightdaymode', visible: true}]
            });
            GlobalStyleService.init();
            GlobalStyleService.setStyle(GlobalStyleService.DAY);
            navbarMenuView = new NavbarMenuView();
            const rightMenuElements = navbarMenuView.getNavbarMenu().rightMenuElements;
            expect(rightMenuElements.length).toEqual(1);
            expect(rightMenuElements[0].label).toEqual('Translation (en) of menu.switchToNightMode');
        });

        it('not visible if configured in ui-menu config with visible = false or not set', async () => {
            await stubMenuConfigLoading({
                navigationBar: [],
                topRightMenus: [
                    {opfabCoreMenuId: 'realtimeusers', visible: false},
                    {opfabCoreMenuId: 'feedconfiguration'}
                ]
            });
            navbarMenuView = new NavbarMenuView();
            const rightMenuElements = navbarMenuView.getNavbarMenu().rightMenuElements;
            expect(rightMenuElements.length).toEqual(0);
        });

        it('not visible if configured in ui-menu config with user not member of showOnlyForGroups', async () => {
            await stubMenuConfigLoading({
                navigationBar: [],
                topRightMenus: [
                    {opfabCoreMenuId: 'realtimeusers', visible: true, showOnlyForGroups: ['groupWhereUserIsNotMember']},
                    {
                        opfabCoreMenuId: 'feedconfiguration',
                        visible: true,
                        showOnlyForGroups: ['groupWhereUserIsNotMember']
                    }
                ]
            });
            await stubCurrentUserData(['groupWhereUserIsMember']);
            navbarMenuView = new NavbarMenuView();
            const rightMenuElements = navbarMenuView.getNavbarMenu().rightMenuElements;
            expect(rightMenuElements.length).toEqual(0);
        });

        it('visible if configured in ui-menu config with user member of showOnlyForGroups', async () => {
            await stubMenuConfigLoading({
                navigationBar: [],
                topRightMenus: [
                    {opfabCoreMenuId: 'realtimeusers', visible: true, showOnlyForGroups: ['groupWhereUserIsMember']},
                    {
                        opfabCoreMenuId: 'feedconfiguration',
                        visible: true,
                        showOnlyForGroups: ['groupWhereUserIsMember']
                    }
                ]
            });
            await stubCurrentUserData(['groupWhereUserIsMember']);
            navbarMenuView = new NavbarMenuView();
            const rightMenuElements = navbarMenuView.getNavbarMenu().rightMenuElements;
            expect(rightMenuElements.length).toEqual(2);
            expect(rightMenuElements[0].id).toEqual('realtimeusers');
            expect(rightMenuElements[1].id).toEqual('feedconfiguration');
        });
        it('not visible if configured in ui-menu config with user not admin for admin feature admin, externaldevicesconfiguration', async () => {
            await stubMenuConfigLoading({
                navigationBar: [],
                topRightMenus: [
                    {opfabCoreMenuId: 'admin', visible: true},
                    {opfabCoreMenuId: 'externaldevicesconfiguration', visible: true}
                ]
            });
            await stubCurrentUserData([]);
            navbarMenuView = new NavbarMenuView();
            const rightMenuElements = navbarMenuView.getNavbarMenu().rightMenuElements;
            expect(rightMenuElements.length).toEqual(0);
        });

        it('visible if configured in ui-menu config with user admin for admin feature admin, externaldevicesconfiguration,useractionlogs', async () => {
            await stubMenuConfigLoading({
                navigationBar: [],
                topRightMenus: [
                    {opfabCoreMenuId: 'admin', visible: true},
                    {opfabCoreMenuId: 'externaldevicesconfiguration', visible: true},
                    {opfabCoreMenuId: 'useractionlogs', visible: true}
                ]
            });
            await stubCurrentUserData([], [PermissionEnum.ADMIN]);
            navbarMenuView = new NavbarMenuView();
            const rightMenuElements = navbarMenuView.getNavbarMenu().rightMenuElements;
            expect(rightMenuElements.length).toEqual(3);
            expect(rightMenuElements[0].id).toEqual('admin');
            expect(rightMenuElements[1].id).toEqual('externaldevicesconfiguration');
            expect(rightMenuElements[2].id).toEqual('useractionlogs');
        });

        it('visible if configured in ui-menu config with user for admin feature useractionlogs', async () => {
            await stubMenuConfigLoading({
                navigationBar: [],
                topRightMenus: [{opfabCoreMenuId: 'useractionlogs', visible: true}]
            });
            await stubCurrentUserData([], [PermissionEnum.VIEW_USER_ACTION_LOGS]);
            navbarMenuView = new NavbarMenuView();
            const rightMenuElements = navbarMenuView.getNavbarMenu().rightMenuElements;
            expect(rightMenuElements.length).toEqual(1);
            expect(rightMenuElements[0].id).toEqual('useractionlogs');
        });

        it('Action logs not visible if configured in ui-menu config with user without admin feature useractionlogs nor admin', async () => {
            await stubMenuConfigLoading({
                navigationBar: [],
                topRightMenus: [{opfabCoreMenuId: 'useractionlogs', visible: true}]
            });
            await stubCurrentUserData([], []);
            navbarMenuView = new NavbarMenuView();
            const rightMenuElements = navbarMenuView.getNavbarMenu().rightMenuElements;
            expect(rightMenuElements.length).toEqual(0);
        });

        it('only menu settings,feedconfiguration,nightdaymode,logout shall be available for collapsed menu', async () => {
            GlobalStyleService.init();
            GlobalStyleService.setStyle(GlobalStyleService.NIGHT);
            await stubMenuConfigLoading({
                navigationBar: [],
                topRightMenus: [
                    {opfabCoreMenuId: 'admin', visible: true},
                    {opfabCoreMenuId: 'externaldevicesconfiguration', visible: true},
                    {opfabCoreMenuId: 'useractionlogs', visible: true},
                    {opfabCoreMenuId: 'realtimeusers', visible: true},
                    {opfabCoreMenuId: 'settings', visible: true},
                    {opfabCoreMenuId: 'feedconfiguration', visible: true},
                    {opfabCoreMenuId: 'nightdaymode', visible: true},
                    {opfabCoreMenuId: 'usercard', visible: true},
                    {opfabCoreMenuId: 'calendar', visible: true},
                    {opfabCoreMenuId: 'logout', visible: true}
                ]
            });
            await stubCurrentUserData([], [PermissionEnum.ADMIN]);
            navbarMenuView = new NavbarMenuView();
            const rightMenuCollapsedElements = navbarMenuView.getNavbarMenu().rightMenuCollapsedElements;
            expect(rightMenuCollapsedElements.length).toEqual(4);
            expect(rightMenuCollapsedElements[0].id).toEqual('settings');
            expect(rightMenuCollapsedElements[0].label).toEqual('Translation (en) of menu.settings');
            expect(rightMenuCollapsedElements[1].id).toEqual('feedconfiguration');
            expect(rightMenuCollapsedElements[1].label).toEqual('Translation (en) of menu.feedconfiguration');
            expect(rightMenuCollapsedElements[2].id).toEqual('nightdaymode');
            expect(rightMenuCollapsedElements[2].label).toEqual('Translation (en) of menu.switchToDayMode');
            expect(rightMenuCollapsedElements[3].id).toEqual('logout');
            expect(rightMenuCollapsedElements[3].label).toEqual('Translation (en) of menu.logout');
        });
    });
    describe('Current selected menu', () => {
        beforeEach(() => {
            NavigationService.setApplicationRouter(new ApplicationRouterMock());
        });

        it('should be core menu feed if current route is /', async () => {
            NavigationService.navigateTo('/');
            await stubMenuConfigLoading({});
            const navBarView = new NavbarMenuView();
            navBarView.setCurrentSelectedMenuEntryListener((currentSelectedMenuId) => {
                expect(currentSelectedMenuId).toEqual('feed');
            });
            navBarView.destroy();
        });
        it('should be core menu feed if current route is feed', async () => {
            NavigationService.navigateTo('/feed');
            await stubMenuConfigLoading({});
            const navBarView = new NavbarMenuView();
            navBarView.setCurrentSelectedMenuEntryListener((currentSelectedMenuId) => {
                expect(currentSelectedMenuId).toEqual('feed');
            });
            navBarView.destroy();
        });
        it('should be core menu feed if current route is a card in feed : /feed/cards/cardId', async () => {
            NavigationService.navigateTo('/feed/cards/cardId');
            await stubMenuConfigLoading({});
            const navBarView = new NavbarMenuView();
            navBarView.setCurrentSelectedMenuEntryListener((currentSelectedMenuId) => {
                expect(currentSelectedMenuId).toEqual('feed');
            });
            navBarView.destroy();
        });
        it('should be custom_menu id if current route is /businessconfigparty/custom_menu_id', async () => {
            NavigationService.navigateTo('/businessconfigparty/custom_menu_id');
            await stubMenuConfigLoading({});
            const navBarView = new NavbarMenuView();
            navBarView.setCurrentSelectedMenuEntryListener((currentSelectedMenuId) => {
                expect(currentSelectedMenuId).toEqual('custom_menu_id');
            });
            navBarView.destroy();
        });
        it('should be custom_menu id if current route is /businessconfigparty/custom_menu_id/customUrlElement', async () => {
            NavigationService.navigateTo('/businessconfigparty/custom_menu_id/customUrlElement');
            await stubMenuConfigLoading({});
            const navBarView = new NavbarMenuView();
            navBarView.setCurrentSelectedMenuEntryListener((currentSelectedMenuId) => {
                expect(currentSelectedMenuId).toEqual('custom_menu_id');
            });
            navBarView.destroy();
        });
        it('should be custom_menu id if current route is /businessconfigparty/custom_menu_id?customUrlParam=test', async () => {
            NavigationService.navigateTo('/businessconfigparty/custom_menu_id?customUrlParam=test');
            await stubMenuConfigLoading({});
            const navBarView = new NavbarMenuView();
            navBarView.setCurrentSelectedMenuEntryListener((currentSelectedMenuId) => {
                expect(currentSelectedMenuId).toEqual('custom_menu_id');
            });
            navBarView.destroy();
        });
    });

    describe('Locale change', () => {
        afterEach(() => {
            ConfigService.setConfigValue('settings.locale', 'en');
        });

        it('should update menu labels in upper menu', async () => {
            await stubMenuConfigLoading({
                navigationBar: [
                    {
                        entries: [
                            {customMenuId: 'customMenu1', label: 'customMenu1Label_translation_key'},
                            {opfabCoreMenuId: 'archives'}
                        ]
                    },
                    {
                        opfabCoreMenuId: 'feed'
                    }
                ]
            });
            const navbarMenuView = new NavbarMenuView();
            const navBarMenuElements = navbarMenuView.getNavbarMenu().upperMenuElements;
            expect(navBarMenuElements[1].label).toEqual('Translation (en) of menu.feed');
            TranslationService.setLang('fr');
            ConfigService.setConfigValue('settings.locale', 'fr');

            const newNavBarMenuElements = navbarMenuView.getNavbarMenu().upperMenuElements;
            expect(newNavBarMenuElements[1].label).toEqual('Translation (fr) of menu.feed');
            expect(newNavBarMenuElements[0].dropdownMenu[0].label).toEqual(
                'Translation (fr) of customMenu1Label_translation_key'
            );
            expect(newNavBarMenuElements[0].dropdownMenu[1].label).toEqual('Translation (fr) of menu.archives');
            navbarMenuView.destroy();
        });
        it('should update menu labels in right menu', async () => {
            await stubMenuConfigLoading({
                navigationBar: [],
                topRightMenus: [{opfabCoreMenuId: 'realtimeusers', visible: true}]
            });
            const navbarMenuView = new NavbarMenuView();
            const rightMenuElements = navbarMenuView.getNavbarMenu().rightMenuElements;
            expect(rightMenuElements[0].label).toEqual('Translation (en) of menu.realtimeusers');

            TranslationService.setLang('fr');
            ConfigService.setConfigValue('settings.locale', 'fr');

            const newRightMenuElements = navbarMenuView.getNavbarMenu().rightMenuElements;
            expect(newRightMenuElements[0].label).toEqual('Translation (fr) of menu.realtimeusers');
            navbarMenuView.destroy();
        });
        it('should trigger menu change listener when locale change', async () => {
            await stubMenuConfigLoading({
                navigationBar: [],
                topRightMenus: [{opfabCoreMenuId: 'realtimeusers', visible: true}]
            });
            const navbarMenuView = new NavbarMenuView();
            let listenerHasBeenCalled = false;
            navbarMenuView.setMenuChangeListener(() => {
                listenerHasBeenCalled = true;
            });
            TranslationService.setLang('fr');
            ConfigService.setConfigValue('settings.locale', 'fr');
            expect(listenerHasBeenCalled).toBeTruthy();
            navbarMenuView.destroy();
        });
    });

    describe('UI Menu Config Change', () => {
        it('should update menu elements when UI menu config changes', async () => {
            // Initial menu config
            await stubMenuConfigLoading({
                navigationBar: [{opfabCoreMenuId: 'feed'}, {opfabCoreMenuId: 'archives'}],
                topRightMenus: [{opfabCoreMenuId: 'realtimeusers', visible: true}],
                topRightIconMenus: [{opfabCoreMenuId: 'calendar', visible: false}]
            });
            const navbarMenuView = new NavbarMenuView();
            let navBarMenuElements = navbarMenuView.getNavbarMenu().upperMenuElements;
            let rightMenuElements = navbarMenuView.getNavbarMenu().rightMenuElements;
            expect(navBarMenuElements.length).toEqual(2);
            expect(navBarMenuElements[0].id).toEqual('feed');
            expect(rightMenuElements.length).toEqual(1);
            expect(navbarMenuView.getNavbarMenu().isCalendarIconVisible).toBeFalsy();

            // Setup listener to verify menu change occurs
            navbarMenuView.setMenuChangeListener(() => {
                // Verify menus have been updated
                navBarMenuElements = navbarMenuView.getNavbarMenu().upperMenuElements;
                rightMenuElements = navbarMenuView.getNavbarMenu().rightMenuElements;
                expect(navBarMenuElements.length).toEqual(3);
                expect(navBarMenuElements[0].id).toEqual('feed');
                expect(navBarMenuElements[1].id).toEqual('archives');
                expect(navBarMenuElements[2].id).toEqual('logging');
                expect(rightMenuElements.length).toEqual(2);
                expect(rightMenuElements[0].id).toEqual('realtimeusers');
                expect(rightMenuElements[1].id).toEqual('settings');
                expect(navbarMenuView.getNavbarMenu().isCalendarIconVisible).toBeTruthy();
                navbarMenuView.destroy();
            });

            // Simulate UI menu config change
            const newMenuConfig = {
                navigationBar: [{opfabCoreMenuId: 'feed'}, {opfabCoreMenuId: 'archives'}, {opfabCoreMenuId: 'logging'}],
                topRightMenus: [
                    {opfabCoreMenuId: 'realtimeusers', visible: true},
                    {opfabCoreMenuId: 'settings', visible: true}
                ],
                topRightIconMenus: [{opfabCoreMenuId: 'calendar', visible: true}]
            };
            const configServerMock = new ConfigServerMock();
            configServerMock.setResponseForMenuConfiguration(
                new ServerResponse(newMenuConfig, ServerResponseStatus.OK, null)
            );
            ConfigService.setConfigServer(configServerMock);
            await firstValueFrom(ConfigService.loadUiMenuConfig());

            // Trigger the event
            ApplicationEventsService.setUiMenuConfigChange();
        });

        it('should update upper menu elements visibility when config changes', async () => {
            await stubMenuConfigLoading({
                navigationBar: [{opfabCoreMenuId: 'feed'}]
            });
            await stubCurrentUserData(['groupA']);
            const navbarMenuView = new NavbarMenuView();
            let navBarMenuElements = navbarMenuView.getNavbarMenu().upperMenuElements;
            expect(navBarMenuElements.length).toEqual(1);

            navbarMenuView.setMenuChangeListener(() => {
                navBarMenuElements = navbarMenuView.getNavbarMenu().upperMenuElements;
                expect(navBarMenuElements.length).toEqual(2);
                expect(navBarMenuElements[1].id).toEqual('archives');
                navbarMenuView.destroy();
            });

            // Change menu config to add a menu visible only for groupA
            const newMenuConfig = {
                navigationBar: [{opfabCoreMenuId: 'feed'}, {opfabCoreMenuId: 'archives', showOnlyForGroups: ['groupA']}]
            };
            const configServerMock = new ConfigServerMock();
            configServerMock.setResponseForMenuConfiguration(
                new ServerResponse(newMenuConfig, ServerResponseStatus.OK, null)
            );
            ConfigService.setConfigServer(configServerMock);
            await firstValueFrom(ConfigService.loadUiMenuConfig());

            ApplicationEventsService.setUiMenuConfigChange();
        });

        it('should update right menu elements when config changes', async () => {
            await stubMenuConfigLoading({
                navigationBar: [],
                topRightMenus: [{opfabCoreMenuId: 'realtimeusers', visible: true}]
            });
            const navbarMenuView = new NavbarMenuView();
            let rightMenuElements = navbarMenuView.getNavbarMenu().rightMenuElements;
            expect(rightMenuElements.length).toEqual(1);
            expect(rightMenuElements[0].id).toEqual('realtimeusers');

            navbarMenuView.setMenuChangeListener(() => {
                rightMenuElements = navbarMenuView.getNavbarMenu().rightMenuElements;
                expect(rightMenuElements.length).toEqual(2);
                expect(rightMenuElements[0].id).toEqual('realtimeusers');
                expect(rightMenuElements[1].id).toEqual('feedconfiguration');
                navbarMenuView.destroy();
            });

            // Add a new right menu
            const newMenuConfig = {
                navigationBar: [],
                topRightMenus: [
                    {opfabCoreMenuId: 'realtimeusers', visible: true},
                    {opfabCoreMenuId: 'feedconfiguration', visible: true}
                ]
            };
            const configServerMock = new ConfigServerMock();
            configServerMock.setResponseForMenuConfiguration(
                new ServerResponse(newMenuConfig, ServerResponseStatus.OK, null)
            );
            ConfigService.setConfigServer(configServerMock);
            await firstValueFrom(ConfigService.loadUiMenuConfig());

            ApplicationEventsService.setUiMenuConfigChange();
        });

        it('should update icon visibility when config changes', async () => {
            await stubMenuConfigLoading({
                navigationBar: [],
                topRightIconMenus: [{opfabCoreMenuId: 'calendar', visible: false}]
            });
            const navbarMenuView = new NavbarMenuView();
            expect(navbarMenuView.getNavbarMenu().isCalendarIconVisible).toBeFalsy();
            expect(navbarMenuView.getNavbarMenu().isCreateUserCardIconVisible).toBeFalsy();

            navbarMenuView.setMenuChangeListener(() => {
                expect(navbarMenuView.getNavbarMenu().isCalendarIconVisible).toBeTruthy();
                expect(navbarMenuView.getNavbarMenu().isCreateUserCardIconVisible).toBeTruthy();
                navbarMenuView.destroy();
            });

            // Change icon visibility
            const newMenuConfig = {
                navigationBar: [],
                topRightIconMenus: [
                    {opfabCoreMenuId: 'calendar', visible: true},
                    {opfabCoreMenuId: 'usercard', visible: true}
                ]
            };
            const configServerMock = new ConfigServerMock();
            configServerMock.setResponseForMenuConfiguration(
                new ServerResponse(newMenuConfig, ServerResponseStatus.OK, null)
            );
            ConfigService.setConfigServer(configServerMock);
            await firstValueFrom(ConfigService.loadUiMenuConfig());

            ApplicationEventsService.setUiMenuConfigChange();
        });
    });
});
