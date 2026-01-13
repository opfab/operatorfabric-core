/* Copyright (c) 2024-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
import {UserConfiguration} from '@ofServices/notifications/model/ExternalDevices';
import {I18n} from 'app/model/I18n';
import {Message, MessageLevel} from '@ofServices/alerteMessage/model/Message';
import {ServerResponse, ServerResponseStatus} from 'app/server/ServerResponse';
import {AlertMessageService} from '@ofServices/alerteMessage/AlertMessageService';
import {ConfigService} from 'app/services/config/ConfigService';
import {ExternalDevicesService} from '@ofServices/notifications/ExternalDevicesService';
import {UserSettingsService} from '@ofServices/userSettings/UserSettingsService';
import {UsersService} from '@ofServices/users/UsersService';
import {firstValueFrom} from 'rxjs';
import {LoggerService} from '@ofServices/logs/LoggerService';
import * as _ from 'lodash-es';
import {User} from '@ofServices/users/model/User';

type SettingValue = string | boolean | number;

export class SettingsView {
    private newSettings: any = {};
    private readonly user: User;
    private userSettings: any = {};

    public constructor(user: User) {
        this.user = user;
    }

    public async loadUserSettings(): Promise<void> {
        if (this.user) {
            try {
                this.userSettings = (await firstValueFrom(UserSettingsService.getUserSettings(this.user.login))).data;
            } catch (error) {
                LoggerService.error('Error loading user settings for user ' + this.user.login, error);
            }
        }
    }

    public isSettingVisible(setting: string): boolean {
        return !ConfigService.getConfigValue('settingsScreen.hiddenSettings', []).includes(setting);
    }

    public isEmailFromUserInsteadOfSettings(): boolean {
        return ConfigService.getConfigValue('settings.getEmailFromUserInsteadOfSettings', false);
    }

    public getSetting(setting: string): SettingValue {
        if (this.user) {
            return this.getSettingsForUser(setting);
        } else {
            return this.getSettingsForCurrentUser(setting);
        }
    }

    private getSettingsForUser(setting: any): SettingValue {
        const userSettingsValue = _.get(this.userSettings, setting, undefined);
        if (userSettingsValue === undefined) {
            switch (setting) {
                case 'replayInterval':
                    return ConfigService.getConfigValueWithNoUserSettingsOverride('settings.replayInterval', 5);
                case 'timezoneForEmails':
                    return ConfigService.getConfigValueWithNoUserSettingsOverride(
                        'settings.timezoneForEmails',
                        'Europe/Paris'
                    );
                case 'email':
                    if (this.isEmailFromUserInsteadOfSettings()) {
                        return this.user.email;
                    }
                    break;
                default:
                    return ConfigService.getConfigValueWithNoUserSettingsOverride('settings.' + setting);
            }
        }
        return userSettingsValue;
    }

    private getSettingsForCurrentUser(setting: string): SettingValue {
        switch (setting) {
            case 'replayInterval':
                return ConfigService.getConfigValue('settings.replayInterval', 5);

            case 'timezoneForEmails':
                return ConfigService.getConfigValue('settings.timezoneForEmails', 'Europe/Paris');

            case 'email':
                if (this.isEmailFromUserInsteadOfSettings()) {
                    return UsersService.getCurrentUserWithPerimeters().emailForCardSending;
                } else {
                    return ConfigService.getConfigValue('settings.' + setting);
                }
            default:
                return ConfigService.getConfigValue('settings.' + setting);
        }
    }

    public async isExternalDeviceSettingVisible(): Promise<boolean> {
        const userLogin = this.user?.login ?? UsersService.getCurrentUserWithPerimeters().userData.login;
        const userConfiguration: UserConfiguration = await firstValueFrom(
            ExternalDevicesService.fetchUserConfiguration(userLogin)
        );
        if (userConfiguration?.externalDeviceIds?.length > 0) return true;
        return false;
    }

    public setSetting(setting: string, value: SettingValue): void {
        const currentValue = this.getSetting(setting);
        if (currentValue !== value) {
            this.newSettings[setting] = value;
        } else if (setting in this.newSettings) {
            delete this.newSettings[setting];
        }
    }

    private areEmailCheckboxesTicked(): boolean {
        const emailToPlainText: boolean = Boolean(
            this.newSettings?.emailToPlainText ?? this.getSetting('emailToPlainText')
        );
        const sendDailyEmail: boolean = Boolean(this.newSettings?.sendDailyEmail ?? this.getSetting('sendDailyEmail'));
        const sendWeeklyEmail: boolean = Boolean(
            this.newSettings?.sendWeeklyEmail ?? this.getSetting('sendWeeklyEmail')
        );
        const sendCardsByEmail: boolean = Boolean(
            this.newSettings?.sendCardsByEmail ?? this.getSetting('sendCardsByEmail')
        );

        return emailToPlainText || sendDailyEmail || sendWeeklyEmail || sendCardsByEmail;
    }

    private isEmailFilled(): boolean {
        return Boolean(this.newSettings?.email ?? this.getSetting('email'));
    }

    public areEmailAndEmailCheckboxesCoherent(): boolean {
        if (this.areEmailCheckboxesTicked()) {
            if (!this.isEmailFilled()) {
                return false;
            }
        }
        return true;
    }

    private isReplayIntervalInvalid(): boolean {
        return this.newSettings?.replayInterval == null || Number.isNaN(Number(this.newSettings?.replayInterval));
    }

    public async saveSettings(): Promise<ServerResponse<any>> {
        if (!this.doesSettingsNeedToBeSaved()) {
            return new ServerResponse(null, ServerResponseStatus.OK, null);
        }

        if (this.isReplayIntervalInvalid()) {
            this.newSettings.replayInterval = ConfigService.getConfigValue('settings.replayInterval', 5);
        }

        let serverResponse: ServerResponse<any>;
        try {
            if (this.user) {
                serverResponse = await firstValueFrom(
                    UserSettingsService.patchUserSettings(this.user.login, this.newSettings)
                );
            } else {
                serverResponse = await firstValueFrom(UserSettingsService.patchCurrentUserSettings(this.newSettings));
            }
        } catch (error) {
            LoggerService.error('Error saving settings' + error.toString());
            AlertMessageService.sendAlertMessage(
                new Message(null, MessageLevel.ERROR, new I18n('shared.error.impossibleToSaveSettings'))
            );
            return new ServerResponse(null, ServerResponseStatus.UNKNOWN_ERROR, null);
        }

        if (serverResponse.status === ServerResponseStatus.OK) {
            this.updateAfterSuccessfulSave();
        } else {
            AlertMessageService.sendAlertMessage(
                new Message(null, MessageLevel.ERROR, new I18n('shared.error.impossibleToSaveSettings'))
            );
        }
        return serverResponse;
    }

    private updateAfterSuccessfulSave() {
        if (!this.user || this.user.login === UsersService.getCurrentUserWithPerimeters().userData.login) {
            // modify new user settings in memory
            Object.entries(this.newSettings).forEach(([setting, value]) => {
                ConfigService.setConfigValue('settings.' + setting, value);
            });
        }

        this.newSettings = {};
    }

    public doesSettingsNeedToBeSaved(): boolean {
        return Object.keys(this.newSettings).length > 0;
    }
}
