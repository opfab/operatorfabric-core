/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {ConfigService} from '@ofServices/config.service';
import {ExternalDevicesService} from "@ofServices/external-devices.service";
import {UserService} from "@ofServices/user.service";
import {UserConfiguration} from "@ofModel/external-devices.model";

@Component({
  selector: 'of-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  locales: string[];
  displayInfo: SettingsInputs;
  externalDevicesEnabled: boolean;
  playSoundForAlarmDefaultValue: boolean;
  playSoundForActionDefaultValue: boolean;
  playSoundForCompliantDefaultValue: boolean;
  playSoundForInformationDefaultValue: boolean;
  replayEnabledDefaultValue: boolean;
  replayIntervalDefaultValue: number;
  remoteLoggingEnabledDefaultValue: boolean;

  userConfiguration: UserConfiguration;

  constructor(private store: Store<AppState>,
              private configService: ConfigService,
              private userService: UserService,
              private externalDevicesService: ExternalDevicesService) { }

  ngOnInit() {
    this.locales = this.configService.getConfigValue('i18n.supported.locales');
    this.displayInfo = this.configService.getConfigValue('settings.infos.hide');
    this.externalDevicesEnabled = this.configService.getConfigValue('externalDevicesEnabled');
    this.playSoundForAlarmDefaultValue = !!this.configService.getConfigValue('settings.playSoundForAlarm') ? this.configService.getConfigValue('settings.playSoundForAlarm') : false;
    this.playSoundForActionDefaultValue = !!this.configService.getConfigValue('settings.playSoundForAction') ? this.configService.getConfigValue('settings.playSoundForAction') : false;
    this.playSoundForCompliantDefaultValue = !!this.configService.getConfigValue('settings.playSoundForCompliant') ? this.configService.getConfigValue('settings.playSoundForCompliant') : false;
    this.playSoundForInformationDefaultValue = !!this.configService.getConfigValue('settings.playSoundForInformation') ? this.configService.getConfigValue('settings.playSoundForInformation') : false;
    this.replayEnabledDefaultValue = !!this.configService.getConfigValue('settings.replayEnabled') ? this.configService.getConfigValue('settings.replayEnabled') : false;
    this.replayIntervalDefaultValue = !!this.configService.getConfigValue('settings.replayInterval') ? this.configService.getConfigValue('settings.replayInterval') : 5;
    this.remoteLoggingEnabledDefaultValue = !!this.configService.getConfigValue('settings.remoteLoggingEnabled') ? this.configService.getConfigValue('settings.remoteLoggingEnabled') : false;

    const userLogin = this.userService.getCurrentUserWithPerimeters().userData.login;

    if (this.externalDevicesEnabled)
      this.externalDevicesService.fetchUserConfiguration(userLogin).subscribe(result => {
        this.userConfiguration = result;
      });
  }

  isExternalDeviceConfiguredForUser(): boolean {
    return (!!this.userConfiguration && !!this.userConfiguration.externalDeviceId);
  }

}

interface SettingsInputs {
  description: boolean;
  language: boolean;
  sounds: boolean;
  remoteLoggingEnabled: boolean;
}
