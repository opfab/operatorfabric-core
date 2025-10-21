/* Copyright (c) 2024-2025 RTE (http://www.rte-france.com)
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
import {NavbarMenuElement} from './NavbarPage';
import {NavbarMenuView} from './NavbarMenuView';
import {MenuEntryLinkType} from 'app/model/MenuEntryLinkType';
import {ApplicationRouterMock} from '@tests/mocks/applicationRouter.mock';
import {NavigationService} from '@ofServices/navigation/NavigationService';
import {GlobalStyleService} from '@ofServices/style/global-style.service';
import {TranslationService} from '@ofServices/translation/TranslationService';

declare const opfabStyle;

describe('NavbarMenuView - OnMenuClick', () => {
    const translationLib = new TranslationLibMock();
    let applicationRouterMock: ApplicationRouterMock;

    const originalOpfabStyle_setOpfabTheme = opfabStyle.setOpfabTheme;

    beforeEach(async () => {
        opfabStyle.setOpfabTheme = () => {};
        await stubUiMenuConfigLoading({});
        mockRouter();
    });

    afterEach(() => {
        opfabStyle.setOpfabTheme = originalOpfabStyle_setOpfabTheme;
    });

    describe('Click on menu to open inside the application', () => {
        it('open feed if menu item is core menu feed', async () => {
            clickOnMenu({
                menuId: 'feed',
                isCoreMenu: true
            });
            expect(applicationRouterMock.urlCalled).toEqual('feed');
        });
        it('open custom application in iframe if menu item is custom menu ', async () => {
            clickOnMenu({
                menuId: 'customMenu1',
                isCoreMenu: false
            });
            expect(applicationRouterMock.urlCalled).toEqual('businessconfigparty/customMenu1/');
        });

        it('open custom screen if menu item contains custom screen id ', async () => {
            clickOnMenu({
                menuId: 'customMenu1',
                isCustomScreen: true,
                isCoreMenu: false
            });
            expect(applicationRouterMock.urlCalled).toEqual('customscreen/customMenu1');
        });

        it('set route for custom application with double encoding if id contains a #', async () => {
            clickOnMenu({
                menuId: 'custom#Menu1',
                isCoreMenu: false
            });
            // space first encoding %23 , second encoding %2523
            expect(applicationRouterMock.urlCalled).toEqual('businessconfigparty/custom%2523Menu1/');
        });

        it('set route for custom application with double encoding if id contains a space character', async () => {
            clickOnMenu({
                menuId: 'custom Menu1',
                isCoreMenu: false
            });
            // space first encoding %20 , second encoding %2520
            expect(applicationRouterMock.urlCalled).toEqual('businessconfigparty/custom%2520Menu1/');
        });
    });

    describe('Click on custom menu to open in new tab', () => {
        const originalWindowOpen = window.open;
        let window_opener_value;
        let mockedWindowAPIUrlCalled: string;

        beforeEach(async () => {
            window.open = function (url?: string | URL, target?: string, features?: string): any {
                mockedWindowAPIUrlCalled = url.toString();
                return {
                    set opener(value) {
                        window_opener_value = value;
                    }
                };
            };
        });

        afterEach(() => {
            window.open = originalWindowOpen;
        });

        it('open in new tab if linkType is TAB ', async () => {
            clickOnMenu({
                linkType: MenuEntryLinkType.TAB,
                url: 'https://customMenuUrl/'
            });
            expect(mockedWindowAPIUrlCalled).toContain('https://customMenuUrl/');
        });

        it('open in new tab if isClickOnNewTabIcon is true ', async () => {
            clickOnMenu({
                url: 'customMenuUrl',
                openInNewTab: true
            });
            expect(mockedWindowAPIUrlCalled).toContain('customMenuUrl');
        });

        it('clear reference to parent window to prevent the opened window to access the parent window ', async () => {
            window_opener_value = 'refrenceToParentWindow';
            clickOnMenu({
                url: 'customMenuUrl',
                openInNewTab: true
            });
            expect(window_opener_value).toBeNull();
        });

        it('set url with opfab_theme=NIGHT added if UI in night mode', async () => {
            GlobalStyleService.init();
            GlobalStyleService.switchToNightMode();
            clickOnMenu({
                linkType: MenuEntryLinkType.TAB,
                url: 'https://customMenuUrl/'
            });
            expect(mockedWindowAPIUrlCalled).toEqual('https://customMenuUrl/?opfab_theme=NIGHT');
        });

        it('set url with opfab_theme=DAY added if UI in day mode', async () => {
            GlobalStyleService.init();
            GlobalStyleService.switchToDayMode();
            clickOnMenu({
                linkType: MenuEntryLinkType.TAB,
                url: 'https://customMenuUrl/'
            });
            expect(mockedWindowAPIUrlCalled).toEqual('https://customMenuUrl/?opfab_theme=DAY');
        });

        it('set url with opfab_theme as a new url param if url contains params', async () => {
            GlobalStyleService.init();
            GlobalStyleService.switchToDayMode();
            clickOnMenu({
                linkType: MenuEntryLinkType.TAB,
                url: 'https://customMenuUrl/test?param1=value1'
            });
            expect(mockedWindowAPIUrlCalled).toEqual('https://customMenuUrl/test?param1=value1&opfab_theme=DAY');
        });
    });

    describe('Click on nightday menu', () => {
        it('switch to day mode if current mode is night mode ', async () => {
            GlobalStyleService.init();
            GlobalStyleService.setStyle(GlobalStyleService.NIGHT);
            mockRouter();
            clickOnMenu({
                menuId: 'nightdaymode',
                isCoreMenu: true
            });
            expect(GlobalStyleService.getStyle()).toEqual(GlobalStyleService.DAY);
            expect(applicationRouterMock.urlCalled).toBeUndefined();
        });

        it('switch to night mode if current mode is day mode ', async () => {
            GlobalStyleService.init();
            GlobalStyleService.setStyle(GlobalStyleService.DAY);
            mockRouter();
            clickOnMenu({
                menuId: 'nightdaymode',
                isCoreMenu: true
            });
            expect(GlobalStyleService.getStyle()).toEqual(GlobalStyleService.NIGHT);
            expect(applicationRouterMock.urlCalled).toBeUndefined();
        });

        it(' if current mode is night mode change the title of the menu to change to night mode ', async () => {
            GlobalStyleService.init();
            GlobalStyleService.setStyle(GlobalStyleService.NIGHT);
            await stubUiMenuConfigLoading({
                navigationBar: [],
                topRightMenus: [{opfabCoreMenuId: 'nightdaymode', visible: true}]
            });
            const navbarMenuView = clickOnMenu({
                menuId: 'nightdaymode',
                isCoreMenu: true
            });
            checkNightDayModeMenuText(navbarMenuView, 'Translation (en) of menu.switchToNightMode');
        });

        it(' if current mode is day mode change the title of the menu to change to day mode ', async () => {
            GlobalStyleService.init();
            GlobalStyleService.setStyle(GlobalStyleService.DAY);
            await stubUiMenuConfigLoading({
                navigationBar: [],
                topRightMenus: [{opfabCoreMenuId: 'nightdaymode', visible: true}]
            });
            const navbarMenuView = clickOnMenu({
                menuId: 'nightdaymode',
                isCoreMenu: true
            });
            checkNightDayModeMenuText(navbarMenuView, 'Translation (en) of menu.switchToDayMode');
        });
    });

    function clickOnMenu({
        menuId = 'MyMenuId',
        isCoreMenu = false,
        isCustomScreen = false,
        linkType = MenuEntryLinkType.IFRAME,
        url = '',
        openInNewTab = false
    }): NavbarMenuView {
        TranslationService.setTranslationLib(translationLib);
        const navbarMenuView = new NavbarMenuView();
        const navbarMenuElement = new NavbarMenuElement();
        navbarMenuElement.id = menuId;
        navbarMenuElement.isCoreMenu = isCoreMenu;
        navbarMenuElement.isCustomScreen = isCustomScreen;
        navbarMenuElement.linkType = linkType;
        navbarMenuElement.url = url;
        navbarMenuView.onMenuClick(navbarMenuElement, openInNewTab);
        return navbarMenuView;
    }

    async function stubUiMenuConfigLoading(config: any) {
        const configServerMock = new ConfigServerMock();
        configServerMock.setResponseForMenuConfiguration(new ServerResponse(config, ServerResponseStatus.OK, null));
        ConfigService.setConfigServer(configServerMock);
        await firstValueFrom(ConfigService.loadUiMenuConfig());
    }

    function mockRouter() {
        applicationRouterMock = new ApplicationRouterMock();
        NavigationService.setApplicationRouter(applicationRouterMock);
    }

    function checkNightDayModeMenuText(navbarMenuView: NavbarMenuView, text: string) {
        navbarMenuView
            .getNavbarMenu()
            .rightMenuElements.filter((menu) => menu.id === 'nightdaymode')
            .forEach((menu) => {
                expect(menu.label).toEqual(text);
            });
    }
});
