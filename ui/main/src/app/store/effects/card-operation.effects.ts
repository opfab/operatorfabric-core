/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {CardService} from '@ofServices/card.service';
import {Observable, of} from 'rxjs';
import {catchError, filter, map, switchMap, withLatestFrom} from 'rxjs/operators';
import {
    LightCardActionTypes,
    LoadLightCard,
    LoadLightChildCard,
    LoadLightParentCard,
    UpdateALightCard
} from '@ofActions/light-card.actions';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {ApplyFilter, FeedActionTypes} from '@ofActions/feed.actions';
import {FilterType} from '@ofServices/filter.service';
import {selectCardStateSelectedId} from '@ofSelectors/card.selectors';
import {LoadCard} from '@ofActions/card.actions';
import {SoundNotificationService} from '@ofServices/sound-notification.service';
import {selectLightCardsState, selectSortedFilterLightCardIds} from '@ofSelectors/feed.selectors';
import {LightCard} from '@ofModel/light-card.model';
import {UserService} from '@ofServices/user.service';

@Injectable()
export class CardOperationEffects {


    constructor(private store: Store<AppState>,
                private actions$: Actions,
                private service: CardService,
                private soundNotificationService: SoundNotificationService,
                private userService: UserService) {
    }


    loadLightCard = createEffect(() => this.actions$
        .pipe(
            ofType(LightCardActionTypes.LoadLightCard),
            map((loadedCardAction: LoadLightCard) => loadedCardAction.payload.lightCard),
            withLatestFrom(this.store.select(selectLightCardsState)),
            map(([lightCard, state]) => {
                    if (!!lightCard.parentCardId) {
                        return new LoadLightChildCard({lightCard: lightCard,isFromCurrentUserEntity : this.doesChildCardIsFromCurrentUserEntity(lightCard)});
                    }
                    else {
                        let card: LightCard  = {...lightCard} ;
                        card.hasChildCardFromCurrentUserEntity = this.doesNewCardVersionHasChildFromCurrentUserEntity(state.entities[card.id],card);
                        return new LoadLightParentCard({lightCard: card});
                    }
                }
            )
        ));

    private doesChildCardIsFromCurrentUserEntity(childCard) : boolean
    {
        return this.userService.getCurrentUserWithPerimeters().userData.entities.some((entity) => entity === childCard.publisher);
    }

    private doesNewCardVersionHasChildFromCurrentUserEntity(oldCardVersion,newCard) : boolean
    {
        return  (oldCardVersion && newCard.keepChildCards && oldCardVersion.hasChildCardFromCurrentUserEntity);
    }

    /** This effect triggers sound notifications for new cards as well as for card updates (so far, reminders).
     *  It calls different handling functions depending on the action types as the conditions to trigger sounds are
     *  different for new cards and for reminders.
     * */
    triggerSoundNotifications = createEffect(() => this.actions$
        .pipe(
            ofType(LightCardActionTypes.LoadLightParentCard, LightCardActionTypes.UpdateALightCard),
            /* Since both this effect and the feed state update are triggered by LoadLightParentCard, there could
             * theoretically be an issue if the feed state update by the reducer hasn't been done before we take the
             * list of visible cards using withLatestFrom. However, this hasn't cropped up in any of the tests so far so
             * we'll deal with it if the need arises.*/
            withLatestFrom(this.store.select(selectSortedFilterLightCardIds)),
            map(([cardAction, currentlyVisibleIds] : [LoadLightParentCard | UpdateALightCard, string[]]) => {
                    switch (cardAction.type) {
                        case LightCardActionTypes.LoadLightParentCard: {
                            this.soundNotificationService.handleLoadedCard(cardAction.payload.lightCard, currentlyVisibleIds);
                            break;
                        }
                        case LightCardActionTypes.UpdateALightCard: {
                            this.soundNotificationService.handleUpdatedCard(cardAction.payload.lightCard, cardAction.payload.updateTrigger, currentlyVisibleIds,)
                            break;
                        }
                        default: {
                            console.error("Unexpected action type for sound notification effect: "+ typeof cardAction);
                        }
                    }
                }
            )
        ), {dispatch: false});
    
    updateSubscription: Observable<any> = createEffect(() => this.actions$
        .pipe(
            ofType(FeedActionTypes.ApplyFilter),
            filter((af: ApplyFilter) => af.payload.name === FilterType.BUSINESSDATE_FILTER),
            switchMap((af: ApplyFilter) => {
                    this.service.setSubscriptionDates(af.payload.status.start, af.payload.status.end);
                    return of();
                }
            ),
            catchError((error, caught) => {
                console.error('CardOperationEffect - Error in update subscription ', error);
                return caught;
            })
        ), { dispatch: false });


    refreshIfSelectedCard: Observable<any> = createEffect(() => this.actions$
        .pipe(
            ofType(LightCardActionTypes.LoadLightParentCard),
            map((a: LoadLightParentCard) => a.payload.lightCard),
            withLatestFrom(this.store.select(selectCardStateSelectedId)), // retrieve currently selected card
            switchMap(([lightCard, selectedCardId]) =>  {
                if (lightCard.id === selectedCardId)  this.store.dispatch(new LoadCard({id: lightCard.id}));
                return of();
            })
        ), { dispatch: false });


}
