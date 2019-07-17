import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalcHeightDirective } from "./calc-height.directive";
//TODO Find out where directive would be best put

@NgModule({
  declarations: [CalcHeightDirective],
  imports: [
    CommonModule
  ],
  exports: [
      CalcHeightDirective
  ]
})
export class UtilitiesModule { }
