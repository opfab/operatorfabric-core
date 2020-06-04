

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
    this.setSprites();
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

  private setSprites() {
    if (this.bright == 'dark' || this.bright == 'light') {
      this.sprites='sprites-mono.svg'
    } else {
      this.bright = undefined; // wrong value set by the user
      this.sprites='sprites.svg'
    }
  }
  
}
