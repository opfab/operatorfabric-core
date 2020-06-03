

import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {IframeDisplayComponent} from "./iframedisplay.component";

const routes: Routes = [
    {
        path: ':menu_id/:menu_version/:menu_entry_id',
        component: IframeDisplayComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ThirdpartyRoutingModule { }
