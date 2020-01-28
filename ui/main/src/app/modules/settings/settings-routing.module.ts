
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {SettingsComponent} from "./components/settings/settings.component";

const routes: Routes = [
    {
        path: '',
        component: SettingsComponent,
        // canActivate: [AuthenticationGuard],
    },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SettingsRoutingModule { }
