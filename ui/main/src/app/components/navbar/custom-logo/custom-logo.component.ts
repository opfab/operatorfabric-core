import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'of-custom-logo',
  templateUrl: './custom-logo.component.html',
  styleUrls: ['./custom-logo.component.css']
})
export class CustomLogoComponent implements OnInit {

  @Input() base64: string;

  @Input() limitSize: boolean;
  @Input() height: Number;
  @Input() width: Number;

  DEFAULT_HEIGHT: Number = 32;
  DEFAULT_WIDTH: Number = 150;

  MAX_HEIGHT: Number = 32;
  MAX_WIDTH: Number = 200;

  constructor(public _DomSanitizationService: DomSanitizer) { }

  ngOnInit() {
    // default value, Administrator has to change explicitly
    if (this.height == undefined)
      this.height = this.DEFAULT_HEIGHT;
    if (this.width == undefined)
      this.width = this.DEFAULT_WIDTH;
    if (this.limitSize == undefined)
      this.limitSize = true;   

    console.log("AVANT SETTAGE, les valeurs de height et de width et limitSize : ", this.height, this.width, this.limitSize);
    this.setHeightAndWidth();
    console.log("APRES SETTAGE, les valeurs de height et de width et limitSize : ", this.height, this.width, this.limitSize);
  }

  private setHeightAndWidth() {
    // in case, we want to limit the customLogo size. By default, it is limited.
    if (this.limitSize) {
      if (this.height > this.MAX_HEIGHT)
        this.height = this.MAX_HEIGHT;
      if (this.width > this.MAX_WIDTH)
        this.width = this.MAX_WIDTH;
    } else {
      console.log("limitsize à false");
    }
  }

}
