/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {CardService} from '@ofServices/card.service';
import {Observable} from 'rxjs';
import {catchError, filter, map, switchMap, takeUntil, withLatestFrom} from 'rxjs/operators';
import {
    AddLightCardFailure,
    HandleUnexpectedError,
    LightCardActions,
    LightCardActionTypes,
    LoadLightCardsSuccess,
    RemoveLightCard,
    UpdatedSubscription
} from '@ofActions/light-card.actions';
import {Action, Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {ApplyFilter, FeedActionTypes} from "@ofActions/feed.actions";
import {FilterType} from "@ofServices/filter.service";
import {selectCardStateSelectedId} from "@ofSelectors/card.selectors";
import {LoadCard} from "@ofActions/card.actions";
import {CardOperationType} from "@ofModel/card-operation.model";
import { UserActionsTypes } from '@ofStore/actions/user.actions';

@Injectable()
export class CardOperationEffects {

    /* istanbul ignore next */
    constructor(private store: Store<AppState>,
                private actions$: Actions,
                private service: CardService) {
    }

    @Effect()
    subscribe: Observable<LightCardActions> = this.actions$
        .pipe(
            // loads card operations only after authentication of a default user ok.
            ofType(UserActionsTypes.UserApplicationRegistered),
            switchMap(() => this.service.getCardOperation()
                .pipe(
                    takeUntil(this.service.unsubscribe$),
                    map(operation => {
                        switch (operation.type) {
                            case CardOperationType.ADD:
                                return new LoadLightCardsSuccess({lightCards: operation.cards});
                            case CardOperationType.DELETE:
                                return new RemoveLightCard({cards: operation.cardIds});
                            default:
                                return new AddLightCardFailure(
                                    {error: new Error(`unhandled action type '${operation.type}'`)}
                                );
                        }
                    }),
                    catchError((error, caught) => {
                        this.store.dispatch(new AddLightCardFailure({error: error}));
                        return caught;
                    })
                )
            ),

            catchError((error, caught) => {
                this.store.dispatch(new HandleUnexpectedError({error: error}));
                return caught;
            }));

    @Effect()
    updateSubscription: Observable<LightCardActions> = this.actions$
        .pipe(
            // loads card operations only after authentication of a default user ok.
            ofType(FeedActionTypes.ApplyFilter),
            filter((af: ApplyFilter) => af.payload.name == FilterType.TIME_FILTER),
            switchMap((af: ApplyFilter) => this.service.updateCardSubscriptionWithDates(af.payload.status.start, af.payload.status.end)
                .pipe(
                    map(() => {
                        return new UpdatedSubscription();
                    })
                )
            ),
            catchError((error, caught) => {
                this.store.dispatch(new HandleUnexpectedError({error: error}))
                return caught;
            })
        );

    @Effect()
    refreshIfSelectedCard: Observable<Action> = this.actions$
        .pipe(
            ofType(LightCardActionTypes.LoadLightCardsSuccess),
            map((a: LoadLightCardsSuccess) => a.payload.lightCards), //retrieve list of added light cards from action payload
            withLatestFrom(this.store.select(selectCardStateSelectedId)), //retrieve currently selected card
            switchMap(([lightCards, selectedCardId]) => lightCards.filter(card => card.id.indexOf(selectedCardId) >= 0)), //keep only lightCards matching the process id of current selected card
            map(lightCard => new LoadCard({id: lightCard.id})) //if any, trigger refresh by firing LoadCard
        )
    ;
}
