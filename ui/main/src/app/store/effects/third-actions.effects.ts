import {Injectable} from "@angular/core";
import {ThirdsService} from "@ofServices/thirds.service";
import {ThirdActionsService} from "@ofServices/third-actions.service";
import {AppState} from "@ofStore/index";
import {Action, Store} from "@ngrx/store";
import {Actions, Effect, ofType} from "@ngrx/effects";
import {Observable, of} from "rxjs";
import {catchError, flatMap, map, switchMap} from "rxjs/operators";
import {
    UpdateOneThirdAction,
    LoadThirdActionFailure,
    LoadThirdActions,
    LoadThirdActionSuccess,
    ThirdActionTypes
} from "@ofActions/third-action.actions";
import {Action as ThirdAction, ThirdActionHolder} from "@ofModel/thirds.model"
import {selectThirdActionList} from "@ofSelectors/third-action.selectors";
import {LightCard} from "@ofModel/light-card.model";


@Injectable()
export class ThirdActionsEffects{
    constructor(private thirdService: ThirdsService,
                private thirdActionService: ThirdActionsService,
                private store:Store<AppState>,
                private action$:Actions) {
    }


    @Effect()
    loadThirdActions: Observable<Action> = this.action$
        .pipe(
            ofType(ThirdActionTypes.LoadThirdActions),
            switchMap((loadOrder:LoadThirdActions) => {
                const lightCard:LightCard = loadOrder.payload.card;
            return this.thirdService.fetchActionsFromLightCard(lightCard)
                .pipe(map((actionMap: Map<string,ThirdAction>)=>{
                        return new ThirdActionHolder(lightCard.publisher,
                            lightCard.processId,
                            lightCard.state,
                            actionMap);
                })
                );
            }),
            map((actions:ThirdActionHolder)=> new LoadThirdActionSuccess({actions:actions})),
            catchError(error => {
                console.error(error);
                return of(new LoadThirdActionFailure({error: error}));
            }));

    @Effect()
    updateOneThirdAction:Observable<Action> = this.action$
        .pipe(
            ofType(ThirdActionTypes.UpdateOneThirdAction),
            switchMap((updateThirdActionOrder:UpdateOneThirdAction) => {

                this.store.select(selectThirdActionList)
            return null;
            })
        );
}
