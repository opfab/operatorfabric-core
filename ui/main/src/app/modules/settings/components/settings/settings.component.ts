/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
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

@Component({
  selector: 'of-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  locales: string[];
  timeZones: string[];
  displayInfo: SettingsInputs;
  externalDevicesEnabled: boolean;

  constructor(private store: Store<AppState>,private  configService: ConfigService) { }

  ngOnInit() {
    this.locales = this.configService.getConfigValue('i18n.supported.locales');
    this.timeZones = this.configService.getConfigValue('i10n.supported.time-zones');
    this.displayInfo = this.configService.getConfigValue('settings.infos.hide');
    this.externalDevicesEnabled = this.configService.getConfigValue('externalDevicesEnabled');
  }

}

interface SettingsInputs {
  description: boolean;
  language: boolean;
  timezone: boolean;
  sounds: boolean;
}
