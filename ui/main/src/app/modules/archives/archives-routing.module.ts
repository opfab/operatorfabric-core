

import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
// import {AuthenticationGuard} from "@ofServices/guard.service";
import {ArchivesComponent} from "./archives.component";
import {CardDetailsComponent} from "../cards/components/card-details/card-details.component";
import {DetailComponent} from "../cards/components/detail/detail.component";

const routes: Routes = [
    {
        path: '',
        component: ArchivesComponent,
        // canActivate: [AuthenticationGuard]
        children: [
            // {
            //     path: '',
            //     pathMatch: 'full',
            //     redirectTo: 'cards'
            // },
            {
                path: 'cards',
                children : [
                    {
                        path: '',
                        component: CardDetailsComponent,
                    },
                    {
                        path: ':cid',
                        component: CardDetailsComponent,
                        children: [
                            {
                                path: 'details/:did',
                                component: DetailComponent
                            }
                        ]
                    }]
            },
        ]
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArchivesRoutingModule { }
