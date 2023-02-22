/* Copyright (c) 2023, RTE (http://www.rte-france.com)
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
import {AboutView} from './about.view';
import packageInfo from '../../../../../../package.json';


describe('About view ', () => {

    let configService: ConfigService;
    let configServerMock: ConfigServerMock;
    const opfab = {name : 'OperatorFabric', version: packageInfo.opfabVersion , rank: 0};

    beforeEach(() => {
        configServerMock = new ConfigServerMock();
        configService = new ConfigService(configServerMock);
    });

    it('GIVEN an application list in web-ui.json WHEN getting about array THEN get an applications list by rank ', async () => {

        const first = {name: 'first', version: 'first version', rank: 1};
        const second = {name: 'second', version: 'second version', rank: 2};
        const businessconfig = {name: 'businessconfig', version: 'businessconfig version', rank: 3};
        const applications = {businessconfig: businessconfig, second: second, first: first};

        configServerMock.setResponseForWebUIConfiguration(new ServerResponse({about: applications},ServerResponseStatus.OK,null));
        await firstValueFrom(configService.loadWebUIConfiguration());

        const aboutView = new AboutView(configService);

        expect(aboutView.getAboutElements()).toEqual([opfab,first, second, businessconfig]);
    });
    it('GIVEN an application list with same ranks in web-ui.json WHEN getting about view THEN get applications list in declared order', async() => {

        const first = {name: 'aaaa', version: 'v1', rank: 0};
        const second = {name: 'bbbb', version: 'v2', rank: 0};
        const businessconfig = {name: 'ccc', version: 'v3', rank: 0};
        const applications = {first: first, second: second, businessconfig: businessconfig};

        configServerMock.setResponseForWebUIConfiguration(new ServerResponse({about: applications},ServerResponseStatus.OK,null));
        await firstValueFrom(configService.loadWebUIConfiguration());
        const aboutView = new AboutView(configService);

        expect(aboutView.getAboutElements()).toEqual([opfab,first, second, businessconfig]);
    });

    it('GIVEN an application list with no rank in web-ui.json WHEN getting about view THEN get applications list in declared order ', async () => {
        const first = {name: 'aaaa', version: 'v1'};
        const second = {name: 'bbbb', version: 'v2'};
        const businessconfig = {name: 'ccc', version: 'v3'};
        const applications = {first: first, second: second, businessconfig: businessconfig};

        configServerMock.setResponseForWebUIConfiguration(new ServerResponse({about: applications},ServerResponseStatus.OK,null));
        await firstValueFrom(configService.loadWebUIConfiguration());

        const aboutView = new AboutView(configService);

        expect(aboutView.getAboutElements()).toEqual([opfab,first, second, businessconfig]);
    });

});
