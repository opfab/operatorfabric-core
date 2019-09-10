/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, Input, OnInit} from '@angular/core';
import {PlatformLocation} from "@angular/common";
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'of-icon',
  templateUrl:'icon.component.html',
  styleUrls: ['icon.component.scss']
})
export class IconComponent implements OnInit {

  @Input() icon:string;
  @Input() small:boolean;
  @Input() medium:boolean;
  @Input() big:boolean;
  @Input() dark:boolean;
  @Input() light:boolean;
  @Input() base64: string;
  size:string;
  sprites:string;
  iconPath:string;
  constructor(platformLocation: PlatformLocation, public _DomSanitizationService: DomSanitizer) {
      let baseHref = platformLocation.getBaseHrefFromDOM();
      this.iconPath = (baseHref?baseHref:'/')+'assets/images/icons/'
  }

  ngOnInit() {
    this.big = this.big != undefined;
    this.medium = this.medium != undefined && !this.big;
    this.small = this.small != undefined && !this.medium;
    this.dark = this.dark != undefined;
    this.light = this.light != undefined && ! this.dark;
    let size = this.big?'big':this.medium?'medium':'small'
    switch (size) {
        case 'big':
          this.size = '64px';
          break;
        case 'medium':
          this.size = '32px';
          break;
         default:
          this.size = '16px';
    }
    if(this.dark||this.light){
      this.sprites='sprites-mono.svg'
    }else{
      this.sprites='sprites.svg'
    }
  }

}
