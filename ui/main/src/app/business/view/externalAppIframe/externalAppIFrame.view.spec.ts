/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ConfigServerMock} from '@tests/mocks/configServer.mock';
import {RemoteLoggerServiceMock} from '@tests/mocks/remote-logger.service.mock';
import {UserServerMock} from '@tests/mocks/userServer.mock';
import {ServerResponse, ServerResponseStatus} from 'app/business/server/serverResponse';
import {AlertMessageService} from 'app/business/services/alert-message.service';
import {ConfigService} from 'app/business/services/config.service';
import {GlobalStyleService} from 'app/business/services/global-style.service';
import {OpfabLoggerService} from 'app/business/services/logs/opfab-logger.service';
import {MenuService} from 'app/business/services/menu.service';
import {UserPreferencesService} from 'app/business/services/users/user-preference.service';
import {UserService} from 'app/business/services/users/user.service';
import {RouterStore} from 'app/business/store/router.store';
import {firstValueFrom} from 'rxjs';
import {ExternalAppIFrameView} from './externalAppIFrame.view';

describe('ExternalAppIFrame view ', () => {
    let configService: ConfigService;
    let configServerMock: ConfigServerMock;
    let routerStore: RouterStore;
    let globalStyleService: GlobalStyleService;

    const menuConf = {
        navigationBar: [
            {
                id: 'menu1',
                label: 'title.single',
                entries: [
                    {
                        customMenuId: 'entry1',
                        url: 'https://test/',
                        label: 'entry.single',
                        linkType: 'BOTH'
                    },
                    {
                        customMenuId: 'entry2',
                        url: 'https://test/question?param=myparam',
                        label: 'entry.single',
                        linkType: 'BOTH'
                    }
                ]
            }
        ]
    };

    beforeEach(() => {
        configServerMock = new ConfigServerMock();
        configService = new ConfigService(configServerMock);
        routerStore = new RouterStore();
        const mockUserServer = new UserServerMock();
        const logService = new OpfabLoggerService(new RemoteLoggerServiceMock(configService, null));
        const userService = new UserService(mockUserServer, logService, new AlertMessageService());
        const menuService = new MenuService(configService, userService,logService);
        globalStyleService = new GlobalStyleService(new UserPreferencesService(), configService, menuService);
    });

    // menu1/entry1 ==> https://test/ ==> https://test/?opfab_theme=DAY
    it('GIVEN a menu is configured WHEN menu route is send THEN url is set with opfab_theme  ', async () => {
        globalStyleService.setStyle(GlobalStyleService.DAY);
        configServerMock.setResponseForMenuConfiguration(new ServerResponse(menuConf, ServerResponseStatus.OK, null));
        await firstValueFrom(configService.loadUiMenuConfig());

        const externalAppIFrameView = new ExternalAppIFrameView(configService, routerStore, globalStyleService);

        routerStore.setCurrentRoute('/businessconfigparty/menu1/entry1');

        const url = await firstValueFrom(externalAppIFrameView.getExternalAppUrl());

        expect(url).toEqual('https://test/?opfab_theme=DAY');
    });

    // menu1/entry2 ==> https://test/question?param=myparam ==> https://test/question?param=myparam&opfab_theme=DAY
    it('GIVEN menu is configure with a parameter in url  WHEN route is send THEN url is set with the parameter and opfab_theme  ', async () => {
        globalStyleService.setStyle(GlobalStyleService.DAY);
        configServerMock.setResponseForMenuConfiguration(new ServerResponse(menuConf, ServerResponseStatus.OK, null));
        await firstValueFrom(configService.loadUiMenuConfig());

        const externalAppIFrameView = new ExternalAppIFrameView(configService, routerStore, globalStyleService);

        routerStore.setCurrentRoute('/businessconfigparty/menu1/entry2');

        const url = await firstValueFrom(externalAppIFrameView.getExternalAppUrl());

        expect(url).toEqual('https://test/question?param=myparam&opfab_theme=DAY');
    });

    // If a business application is called form a card, it can be called with parameters
    // To do that, in the card the window.location is set with the url #/businessconfigparty/menu_id/menuItem_id
    // then is is possible to add params to the url
    // For example: #/businessconfigparty/menu_id/menuItem_id?myparam=param1&myotherparam=param2
    //
    // The user will be redirected to the url configured + the parameters
    //
    // menu1/entry1?my_param=param&my_param2=param2 ==> https://test/ ==> https://test/?my_param=param&my_param2=param2&opfab_theme=DAY
    it('GIVEN menu is configure WHEN route is send with params THEN url is set with the params and with opfab_theme  ', async () => {
        globalStyleService.setStyle(GlobalStyleService.DAY);
        configServerMock.setResponseForMenuConfiguration(new ServerResponse(menuConf, ServerResponseStatus.OK, null));
        await firstValueFrom(configService.loadUiMenuConfig());

        const externalAppIFrameView = new ExternalAppIFrameView(configService, routerStore, globalStyleService);

        routerStore.setCurrentRoute('/businessconfigparty/menu1/entry1?my_param=param&my_param2=param2');

        const url = await firstValueFrom(externalAppIFrameView.getExternalAppUrl());

        expect(url).toEqual('https://test/?my_param=param&my_param2=param2&opfab_theme=DAY');
    });

    // WARNING : HACK
    //
    // When user makes a reload (for example via F5) or use a bookmark link, the browser encodes what is after #
    // if user makes a second reload, the browser encodes again the encoded link
    // and after if user reload again, this time it is not encoded anymore by the browser
    // So it ends up with 3 possible links: a none encoded link, an encoded link or a twice encoding link
    // and we have no way to know which one it is when processing the url
    //
    // To solve the problem we encode two times the url before giving it to the browser
    // so we always have a unique case : a double encoded url

    it('GIVEN menu is configure WHEN route is send with params and encoded twice THEN url is decoded set with the params and with opfab_theme  ', async () => {
        globalStyleService.setStyle(GlobalStyleService.DAY);
        configServerMock.setResponseForMenuConfiguration(new ServerResponse(menuConf, ServerResponseStatus.OK, null));
        await firstValueFrom(configService.loadUiMenuConfig());

        const externalAppIFrameView = new ExternalAppIFrameView(configService, routerStore, globalStyleService);

        routerStore.setCurrentRoute('/businessconfigparty/menu1/entry1%253Fmy_param=param&my_param2=param2');

        const url = await firstValueFrom(externalAppIFrameView.getExternalAppUrl());

        expect(url).toEqual('https://test/?my_param=param&my_param2=param2&opfab_theme=DAY');
    });

    // menu1/entry2?my_param2=param2 ==> https://test/question?param=myparam ==> https://test/question?my_param=param&my_param2=param2&opfab_theme=DAY
    it('GIVEN menu is configure with a parameter in url WHEN route is send with params THEN url is set with all the params and with opfab_theme  ', async () => {
        globalStyleService.setStyle(GlobalStyleService.DAY);
        configServerMock.setResponseForMenuConfiguration(new ServerResponse(menuConf, ServerResponseStatus.OK, null));
        await firstValueFrom(configService.loadUiMenuConfig());

        const externalAppIFrameView = new ExternalAppIFrameView(configService, routerStore, globalStyleService);

        routerStore.setCurrentRoute('/businessconfigparty/menu1/entry2?my_param2=param2');

        const url = await firstValueFrom(externalAppIFrameView.getExternalAppUrl());

        expect(url).toEqual('https://test/question?param=myparam&my_param2=param2&opfab_theme=DAY');
    });

    // menu1/entry1/deep/deep2/query?my_param=param ==> https://test/ ==> https://test/deepurl/deepurl2/query?my_param=param&opfab_theme=DAY
    it('GIVEN menu is configure WHEN route is send with deep link and a param THEN url is set with deep link , the param and opfab_theme  ', async () => {
        globalStyleService.setStyle(GlobalStyleService.DAY);
        configServerMock.setResponseForMenuConfiguration(new ServerResponse(menuConf, ServerResponseStatus.OK, null));
        await firstValueFrom(configService.loadUiMenuConfig());

        const externalAppIFrameView = new ExternalAppIFrameView(configService, routerStore, globalStyleService);

        routerStore.setCurrentRoute('/businessconfigparty/menu1/entry1/deep/deep2/query?my_param=param');

        const url = await firstValueFrom(externalAppIFrameView.getExternalAppUrl());

        expect(url).toEqual('https://test/deep/deep2/query?my_param=param&opfab_theme=DAY');
    });

    it('GIVEN an url is set  WHEN global style change THEN url is set with new style  ', async () => {
        globalStyleService.setStyle(GlobalStyleService.DAY);
        configServerMock.setResponseForMenuConfiguration(new ServerResponse(menuConf, ServerResponseStatus.OK, null));
        await firstValueFrom(configService.loadUiMenuConfig());

        const externalAppIFrameView = new ExternalAppIFrameView(configService, routerStore, globalStyleService);

        routerStore.setCurrentRoute('/businessconfigparty/menu1/entry1');

        const url = await firstValueFrom(externalAppIFrameView.getExternalAppUrl());
        expect(url).toEqual('https://test/?opfab_theme=DAY');

        globalStyleService.setStyle(GlobalStyleService.NIGHT);
        const newUrl = await firstValueFrom(externalAppIFrameView.getExternalAppUrl());
        expect(newUrl).toEqual('https://test/?opfab_theme=NIGHT');
    });
});
