/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
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
import {UserService} from '../user.service';
import {ProcessesService} from '@ofServices/processes.service';
import {EntitiesService} from '@ofServices/entities.service';
import {ConsideredAcknowledgedForUserWhenEnum} from '@ofModel/processes.model';

/**
 *
 * This class is used to store and provide lightCard to all other classes in "real time" (feed, monitoring, calendar... )
 *
 * It implements a feature to deliver the last array of lightCards with a limited rate of update : see method getLightCardsWithLimitedUpdateRate()
 *
 * Child cards are not provided along with light card,s they can be retrieved as they are received via getNewLightChildCards()
 *
 * The class provides as well an observable to get information if the loading is in progress, it is in progress when
 * there is a flow of lightCard coming from the subscription service.
 *
 * This feature was previously implemented with NGRX, but it was not fast enough, so it has been changed with a custom implementation
 *
 * This class does not hold the selected lightCard or the current loaded card, this is done via NGRX store.
 */
 @Injectable({
    providedIn: 'root'
})
export class LightCardsStoreService {

    private lightCards = new Map();
    private childCards = new Map();
    private lightCardsEvents = new Subject<Map<any, any>>();
    private lightCardsEventsWithLimitedUpdateRate = new ReplaySubject<Array<any>>();
    private newLightCards = new Subject<LightCard>();
    private newLightChildCards = new Subject<LightCard>();
    private deletedLightChildCards = new Subject<any>();

    private orphanedLightChildCardsFromCurrentEntity: Set<string> = new Set();

    private timeOfLastDebounce = 0;
    private numberOfCardProcessedByPreviousDebounce = 0;

    private nbCardLoadedInHalfSecondInterval = 0;
    private nbCardLoadedInPreviousHalfSecondInterval = 0;
    private loadingInProgress = new Subject();


    constructor(private userService: UserService,
                private processesService: ProcessesService,
                private entitiesService: EntitiesService) {
        this.getLightCardsWithLimitedUpdateRate().subscribe();
        this.checkForLoadingInProgress();
    }


   // --------------------
    // When a flow of card is coming, for performance reasons, we do not want to update the card list
    // every time a card is arriving, so we wait for the end of the flow of cards.
    //
    // But if it takes too long, we want to show something.
    // So every second we make a rendering even if the flow is still continuing except if there is less than 20 new cards received in between
    // In this case it means the browser is slow, so we wait 1s more to avoid adding unnecessary load of the browser
    // This situation can arise for example when the browser is busy rendering the monitoring screen with the previous list of cards
    //
    // To do that we combine a debounce waiting for the end of the flow and an interval to get the cards list every second

    private getLightCardsWithLimitedUpdateRate(): Observable<any> {
        return merge(this.getLightCardsInterval(), this.getLightCardDebounce())
            .pipe(
                map((cards) => {
                    const array = new Array();
                    cards.forEach((card, id) => {
                        array.push(card);
                    });
                    return array;
                }),
                tap((cards) => this.lightCardsEventsWithLimitedUpdateRate.next(cards)));

    }

    private getLightCardsInterval(): Observable<any> {
        return this.lightCardsEvents.pipe(
            sample(interval(1000)),
            filter((results: Map<any, any>) => ((
                (new Date().valueOf()) - this.timeOfLastDebounce) > 1000)   // we only need to get cards if no debounce arise in 1 second
                && (results.size - this.numberOfCardProcessedByPreviousDebounce > 20)), // and if there is enough new cards

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
    // loading is considered in progress
    private checkForLoadingInProgress() {
        if (this.nbCardLoadedInHalfSecondInterval >= 5) {
            if (this.nbCardLoadedInPreviousHalfSecondInterval >= 5) {
                this.loadingInProgress.next(true);
            } else {
                this.nbCardLoadedInPreviousHalfSecondInterval = this.nbCardLoadedInHalfSecondInterval;
            }
            this.nbCardLoadedInHalfSecondInterval = 0;
        } else {
            if (this.nbCardLoadedInPreviousHalfSecondInterval < 5) this.loadingInProgress.next(false);
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

    public getDeletedChildCardsIds(): Observable<any> {
        return this.deletedLightChildCards;
    }

    // for observable subscribe after the events are emitted we use replaySubject
    public getLightCards(): Observable<any> {
        return this.lightCardsEventsWithLimitedUpdateRate.asObservable();
    }

    public getChildCards(parentCardId: string) {
        return this.childCards.get(parentCardId);
    }

    public getLoadingInProgress() {
        return this.loadingInProgress.asObservable();
    }

    public removeLightCard(cardId) {
        const card = this.lightCards.get(cardId);
        if (!card) { // is a child card
            this.removeChildCard(cardId);
        } else {
            this.childCards.delete(cardId);
            this.lightCards.delete(cardId);
        }
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

    private computeListEntitiesToAck(lightCard: LightCard): string[] {
        const listEntitiesToAck = [];

        if (!! lightCard.entityRecipients) {
            const listOfEntityRecipients = this.entitiesService.getEntitiesFromIds(lightCard.entityRecipients);
            if (!! listOfEntityRecipients)
                this.entitiesService.resolveEntitiesAllowedToSendCards(listOfEntityRecipients).forEach(entityToAdd =>
                    listEntitiesToAck.push(entityToAdd.id)
                );
        }
        return listEntitiesToAck;
    }

    private checkIsAcknowledgedForTheCaseOfOneEntitySufficesForAck(consideredAcknowledgedForUserWhen: ConsideredAcknowledgedForUserWhenEnum,
                                                                   lightCard: LightCard): boolean {

        if ((consideredAcknowledgedForUserWhen === ConsideredAcknowledgedForUserWhenEnum.ONE_ENTITY_OF_USER_HAS_ACKNOWLEDGED)
            && (!! lightCard.entitiesAcks)) {
            return (lightCard.entitiesAcks.filter(entityId =>
                this.userService.getCurrentUserWithPerimeters().userData.entities.includes(entityId)).length > 0);
        } else
            return false;
    }

    private checkIsAcknowledgedForTheCaseOfAllEntitiesMustAckTheCard(consideredAcknowledgedForUserWhen: ConsideredAcknowledgedForUserWhenEnum,
                                                                     lightCard: LightCard,
                                                                     listEntitiesToAck: string[]): boolean {

        if ((consideredAcknowledgedForUserWhen === ConsideredAcknowledgedForUserWhenEnum.ALL_ENTITIES_OF_USER_HAVE_ACKNOWLEDGED)
            && (!! lightCard.entitiesAcks)) {

            // We compute the entities for which the ack is pending
            const entitiesWaitedForAck = listEntitiesToAck.filter(entityId =>
                lightCard.entitiesAcks.indexOf(entityId) < 0);

            const entitiesOfUserAndWaitedForAck = entitiesWaitedForAck.filter(entityId => {
                return this.entitiesService.isEntityAllowedToSendCard(entityId)
                    && this.userService.getCurrentUserWithPerimeters().userData.entities.includes(entityId);
            });
            return (entitiesOfUserAndWaitedForAck.length === 0);
        } else
            return false;
    }

    public addEntitiesAcksForLightCard(cardId: string, entitiesAcksToAdd: string[]) {
        const card = this.lightCards.get(cardId);

        if (!!card && !!entitiesAcksToAdd) {
            card.entitiesAcks = (!! card.entitiesAcks) ? [...new Set([...card.entitiesAcks , ...entitiesAcksToAdd])] : entitiesAcksToAdd;
            card.hasBeenAcknowledged = this.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(card);
            this.lightCardsEvents.next(this.lightCards);
        }
    }

    public isLightCardHasBeenAcknowledgedByUserOrByUserEntity(lightCard: LightCard): boolean {
        const consideredAcknowledgedForUserWhen = this.processesService.getConsideredAcknowledgedForUserWhenForALightCard(lightCard);

        if (this.areWeInModeUserHasAcknowledged(lightCard, consideredAcknowledgedForUserWhen))
            return lightCard.hasBeenAcknowledged;
        else
            return this.isLightCardHasBeenAcknowledgedByUserEntity(lightCard, consideredAcknowledgedForUserWhen);
    }

    private doEntityRecipientsIncludeAtLeastOneEntityOfUser(lightCard: LightCard): boolean {
        const entitiesOfUserThatAreRecipients = lightCard.entityRecipients.filter(entityId => {
            return this.entitiesService.isEntityAllowedToSendCard(entityId)
                && this.userService.getCurrentUserWithPerimeters().userData.entities.includes(entityId);
        });
        return (entitiesOfUserThatAreRecipients.length > 0);
    }

    private areWeInModeUserHasAcknowledged(lightCard: LightCard,
                                           consideredAcknowledgedForUserWhen: ConsideredAcknowledgedForUserWhenEnum): boolean {
        return ((consideredAcknowledgedForUserWhen === ConsideredAcknowledgedForUserWhenEnum.USER_HAS_ACKNOWLEDGED) ||
                ((!lightCard.entityRecipients) || (!lightCard.entityRecipients.length)) ||
                !this.doEntityRecipientsIncludeAtLeastOneEntityOfUser(lightCard));
    }

    private isLightCardHasBeenAcknowledgedByUserEntity(lightCard: LightCard,
                                                       consideredAcknowledgedForUserWhen: ConsideredAcknowledgedForUserWhenEnum): boolean {
        const listEntitiesToAck = this.computeListEntitiesToAck(lightCard);

        if ((!! listEntitiesToAck) && (listEntitiesToAck.length > 0) &&
            (consideredAcknowledgedForUserWhen !== ConsideredAcknowledgedForUserWhenEnum.USER_HAS_ACKNOWLEDGED)) {
            return (this.checkIsAcknowledgedForTheCaseOfOneEntitySufficesForAck(consideredAcknowledgedForUserWhen, lightCard)
                    || this.checkIsAcknowledgedForTheCaseOfAllEntitiesMustAckTheCard(consideredAcknowledgedForUserWhen, lightCard,
                                                                                     listEntitiesToAck));
        } else
            return false;
    }

    public setLightCardAcknowledgment(cardId: string, ack: boolean) {
        const card = this.lightCards.get(cardId);
        if (!!card) {
            card.hasBeenAcknowledged = ack;

            // Each time hasBeenAcknowledged is updated, we have to compute it again, relating to entities acks
            card.hasBeenAcknowledged = this.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(card);
            this.lightCardsEvents.next(this.lightCards);
        }
    }

    public addOrUpdateLightCard(card) {
        this.nbCardLoadedInHalfSecondInterval++;
        if (!!card.parentCardId) {
            this.addChildCard(card);
            const isFromCurrentUser = this.isLightChildCardFromCurrentUserEntity(card);
            if (isFromCurrentUser) {
                const parentCard = this.lightCards.get(card.parentCardId);
                if (!parentCard) {
                    // if parent does not exist yet keep in memory the information that the card with id=parentCardId has a child
                    // and that this child is from current user entity
                    // this can happen as the back doesn't order the cards before sending them
                    // in the subscription (i.e a child can be received before its parent)
                    this.orphanedLightChildCardsFromCurrentEntity.add(card.parentCardId);
                } else {
                    parentCard.hasChildCardFromCurrentUserEntity = true;
                    this.addOrUpdateParentLightCard(parentCard);
                }
            }
            this.newLightChildCards.next(card);
        } else {
            const oldCardVersion = this.lightCards.get(card.id);
            card.hasChildCardFromCurrentUserEntity = this.lightCardHasChildFromCurrentUserEntity(oldCardVersion, card);
            card.hasBeenAcknowledged = this.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(card);
            this.addOrUpdateParentLightCard(card);
        }
    }

    private addChildCard(card: LightCard) {
        if (!!card.parentCardId) {
            const children = this.childCards.get(card.parentCardId);
            if (children) {
                children.push(card);
            } else {
                this.childCards.set(card.parentCardId, [card]);
            }
        }
    }

    private removeChildCard(cardId) {
        this.childCards.forEach( (children, parentCardId) => {

            const childIdx = children.findIndex(c => c.id === cardId);
            if (childIdx >= 0) {
                const removed = children.splice(childIdx, 1);

                this.deletedLightChildCards.next({'cardId': cardId, 'parentCardId': parentCardId });

                if (this.isLightChildCardFromCurrentUserEntity(removed[0]) && this.getChildCardsFromCurrentUserEntity(children).length === 0) {
                    const parentCard = this.lightCards.get(parentCardId);
                    parentCard.hasChildCardFromCurrentUserEntity = false;
                }
            }
        });
    }

    private getChildCardsFromCurrentUserEntity(children: LightCard[]) {
        const userEntities = this.userService.getCurrentUserWithPerimeters().userData.entities;
        return children.filter(c => userEntities.includes(c.publisher));
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
