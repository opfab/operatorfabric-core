/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ConfigServerMock} from '@tests/mocks/configServer.mock';
import {ConfigService} from './config.service';
import {firstValueFrom, timeout} from 'rxjs';

describe('ConfigService', () => {
    let configService: ConfigService;
    let configServerMock: ConfigServerMock;

    beforeEach(() => {
        configServerMock = new ConfigServerMock();
        configService = new ConfigService(configServerMock);
    });
    describe('Web-ui config', () => {
        it('GIVEN_A_Web-ui_Configuration_File_WHEN_Loading_THEN_Configuration_Is_Loaded', async () => {
            configServerMock.setWebUIConfiguration({field: 'value'});
            const conf = await firstValueFrom(configService.loadWebUIConfiguration().pipe(timeout(100)));
            expect(conf).toEqual({field: 'value'});
        });

        it('GIVEN_A_Loaded_Configuration_WHEN_Get_Config_Value_THEN_Obtain_Config_Value', async () => {
            const conf = {field1: 'value1', nested: {field2: 'value2'}};
            configServerMock.setWebUIConfiguration(conf);
            await firstValueFrom(configService.loadWebUIConfiguration().pipe(timeout(100)));
            expect(configService.getConfigValue('field1')).toEqual('value1');
            expect(configService.getConfigValue('nested.field2')).toEqual('value2');
        });

        it('GIVEN_A_Loaded_Configuration_WHEN_Get_Non_Existing_Config_Value_THEN_Obtain_FallBack_Config_Value', async () => {
            const conf = {field1: 'value1', nested: {field2: 'value2'}};
            configServerMock.setWebUIConfiguration(conf);
            await firstValueFrom(configService.loadWebUIConfiguration().pipe(timeout(100)));
            expect(configService.getConfigValue('unexisting', 'myfallback')).toEqual('myfallback');
        });

        it('GIVEN_A_Loaded_Configuration_WHEN_Set_Config_Value_THEN_Initial_Config_Value_Change', async () => {
            const conf = {field1: 'value1', nested: {field2: 'value2'}};
            configServerMock.setWebUIConfiguration(conf);
            await firstValueFrom(configService.loadWebUIConfiguration().pipe(timeout(100)));
            configService.setConfigValue('nested.field2', 'newValue2');
            expect(configService.getConfigValue('nested.field2')).toEqual('newValue2');
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

            configServerMock.setWebUIConfiguration(conf);
            await firstValueFrom(configService.loadWebUIConfiguration());
            configService.overrideConfigSettingsWithUserSettings(settings);
            expect(configService.getConfigValue('settings.settings1')).toEqual('newS1');
            expect(configService.getConfigValue('settings.settings2')).toEqual('s2');
            expect(configService.getConfigValue('settings.settings3')).toEqual('newS3');
        });

        it('GIVEN_A_Loaded_Configuration_WHEN_Change_Config_Value_THEN_Change_Is_Received_Via_Observable', async () => {
            const conf = {field1: 'value1', nested: {field2: 'value2'}};
            configServerMock.setWebUIConfiguration(conf);
            await firstValueFrom(configService.loadWebUIConfiguration().pipe(timeout(100)));

            let observableEmissionNb = 1;
            configService.getConfigValueAsObservable('nested.field2').subscribe((value) => {
                if (observableEmissionNb === 1) expect(value).toBe('value2');
                else expect(value).toBe('newValue2');
                observableEmissionNb++;
            });
            configService.setConfigValue('nested.field2', 'newValue2');
        });
    });

    describe('Menu config', () => {
        const menuConf = {
            coreMenusConfiguration: [
                {
                    id: 'feed',
                    visible: true
                },
                {
                    id: 'archives',
                    visible: true
                }
            ],
            menus: [
                {
                  id: "menu1",
                  label: "title.single",
                  entries: [
                    {
                      id: "entry1",
                      url: "https://test",
                      label: "entry.single",
                      linkType: "BOTH"
                    }
                  ]
                },],
            locales : [{
                language: "en",
                i18n: {
                    menu1: {
                        title: "First menu",
                        entry: "Single menu entry"
                    },
                }
            }]
        };

        it('GIVEN_A_Menu_Configuration_File_WHEN_Loading_Core_Menu_THEN_Core_Menu_Configuration_Is_Available', async () => {
            configServerMock.setMenuConfiguration(menuConf);
            await firstValueFrom(configService.loadCoreMenuConfigurations().pipe(timeout(100)));
            expect(configService.getCoreMenuConfiguration()[0].id).toEqual("feed");
        });


        it('GIVEN_A_Menu_Configuration_File_WHEN_Fetch_Custom_Menu_Translation_THEN_Translation_Is_Available', async () => {
            configServerMock.setMenuConfiguration(menuConf);
            const translation = await firstValueFrom(configService.fetchMenuTranslations().pipe(timeout(100)));
            expect(translation[0].language).toEqual("en");
            expect(translation[0].i18n["menu1"]["title"]).toEqual("First menu");
        });

        it('GIVEN_A_Menu_Configuration_File_WHEN_Getting_Url_For_Custom_Menu_THEN_Url_Is_Provided', async () => {
            configServerMock.setMenuConfiguration(menuConf);
            const url = await firstValueFrom(configService.queryMenuEntryURL("menu1","entry1").pipe(timeout(100)));
            expect(url).toEqual("https://test");
        });
    });
});
