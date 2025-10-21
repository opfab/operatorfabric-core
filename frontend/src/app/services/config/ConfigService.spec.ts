/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ConfigServerMock} from '@tests/mocks/configServer.mock';
import {ConfigService} from './ConfigService';
import {firstValueFrom} from 'rxjs';
import {ServerResponse, ServerResponseStatus} from 'app/server/ServerResponse';
describe('ConfigService', () => {
    let configServerMock: ConfigServerMock;

    beforeEach(() => {
        ConfigService.reset();
        configServerMock = new ConfigServerMock();
        ConfigService.setConfigServer(configServerMock);
    });
    describe('Web-ui config', () => {
        it('GIVEN_A_Web-ui_Configuration_File_WHEN_Loading_THEN_Configuration_Is_Loaded', async () => {
            configServerMock.setResponseForWebUIConfiguration(
                new ServerResponse({field: 'value'}, ServerResponseStatus.OK, null)
            );
            const conf = await firstValueFrom(ConfigService.loadWebUIConfiguration());
            expect(conf).toEqual({field: 'value'});
        });

        it('GIVEN_A_Loaded_Configuration_WHEN_Get_Config_Value_THEN_Obtain_Config_Value', async () => {
            const conf = {field1: 'value1', nested: {field2: 'value2'}};
            configServerMock.setResponseForWebUIConfiguration(new ServerResponse(conf, ServerResponseStatus.OK, null));
            await firstValueFrom(ConfigService.loadWebUIConfiguration());
            expect(ConfigService.getConfigValue('field1')).toEqual('value1');
            expect(ConfigService.getConfigValue('nested.field2')).toEqual('value2');
        });

        it('GIVEN_A_Loaded_Configuration_WHEN_Get_Non_Existing_Config_Value_THEN_Obtain_FallBack_Config_Value', async () => {
            const conf = {field1: 'value1', nested: {field2: 'value2'}};
            configServerMock.setResponseForWebUIConfiguration(new ServerResponse(conf, ServerResponseStatus.OK, null));
            await firstValueFrom(ConfigService.loadWebUIConfiguration());
            expect(ConfigService.getConfigValue('unexisting', 'myfallback')).toEqual('myfallback');
        });

        it('GIVEN_A_Loaded_Configuration_WHEN_Set_Config_Value_THEN_Initial_Config_Value_Change', async () => {
            const conf = {field1: 'value1', nested: {field2: 'value2'}};
            configServerMock.setResponseForWebUIConfiguration(new ServerResponse(conf, ServerResponseStatus.OK, null));
            await firstValueFrom(ConfigService.loadWebUIConfiguration());
            ConfigService.setConfigValue('nested.field2', 'newValue2');
            expect(ConfigService.getConfigValue('nested.field2')).toEqual('newValue2');
        });

        it('GIVEN_A_Loaded_Configuration_WHEN_Override_With_User_Settings_THEN_Config_Values_From_Settings_Overrides_Loaded_Config', async () => {
            const conf = {
                field1: 'value1',
                settings: {
                    settings1: 's1',
                    settings2: 's2',
                    settings3: 's3'
                }
            };
            const settings = {
                settings1: 'newS1',
                settings3: 'newS3'
            };

            configServerMock.setResponseForWebUIConfiguration(new ServerResponse(conf, ServerResponseStatus.OK, null));
            await firstValueFrom(ConfigService.loadWebUIConfiguration());
            ConfigService.overrideConfigSettingsWithUserSettings(settings);
            expect(ConfigService.getConfigValue('settings.settings1')).toEqual('newS1');
            expect(ConfigService.getConfigValue('settings.settings2')).toEqual('s2');
            expect(ConfigService.getConfigValue('settings.settings3')).toEqual('newS3');
        });

        it('GIVEN_A_Loaded_Configuration_WHEN_Change_Config_Value_THEN_Change_Is_Received_Via_Observable', async () => {
            const conf = {field1: 'value1', nested: {field2: 'value2'}};
            configServerMock.setResponseForWebUIConfiguration(new ServerResponse(conf, ServerResponseStatus.OK, null));
            await firstValueFrom(ConfigService.loadWebUIConfiguration());
            let observableEmissionNb = 0;
            const getConfig = ConfigService.getConfigValueAsObservable('nested.field2').subscribe((value) => {
                observableEmissionNb++;
                if (observableEmissionNb === 1) expect(value).toBe('value2');
                else expect(value).toBe('newValue2');
            });
            ConfigService.setConfigValue('nested.field2', 'newValue2');
            expect(observableEmissionNb).toBe(2);
            getConfig.unsubscribe();
        });
    });

    describe('Menu config', () => {
        const menuConf = {
            navigationBar: [
                {
                    opfabCoreMenuId: 'feed',
                    visible: true
                }
            ],
            locales: [
                {
                    language: 'en',
                    i18n: {
                        title: 'First menu',
                        entry: 'Single menu entry'
                    }
                }
            ]
        };

        it('GIVEN_A_Menu_Configuration_File_WHEN_Fetch_Custom_Menu_Translation_THEN_Translation_Is_Available', async () => {
            configServerMock.setResponseForMenuConfiguration(
                new ServerResponse(menuConf, ServerResponseStatus.OK, null)
            );
            const translation = await firstValueFrom(ConfigService.fetchMenuTranslations());
            expect(translation[0].language).toEqual('en');
            expect(translation[0].i18n['title']).toEqual('First menu');
        });
    });
});
