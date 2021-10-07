/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Injectable} from '@angular/core';
import {LightCard} from '@ofModel/light-card.model';
import {debounceTime, filter, interval, map, merge, Observable, ReplaySubject, sample, Subject, tap} from 'rxjs';
import {UserService} from './user.service';

/**
 * 
 * This class is used to store and provide lightCard to all other classes in "real time" (feed , monitoring , calendar ... )
 * 
 * It implements a feature to deliver the last array of lightCards with a limited rate of update : see method getLightCardsWithLimitedUpdateRate() 
 * 
 * Child cards are not provided along with light card,s they can be retrieved as they are received via getNewLightChildCards()
 * 
 * The class provides as well an observable to get information if the loading is in progress, it is in progress when 
 * there is a flow of lightCard coming from the subscription service.
 * 
 * This feature was préviously implemented with NGRX but i was not fast  enough, so it has been changed with a custom implementation
 * 
 * This class does not hold the selected lightCard or the current loaded card, this is done via NGRX store.
 */

@Injectable()
export class LightCardsStoreService {

    private lightCards = new Map();
    private lightCardsEvents = new Subject<Map<any, any>>();
    private lightCardsEventsWithLimitedUpdateRate = new ReplaySubject<Array<any>>();
    private newLightCards = new Subject<LightCard>();
    private newLightChildCards = new Subject<LightCard>();

    private orphanedLightChildCardsFromCurrentEntity: Set<string> = new Set();

    private timeOfLastDebounce: number = 0;
    private numberOfCardProcessedByPreviousDebounce: number = 0;

    private nbCardLoadedInHalfSecondInterval = 0;
    private nbCardLoadedInPreviousHalfSecondInterval = 0;
    private loadingInProgress = new Subject();


    constructor(private userService: UserService) {
        this.getLightCardsWithLimitedUpdateRate().subscribe();
        this.checkForLoadingInProgress();
    }


   // --------------------
    // When an flow of card is coming, for performance reasons , we do not want to update the card list 
    // every time  a card is arriving so we wait for the end of the flow of cards.
    //
    // But if it takes too long, we want to show something . 
    // So every second we make a rendering even if the flow is still continuing except  if  there is less than 20 new cards received in between 
    // In this case it means the browser is slow so we wait 1 s more to avoid adding unnecessary load ot the browser 
    // This situation can arise for example when the browser is busy rendering the monitoring screen with the previous list of card
    // 
    // To do that we combine a debounce waiting for the end of the flow and an interval to get the card list every second 

    private getLightCardsWithLimitedUpdateRate(): Observable<any> {
        return merge(this.getLightCardsInterval(), this.getLightCardDebounce())
            .pipe(
                map((cards) => {
                    const array = new Array();
                    cards.forEach((card, id) => {
                        array.push(card);
                    });
                    return array
                }),
                tap((cards) => this.lightCardsEventsWithLimitedUpdateRate.next(cards)));

    }

    private getLightCardsInterval(): Observable<any> {
        return this.lightCardsEvents.pipe(
            sample(interval(1000)),
            filter((results: Map<any, any>) => ((
                (new Date().valueOf()) - this.timeOfLastDebounce) > 1000)   // we only need to get cards if no debounce arise in 1 seconds 
                && (results.size - this.numberOfCardProcessedByPreviousDebounce > 20)), //and if there is enough new card 

            tap((results) => {
                console.log(new Date().toISOString(), "Cards flow in progress : " + (results.size - this.numberOfCardProcessedByPreviousDebounce) + " new cards  ");
                this.numberOfCardProcessedByPreviousDebounce = results.size;
            }),
        );
    }

    private getLightCardDebounce(): Observable<any> {
        return this.lightCardsEvents.pipe(
            debounceTime(200),
            tap(() => this.timeOfLastDebounce = (new Date()).valueOf())
        );
    }


    // if the flow is more than 10 cards seconds 
    // loading is consider in progress
    private checkForLoadingInProgress() {
        if (this.nbCardLoadedInHalfSecondInterval>=5) {
            if (this.nbCardLoadedInPreviousHalfSecondInterval>=5) {   
                this.loadingInProgress.next(true);
            }
            else {
                this.nbCardLoadedInPreviousHalfSecondInterval = this.nbCardLoadedInHalfSecondInterval;
            }
            this.nbCardLoadedInHalfSecondInterval = 0;
        }  
        else {
            if (this.nbCardLoadedInPreviousHalfSecondInterval<5) this.loadingInProgress.next(false);
            this.nbCardLoadedInPreviousHalfSecondInterval = this.nbCardLoadedInHalfSecondInterval;
        }
        setTimeout(() => this.checkForLoadingInProgress(), 500);
    }


    public getLightCard(cardId: string) {
        return this.lightCards.get(cardId);
    }

    public getNewLightCards(): Observable<LightCard> {
        return this.newLightCards;
    }

    public getNewLightChildCards(): Observable<LightCard> {
        return this.newLightChildCards;
    }

    // for observable subscribe after the events are emit we use replaySubject 
    public getLightCards(): Observable<any> {
        return this.lightCardsEventsWithLimitedUpdateRate.asObservable();
    }

    public getLoadingInProgress() {
        return this.loadingInProgress.asObservable();
    }

    public removeLightCard(cardId) {
        this.lightCards.delete(cardId);
        this.lightCardsEvents.next(this.lightCards);
    }

    public removeAllLightCards() {
        this.lightCards.clear();
        this.lightCardsEvents.next(this.lightCards);
    }

    public setLightCardRead(cardId: string, read: boolean) {
        const card = this.lightCards.get(cardId);
        if (!!card) {
            card.hasBeenRead = read;
            this.lightCardsEvents.next(this.lightCards);
        }
    }

    public setLightCardAcknowledgment(cardId: string, ack: boolean) {
        const card = this.lightCards.get(cardId);
        if (!!card) {
            card.hasBeenAcknowledged = ack;
            this.lightCardsEvents.next(this.lightCards);
        }
    }

    public addOrUpdateLightCard(card) {
        this.nbCardLoadedInHalfSecondInterval++;
        if (!!card.parentCardId) {
            const isFromCurrentUser = this.isLightChildCardFromCurrentUserEntity(card);
            if (isFromCurrentUser) {
                const parentCard = this.lightCards.get(card.parentCardId)
                if (!parentCard) {
                    // if parent does not exist yet keep in memory the information that the card with id=parentCardId has a child                    
                    // and that this child is from current user entity
                    // this can happen as the back doesn't order the cards before sending them 
                    // in the subscription (i.e a child can be received before its parent)
                    this.orphanedLightChildCardsFromCurrentEntity.add(card.parentCardId);
                }
                else {
                    parentCard.hasChildCardFromCurrentUserEntity = true;
                    this.addOrUpdateParentLightCard(parentCard);
                }
            }
            this.newLightChildCards.next(card);
        }
        else {
            const oldCardVersion = this.lightCards.get(card.id);
            card.hasChildCardFromCurrentUserEntity = this.lightCardHasChildFromCurrentUserEntity(oldCardVersion, card);
            this.addOrUpdateParentLightCard(card);
        }
    }


    private isLightChildCardFromCurrentUserEntity(childCard): boolean {
        return this.userService.getCurrentUserWithPerimeters().userData.entities.some((entity) => entity === childCard.publisher);
    }

    private addOrUpdateParentLightCard(card) {
        this.lightCards.set(card.id, card);
        this.newLightCards.next(card);
        this.lightCardsEvents.next(this.lightCards);
    }

    private lightCardHasChildFromCurrentUserEntity(oldCardVersion, newCard): boolean {
        if (oldCardVersion) return (newCard.keepChildCards && oldCardVersion.hasChildCardFromCurrentUserEntity);
        else {
            // if a child card form the current user entity has been loaded in the UI before the parent card 
            if (this.orphanedLightChildCardsFromCurrentEntity.has(newCard.id)) {
                this.orphanedLightChildCardsFromCurrentEntity.delete(newCard.id);
                return true;
            }
            return false;
        }
    }

 



}
