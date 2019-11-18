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
  @Input() height:string;
  @Input() width:string;
  @Input() limitSize:boolean;

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

    this.setWitdhAndHeight();

    if(this.dark||this.light){
      this.sprites='sprites-mono.svg'
    }else{
      this.sprites='sprites.svg'
    }
  }

  private setWitdhAndHeight() {
    // define height and witdh from properties, if not defined, set default values defined by the size string (small/medium/big)
    if (this.height==undefined && this.width==undefined) {
      let sizeTemp = this.big?'big':this.medium?'medium':'small'
      switch (sizeTemp) {
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
      this.height = this.size;
      this.width = this.size;
    }

    // in case, we want to limit the icon size. By default, it is not limited.
    if (this.limitSize) {
      // max height equals to 32px
      let heightTemp = Number(this.height.replace('px',''));
      if (heightTemp > 32) 
        this.height = '32px';

      let witdhTemp = Number(this.width.replace('px',''));
        if (witdhTemp > 200) 
          this.width = '200px';
    }
    
  }

}
