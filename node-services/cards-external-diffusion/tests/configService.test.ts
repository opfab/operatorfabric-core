/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import 'jest';
import logger from '../src/domain/server-side/logger';
import ConfigService from '../src/domain/client-side/configService';
import ConfigDTO from '../src/domain/client-side/configDTO';

function getDefaultConfig() {
    const defaultConfig = new ConfigDTO();
    defaultConfig.checkPeriodInSeconds = 30;
    defaultConfig.subjectPrefix = 'Mail subject prefix';

    return defaultConfig;
}

describe('config service', function () {
    it('Update config params ', async function () {
        const defaultConfig = getDefaultConfig();
        const configService = new ConfigService(defaultConfig, null, logger);
        expect(configService.getConfig().checkPeriodInSeconds).toEqual(30);
        expect(configService.getConfig().subjectPrefix).toEqual('Mail subject prefix');

        const confUpdate = {"checkPeriodInSeconds": 60}
        
        configService.patch(confUpdate);
        expect(configService.getConfig().checkPeriodInSeconds).toEqual(60);
        expect(configService.getConfig().subjectPrefix).toEqual('Mail subject prefix');


        const updateSubjexctPrefix = {"subjectPrefix": "NEW Mail subject prefix"}
        configService.patch(updateSubjexctPrefix);
        expect(configService.getConfig().checkPeriodInSeconds).toEqual(60);
        expect(configService.getConfig().subjectPrefix).toEqual('NEW Mail subject prefix');
    })

    it('Wrong config params are ignored', async function () {
        const defaultConfig = getDefaultConfig();
        const configService = new ConfigService(defaultConfig, null, logger);

        const confUpdate = {"checkPeriodInSeconds": 10, "wrongParam": 5};
        
        configService.patch(confUpdate);
        expect(configService.getConfig().checkPeriodInSeconds).toEqual(10);
        expect(configService.getConfig().subjectPrefix).toEqual('Mail subject prefix');

    })
})
