/* Copyright (c) 2024-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ServerResponse, ServerResponseStatus} from 'app/server/ServerResponse';
import {ConfigService} from 'app/services/config/ConfigService';
import {ReplaySubject, firstValueFrom} from 'rxjs';
import {SettingsView} from './SettingsView';
import {ExternalDevicesServerMock} from '@tests/mocks/externalDevicesServer.mock';
import {UserWithPerimeters} from '@ofServices/users/model/UserWithPerimeters';
import {User} from '@ofServices/users/model/User';
import {ExternalDevicesService} from '@ofServices/notifications/ExternalDevicesService';
import {UserSettingsServerMock} from '@tests/mocks/UserSettingsServer.mock';
import {UserSettingsService} from '@ofServices/userSettings/UserSettingsService';
import {AlertMessageService} from '@ofServices/alerteMessage/AlertMessageService';
import {Message, MessageLevel} from '@ofServices/alerteMessage/model/Message';
import {loadWebUIConf, setUserPerimeter} from '@tests/helpers';

async function setUserConf() {
    const userWithPerimeters = new UserWithPerimeters(
        new User('user', '', '', '', [], [], 'userEmail@mail.com'),
        new Array(),
        null,
        new Map(),
        new Map(),
        false,
        false,
        false,
        false,
        'userWithPerimeterEmail@mail.com'
    );
    await setUserPerimeter(userWithPerimeters);
}

describe('Settings view ', () => {
    describe('isSettingsVisible', () => {
        let settingsView: SettingsView;

        beforeEach(async () => {
            await loadWebUIConf({settingsScreen: {hiddenSettings: ['sendCardsByEmail']}});
            settingsView = new SettingsView(undefined);
        });

        it('should make a setting visible if it is not hidden in the web-ui configuration', () => {
            expect(settingsView.isSettingVisible('remoteLoggingEnabled')).toBe(true);
        });

        it('should hide a setting if it is hidden in the web-ui configuration', () => {
            expect(settingsView.isSettingVisible('sendCardsByEmail')).toBe(false);
        });

        describe('when user is current user', () => {
            it('should make externalDevicesEnabled visible if user is associated to an external device', async () => {
                const externalDevicesServerMock = new ExternalDevicesServerMock();
                externalDevicesServerMock.setResponseForFetchUserConfiguration(
                    new ServerResponse(
                        {userLogin: 'user', externalDeviceIds: ['device1']},
                        ServerResponseStatus.OK,
                        null
                    )
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

        describe('when user is not current user', () => {
            beforeEach(() => {
                const anotherUser = new User('anotherUser', '', '', '', [], [], '');
                settingsView = new SettingsView(anotherUser);
            });
            it('should make externalDevicesEnabled visible if user is associated to an external device', async () => {
                const externalDevicesServerMock = new ExternalDevicesServerMock();
                externalDevicesServerMock.setResponseForFetchUserConfiguration(
                    new ServerResponse(
                        {userLogin: 'anotherUser', externalDeviceIds: ['device1']},
                        ServerResponseStatus.OK,
                        null
                    )
                );
                ExternalDevicesService.setExternalDevicesServer(externalDevicesServerMock);
                await setUserConf();
                expect(await settingsView.isExternalDeviceSettingVisible()).toBe(true);
            });

            it('should hide externalDevicesEnabled if user is not associated to an external device', async () => {
                const externalDevicesServerMock = new ExternalDevicesServerMock();
                externalDevicesServerMock.setResponseForFetchUserConfiguration(
                    new ServerResponse({userLogin: 'anotherUser', externalDeviceIds: []}, ServerResponseStatus.OK, null)
                );
                ExternalDevicesService.setExternalDevicesServer(externalDevicesServerMock);
                await setUserConf();
                expect(await settingsView.isExternalDeviceSettingVisible()).toBe(false);
            });
        });
    });

    describe('getSetting', () => {
        let settingsView: SettingsView;

        describe('for current user', () => {
            beforeEach(() => {
                settingsView = new SettingsView(undefined);
            });
            it('should retrieve a boolean setting from the configuration service if it exists', async () => {
                await loadWebUIConf({settings: {remoteLoggingEnabled: true}});
                expect(settingsView.getSetting('remoteLoggingEnabled')).toBe(true);
            });

            it('should retrieve a number setting from the configuration service if it exists', async () => {
                await loadWebUIConf({settings: {replayInterval: 10}});
                expect(settingsView.getSetting('replayInterval')).toBe(10);
            });

            it('should retrieve a string setting from the configuration service if it exists', async () => {
                await loadWebUIConf({settings: {locale: 'en'}});
                expect(settingsView.getSetting('locale')).toBe('en');
            });

            it('should return null if a setting does not exist', async () => {
                await loadWebUIConf({settings: {locale: 'en'}});
                expect(settingsView.getSetting('notExist')).toBeNull();
            });

            it('should return the default value of 5 if replayInterval is not set', async () => {
                await loadWebUIConf({settings: {}});
                expect(settingsView.getSetting('replayInterval')).toBe(5);
            });
            it('should return the email from user if getEmailFromUserInsteadOfSettings is true', async () => {
                await setUserConf();
                await loadWebUIConf({
                    settings: {getEmailFromUserInsteadOfSettings: true, email: 'emailFromSettings@mail.com'}
                });
                expect(settingsView.getSetting('email')).toBe('userWithPerimeterEmail@mail.com');
            });
            it('should return email from settings if getEmailFromUserInsteadOfSettings is false', async () => {
                await setUserConf();
                await loadWebUIConf({
                    settings: {getEmailFromUserInsteadOfSettings: false, email: 'emailFromSettings@mail.com'}
                });
                expect(settingsView.getSetting('email')).toBe('emailFromSettings@mail.com');
            });
        });

        describe('for another user (admin mode)', () => {
            beforeEach(() => {
                const user1 = new User('user1', '', '', '', [], [], 'userEmail@mail.com');
                settingsView = new SettingsView(user1);
            });
            it('should retrieve settings from other user and not current user', async () => {
                await loadWebUIConf({settings: {replayInterval: 10}});
                // set current user settings to check they are not used
                ConfigService.overrideConfigSettingsWithUserSettings({replayInterval: 15});
                const settingsServerMock = new UserSettingsServerMock();
                settingsServerMock.setResponseForGetUserSettings(
                    new ServerResponse({replayInterval: 20}, ServerResponseStatus.OK, null)
                );
                UserSettingsService.setUserSettingsServer(settingsServerMock);
                await settingsView.loadUserSettings();
                expect(settingsView.getSetting('replayInterval')).toBe(20);
            });
            it('Should return default settings if user has no settings saved', async () => {
                await loadWebUIConf({settings: {remoteLoggingEnabled: false}});

                // set current user settings to check they are not used
                ConfigService.overrideConfigSettingsWithUserSettings({remoteLoggingEnabled: true});
                const settingsServerMock = new UserSettingsServerMock();
                settingsServerMock.setResponseForGetUserSettings(
                    new ServerResponse({}, ServerResponseStatus.NOT_FOUND, null)
                );
                UserSettingsService.setUserSettingsServer(settingsServerMock);
                await settingsView.loadUserSettings();
                expect(settingsView.getSetting('remoteLoggingEnabled')).toBe(false);
            });

            it('should return the default value of 5 if replayInterval is not set', async () => {
                await loadWebUIConf({settings: {}});
                // set current user settings to check they are not used
                ConfigService.overrideConfigSettingsWithUserSettings({replayInterval: 15});
                const settingsServerMock = new UserSettingsServerMock();
                settingsServerMock.setResponseForGetUserSettings(new ServerResponse({}, ServerResponseStatus.OK, null));
                UserSettingsService.setUserSettingsServer(settingsServerMock);
                await settingsView.loadUserSettings();
                expect(settingsView.getSetting('replayInterval')).toBe(5);
            });
            it('should return the email from user if getEmailFromUserInsteadOfSettings is true', async () => {
                await setUserConf();
                await loadWebUIConf({
                    settings: {getEmailFromUserInsteadOfSettings: true}
                });
                ConfigService.overrideConfigSettingsWithUserSettings({email: 'emailFromSettings@mail.com'});
                expect(settingsView.getSetting('email')).toBe('userEmail@mail.com');
            });
            it('should return email from settings if getEmailFromUserInsteadOfSettings is false', async () => {
                await setUserConf();
                await loadWebUIConf({
                    settings: {getEmailFromUserInsteadOfSettings: false}
                });
                ConfigService.overrideConfigSettingsWithUserSettings({
                    email: 'emailFromSettingsForCurrentUser@mail.com'
                });

                const settingsServerMock = new UserSettingsServerMock();
                settingsServerMock.setResponseForGetUserSettings(
                    new ServerResponse({email: 'emailFromUserSettings@mail.com'}, ServerResponseStatus.OK, null)
                );
                UserSettingsService.setUserSettingsServer(settingsServerMock);
                await settingsView.loadUserSettings();
                expect(settingsView.getSetting('email')).toBe('emailFromUserSettings@mail.com');
            });
            it('should return undefined for non existing mail setting if getEmailFromUserInsteadOfSettings is false ', async () => {
                await setUserConf();
                await loadWebUIConf({
                    settings: {getEmailFromUserInsteadOfSettings: false}
                });
                // This is done to check that email from other current user settings is not used
                ConfigService.overrideConfigSettingsWithUserSettings({
                    email: 'emailFromSettingsForCurrentUser@mail.com'
                });

                const settingsServerMock = new UserSettingsServerMock();
                settingsServerMock.setResponseForGetUserSettings(new ServerResponse({}, ServerResponseStatus.OK, null));
                UserSettingsService.setUserSettingsServer(settingsServerMock);
                await settingsView.loadUserSettings();
                expect(settingsView.getSetting('email')).toBeUndefined();
            });
        });
    });

    describe('saveSettings', () => {
        let settingsView: SettingsView;
        let settingsServerMock: UserSettingsServerMock;

        describe('for current user ', () => {
            beforeEach(async () => {
                await loadWebUIConf({settings: {}});
                settingsServerMock = new UserSettingsServerMock();
                settingsServerMock.setResponseForPatchUserSettings(
                    new ServerResponse(null, ServerResponseStatus.OK, null)
                );
                UserSettingsService.setUserSettingsServer(settingsServerMock);
                settingsView = new SettingsView(undefined);
                settingsView.setSetting('remoteLoggingEnabled', true);
                settingsView.setSetting('replayInterval', 10);
                settingsView.setSetting('locale', 'en');
                settingsView.setSetting('timezoneForEmails', 'Europe/Sofia');
            });
            it('should save settings in the local configuration when saveSettings is called', async () => {
                await settingsView.saveSettings();
                expect(ConfigService.getConfigValue('settings.remoteLoggingEnabled')).toBe(true);
                expect(ConfigService.getConfigValue('settings.replayInterval')).toBe(10);
                expect(ConfigService.getConfigValue('settings.locale')).toBe('en');
                expect(ConfigService.getConfigValue('settings.timezoneForEmails')).toBe('Europe/Sofia');
            });

            it(
                'should return the default value of 5 if replayInterval is set to a string value in the local configuration ' +
                    'when saveSettings is called',
                async () => {
                    settingsView.setSetting('replayInterval', 'aStringValue');
                    await settingsView.saveSettings();
                    expect(ConfigService.getConfigValue('settings.replayInterval')).toBe(5);
                }
            );

            it(
                'should return the default value of 5 if replayInterval is set to null in the local configuration ' +
                    'when saveSettings is called',
                async () => {
                    settingsView.setSetting('replayInterval', null);
                    await settingsView.saveSettings();
                    expect(ConfigService.getConfigValue('settings.replayInterval')).toBe(5);
                }
            );

            it(
                'should return the previous value set by the user (here, 28) if replayInterval is set to null in the local configuration ' +
                    'when saveSettings is called',
                async () => {
                    settingsView.setSetting('replayInterval', 28);
                    await settingsView.saveSettings();
                    expect(ConfigService.getConfigValue('settings.replayInterval')).toBe(28);

                    settingsView.setSetting('replayInterval', null);
                    await settingsView.saveSettings();
                    expect(ConfigService.getConfigValue('settings.replayInterval')).toBe(28);
                }
            );

            it('should save settings in the back end when saveSettings is called', async () => {
                const serverResponse = await settingsView.saveSettings();
                expect(serverResponse.status).toBe(ServerResponseStatus.OK);
                expect(settingsServerMock.settingsPatch).toEqual({
                    remoteLoggingEnabled: true,
                    replayInterval: 10,
                    locale: 'en',
                    timezoneForEmails: 'Europe/Sofia'
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
                expect(ConfigService.getConfigValue('settings.timezoneForEmails')).toBeNull();
            });
        });
        describe('for another user (admin mode)', () => {
            beforeEach(async () => {
                await loadWebUIConf({settings: {}});
                settingsServerMock = new UserSettingsServerMock();
                settingsServerMock.setResponseForPatchUserSettings(
                    new ServerResponse(null, ServerResponseStatus.OK, null)
                );
                UserSettingsService.setUserSettingsServer(settingsServerMock);
                const anotherUser = new User('anotherUser', '', '', '', [], [], '');
                settingsView = new SettingsView(anotherUser);
                settingsView.setSetting('remoteLoggingEnabled', true);
                settingsView.setSetting('replayInterval', 10);
                settingsView.setSetting('locale', 'en');
                settingsView.setSetting('timezoneForEmails', 'Europe/Sofia');
            });
            it('should not save settings in the local configuration when saveSettings is called', async () => {
                await settingsView.saveSettings();
                expect(ConfigService.getConfigValue('settings.remoteLoggingEnabled')).toBe(null);
                expect(ConfigService.getConfigValue('settings.timezoneForEmails')).toBe(null);
            });
            it('should save settings in the local configuration when saveSettings is called and user is current user', async () => {
                const sameUser = new User('user', '', '', '', [], [], '');
                settingsView = new SettingsView(sameUser);
                settingsView.setSetting('remoteLoggingEnabled', true);
                settingsView.setSetting('timezoneForEmails', 'Europe/Sofia');
                await settingsView.saveSettings();
                expect(ConfigService.getConfigValue('settings.remoteLoggingEnabled')).toBe(true);
                expect(ConfigService.getConfigValue('settings.timezoneForEmails')).toBe('Europe/Sofia');
            });

            it('should save settings of good user in the back end when saveSettings is called', async () => {
                const serverResponse = await settingsView.saveSettings();
                expect(serverResponse.status).toBe(ServerResponseStatus.OK);
                expect(settingsServerMock.settingsPatch).toEqual({
                    remoteLoggingEnabled: true,
                    replayInterval: 10,
                    locale: 'en',
                    timezoneForEmails: 'Europe/Sofia'
                });
                expect(settingsServerMock.userIdPatch).toBe('anotherUser');
            });

            it('should not save settings in the back end again if no settings have been modified', async () => {
                await settingsView.saveSettings();
                settingsView.saveSettings();
                settingsView.saveSettings();
                expect(settingsServerMock.numberOfCallsToPatchUserSettings).toBe(1);
            });
        });
    });

    describe('doesSettingsNeedToBeSaved', () => {
        let settingsView: SettingsView;

        beforeEach(async () => {
            await loadWebUIConf({settings: {}});
            settingsView = new SettingsView(undefined);
        });

        it('should return false if no settings have been modified', () => {
            expect(settingsView.doesSettingsNeedToBeSaved()).toBe(false);
        });

        it('should return true if settings have been modified', () => {
            settingsView.setSetting('remoteLoggingEnabled', true);
            expect(settingsView.doesSettingsNeedToBeSaved()).toBe(true);
        });

        it('should return false if settings have been modified and then saved', async () => {
            const settingsServerMock = new UserSettingsServerMock();
            settingsServerMock.setResponseForPatchUserSettings(new ServerResponse(null, ServerResponseStatus.OK, null));
            UserSettingsService.setUserSettingsServer(settingsServerMock);
            settingsView.setSetting('remoteLoggingEnabled', true);
            await settingsView.saveSettings();
            expect(settingsView.doesSettingsNeedToBeSaved()).toBe(false);
        });

        it('should return false is setting value has been set with existing value', async () => {
            await loadWebUIConf({settings: {remoteLoggingEnabled: true}});
            settingsView.setSetting('remoteLoggingEnabled', true);
            expect(settingsView.doesSettingsNeedToBeSaved()).toBe(false);
        });

        it('should return false if setting value has been set with different value and set again to existing value', async () => {
            await loadWebUIConf({settings: {remoteLoggingEnabled: true}});
            settingsView.setSetting('remoteLoggingEnabled', false);
            settingsView.setSetting('remoteLoggingEnabled', true);
            expect(settingsView.doesSettingsNeedToBeSaved()).toBe(false);
        });
    });
    describe('areEmailSettingsCoherent', () => {
        let settingsView: SettingsView;

        beforeEach(async () => {
            await loadWebUIConf({settings: {}});
            settingsView = new SettingsView(undefined);
        });

        it('should detect if one email checkbox is ticked and no email address is given', async () => {
            const alertSubject = new ReplaySubject<Message>();
            AlertMessageService.getAlertMessage().subscribe((Message) => {
                alertSubject.next(Message);
            });
            settingsView.setSetting('emailToPlainText', false);
            settingsView.setSetting('sendDailyEmail', false);
            settingsView.setSetting('sendCardsByEmail', true);
            settingsView.setSetting('email', null);

            const emailSettingsAreCoherent = settingsView.areEmailAndEmailCheckboxesCoherent();
            expect(emailSettingsAreCoherent).toBeFalse();
        });
    });
});
