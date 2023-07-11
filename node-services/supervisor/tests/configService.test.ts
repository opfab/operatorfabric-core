/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import 'jest';
import logger from '../src/common/server-side/logger';
import ConfigService from '../src/domain/client-side/configService';
import ConfigDTO from '../src/domain/client-side/configDTO';

function getDefaultConfig() {
    const defaultConfig = new ConfigDTO();
    defaultConfig.secondsBetweenConnectionChecks = 30;
    const entities = [{"id": "ENTITY1", "supervisors": ["ENTITY2"] }];
    defaultConfig.entitiesToSupervise = entities;
    return defaultConfig;
}

describe('config service', function () {
    it('Update config params ', async function () {
        const defaultConfig = getDefaultConfig();
        const configService = new ConfigService(defaultConfig, null, logger);
        expect(configService.getSupervisorConfig().secondsBetweenConnectionChecks).toEqual(30);
        expect(configService.getSupervisorConfig().entitiesToSupervise).toEqual([{"id": "ENTITY1", "supervisors": ["ENTITY2"] }]);

        const confUpdate = {"secondsBetweenConnectionChecks": 5}
        
        configService.patch(confUpdate);
        expect(configService.getSupervisorConfig().secondsBetweenConnectionChecks).toEqual(5);
        expect(configService.getSupervisorConfig().entitiesToSupervise).toEqual([{"id": "ENTITY1", "supervisors": ["ENTITY2"] }]);


        const updateEntities = {"entitiesToSupervise": [{"id": "ENTITY3", "supervisors": ["ENTITY4"] }]};
        configService.patch(updateEntities);
        expect(configService.getSupervisorConfig().secondsBetweenConnectionChecks).toEqual(5);
        expect(configService.getSupervisorConfig().entitiesToSupervise).toEqual([{"id": "ENTITY3", "supervisors": ["ENTITY4"] }]);
    })

    it('Wrong config params are ignored', async function () {
        const defaultConfig = getDefaultConfig();
        const configService = new ConfigService(defaultConfig, null, logger);

        const confUpdate = {"secondsBetweenConnectionChecks": 10, "wrongParam": 5};
        
        configService.patch(confUpdate);
        expect(configService.getSupervisorConfig().secondsBetweenConnectionChecks).toEqual(10);
        expect(configService.getSupervisorConfig().entitiesToSupervise).toEqual([{"id": "ENTITY1", "supervisors": ["ENTITY2"] }]);

    })
})
