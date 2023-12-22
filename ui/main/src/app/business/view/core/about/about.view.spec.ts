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
    let configServerMock: ConfigServerMock;
    const opfab = {name: 'OperatorFabric', version: packageInfo.opfabVersion, rank: 0};

    beforeEach(() => {
        configServerMock = new ConfigServerMock();
        ConfigService.setConfigServer(configServerMock);
    });
    function setupTest(applications: any) {
        configServerMock.setResponseForWebUIConfiguration(
            new ServerResponse({about: applications}, ServerResponseStatus.OK, null)
        );
        return firstValueFrom(ConfigService.loadWebUIConfiguration());
    }

    it('GIVEN an application list in web-ui.json WHEN getting about array THEN get an applications list by rank ', async () => {
        const applications = {
            businessconfig: {name: 'businessconfig', version: 'businessconfig version', rank: 3},
            second: {name: 'second', version: 'second version', rank: 2},
            first: {name: 'first', version: 'first version', rank: 1}
        };

        await setupTest(applications);

        const aboutView = new AboutView();
        expect(aboutView.getAboutElements()).toEqual([
            opfab,
            applications.first,
            applications.second,
            applications.businessconfig
        ]);
    });

    it('GIVEN an application list with same ranks in web-ui.json WHEN getting about view THEN get applications list in declared order', async () => {
        const applications = {
            first: {name: 'aaaa', version: 'v1', rank: 0},
            second: {name: 'bbbb', version: 'v2', rank: 0},
            businessconfig: {name: 'ccc', version: 'v3', rank: 0}
        };

        await setupTest(applications);

        const aboutView = new AboutView();
        expect(aboutView.getAboutElements()).toEqual([
            opfab,
            applications.first,
            applications.second,
            applications.businessconfig
        ]);
    });

    it('GIVEN an application list with no rank in web-ui.json WHEN getting about view THEN get applications list in declared order ', async () => {
        const applications = {
            first: {name: 'aaaa', version: 'v1'},
            second: {name: 'bbbb', version: 'v2'},
            businessconfig: {name: 'ccc', version: 'v3'}
        };

        await setupTest(applications);

        const aboutView = new AboutView();
        expect(aboutView.getAboutElements()).toEqual([
            opfab,
            applications.first,
            applications.second,
            applications.businessconfig
        ]);
    });
});
