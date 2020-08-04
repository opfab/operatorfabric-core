import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SingleFilterComponent} from './single-filter.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';


@NgModule({
    declarations: [SingleFilterComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule,
        NgbModule
    ],
    exports: [SingleFilterComponent]
})
export class SingleFilterModule { }
