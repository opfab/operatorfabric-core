/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from "@angular/core";
import {Action, Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {Actions, Effect, ofType} from "@ngrx/effects";
import {CardService} from "@ofServices/card.service";
import {Observable} from "rxjs";
import {ROUTER_NAVIGATION, RouterNavigationAction} from "@ngrx/router-store";
import {filter, switchMap} from "rxjs/operators";
import {LoadCard} from "@ofActions/card.actions";
import {SelectLightCard} from "@ofActions/light-card.actions";
import {UpdateSelectedMenu} from "@ofActions/menu.actions";

@Injectable()
export class CustomRouterEffects {
    /* istanbul ignore next */
    constructor(private store: Store<AppState>,
                private actions$: Actions,
                private service: CardService
    ) {}

    @Effect()
    navigateToCard: Observable<Action> = this.actions$.pipe(
        ofType(ROUTER_NAVIGATION),
        filter((action: RouterNavigationAction, index)=> {
            return action.payload.event.url.indexOf("/feed/cards/")>=0;
        }),
        switchMap(action=>{
            const routerState:any = action.payload.routerState;
            return [
                new LoadCard({id: routerState.params['cid']}),
                new SelectLightCard({selectedCardId: routerState.params['cid']})
            ];
        })
    );

    @Effect()
    navigateToMenuURL: Observable<Action> = this.actions$.pipe(
        ofType(ROUTER_NAVIGATION),
        filter((action: RouterNavigationAction, index)=> {
            return action.payload.event.url.indexOf("/thirdparty/")>=0;
        }),
        switchMap(action=>{
            const routerState:any = action.payload.routerState;
            return [
                new UpdateSelectedMenu({menu_id: routerState.params['menu_id'],menu_entry_id: routerState.params['menu_entry_id']})
            ];
        })
    );
}
