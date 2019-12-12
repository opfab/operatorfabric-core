/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, Input, OnInit} from '@angular/core';
import {PlatformLocation} from "@angular/common";

@Component({
  selector: 'of-icon',
  templateUrl:'icon.component.html',
  styleUrls: ['icon.component.scss']
})
export class IconComponent implements OnInit {

  @Input() icon:string;
  @Input() sizeIcon:string;
  @Input() bright:string;

  size:string;
  sprites:string;
  iconPath:string;

  constructor(platformLocation: PlatformLocation) {
      let baseHref = platformLocation.getBaseHrefFromDOM();
      this.iconPath = (baseHref?baseHref:'/')+'assets/images/icons/'
  }

  ngOnInit() {
    this.setSize();
    this.setSprintes();
  }

  private setSize() {
    switch (this.sizeIcon) {
      case 'big':
        this.size = '64px';
        break;
      case 'medium':
        this.size = '32px';
        break;
      case 'small':
        this.size = '16px';
        break;
      default:
        this.size = '32px'  
    }   
  }

  private setSprintes() {
    if (this.bright == 'dark' || this.bright == 'light') {
      this.sprites='sprites-mono.svg'
    } else {
      this.bright = undefined; // wrong value setted by the user
      this.sprites='sprites.svg'
    }
  }
  
}
