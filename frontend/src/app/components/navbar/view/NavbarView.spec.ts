/* Copyright (c) 2024-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {NavbarView} from './NavbarView';
import {NavbarPage} from './NavbarPage';
import {loadWebUIConf} from '@tests/helpers';

describe('NavbarView', () => {
    describe('get environment name and color', () => {
        it('should set showEnvironmentName to false if no environmentName define in web-ui.json', async () => {
            await loadWebUIConf({});
            const navbarPage = getNavbarPage();
            expect(navbarPage.showEnvironmentName).toBeFalsy();
        });

        it('should set showEnvironmentName to true if environmentName define in web-ui.json', async () => {
            await loadWebUIConf({environmentName: 'dev'});
            const navbarPage = getNavbarPage();
            expect(navbarPage.showEnvironmentName).toBeTruthy();
        });

        it('should get environment name and color from web-ui.json', async () => {
            await loadWebUIConf({environmentName: 'dev', environmentColor: '#ff0000'});
            const navbarPage = getNavbarPage();
            expect(navbarPage.environmentName).toEqual('dev');
            expect(navbarPage.environmentColor).toEqual('#ff0000');
        });

        it('should get blue color if no environmentColor define in web-ui.json', async () => {
            await loadWebUIConf({environmentName: 'dev'});
            const navbarPage = getNavbarPage();
            expect(navbarPage.environmentColor).toEqual('#0000ff');
        });
    });

    describe('get logo ', () => {
        it('should get default opfab logo if no logo defined in web-ui.json', async () => {
            await loadWebUIConf({});

            const navbarPage = getNavbarPage();
            expect(navbarPage.logo.isDefaultOpfabLogo).toBeTruthy();
            expect(navbarPage.logo.base64Image).toContain('data:image/svg+xml;base64,PCEtLQ');
            expect(navbarPage.logo.height).toEqual(32);
            expect(navbarPage.logo.width).toEqual(32);
        });

        it('should get logo from web-ui.json if logo defined in web-ui.json', async () => {
            await loadWebUIConf({logo: {base64: 'customLogoInBase64', height: 30, width: 30}});
            const navbarPage = getNavbarPage();
            expect(navbarPage.logo.isDefaultOpfabLogo).toBeFalsy();
            expect(navbarPage.logo.base64Image).toContain('data:image/svg+xml;base64,customLogoInBase64');
            expect(navbarPage.logo.height).toEqual(30);
            expect(navbarPage.logo.width).toEqual(30);
        });

        it('should get default opfab logo if logo.base64 not defined in web-ui.json', async () => {
            await loadWebUIConf({logo: {height: 40, width: 40}});
            const navbarPage = getNavbarPage();
            expect(navbarPage.logo.isDefaultOpfabLogo).toBeTruthy();
            expect(navbarPage.logo.base64Image).toContain('data:image/svg+xml;base64,PCEtLQ');
            expect(navbarPage.logo.height).toEqual(32);
            expect(navbarPage.logo.width).toEqual(32);
        });

        it('should set height to 40 if height not defined in web-ui.json', async () => {
            await loadWebUIConf({logo: {base64: 'customLogoInBase64', width: 30}});
            const navbarPage = getNavbarPage();
            expect(navbarPage.logo.height).toEqual(40);
            expect(navbarPage.logo.width).toEqual(30);
        });

        it('should set width to 40 if width not defined in web-ui.json', async () => {
            await loadWebUIConf({logo: {base64: 'customLogoInBase64', height: 30}});
            const navbarPage = getNavbarPage();
            expect(navbarPage.logo.height).toEqual(30);
            expect(navbarPage.logo.width).toEqual(40);
        });

        it('should set height to 48 if height > 48 in web-ui.json', async () => {
            await loadWebUIConf({logo: {base64: 'customLogoInBase64', height: 50, width: 30}});
            const navbarPage = getNavbarPage();
            expect(navbarPage.logo.height).toEqual(48);
            expect(navbarPage.logo.width).toEqual(30);
        });
    });

    function getNavbarPage(): NavbarPage {
        return new NavbarView().getNavbarPage();
    }
});
