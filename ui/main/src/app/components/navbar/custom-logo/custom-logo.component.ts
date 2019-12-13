import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'of-custom-logo',
  templateUrl: './custom-logo.component.html',
  styleUrls: ['./custom-logo.component.css']
})
export class CustomLogoComponent implements OnInit {

  @Input() base64: string;

  @Input() limitSize: boolean;
  @Input() height: number;
  @Input() width: number;

  DEFAULT_HEIGHT: number;
  DEFAULT_WIDTH: number;

  MAX_HEIGHT: number;
  MAX_WIDTH: number;

  constructor(public domSanitizationService: DomSanitizer) { 
    this.DEFAULT_HEIGHT = 32;
    this.DEFAULT_WIDTH = 150;
  
    this.MAX_HEIGHT = 32;
    this.MAX_WIDTH = 200;
  }

  ngOnInit() {
    // default value, Administrator has to change explicitly
    if (this.base64 == undefined || this.base64 == '') {
      console.error("no custom-logo base64 configured, no picture loaded");
    }
    if (this.height == undefined)
      this.height = this.DEFAULT_HEIGHT;
    if (this.width == undefined)
      this.width = this.DEFAULT_WIDTH;
    if (this.limitSize == undefined)
      this.limitSize = true;   

    this.setHeightAndWidth();
  }

  private setHeightAndWidth() {
    // in case, we want to limit the customLogo size. By default, it is limited.
    if (this.limitSize) {
      if (this.height > this.MAX_HEIGHT)
        this.height = this.MAX_HEIGHT;
      if (this.width > this.MAX_WIDTH)
        this.width = this.MAX_WIDTH;
    } 
  }

  public getImage(): SafeUrl {
    return this.domSanitizationService.bypassSecurityTrustUrl(this.base64);
  }

}
