
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SettingsRoutingModule} from "./settings-routing.module";
import {SettingsComponent} from './components/settings/settings.component';
import {BaseSettingComponent} from './components/settings/base-setting/base-setting.component';
import {TextSettingComponent} from './components/settings/text-setting/text-setting.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";
import {EmailSettingComponent} from './components/settings/email-setting/email-setting.component';
import {ListSettingComponent} from "./components/settings/list-setting/list-setting.component";
import {MultiSettingsComponent} from './components/settings/multi-settings/multi-settings.component';
import {TypeAheadSettingsComponent} from './components/settings/type-ahead-settings/type-ahead-settings.component';
import {TypeaheadModule} from "ngx-type-ahead";

@NgModule({
    declarations: [SettingsComponent, BaseSettingComponent, TextSettingComponent, EmailSettingComponent, ListSettingComponent, MultiSettingsComponent, TypeAheadSettingsComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TypeaheadModule,
        SettingsRoutingModule,
        TranslateModule,
    ]
})
export class SettingsModule {
}
