
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IframeDisplayComponent} from './iframedisplay.component';
import {ThirdpartyRoutingModule} from "./thirdparty-routing.module";

@NgModule({
  declarations: [IframeDisplayComponent],
  imports: [
    CommonModule,
    ThirdpartyRoutingModule
  ]
})
export class ThirdpartyModule { }
