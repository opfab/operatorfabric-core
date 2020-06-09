import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MultiFilterComponent} from './multi-filter.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';



@NgModule({
  declarations: [MultiFilterComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    NgbModule
  ],
  exports: [MultiFilterComponent]
})
export class MultiFilterModule { }
