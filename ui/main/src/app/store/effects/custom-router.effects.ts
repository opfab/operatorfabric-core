/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {Injectable} from "@angular/core";
import {Action, Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {Actions, Effect, ofType} from "@ngrx/effects";
import {Observable} from "rxjs";
import {
    ROUTER_NAVIGATION,
    ROUTER_REQUEST,
    RouterNavigationAction,
    RouterRequestAction
} from "@ngrx/router-store";
import {filter, map, switchMap} from "rxjs/operators";
import {LoadCard} from "@ofActions/card.actions";
import {ClearLightCardSelection, SelectLightCard} from "@ofActions/light-card.actions";


@Injectable()
export class CustomRouterEffects {

    constructor(private store: Store<AppState>,
                private actions$: Actions
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
    navigateAwayFromFeed: Observable<Action> = this.actions$.pipe(
        ofType(ROUTER_REQUEST),
        filter((action: RouterRequestAction, index)=> {
            return (action.payload.routerState.url.indexOf("/feed/cards/")>=0) && (action.payload.event.url.indexOf("/feed/")<0); //If navigating from /feed/cards/ to somewhere else
        }),
        map( action => new ClearLightCardSelection())
    )

}
