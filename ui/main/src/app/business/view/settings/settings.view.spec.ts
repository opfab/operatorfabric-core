/* Copyright (c) 2024, RTE (http://www.rte-france.com)
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
import {ReplaySubject, firstValueFrom} from 'rxjs';
import {SettingsView} from './settings.view';
import {ExternalDevicesServerMock} from '@tests/mocks/externalDevicesServer.mock';
import {UserService} from 'app/business/services/users/user.service';
import {UserServerMock} from '@tests/mocks/userServer.mock';
import {UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {User} from '@ofModel/user.model';
import {ExternalDevicesService} from 'app/business/services/notifications/external-devices.service';
import {SettingsServerMock} from '@tests/mocks/settingsServer.mock';
import {SettingsService} from 'app/business/services/users/settings.service';
import {AlertMessageService} from 'app/business/services/alert-message.service';
import {Message, MessageLevel} from '@ofModel/message.model';

describe('Settings view ', () => {
    function setWebUiConf(webuiConf: any) {
        const configServerMock = new ConfigServerMock();
        ConfigService.setConfigServer(configServerMock);
        configServerMock.setResponseForWebUIConfiguration(new ServerResponse(webuiConf, ServerResponseStatus.OK, null));
        return firstValueFrom(ConfigService.loadWebUIConfiguration());
    }

    function setUserConf() {
        const userServerMock = new UserServerMock();
        UserService.setUserServer(userServerMock);
        const userWithPerimeters = new UserWithPerimeters(new User('user', '', ''), new Array(), null, new Map());
        userServerMock.setResponseForCurrentUserWithPerimeter(
            new ServerResponse(userWithPerimeters, ServerResponseStatus.OK, null)
        );
        return firstValueFrom(UserService.loadUserWithPerimetersData());
    }

    describe('isSettingsVisible', () => {
        let settingsView: SettingsView;

        beforeEach(async () => {
            await setWebUiConf({settingsScreen: {hiddenSettings: ['sendCardsByEmail']}});
            settingsView = new SettingsView();
        });

        it('should make a setting visible if it is not hidden in the web-ui configuration', () => {
            expect(settingsView.isSettingVisible('remoteLoggingEnabled')).toBe(true);
        });

        it('should hide a setting if it is hidden in the web-ui configuration', () => {
            expect(settingsView.isSettingVisible('sendCardsByEmail')).toBe(false);
        });

        it('should make externalDevicesEnabled visible if user is associated to an external device', async () => {
            const externalDevicesServerMock = new ExternalDevicesServerMock();
            externalDevicesServerMock.setResponseForFetchUserConfiguration(
                new ServerResponse({userLogin: 'user', externalDeviceIds: ['device1']}, ServerResponseStatus.OK, null)
            );
            ExternalDevicesService.setExternalDevicesServer(externalDevicesServerMock);
            await setUserConf();
            expect(await settingsView.isExternalDeviceSettingVisible()).toBe(true);
        });

        it('should hide externalDevicesEnabled if user is not associated to an external device', async () => {
            const externalDevicesServerMock = new ExternalDevicesServerMock();
            externalDevicesServerMock.setResponseForFetchUserConfiguration(
                new ServerResponse({userLogin: 'user', externalDeviceIds: []}, ServerResponseStatus.OK, null)
            );
            ExternalDevicesService.setExternalDevicesServer(externalDevicesServerMock);
            await setUserConf();
            expect(await settingsView.isExternalDeviceSettingVisible()).toBe(false);
        });
    });

    describe('getSetting', () => {
        let settingsView: SettingsView;

        beforeEach(() => {
            settingsView = new SettingsView();
        });

        it('should retrieve a boolean setting from the configuration service if it exists', async () => {
            await setWebUiConf({settings: {remoteLoggingEnabled: true}});
            expect(settingsView.getSetting('remoteLoggingEnabled')).toBe(true);
        });

        it('should retrieve a number setting from the configuration service if it exists', async () => {
            await setWebUiConf({settings: {replayInterval: 10}});
            expect(settingsView.getSetting('replayInterval')).toBe(10);
        });

        it('should retrieve a string setting from the configuration service if it exists', async () => {
            await setWebUiConf({settings: {locale: 'en'}});
            expect(settingsView.getSetting('locale')).toBe('en');
        });

        it('should return null if a setting does not exist', async () => {
            await setWebUiConf({settings: {locale: 'en'}});
            expect(settingsView.getSetting('notExist')).toBeNull();
        });

        it('should return the default value of 5 if replayInterval is not set', async () => {
            await setWebUiConf({settings: {}});
            expect(settingsView.getSetting('replayInterval')).toBe(5);
        });
    });

    describe('saveSettings', () => {
        let settingsView: SettingsView;
        let settingsServerMock: SettingsServerMock;

        beforeEach(async () => {
            await setWebUiConf({settings: {}});
            settingsServerMock = new SettingsServerMock();
            settingsServerMock.setResponseForPatchUserSettings(new ServerResponse(null, ServerResponseStatus.OK, null));
            SettingsService.setSettingsServer(settingsServerMock);
            settingsView = new SettingsView();
            settingsView.setSetting('remoteLoggingEnabled', true);
            settingsView.setSetting('replayInterval', 10);
            settingsView.setSetting('locale', 'en');
        });

        it('should save settings in the local configuration when saveSettings is called', async () => {
            await settingsView.saveSettings();
            expect(ConfigService.getConfigValue('settings.remoteLoggingEnabled')).toBe(true);
            expect(ConfigService.getConfigValue('settings.replayInterval')).toBe(10);
            expect(ConfigService.getConfigValue('settings.locale')).toBe('en');
        });

        it('should save settings in the back end when saveSettings is called', async () => {
            const serverResponse = await settingsView.saveSettings();
            expect(serverResponse.status).toBe(ServerResponseStatus.OK);
            expect(settingsServerMock.settingsPatch).toEqual({
                remoteLoggingEnabled: true,
                replayInterval: 10,
                locale: 'en'
            });
        });

        it('should not save settings in the back end again if no settings have been modified', async () => {
            await settingsView.saveSettings();
            settingsView.saveSettings();
            settingsView.saveSettings();
            expect(settingsServerMock.numberOfCallsToPatchUserSettings).toBe(1);
        });

        it('should send an alert message if setting saving fails', async () => {
            settingsServerMock.setResponseForPatchUserSettings(
                new ServerResponse(null, ServerResponseStatus.UNKNOWN_ERROR, null)
            );
            const alertSubject = new ReplaySubject<Message>();
            AlertMessageService.getAlertMessage().subscribe((Message) => {
                alertSubject.next(Message);
            });

            await settingsView.saveSettings();
            const message = await firstValueFrom(alertSubject.asObservable());
            expect(message.i18n.key).toEqual('shared.error.impossibleToSaveSettings');
            expect(message.level).toEqual(MessageLevel.ERROR);
        });

        it('should not save settings in the local configuration when save setting to the back fails', async () => {
            settingsServerMock.setResponseForPatchUserSettings(
                new ServerResponse(null, ServerResponseStatus.UNKNOWN_ERROR, null)
            );
            await settingsView.saveSettings();
            expect(ConfigService.getConfigValue('settings.remoteLoggingEnabled')).toBeNull();
            expect(ConfigService.getConfigValue('settings.replayInterval')).toBeNull();
            expect(ConfigService.getConfigValue('settings.locale')).toBeNull();
        });
    });

    describe('doesSettingsNeedToBeSaved', () => {
        let settingsView: SettingsView;

        beforeEach(async () => {
            await setWebUiConf({settings: {}});
            settingsView = new SettingsView();
        });

        it('should return false if no settings have been modified', () => {
            expect(settingsView.doesSettingsNeedToBeSaved()).toBe(false);
        });

        it('should return true if settings have been modified', () => {
            settingsView.setSetting('remoteLoggingEnabled', true);
            expect(settingsView.doesSettingsNeedToBeSaved()).toBe(true);
        });

        it('should return false is settings have been modified and then saved', async () => {
            const settingsServerMock = new SettingsServerMock();
            settingsServerMock.setResponseForPatchUserSettings(new ServerResponse(null, ServerResponseStatus.OK, null));
            SettingsService.setSettingsServer(settingsServerMock);
            settingsView.setSetting('remoteLoggingEnabled', true);
            await settingsView.saveSettings();
            expect(settingsView.doesSettingsNeedToBeSaved()).toBe(false);
        });

        it('should return false is setting value has been set with existing value', async () => {
            await setWebUiConf({settings: {remoteLoggingEnabled: true}});
            settingsView.setSetting('remoteLoggingEnabled', true);
            expect(settingsView.doesSettingsNeedToBeSaved()).toBe(false);
        });

        it('should return false if setting value has been set with different value and set again to existing value', async () => {
            await setWebUiConf({settings: {remoteLoggingEnabled: true}});
            settingsView.setSetting('remoteLoggingEnabled', false);
            settingsView.setSetting('remoteLoggingEnabled', true);
            expect(settingsView.doesSettingsNeedToBeSaved()).toBe(false);
        });
    });
});
