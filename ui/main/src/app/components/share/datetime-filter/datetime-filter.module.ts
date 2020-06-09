import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DatetimeFilterComponent} from './datetime-filter.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';


@NgModule({
    declarations: [DatetimeFilterComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule,
        NgbModule
    ],
    exports: [DatetimeFilterComponent]
})
export class DatetimeFilterModule {
}
