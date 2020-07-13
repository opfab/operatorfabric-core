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
import {Observable, of} from 'rxjs';
import {catchError, filter, map, switchMap,withLatestFrom} from 'rxjs/operators';
import {
    HandleUnexpectedError,
    LightCardActionTypes,
    LoadLightCardsSuccess
} from '@ofActions/light-card.actions';
import {Action, Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {ApplyFilter, FeedActionTypes} from '@ofActions/feed.actions';
import {FilterType} from '@ofServices/filter.service';
import {selectCardStateSelectedId} from '@ofSelectors/card.selectors';
import {LoadCard} from '@ofActions/card.actions';
import {SoundNotificationService} from '@ofServices/sound-notification.service';
import {selectSortedFilterLightCardIds} from '@ofSelectors/feed.selectors';

@Injectable()
export class CardOperationEffects {

    /* istanbul ignore next */
    constructor(private store: Store<AppState>,
                private actions$: Actions,
                private service: CardService,
                private soundNotificationService: SoundNotificationService) {
    }



    @Effect({dispatch: false})
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
                    this.soundNotificationService.handleCards(lightCards, currentlyVisibleIds);
                }
            )
        );

    @Effect()
    updateSubscription: Observable<any> = this.actions$
        .pipe(
            ofType(FeedActionTypes.ApplyFilter),
            filter((af: ApplyFilter) => af.payload.name === FilterType.BUSINESSDATE_FILTER),
            switchMap((af: ApplyFilter) => {
                    this.service.setSubscriptionDates(af.payload.status.start, af.payload.status.end);
                    return of();
                }
            ),
            catchError((error, caught) => {
                this.store.dispatch(new HandleUnexpectedError({error: error}));
                return caught;
            })
        );

    @Effect()
    refreshIfSelectedCard: Observable<Action> = this.actions$
        .pipe(
            ofType(LightCardActionTypes.LoadLightCardsSuccess),
            map((a: LoadLightCardsSuccess) => a.payload.lightCards), // retrieve list of added light cards from action payload
            withLatestFrom(this.store.select(selectCardStateSelectedId)), // retrieve currently selected card
            switchMap(([lightCards, selectedCardId]) => lightCards.filter(card => card.id === selectedCardId)), // keep only lightCards matching the process id of current selected card
            map(lightCard => new LoadCard({id: lightCard.id})) // if any, trigger refresh by firing LoadCard
        )
    ;
}
