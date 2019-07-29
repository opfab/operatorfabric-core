import {Injectable} from "@angular/core";
import {ThirdsService} from "@ofServices/thirds.service";
import {AppState} from "@ofStore/index";
import {Store} from "@ngrx/store";
import {Actions, Effect, ofType} from "@ngrx/effects";
import {of} from "rxjs";
import {catchError, map, mergeMap, tap} from "rxjs/operators";
import {
    LoadThirdActionFailure,
    LoadThirdActions,
    LoadThirdActionSuccess,
    ThirdActionTypes
} from "@ofActions/third-action.actions";
import {Action as ThirdAction, ThirdActionHolder} from "@ofModel/thirds.model"
import {LightCard} from "@ofModel/light-card.model";


@Injectable()
export class ThirdActionsEffects {
    constructor(private store: Store<AppState>,
                private action$: Actions,
                private thirdService: ThirdsService
    ) {
    }

    @Effect()
    loadThirdActions= this.action$
        .pipe(
            ofType(ThirdActionTypes.LoadThirdActions),
            mergeMap((loadOrder: LoadThirdActions) => {
                const lightCard: LightCard = loadOrder.payload.card;
                return this.thirdService.fetchActionsFromLightCard(lightCard)
                    .pipe(
                        map(([actions,holder]:[Array<ThirdAction>,ThirdActionHolder]) => {
                            return new LoadThirdActionSuccess({actions: actions,holder:holder});
                        }),
                        catchError(error => {
                            console.error(error);
                            return of(new LoadThirdActionFailure({error: error}));
                        })
                    );
            }),
            catchError(error => {
                console.error(error);
                return of(new LoadThirdActionFailure({error: error}));
            }));

    // @Effect()
    // updateOneThirdAction: Observable<Action> = this.action$
    //     .pipe(
    //         ofType(ThirdActionTypes.UpdateOneThirdAction),
    //         switchMap((updateThirdActionOrder: UpdateOneThirdAction) => {
    //
    //             this.store.select(selectThirdActionList).pipe();
    //             return null;
    //         })
    //     );
}
