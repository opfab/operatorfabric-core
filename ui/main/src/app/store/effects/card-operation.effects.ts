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
    NoopAction, RemoveLightCard,
    UpdateALightCard
} from '@ofActions/light-card.actions';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {ApplyFilter, FeedActionTypes} from '@ofActions/feed.actions';
import {FilterType} from '@ofServices/filter.service';
import {selectCardStateSelectedId} from '@ofSelectors/card.selectors';
import {LoadCard} from '@ofActions/card.actions';
import {SoundNotificationService} from '@ofServices/sound-notification.service';
import {selectLightCardsState} from '@ofSelectors/feed.selectors';
import {LightCard} from '@ofModel/light-card.model';
import {UserService} from '@ofServices/user.service';
import {AppService} from '@ofServices/app.service';


@Injectable()
export class CardOperationEffects {

    private  orphanedChildCardsFromCurrentEntity : Set <string>  = new Set();

    constructor(private store: Store<AppState>,
                private actions$: Actions,
                private service: CardService,
                private soundNotificationService: SoundNotificationService,
                private userService: UserService,
                private appService: AppService) {
    }


    loadLightCard = createEffect(() => this.actions$
        .pipe(
            ofType(LightCardActionTypes.LoadLightCard),
            map((loadedCardAction: LoadLightCard) => loadedCardAction.payload.lightCard),
            withLatestFrom(this.store.select(selectLightCardsState)),
            map(([lightCard, state]) => {
                if (!!lightCard.parentCardId) {
                    const isFromCurrentUser = this.isChildCardFromCurrentUserEntity(lightCard);
                    if (isFromCurrentUser) {
                        if (!state.entities[lightCard.parentCardId]) {
                             // if parent does not exist yet keep in memory the information that the card with id=parentCardId has a child
                             // and that this child if from current user entity
                             // this situation can arise as we do not have the card ordered when received from
                             // the back via subscription (i.e a child can be received  before his parent)
                            this.orphanedChildCardsFromCurrentEntity.add(lightCard.parentCardId);
                            // do not need to load this child card
                            return new NoopAction();
                        }
    
                    }
                    return new LoadLightChildCard({lightCard: lightCard, isFromCurrentUserEntity: isFromCurrentUser});
                }

                else {
                    let newCard: LightCard = {...lightCard};
                    const oldCardVersion = state.entities[newCard.id];
                    newCard.hasChildCardFromCurrentUserEntity = this.cardHasChildFromCurrentUserEntity(oldCardVersion, newCard);
                    return new LoadLightParentCard({lightCard: newCard});
                }
            })
        ));

    private isChildCardFromCurrentUserEntity(childCard) : boolean
    {
        return this.userService.getCurrentUserWithPerimeters().userData.entities.some((entity) => entity === childCard.publisher);
    }

    private cardHasChildFromCurrentUserEntity(oldCardVersion,newCard) : boolean
    {
        if (oldCardVersion) return  (newCard.keepChildCards && oldCardVersion.hasChildCardFromCurrentUserEntity);
        else {
            // if a child card form the current user entity has been loaded in the UI before the parent card 
            if (this.orphanedChildCardsFromCurrentEntity.has(newCard.id)) {
                this.orphanedChildCardsFromCurrentEntity.delete(newCard.id);
                return true;
            }
        return false;
        }
    }

    /** This effect triggers sound notifications for new cards as well as for card updates (so far, reminders).
     *  It calls different handling functions depending on the action types as the conditions to trigger sounds are
     *  different for new cards and for reminders.
     * */
    
    triggerSoundNotifications = createEffect(() => this.actions$
        .pipe(
            ofType(LightCardActionTypes.LoadLightParentCard, LightCardActionTypes.UpdateALightCard),
            map((cardAction : LoadLightParentCard | UpdateALightCard) => {
                    switch (cardAction.type) {
                        case LightCardActionTypes.LoadLightParentCard: {
                            this.soundNotificationService.handleLoadedCard(cardAction.payload.lightCard);
                            break;
                        }
                        case LightCardActionTypes.UpdateALightCard: {
                            this.soundNotificationService.handleUpdatedCard(cardAction.payload.lightCard, cardAction.payload.updateTrigger);
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

    deleteIfSelectedCard: Observable<any> = createEffect(() => this.actions$
        .pipe(
            ofType(LightCardActionTypes.RemoveLightCard),
            map((a: RemoveLightCard) => a.payload.card),
            withLatestFrom(this.store.select(selectCardStateSelectedId)), // retrieve currently selected card
            switchMap(([card, selectedCardId]) =>  {
                if (card === selectedCardId)
                    this.appService.closeDetails();
                return of();
            })
        ), { dispatch: false });

}
