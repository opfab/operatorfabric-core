/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
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
import {ExternalDevicesService} from 'app/business/services/external-devices.service';
import {UserService} from 'app/business/services/user.service';
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

    userConfiguration: UserConfiguration;

    patternReplayInterval = '[0-9]*';

    constructor(
        private configService: ConfigService,
        private userService: UserService,
        private externalDevicesService: ExternalDevicesService,
        private translateService: TranslateService
    ) {}

    ngOnInit() {
        this.locales = this.translateService.getLangs();
        this.hiddenSettings = this.configService.getConfigValue('settingsScreen.hiddenSettings');
        this.externalDevicesEnabled = this.configService.getConfigValue('externalDevicesEnabled');
        this.playSoundForAlarmDefaultValue = this.configService.getConfigValue('settings.playSoundForAlarm')
            ? this.configService.getConfigValue('settings.playSoundForAlarm')
            : false;
        this.playSoundForActionDefaultValue = this.configService.getConfigValue('settings.playSoundForAction')
            ? this.configService.getConfigValue('settings.playSoundForAction')
            : false;
        this.playSoundForCompliantDefaultValue = this.configService.getConfigValue('settings.playSoundForCompliant')
            ? this.configService.getConfigValue('settings.playSoundForCompliant')
            : false;
        this.playSoundForInformationDefaultValue = this.configService.getConfigValue('settings.playSoundForInformation')
            ? this.configService.getConfigValue('settings.playSoundForInformation')
            : false;
        this.replayEnabledDefaultValue = this.configService.getConfigValue('settings.replayEnabled')
            ? this.configService.getConfigValue('settings.replayEnabled')
            : false;
        this.replayIntervalDefaultValue = this.configService.getConfigValue('settings.replayInterval')
            ? this.configService.getConfigValue('settings.replayInterval')
            : 5;
        this.remoteLoggingEnabledDefaultValue = this.configService.getConfigValue('settings.remoteLoggingEnabled')
            ? this.configService.getConfigValue('settings.remoteLoggingEnabled')
            : false;
        this.systemNotificationAlarmDefaultValue = this.configService.getConfigValue('settings.systemNotificationAlarm')
            ? this.configService.getConfigValue('settings.systemNotificationAlarm')
            : false;
        this.systemNotificationActionDefaultValue = this.configService.getConfigValue('settings.systemNotificationAction')
            ? this.configService.getConfigValue('settings.systemNotificationAction')
            : false;
        this.systemNotificationCompliantDefaultValue = this.configService.getConfigValue('settings.systemNotificationCompliant')
            ? this.configService.getConfigValue('settings.systemNotificationCompliant')
            : false;
        this.systemNotificationInformationDefaultValue = this.configService.getConfigValue('settings.systemNotificationInformation')
            ? this.configService.getConfigValue('settings.systemNotificationInformation')
            : false;
        this.sendCardsByEmailDefaultValue = this.configService.getConfigValue('settings.sendCardsByEmail')
            ? this.configService.getConfigValue('settings.sendCardsByEmail')
            : false;
        const userLogin = this.userService.getCurrentUserWithPerimeters().userData.login;

        if (this.externalDevicesEnabled)
            this.externalDevicesService.fetchUserConfiguration(userLogin).subscribe((result) => {
                this.userConfiguration = result;
            });
    }

    isExternalDeviceConfiguredForUser(): boolean {
        return  this.userConfiguration?.externalDeviceIds?.length > 0;
    }
}

