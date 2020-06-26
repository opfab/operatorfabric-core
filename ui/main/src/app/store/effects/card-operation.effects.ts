/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
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
import {SoundNotificationService} from "@ofServices/sound-notification.service";
import {selectSortedFilterLightCardIds} from "@ofSelectors/feed.selectors";

@Injectable()
export class CardOperationEffects {

    /* istanbul ignore next */
    constructor(private store: Store<AppState>,
                private actions$: Actions,
                private service: CardService,
                private soundNotificationService: SoundNotificationService) {
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


    @Effect({dispatch:false})
    triggerSoundNotifications = this.actions$
    /* Creating a dedicated effect was necessary because this handling needs to be done once the added cards have been
     * processed since we take a look at the feed state to know if the card is currently visible or not */
        .pipe(
            ofType(LightCardActionTypes.LoadLightCardsSuccess),
            map((loadedCardAction: LoadLightCardsSuccess) => loadedCardAction.payload.lightCards),
            withLatestFrom(this.store.select(selectSortedFilterLightCardIds)),
            /* Since both this effect and the feed state update are triggered by LoadLightCardSuccess, there could
            * theoretically be an issue if the feed state update by the reducer hasn't been done before we take the
            * list of visible cards using withLatestFrom. However, this hasn't cropped up in any of the tests so far so
            * we'll deal with it if the need arises.*/
            map(([lightCards, currentlyVisibleIds]) => {
                    this.soundNotificationService.handleCards(lightCards,currentlyVisibleIds);
                }
            )
        );

    @Effect()
    updateSubscription: Observable<LightCardActions> = this.actions$
        .pipe(
            // loads card operations only after authentication of a default user ok.
            ofType(FeedActionTypes.ApplyFilter),
            filter((af: ApplyFilter) => af.payload.name == FilterType.BUSINESSDATE_FILTER),
            switchMap((af: ApplyFilter) =>
                {
                    console.log(new Date().toISOString(),"BUG OC-604 card-operation.effect.ts update subscription af.payload.status.start  = ",af.payload.status.start,"af.payload.status.end",af.payload.status.end);
                    return this.service.updateCardSubscriptionWithDates(af.payload.status.start, af.payload.status.end)
                .pipe(
                    map(() => {
                        return new UpdatedSubscription();
                    })
                )
                }
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
            switchMap(([lightCards, selectedCardId]) => lightCards.filter(card => card.id===selectedCardId)), //keep only lightCards matching the process id of current selected card
            map(lightCard => new LoadCard({id: lightCard.id})) //if any, trigger refresh by firing LoadCard
        )
    ;
}
