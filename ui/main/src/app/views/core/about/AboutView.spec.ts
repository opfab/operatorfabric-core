/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AboutView} from './AboutView';
import packageInfo from '../../../../../package.json';
import {loadWebUIConf} from '@tests/helpers';

describe('About view ', () => {
    const opfab = {name: 'OperatorFabric', version: packageInfo.opfabVersion, rank: 0};

    async function loadApplicationConfig(applications: any) {
        await loadWebUIConf({about: applications});
    }

    it('GIVEN an application list in web-ui.json WHEN getting about array THEN get an applications list by rank ', async () => {
        const applications = {
            businessconfig: {name: 'businessconfig', version: 'businessconfig version', rank: 3},
            second: {name: 'second', version: 'second version', rank: 2},
            first: {name: 'first', version: 'first version', rank: 1}
        };

        await loadApplicationConfig(applications);

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

        await loadApplicationConfig(applications);

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

        await loadApplicationConfig(applications);

        const aboutView = new AboutView();
        expect(aboutView.getAboutElements()).toEqual([
            opfab,
            applications.first,
            applications.second,
            applications.businessconfig
        ]);
    });
});
