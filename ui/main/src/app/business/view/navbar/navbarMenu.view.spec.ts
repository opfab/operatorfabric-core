/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ConfigServerMock} from '@tests/mocks/configServer.mock';
import {ServerResponse, ServerResponseStatus} from 'app/business/server/serverResponse';
import {ConfigService} from 'app/business/services/config.service';
import {firstValueFrom} from 'rxjs';
import {TranslationServiceMock} from '@tests/mocks/translation.service.mock';
import {NavbarMenu, NavbarMenuElement} from './navbarPage';
import {User} from '@ofModel/user.model';
import {UserServerMock} from '@tests/mocks/userServer.mock';
import {UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {UserService} from 'app/business/services/users/user.service';
import {NavbarMenuView} from './navbarMenu.view';
import {MenuEntryLinkTypeEnum} from '@ofModel/menu.model';
import {PermissionEnum} from '@ofModel/permission.model';
import {GlobalStyleService} from 'app/business/services/global-style.service';
import {RouterStore} from 'app/business/store/router.store';

declare const opfabStyle;

describe('NavbarMenuView', () => {
    let translationService;

    beforeEach(() => {
        translationService = new TranslationServiceMock();
    });

    describe('get core navbar menus', () => {
        it('should get menus defined ui-menu.json', async () => {
            stubConfigLoading({
                navigationBar: [{opfabCoreMenuId: 'feed'}, {opfabCoreMenuId: 'archives'}]
            });
            const navBarMenuElements = getNavbarNavigationBar();
            expect(navBarMenuElements.length).toEqual(2);
            expect(navBarMenuElements[0].id).toEqual('feed');
            expect(navBarMenuElements[1].id).toEqual('archives');
        });

        it('should get menu translations in labels', async () => {
            stubConfigLoading({
                navigationBar: [{opfabCoreMenuId: 'feed'}, {opfabCoreMenuId: 'archives'}]
            });
            const navBarMenuElements = getNavbarNavigationBar();
            expect(navBarMenuElements[0].label).toEqual('Translation (en) of menu.feed');
            expect(navBarMenuElements[1].label).toEqual('Translation (en) of menu.archives');
        });

        it('should get dropdown menus defined ui-menu.json', async () => {
            stubConfigLoading({
                navigationBar: [{entries: [{opfabCoreMenuId: 'feed'}, {opfabCoreMenuId: 'archives'}]}]
            });
            const navBarMenuElements = getNavbarNavigationBar();
            expect(navBarMenuElements.length).toEqual(1);
            expect(navBarMenuElements[0].dropdownMenu[0].id).toEqual('feed');
            expect(navBarMenuElements[0].dropdownMenu[1].id).toEqual('archives');
        });

        it('should get dropdown menu translations in labels', async () => {
            stubConfigLoading({
                navigationBar: [
                    {opfabCoreMenuId: 'feed', entries: [{opfabCoreMenuId: 'feed'}, {opfabCoreMenuId: 'archives'}]}
                ]
            });
            const navBarMenuElements = getNavbarNavigationBar();
            expect(navBarMenuElements[0].dropdownMenu[0].label).toEqual('Translation (en) of menu.feed');
            expect(navBarMenuElements[0].dropdownMenu[1].label).toEqual('Translation (en) of menu.archives');
        });

        it('should not get menu if user is not member of showOnlyForGroups', async () => {
            stubConfigLoading({
                navigationBar: [
                    {opfabCoreMenuId: 'feed'},
                    {opfabCoreMenuId: 'archives', showOnlyForGroups: ['groupUserIsNotMember']}
                ]
            });
            await stubCurrentUserData(['groupUserIsMember']);
            const navBarMenuElements = getNavbarNavigationBar();
            expect(navBarMenuElements.length).toEqual(1);
            expect(navBarMenuElements[0].id).toEqual('feed');
        });

        it('should  get menu if user is member of showOnlyForGroups', async () => {
            stubConfigLoading({
                navigationBar: [
                    {opfabCoreMenuId: 'feed'},
                    {opfabCoreMenuId: 'archives', showOnlyForGroups: ['groupUserIsMember', 'groupUserIsNotMember']}
                ]
            });
            await stubCurrentUserData(['groupUserIsMember']);
            const navBarMenuElements = getNavbarNavigationBar();
            expect(navBarMenuElements.length).toEqual(2);
            expect(navBarMenuElements[0].id).toEqual('feed');
            expect(navBarMenuElements[1].id).toEqual('archives');
        });

        it('should  get menu if showOnlyForGroups = [] ', async () => {
            stubConfigLoading({
                navigationBar: [{opfabCoreMenuId: 'feed'}, {opfabCoreMenuId: 'archives', showOnlyForGroups: []}]
            });
            await stubCurrentUserData(['groupUserIsMember']);
            const navBarMenuElements = getNavbarNavigationBar();
            expect(navBarMenuElements.length).toEqual(2);
            expect(navBarMenuElements[0].id).toEqual('feed');
            expect(navBarMenuElements[1].id).toEqual('archives');
        });

        it('should not get dropdown menus if user is not member of showOnlyForGroups', async () => {
            stubConfigLoading({
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
            const navBarMenuElements = getNavbarNavigationBar();
            expect(navBarMenuElements[0].dropdownMenu.length).toEqual(1);
            expect(navBarMenuElements[0].dropdownMenu[0].id).toEqual('archives');
        });

        it('should get dropdown menus if user is  member of showOnlyForGroups', async () => {
            stubConfigLoading({
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
            const navBarMenuElements = getNavbarNavigationBar();
            expect(navBarMenuElements[0].dropdownMenu.length).toEqual(2);
            expect(navBarMenuElements[0].dropdownMenu[0].id).toEqual('feed');
            expect(navBarMenuElements[0].dropdownMenu[1].id).toEqual('archives');
        });
    });

    describe('get custom navbar menus', () => {
        it('should get menus defined ui-menu.json', async () => {
            stubConfigLoading({
                navigationBar: [
                    {
                        customMenuId: 'customMenu1',
                        label: 'customMenu1Label_translation_key',
                        url: 'url1',
                        linkType: MenuEntryLinkTypeEnum.TAB
                    },
                    {
                        customMenuId: 'customMenu2',
                        label: 'customMenu2Label_translation_key',
                        url: 'url2',
                        linkType: MenuEntryLinkTypeEnum.BOTH
                    }
                ]
            });
            const navBarMenuElements = getNavbarNavigationBar();
            expect(navBarMenuElements.length).toEqual(2);
            expect(navBarMenuElements[0].id).toEqual('customMenu1');
            expect(navBarMenuElements[0].url).toEqual('url1');
            expect(navBarMenuElements[0].linkType).toEqual(MenuEntryLinkTypeEnum.TAB);
            expect(navBarMenuElements[1].id).toEqual('customMenu2');
            expect(navBarMenuElements[1].url).toEqual('url2');
            expect(navBarMenuElements[1].linkType).toEqual(MenuEntryLinkTypeEnum.BOTH);
        });

        it('should get menu translations in labels', async () => {
            stubConfigLoading({
                navigationBar: [
                    {customMenuId: 'customMenu1', label: 'customMenu1Label_translation_key'},
                    {customMenuId: 'customMenu2', label: 'customMenu2Label_translation_key'}
                ]
            });
            const navBarMenuElements = getNavbarNavigationBar();
            expect(navBarMenuElements[0].label).toEqual('Translation (en) of customMenu1Label_translation_key');
            expect(navBarMenuElements[1].label).toEqual('Translation (en) of customMenu2Label_translation_key');
        });

        it('should get dropdown menus defined ui-menu.json', async () => {
            stubConfigLoading({
                navigationBar: [
                    {
                        entries: [
                            {customMenuId: 'customMenu1', label: 'customMenu1Label_translation_key'},
                            {customMenuId: 'customMenu2', label: 'customMenu2Label_translation_key'}
                        ]
                    }
                ]
            });
            const navBarMenuElements = getNavbarNavigationBar();
            expect(navBarMenuElements.length).toEqual(1);
            expect(navBarMenuElements[0].dropdownMenu[0].id).toEqual('customMenu1');
            expect(navBarMenuElements[0].dropdownMenu[1].id).toEqual('customMenu2');
        });

        it('should get dropdown menu translations in labels', async () => {
            stubConfigLoading({
                navigationBar: [
                    {
                        entries: [
                            {customMenuId: 'customMenu1', label: 'customMenu1Label_translation_key'},
                            {customMenuId: 'customMenu2', label: 'customMenu2Label_translation_key'}
                        ]
                    }
                ]
            });
            const navBarMenuElements = getNavbarNavigationBar();
            expect(navBarMenuElements[0].dropdownMenu[0].label).toEqual(
                'Translation (en) of customMenu1Label_translation_key'
            );
            expect(navBarMenuElements[0].dropdownMenu[1].label).toEqual(
                'Translation (en) of customMenu2Label_translation_key'
            );
        });

        it('should not get menu if user is not member of showOnlyForGroups', async () => {
            stubConfigLoading({
                navigationBar: [
                    {customMenuId: 'customMenu1'},
                    {customMenuId: 'customMenu2', showOnlyForGroups: ['groupUserIsNotMember']}
                ]
            });
            await stubCurrentUserData(['groupUserIsMember']);
            const navBarMenuElements = getNavbarNavigationBar();
            expect(navBarMenuElements.length).toEqual(1);
            expect(navBarMenuElements[0].id).toEqual('customMenu1');
        });

        it('should  get menu if user is member of showOnlyForGroups', async () => {
            stubConfigLoading({
                navigationBar: [
                    {customMenuId: 'customMenu1'},
                    {customMenuId: 'customMenu2', showOnlyForGroups: ['groupUserIsMember', 'groupUserIsNotMember']}
                ]
            });
            await stubCurrentUserData(['groupUserIsMember']);
            const navBarMenuElements = getNavbarNavigationBar();
            expect(navBarMenuElements.length).toEqual(2);
            expect(navBarMenuElements[0].id).toEqual('customMenu1');
            expect(navBarMenuElements[1].id).toEqual('customMenu2');
        });

        it('should not get dropdown menus if user is not member of showOnlyForGroups', async () => {
            stubConfigLoading({
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
            const navBarMenuElements = getNavbarNavigationBar();
            expect(navBarMenuElements[0].dropdownMenu.length).toEqual(1);
            expect(navBarMenuElements[0].dropdownMenu[0].id).toEqual('customMenu2');
        });

        it('should not get dropdown menus if user is  member of showOnlyForGroups', async () => {
            stubConfigLoading({
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
            const navBarMenuElements = getNavbarNavigationBar();
            expect(navBarMenuElements[0].dropdownMenu.length).toEqual(2);
            expect(navBarMenuElements[0].dropdownMenu[0].id).toEqual('customMenu1');
            expect(navBarMenuElements[0].dropdownMenu[1].id).toEqual('customMenu2');
        });
    });

    describe('get mixed core and custom  navbar menus', () => {
        it('should get menus defined ui-menu.json', async () => {
            stubConfigLoading({
                navigationBar: [
                    {opfabCoreMenuId: 'feed'},
                    {opfabCoreMenuId: 'archives'},
                    {customMenuId: 'customMenu1', label: 'customMenu1Label_translation_key', url: 'url1'},
                    {customMenuId: 'customMenu2', label: 'customMenu2Label_translation_key', url: 'url2'}
                ]
            });
            const navBarMenuElements = getNavbarNavigationBar();
            expect(navBarMenuElements.length).toEqual(4);
            expect(navBarMenuElements[0].id).toEqual('feed');
            expect(navBarMenuElements[1].id).toEqual('archives');
            expect(navBarMenuElements[2].id).toEqual('customMenu1');
            expect(navBarMenuElements[3].id).toEqual('customMenu2');
        });

        it('should get menu translation for dropdown menu title in label field', async () => {
            stubConfigLoading({
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
            const navBarMenuElements = getNavbarNavigationBar();
            expect(navBarMenuElements[0].label).toEqual('Translation (en) of dropdownMenu_translation_key');
        });

        it('Should not get menu if sub menu is empty', async () => {
            stubConfigLoading({
                navigationBar: [{entries: []}, {opfabCoreMenuId: 'feed'}]
            });
            const navBarMenuElements = getNavbarNavigationBar();
            expect(navBarMenuElements.length).toEqual(1);
            expect(navBarMenuElements[0].id).toEqual('feed');
        });
        it('Should not get menu if sub menu is empty because he is not in the right groups', async () => {
            stubConfigLoading({
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
            const navBarMenuElements = getNavbarNavigationBar();
            expect(navBarMenuElements.length).toEqual(1);
            expect(navBarMenuElements[0].id).toEqual('feed');
        });
        it('Should not show dropdown menu if sub menu contain only one entry and option showDropdownMenuEvenIfOnlyOneEntry is false', async () => {
            stubConfigLoading({
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
            const navBarMenuElements = getNavbarNavigationBar();
            expect(navBarMenuElements.length).toEqual(2);
            expect(navBarMenuElements[0].id).toEqual('archives');
            expect(navBarMenuElements[1].id).toEqual('feed');
        });
    });

    describe('Get right icons visibility', () => {
        it('Should have no icons visibility if not  configured in ui-menu config', async () => {
            await stubConfigLoading({navigationBar: []});
            const navbarPage = getNavbarMenu();
            expect(navbarPage.isCalendarIconVisible).toBeFalsy();
            expect(navbarPage.isCreateUserCardIconVisible).toBeFalsy();
        });
        it('should have icons visibility if configured in ui-menu config', async () => {
            await stubConfigLoading({
                navigationBar: [],
                topRightIconMenus: [
                    {opfabCoreMenuId: 'usercard', visible: true},
                    {opfabCoreMenuId: 'calendar', visible: true}
                ]
            });
            const navbarPage = getNavbarMenu();
            expect(navbarPage.isCalendarIconVisible).toBeTruthy();
            expect(navbarPage.isCreateUserCardIconVisible).toBeTruthy();
        });

        it('should have icons visibility set to false  if configured in ui-menu config with visible is false', async () => {
            await stubConfigLoading({
                navigationBar: [],
                topRightIconMenus: [
                    {opfabCoreMenuId: 'usercard', visible: false},
                    {opfabCoreMenuId: 'calendar', visible: false}
                ]
            });
            const navbarPage = getNavbarMenu();
            expect(navbarPage.isCalendarIconVisible).toBeFalsy();
            expect(navbarPage.isCreateUserCardIconVisible).toBeFalsy();
        });
        it('should have icons visibility set to false  if configured in ui-menu config with user not member of showOnlyForGroups', async () => {
            await stubConfigLoading({
                navigationBar: [],
                topRightIconMenus: [
                    {opfabCoreMenuId: 'usercard', visible: true, showOnlyForGroups: ['groupWhereUserIsNotMember']},
                    {opfabCoreMenuId: 'calendar', visible: true, showOnlyForGroups: ['groupWhereUserIsNotMember']}
                ]
            });
            await stubCurrentUserData(['groupWhereUserIsMember']);
            const navbarPage = getNavbarMenu();
            expect(navbarPage.isCalendarIconVisible).toBeFalsy();
            expect(navbarPage.isCreateUserCardIconVisible).toBeFalsy();
        });
        it('should have icons visibility set to true  if configured in ui-menu config with user  member of showOnlyForGroups', async () => {
            await stubConfigLoading({
                navigationBar: [],
                topRightIconMenus: [
                    {opfabCoreMenuId: 'usercard', visible: true, showOnlyForGroups: ['groupWhereUserIsMember']},
                    {opfabCoreMenuId: 'calendar', visible: true, showOnlyForGroups: ['groupWhereUserIsMember']}
                ]
            });
            await stubCurrentUserData(['groupWhereUserIsMember']);
            const navbarPage = getNavbarMenu();
            expect(navbarPage.isCalendarIconVisible).toBeTruthy();
            expect(navbarPage.isCreateUserCardIconVisible).toBeTruthy();
        });
    });

    describe('Right menu', () => {
        const originalOpfabStyle_setOpfabTheme = opfabStyle.setOpfabTheme;

        beforeEach(async () => {
            opfabStyle.setOpfabTheme = () => {};
        });

        afterEach(() => {
            opfabStyle.setOpfabTheme = originalOpfabStyle_setOpfabTheme;
        });

        it('visible if configured in ui-menu config', async () => {
            await stubConfigLoading({
                navigationBar: [],
                topRightMenus: [
                    {opfabCoreMenuId: 'realtimeusers', visible: true},
                    {opfabCoreMenuId: 'feedconfiguration', visible: true}
                ]
            });
            const rightMenuElements = new NavbarMenuView(translationService).getNavbarMenu().rightMenuElements;
            expect(rightMenuElements.length).toEqual(2);
            expect(rightMenuElements[0].id).toEqual('realtimeusers');
            expect(rightMenuElements[1].id).toEqual('feedconfiguration');
        });

        it('should get menu translations in labels', async () => {
            await stubConfigLoading({
                navigationBar: [],
                topRightMenus: [
                    {opfabCoreMenuId: 'realtimeusers', visible: true},
                    {opfabCoreMenuId: 'feedconfiguration', visible: true}
                ]
            });
            const rightMenuElements = new NavbarMenuView(translationService).getNavbarMenu().rightMenuElements;
            expect(rightMenuElements.length).toEqual(2);
            expect(rightMenuElements[0].label).toEqual('Translation (en) of menu.realtimeusers');
            expect(rightMenuElements[1].label).toEqual('Translation (en) of menu.feedconfiguration');
        });

        it('daynightmode should have translation for day mode when current mode is night', async () => {
            await stubConfigLoading({
                navigationBar: [],
                topRightMenus: [{opfabCoreMenuId: 'nightdaymode', visible: true}]
            });
            GlobalStyleService.init();
            GlobalStyleService.setStyle(GlobalStyleService.NIGHT);
            const rightMenuElements = new NavbarMenuView(translationService).getNavbarMenu().rightMenuElements;
            expect(rightMenuElements.length).toEqual(1);
            expect(rightMenuElements[0].label).toEqual('Translation (en) of menu.switchToDayMode');
        });

        it('daynightmode should have translation for night mode when current mode is day', async () => {
            await stubConfigLoading({
                navigationBar: [],
                topRightMenus: [{opfabCoreMenuId: 'nightdaymode', visible: true}]
            });
            GlobalStyleService.init();
            GlobalStyleService.setStyle(GlobalStyleService.DAY);
            const rightMenuElements = new NavbarMenuView(translationService).getNavbarMenu().rightMenuElements;
            expect(rightMenuElements.length).toEqual(1);
            expect(rightMenuElements[0].label).toEqual('Translation (en) of menu.switchToNightMode');
        });

        it('not visible if configured in ui-menu config with visible = false or not set', async () => {
            await stubConfigLoading({
                navigationBar: [],
                topRightMenus: [
                    {opfabCoreMenuId: 'realtimeusers', visible: false},
                    {opfabCoreMenuId: 'feedconfiguration'}
                ]
            });
            const rightMenuElements = new NavbarMenuView(translationService).getNavbarMenu().rightMenuElements;
            expect(rightMenuElements.length).toEqual(0);
        });

        it('not visible if configured in ui-menu config with user not member of showOnlyForGroups', async () => {
            await stubConfigLoading({
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
            const rightMenuElements = new NavbarMenuView(translationService).getNavbarMenu().rightMenuElements;
            expect(rightMenuElements.length).toEqual(0);
        });

        it('visible if configured in ui-menu config with user member of showOnlyForGroups', async () => {
            await stubConfigLoading({
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
            const rightMenuElements = new NavbarMenuView(translationService).getNavbarMenu().rightMenuElements;
            expect(rightMenuElements.length).toEqual(2);
            expect(rightMenuElements[0].id).toEqual('realtimeusers');
            expect(rightMenuElements[1].id).toEqual('feedconfiguration');
        });
        it('not visible if configured in ui-menu config with user not admin for admin feature admin, externaldevicesconfiguration,useractionlogs', async () => {
            await stubConfigLoading({
                navigationBar: [],
                topRightMenus: [
                    {opfabCoreMenuId: 'admin', visible: true},
                    {opfabCoreMenuId: 'externaldevicesconfiguration', visible: true},
                    {opfabCoreMenuId: 'useractionlogs', visible: true}
                ]
            });
            await stubCurrentUserData([]);
            const rightMenuElements = new NavbarMenuView(translationService).getNavbarMenu().rightMenuElements;
            expect(rightMenuElements.length).toEqual(0);
        });

        it('visible if configured in ui-menu config with user admin for admin feature admin, externaldevicesconfiguration,useractionlogs', async () => {
            await stubConfigLoading({
                navigationBar: [],
                topRightMenus: [
                    {opfabCoreMenuId: 'admin', visible: true},
                    {opfabCoreMenuId: 'externaldevicesconfiguration', visible: true},
                    {opfabCoreMenuId: 'useractionlogs', visible: true}
                ]
            });
            await stubCurrentUserData([], [PermissionEnum.ADMIN]);
            const rightMenuElements = new NavbarMenuView(translationService).getNavbarMenu().rightMenuElements;
            expect(rightMenuElements.length).toEqual(3);
            expect(rightMenuElements[0].id).toEqual('admin');
            expect(rightMenuElements[1].id).toEqual('externaldevicesconfiguration');
            expect(rightMenuElements[2].id).toEqual('useractionlogs');
        });

        it('only menu settings,feedconfiguration,nightdaymode,logout shall be available for collapsed menu', async () => {
            GlobalStyleService.init();
            GlobalStyleService.setStyle(GlobalStyleService.NIGHT);
            await stubConfigLoading({
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
            const rightMenuCollapsedElements = new NavbarMenuView(translationService).getNavbarMenu()
                .rightMenuCollapsedElements;
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
        it('should be core menu feed if current route is /', async () => {
            RouterStore.setCurrentRoute('/');
            await stubConfigLoading({});
            const navBarView = new NavbarMenuView(translationService);
            navBarView.setCurrentSelectedMenuEntryListener((currentSelectedMenuId) => {
                expect(currentSelectedMenuId).toEqual('feed');
            });
            navBarView.destroy();
        });
        it('should be core menu feed if current route is feed', async () => {
            RouterStore.setCurrentRoute('/feed');
            await stubConfigLoading({});
            const navBarView = new NavbarMenuView(translationService);
            navBarView.setCurrentSelectedMenuEntryListener((currentSelectedMenuId) => {
                expect(currentSelectedMenuId).toEqual('feed');
            });
            navBarView.destroy();
        });
        it('should be core menu feed if current route is a card in feed : /feed/cards/cardId', async () => {
            RouterStore.setCurrentRoute('/feed/cards/cardId');
            await stubConfigLoading({});
            const navBarView = new NavbarMenuView(translationService);
            navBarView.setCurrentSelectedMenuEntryListener((currentSelectedMenuId) => {
                expect(currentSelectedMenuId).toEqual('feed');
            });
            navBarView.destroy();
        });
        it('should be custom_menu id if current route is /businessconfigparty/custom_menu_id', async () => {
            RouterStore.setCurrentRoute('/businessconfigparty/custom_menu_id');
            await stubConfigLoading({});
            const navBarView = new NavbarMenuView(translationService);
            navBarView.setCurrentSelectedMenuEntryListener((currentSelectedMenuId) => {
                expect(currentSelectedMenuId).toEqual('custom_menu_id');
            });
            navBarView.destroy();
        });
        it('should be custom_menu id if current route is /businessconfigparty/custom_menu_id/customUrlElement', async () => {
            RouterStore.setCurrentRoute('/businessconfigparty/custom_menu_id/customUrlElement');
            await stubConfigLoading({});
            const navBarView = new NavbarMenuView(translationService);
            navBarView.setCurrentSelectedMenuEntryListener((currentSelectedMenuId) => {
                expect(currentSelectedMenuId).toEqual('custom_menu_id');
            });
            navBarView.destroy();
        });
        it('should be custom_menu id if current route is /businessconfigparty/custom_menu_id?customUrlParam=test', async () => {
            RouterStore.setCurrentRoute('/businessconfigparty/custom_menu_id?customUrlParam=test');
            await stubConfigLoading({});
            const navBarView = new NavbarMenuView(translationService);
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
            await stubConfigLoading({
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
            const navbarMenuView = new NavbarMenuView(translationService);
            const navBarMenuElements = navbarMenuView.getNavbarMenu().upperMenuElements;
            expect(navBarMenuElements[1].label).toEqual('Translation (en) of menu.feed');
            translationService.setLang('fr');
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
            await stubConfigLoading({
                navigationBar: [],
                topRightMenus: [{opfabCoreMenuId: 'realtimeusers', visible: true}]
            });
            const navbarMenuView = new NavbarMenuView(translationService);
            const rightMenuElements = navbarMenuView.getNavbarMenu().rightMenuElements;
            expect(rightMenuElements[0].label).toEqual('Translation (en) of menu.realtimeusers');

            translationService.setLang('fr');
            ConfigService.setConfigValue('settings.locale', 'fr');

            const newRightMenuElements = navbarMenuView.getNavbarMenu().rightMenuElements;
            expect(newRightMenuElements[0].label).toEqual('Translation (fr) of menu.realtimeusers');
            navbarMenuView.destroy();
        });
        it('should trigger menu change listener when locale change', async () => {
            await stubConfigLoading({
                navigationBar: [],
                topRightMenus: [{opfabCoreMenuId: 'realtimeusers', visible: true}]
            });
            const navbarMenuView = new NavbarMenuView(translationService);
            let listenerHasBeenCalled = false;
            navbarMenuView.setMenuChangeListener(() => {
                listenerHasBeenCalled = true;
            });
            translationService.setLang('fr');
            ConfigService.setConfigValue('settings.locale', 'fr');
            expect(listenerHasBeenCalled).toBeTruthy();
            navbarMenuView.destroy();
        });
    });

    function getNavbarNavigationBar(): NavbarMenuElement[] {
        return new NavbarMenuView(translationService).getNavbarMenu().upperMenuElements;
    }

    async function stubConfigLoading(menuConfig: any) {
        const configServerMock = new ConfigServerMock();
        configServerMock.setResponseForMenuConfiguration(new ServerResponse(menuConfig, ServerResponseStatus.OK, null));
        ConfigService.setConfigServer(configServerMock);
        await firstValueFrom(ConfigService.loadUiMenuConfig());
    }

    async function stubCurrentUserData(userGroups: string[], permissions: PermissionEnum[] = []) {
        const user = new User('currentUser', 'firstname', 'lastname', null, userGroups, []);
        const userServerMock = new UserServerMock();
        userServerMock.setResponseForUser(new ServerResponse(user, ServerResponseStatus.OK, null));
        const userForPerimeter = new User('currentUser', 'firstname', 'lastname', null, userGroups, []);
        const userWithPerimeters = new UserWithPerimeters(userForPerimeter, new Array(), permissions, new Map());
        userServerMock.setResponseForCurrentUserWithPerimeter(
            new ServerResponse(userWithPerimeters, ServerResponseStatus.OK, null)
        );
        UserService.setUserServer(userServerMock);
        await firstValueFrom(UserService.loadUserWithPerimetersData());
    }

    function getNavbarMenu(): NavbarMenu {
        return new NavbarMenuView(translationService).getNavbarMenu();
    }
});
