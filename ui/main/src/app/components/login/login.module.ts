import {NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {IdentificationService} from "@core/services/identification.service";
import {LoginComponent} from "./login.component";
import {MatButtonModule, MatFormFieldModule, MatGridListModule, MatIconModule, MatInputModule} from "@angular/material";
import {CommonModule} from "@angular/common";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

@NgModule({
    imports:[
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatGridListModule,
        MatFormFieldModule,
        MatInputModule,
        BrowserAnimationsModule,
        MatIconModule,
        MatButtonModule,

    ],
    providers: [IdentificationService],
    declarations: [LoginComponent],
    exports: [LoginComponent]})
export class LoginModule{}