
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalcHeightDirective } from "./calc-height.directive";
import { ResizableComponent } from './components/resizable/resizable.component';
//TODO Find out where directive would be best put

@NgModule({
  declarations: [CalcHeightDirective, ResizableComponent],
  imports: [
    CommonModule
  ],
  exports: [
      CalcHeightDirective, ResizableComponent
  ]
})
export class UtilitiesModule { }
