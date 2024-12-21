/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
import {UserConfiguration} from '@ofServices/notifications/model/ExternalDevices';
import {I18n} from '@ofModel/i18n.model';
import {Message, MessageLevel} from '@ofServices/alerteMessage/model/Message';
import {ServerResponse, ServerResponseStatus} from 'app/business/server/serverResponse';
import {AlertMessageService} from '@ofServices/alerteMessage/AlertMessageService';
import {ConfigService} from 'app/services/config/ConfigService';
import {ExternalDevicesService} from '@ofServices/notifications/ExternalDevicesService';
import {UserSettingsService} from '@ofServices/userSettings/UserSettingsService';
import {UsersService} from '@ofServices/users/UsersService';
import {firstValueFrom} from 'rxjs';

export class SettingsView {
    private newSettings: any = {};

    public isSettingVisible(setting: string): boolean {
        return !ConfigService.getConfigValue('settingsScreen.hiddenSettings', []).includes(setting);
    }

    public getSetting(setting: string): string | boolean | number {
        switch (setting) {
            case 'replayInterval':
                return ConfigService.getConfigValue('settings.replayInterval', 5);

            case 'timezoneForEmails':
                return ConfigService.getConfigValue('settings.timezoneForEmails', 'Europe/Paris');

            default:
                return ConfigService.getConfigValue('settings.' + setting);
        }
    }

    public async isExternalDeviceSettingVisible(): Promise<boolean> {
        const userLogin = UsersService.getCurrentUserWithPerimeters().userData.login;
        const userConfiguration: UserConfiguration = await firstValueFrom(
            ExternalDevicesService.fetchUserConfiguration(userLogin)
        );
        if (userConfiguration?.externalDeviceIds?.length > 0) return true;
        return false;
    }

    public setSetting(setting: string, value: string | boolean | number): void {
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

    public isEmailAndEmailCheckboxesCoherent(): boolean {
        if (this.areEmailCheckboxesTicked()) {
            if (!this.isEmailFilled()) {
                return false;
            }
        }
        return true;
    }

    private isReplayIntervalInvalid(): boolean {
        return this.newSettings?.replayInterval == null || isNaN(this.newSettings?.replayInterval);
    }

    public async saveSettings(): Promise<ServerResponse<any>> {
        if (this.doesSettingsNeedToBeSaved()) {
            if (this.isReplayIntervalInvalid()) {
                this.newSettings.replayInterval = ConfigService.getConfigValue('settings.replayInterval', 5);
            }

            const serverResponse = await firstValueFrom(UserSettingsService.patchUserSettings(this.newSettings));
            if (serverResponse.status === ServerResponseStatus.OK) {
                for (const setting in this.newSettings) {
                    if (this.newSettings.hasOwnProperty(setting)) {
                        ConfigService.setConfigValue('settings.' + setting, this.newSettings[setting]);
                    }
                }

                this.newSettings = {};
            } else
                AlertMessageService.sendAlertMessage(
                    new Message(null, MessageLevel.ERROR, new I18n('shared.error.impossibleToSaveSettings'))
                );
            return serverResponse;
        }
        return new ServerResponse(null, ServerResponseStatus.OK, null);
    }

    public doesSettingsNeedToBeSaved(): boolean {
        return Object.keys(this.newSettings).length > 0;
    }
}
