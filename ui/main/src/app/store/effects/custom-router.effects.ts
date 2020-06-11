

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
import {LoadArchivedCard, LoadCard} from "@ofActions/card.actions";
import {ClearLightCardSelection, SelectLightCard} from "@ofActions/light-card.actions";
import {SelectArchivedLightCard} from "@ofActions/archive.actions";

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
    navigateToArchivedCard: Observable<Action> = this.actions$.pipe(
        ofType(ROUTER_NAVIGATION),
        filter((action: RouterNavigationAction, index)=> {
            return action.payload.event.url.indexOf("/archives/cards/")>=0;
        }),
        switchMap(action=>{
            const routerState:any = action.payload.routerState;
            return [
                new LoadArchivedCard({id: routerState.params['cid']}),
                new SelectArchivedLightCard({selectedCardId: routerState.params['cid']})
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
