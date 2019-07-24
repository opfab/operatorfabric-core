import {Injectable} from "@angular/core";
import {ThirdsService} from "@ofServices/thirds.service";
import {AppState} from "@ofStore/index";
import {Action, Store} from "@ngrx/store";
import {Actions, Effect, ofType} from "@ngrx/effects";
import {Observable, of} from "rxjs";
import {catchError, map, switchMap, tap} from "rxjs/operators";
import {
    LoadThirdActionFailure,
    LoadThirdActions,
    LoadThirdActionSuccess,
    ThirdActionTypes,
    UpdateOneThirdAction
} from "@ofActions/third-action.actions";
import {Action as ThirdAction, ThirdActionHolder} from "@ofModel/thirds.model"
import {selectThirdActionList} from "@ofSelectors/third-action.selectors";
import {LightCard} from "@ofModel/light-card.model";


@Injectable()
export class ThirdActionsEffects {
    constructor(private store: Store<AppState>,
                private action$: Actions,
                private thirdService: ThirdsService
    ) {
    }

    @Effect()
    loadThirdActions: Observable<Action> = this.action$
        .pipe(
            ofType(ThirdActionTypes.LoadThirdActions),
            tap(() => console.log('try to load third actions')),
            switchMap((loadOrder: LoadThirdActions) => {
                const lightCard: LightCard = loadOrder.payload.card;
                return this.thirdService.fetchActionsFromLightCard(lightCard)
                    .pipe(
                        map((actions: Array<ThirdAction>) => {
                            return new LoadThirdActionSuccess({actions: actions})
                        })
                    );
            }),
            catchError(error => {
                console.error(error);
                return of(new LoadThirdActionFailure({error: error}));
            }));

    @Effect()
    updateOneThirdAction: Observable<Action> = this.action$
        .pipe(
            ofType(ThirdActionTypes.UpdateOneThirdAction),
            switchMap((updateThirdActionOrder: UpdateOneThirdAction) => {

                this.store.select(selectThirdActionList).pipe();
                return null;
            })
        );
}
