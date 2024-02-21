/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * Copyright (c) 2023, Alliander (http://www.alliander.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnInit} from '@angular/core';
import {ConfigService} from 'app/business/services/config.service';
import {ExternalDevicesService} from 'app/business/services/notifications/external-devices.service';
import {UserService} from 'app/business/services/users/user.service';
import {UserConfiguration} from '@ofModel/external-devices.model';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'of-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
    locales: string[];
    hiddenSettings: string[];
    externalDevicesEnabled: boolean;
    playSoundForAlarmDefaultValue: boolean;
    playSoundForActionDefaultValue: boolean;
    playSoundForCompliantDefaultValue: boolean;
    playSoundForInformationDefaultValue: boolean;
    replayEnabledDefaultValue: boolean;
    replayIntervalDefaultValue: number;
    remoteLoggingEnabledDefaultValue: boolean;
    systemNotificationAlarmDefaultValue: boolean;
    systemNotificationActionDefaultValue: boolean;
    systemNotificationCompliantDefaultValue: boolean;
    systemNotificationInformationDefaultValue: boolean;
    sendCardsByEmailDefaultValue: boolean;
    emailToPlainTextDefaultValue: boolean;
    sendDailyEmailDefaultValue: boolean;

    userConfiguration: UserConfiguration;

    patternReplayInterval = '[0-9]*';

    constructor(private translateService: TranslateService) {}

    ngOnInit() {
        this.locales = this.translateService.getLangs();
        this.hiddenSettings = ConfigService.getConfigValue('settingsScreen.hiddenSettings');
        this.externalDevicesEnabled = ConfigService.getConfigValue('externalDevicesEnabled');
        this.playSoundForAlarmDefaultValue = ConfigService.getConfigValue('settings.playSoundForAlarm')
            ? ConfigService.getConfigValue('settings.playSoundForAlarm')
            : false;
        this.playSoundForActionDefaultValue = ConfigService.getConfigValue('settings.playSoundForAction')
            ? ConfigService.getConfigValue('settings.playSoundForAction')
            : false;
        this.playSoundForCompliantDefaultValue = ConfigService.getConfigValue('settings.playSoundForCompliant')
            ? ConfigService.getConfigValue('settings.playSoundForCompliant')
            : false;
        this.playSoundForInformationDefaultValue = ConfigService.getConfigValue('settings.playSoundForInformation')
            ? ConfigService.getConfigValue('settings.playSoundForInformation')
            : false;
        this.replayEnabledDefaultValue = ConfigService.getConfigValue('settings.replayEnabled')
            ? ConfigService.getConfigValue('settings.replayEnabled')
            : false;
        this.replayIntervalDefaultValue = ConfigService.getConfigValue('settings.replayInterval')
            ? ConfigService.getConfigValue('settings.replayInterval')
            : 5;
        this.remoteLoggingEnabledDefaultValue = ConfigService.getConfigValue('settings.remoteLoggingEnabled')
            ? ConfigService.getConfigValue('settings.remoteLoggingEnabled')
            : false;
        this.systemNotificationAlarmDefaultValue = ConfigService.getConfigValue('settings.systemNotificationAlarm')
            ? ConfigService.getConfigValue('settings.systemNotificationAlarm')
            : false;
        this.systemNotificationActionDefaultValue = ConfigService.getConfigValue('settings.systemNotificationAction')
            ? ConfigService.getConfigValue('settings.systemNotificationAction')
            : false;
        this.systemNotificationCompliantDefaultValue = ConfigService.getConfigValue(
            'settings.systemNotificationCompliant'
        )
            ? ConfigService.getConfigValue('settings.systemNotificationCompliant')
            : false;
        this.systemNotificationInformationDefaultValue = ConfigService.getConfigValue(
            'settings.systemNotificationInformation'
        )
            ? ConfigService.getConfigValue('settings.systemNotificationInformation')
            : false;
        this.sendCardsByEmailDefaultValue = ConfigService.getConfigValue('settings.sendCardsByEmail')
            ? ConfigService.getConfigValue('settings.sendCardsByEmail')
            : false;
        this.emailToPlainTextDefaultValue = ConfigService.getConfigValue('settings.emailToPlainText')
            ? ConfigService.getConfigValue('settings.emailToPlainText')
            : false;
        this.sendDailyEmailDefaultValue = ConfigService.getConfigValue('settings.sendDailyEmail')
            ? ConfigService.getConfigValue('settings.sendDailyEmail')
            : false;
        const userLogin = UserService.getCurrentUserWithPerimeters().userData.login;

        if (this.externalDevicesEnabled)
            ExternalDevicesService.fetchUserConfiguration(userLogin).subscribe((result) => {
                this.userConfiguration = result;
            });
    }

    isExternalDeviceConfiguredForUser(): boolean {
        return this.userConfiguration?.externalDeviceIds?.length > 0;
    }
}
