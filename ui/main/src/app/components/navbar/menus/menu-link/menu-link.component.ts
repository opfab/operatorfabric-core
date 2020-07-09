/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Component, Input, OnInit} from '@angular/core';
import {Menu, MenuEntry} from "@ofModel/processes.model";
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import { ConfigService} from "@ofServices/config.service";

@Component({
  selector: 'of-menu-link',
  templateUrl: './menu-link.component.html',
  styleUrls: ['./menu-link.component.scss']
})
export class MenuLinkComponent implements OnInit {

  @Input() public menu: Menu;
  @Input() public menuEntry: MenuEntry;
  menusOpenInTabs: boolean;
  menusOpenInIframes: boolean;
  menusOpenInBoth: boolean;

  constructor(private store: Store<AppState>,private  configService: ConfigService) {
  }

  ngOnInit() {
    const menuconfig = this.configService.getConfigValue('navbar.businessmenus.type', 'BOTH');

    if (menuconfig == 'TAB') {
      this.menusOpenInTabs = true;
    } else if (menuconfig == 'IFRAME') {
      this.menusOpenInIframes = true;
    } else {
      if (menuconfig != 'BOTH') {
        console.log("MenuLinkComponent - Property navbar.businessconfigmenus.type has an unexpected value: " + menuconfig + ". Default (BOTH) will be applied.")
      }
      this.menusOpenInBoth = true;
    }

  }
}


