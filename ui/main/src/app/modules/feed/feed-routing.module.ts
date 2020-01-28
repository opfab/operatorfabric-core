
import {NgModule} from '@angular/core';
import {FeedComponent} from "./feed.component";
// import {AuthenticationGuard} from "@ofServices/guard.service";
import {RouterModule, Routes} from "@angular/router";
import {DetailComponent} from "../cards/components/detail/detail.component";
import {CardDetailsComponent} from "../cards/components/card-details/card-details.component";

const routes: Routes = [
    {
        path: '',
        component: FeedComponent,
        // canActivate: [AuthenticationGuard],
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
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FeedRoutingModule { }
