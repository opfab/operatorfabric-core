/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CardAction, LightCard} from '@ofModel/light-card.model';
import {
    catchError,
    debounceTime,
    filter,
    interval,
    map,
    merge,
    Observable,
    ReplaySubject,
    sample,
    Subject,
    takeUntil,
    tap
} from 'rxjs';
import {UsersService} from '@ofServices/users/UsersService';
import {OpfabEventStreamService} from 'app/business/services/events/opfabEventStream.service';
import {CardOperationType} from '@ofModel/card-operation.model';
import {LogOption, LoggerService as logger} from 'app/services/logs/LoggerService';
import {SelectedCardStore} from 'app/business/store/selectedCard.store';
import {AcknowledgeService} from '../../../services/acknowlegment/AcknowledgeService';

/**
 *
 * This class is used to store and provide lightCard to all other classes in "real time" (feed, monitoring, calendar... )
 *
 * It implements a feature to deliver the last array of lightCards with a limited rate of update : see method getLightCardsWithLimitedUpdateRate()
 *
 * Child cards are not provided along with light cards, they can be retrieved as they are received via getNewLightChildCards()
 *
 * The class provides as well an observable to get information if the loading is in progress, it is in progress when
 * there is a flow of lightCard coming from the subscription service.
 *
 * This feature was previously implemented with NGRX, but it was not fast enough, so it has been changed with a custom implementation
 *
 * This class does not hold the selected lightCard or the current loaded card.
 */

export class LightCardsStore {
    private readonly lightCards = new Map();
    private readonly childCards = new Map();
    private readonly lightCardsEvents = new Subject<Map<any, any>>();
    private readonly lightCardsEventsWithLimitedUpdateRate = new ReplaySubject<Array<any>>();
    private readonly newLightCards = new Subject<LightCard>();
    private readonly newLightChildCards = new Subject<LightCard>();
    private readonly deletedLightChildCards = new Subject<any>();

    private readonly orphanedLightChildCardsFromCurrentEntity: Set<string> = new Set();

    private timeOfLastDebounce = 0;
    private numberOfCardProcessedByPreviousDebounce = 0;

    private nbCardLoadedInHalfSecondInterval = 0;
    private nbCardLoadedInPreviousHalfSecondInterval = 0;
    private readonly loadingInProgress = new Subject();
    private readonly receivedAcksSubject = new Subject<{
        cardUid: string;
        entitiesAcks: string[];
        operation: CardOperationType;
    }>();

    private readonly unsubscribe$ = new Subject<void>();

    private static readonly DEBOUNCE_TIME_IN_MS = 200;

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
        return merge(this.getLightCardsInterval(), this.getLightCardDebounce()).pipe(
            map((cards) => {
                const array = new Array();
                cards.forEach((card, id) => {
                    array.push(card);
                });
                return array;
            }),
            tap((cards) => this.lightCardsEventsWithLimitedUpdateRate.next(cards))
        );
    }

    private getLightCardsInterval(): Observable<any> {
        return this.lightCardsEvents.pipe(
            sample(interval(1000)),
            filter(
                (results: Map<any, any>) =>
                    new Date().valueOf() - this.timeOfLastDebounce > 1000 && // we only need to get cards if no debounce arise in 1 second
                    results.size - this.numberOfCardProcessedByPreviousDebounce > 20
            ), // and if there is enough new cards

            tap((results) => {
                const newCardsCount = results.size - this.numberOfCardProcessedByPreviousDebounce;
                logger.debug(`Cards flow in progress : ${newCardsCount} new cards`);
                this.numberOfCardProcessedByPreviousDebounce = results.size;
            })
        );
    }

    // Using debounce permit to avoid too much sorting and filtering of  card
    // when a flow of card is arriving
    private getLightCardDebounce(): Observable<any> {
        return this.lightCardsEvents.pipe(
            debounceTime(LightCardsStore.DEBOUNCE_TIME_IN_MS),
            tap(() => (this.timeOfLastDebounce = new Date().valueOf()))
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

    // debounceTimeInMs is to be modify only in testing case
    // Default value must be kept for production
    public initStore() {
        this.getLightCardsWithLimitedUpdateRate().subscribe();
        this.checkForLoadingInProgress();
        OpfabEventStreamService.getCardOperationStream()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
                next: (operation) => {
                    switch (operation.type) {
                        case CardOperationType.ADD:
                            logger.info(
                                'LightCardStore - Receive card to add id=' +
                                    operation.card.id +
                                    ' with date=' +
                                    new Date(operation.card.publishDate).toISOString(),
                                LogOption.LOCAL_AND_REMOTE
                            );
                            this.addOrUpdateLightCard(operation.card);
                            if (operation.card.id === SelectedCardStore.getSelectedCardId())
                                SelectedCardStore.setSelectedCardId(operation.card.id); // to update the selected card
                            break;
                        case CardOperationType.DELETE:
                            logger.info(
                                `LightCardStore - Receive card to delete id=` + operation.cardId,
                                LogOption.LOCAL_AND_REMOTE
                            );
                            this.removeLightCard(operation.cardId);
                            break;
                        case CardOperationType.ACK:
                            logger.info(
                                'LightCardStore - Receive ack on card uid=' +
                                    operation.cardUid +
                                    ', id=' +
                                    operation.cardId,
                                LogOption.LOCAL_AND_REMOTE
                            );
                            this.addEntitiesAcksForLightCard(operation.cardId, operation.entitiesAcks);
                            this.receivedAcksSubject.next({
                                cardUid: operation.cardUid,
                                entitiesAcks: operation.entitiesAcks,
                                operation: CardOperationType.ACK
                            });
                            break;
                        case CardOperationType.UNACK:
                            logger.info(
                                'LightCardStore - Receive unack on card uid=' +
                                    operation.cardUid +
                                    ', id=' +
                                    operation.cardId,
                                LogOption.LOCAL_AND_REMOTE
                            );
                            this.removeEntitiesAcksForLightCard(operation.cardId, operation.entitiesAcks);
                            this.receivedAcksSubject.next({
                                cardUid: operation.cardUid,
                                entitiesAcks: operation.entitiesAcks,
                                operation: CardOperationType.UNACK
                            });
                            break;
                        default:
                            logger.info(
                                `LightCardStore - Unknown operation ` +
                                    operation.type +
                                    ` for card id=` +
                                    operation.cardId,
                                LogOption.LOCAL_AND_REMOTE
                            );
                    }
                },
                error: (error) => {
                    logger.error(
                        'LightCardStore - Error received from  card operation stream ' + JSON.stringify(error)
                    );
                }
            });
        catchError((error, caught) => {
            logger.error('LightCardStore - Global  error in subscription ' + JSON.stringify(error));
            return caught;
        });
    }

    public addOrUpdateLightCard(card) {
        this.nbCardLoadedInHalfSecondInterval++;
        if (card.parentCardId) {
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
            card.hasBeenAcknowledged = this.isLightCardHasBeenAcknowledged(card);
            card.hasBeenRead = this.isLightCardHasBeenRead(card);
            this.addOrUpdateParentLightCard(card);
        }
    }

    public isLightCardHasBeenAcknowledged(card) {
        let hasBeenAcknowledged = AcknowledgeService.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(card);
        const children = this.getChildCards(card.id);
        if (hasBeenAcknowledged && children) {
            for (const child of children) {
                if (
                    child.actions?.includes(CardAction.PROPAGATE_READ_ACK_TO_PARENT_CARD) &&
                    !AcknowledgeService.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(child)
                ) {
                    hasBeenAcknowledged = false;
                    break;
                }
            }
        }
        return hasBeenAcknowledged;
    }

    public isLightCardHasBeenRead(card) {
        let hasBeenRead = card.hasBeenRead;
        const children = this.getChildCards(card.id);
        if (hasBeenRead && children) {
            for (const child of children) {
                if (child.actions?.includes(CardAction.PROPAGATE_READ_ACK_TO_PARENT_CARD) && !child.hasBeenRead) {
                    hasBeenRead = false;
                    break;
                }
            }
        }
        return hasBeenRead;
    }

    private addChildCard(card: LightCard) {
        if (card.parentCardId) {
            const children = this.childCards.get(card.parentCardId);
            if (children) {
                const childIndex = children.findIndex((child) => child.id === card.id);
                if (childIndex >= 0) children.splice(childIndex, 1);
                children.push(card);
            } else {
                this.childCards.set(card.parentCardId, [card]);
            }

            this.unreadAndUnackParentCardIfNeeded(card);
        }
    }

    private unreadAndUnackParentCardIfNeeded(card: LightCard) {
        if (card.parentCardId) {
            const parent = this.lightCards.get(card.parentCardId);

            if (parent && card.actions?.includes(CardAction.PROPAGATE_READ_ACK_TO_PARENT_CARD)) {
                if (parent.hasBeenRead && !card.hasBeenRead) {
                    this.setLightCardRead(parent.id, false);
                }
                if (
                    parent.hasBeenAcknowledged &&
                    !AcknowledgeService.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(card)
                ) {
                    this.setLightCardAcknowledgment(parent.id, false);
                }
            }
        }
    }

    private isLightChildCardFromCurrentUserEntity(childCard): boolean {
        return UsersService.getCurrentUserWithPerimeters().userData.entities.some(
            (entity) => entity === childCard.publisher
        );
    }

    private addOrUpdateParentLightCard(card) {
        this.lightCards.set(card.id, card);
        this.newLightCards.next(card);
        this.lightCardsEvents.next(this.lightCards);
    }

    private lightCardHasChildFromCurrentUserEntity(oldCardVersion, newCard): boolean {
        if (oldCardVersion)
            return (
                newCard.actions?.includes(CardAction.KEEP_CHILD_CARDS) &&
                oldCardVersion.hasChildCardFromCurrentUserEntity
            );
        else {
            // if a child card form the current user entity has been loaded in the UI before the parent card
            if (this.orphanedLightChildCardsFromCurrentEntity.has(newCard.id)) {
                this.orphanedLightChildCardsFromCurrentEntity.delete(newCard.id);
                return true;
            }
            return false;
        }
    }

    public removeLightCard(cardId) {
        this.closeCardIfOpen(cardId);
        const card = this.lightCards.get(cardId);
        if (!card) {
            // is a child card
            this.removeChildCard(cardId);
        } else {
            this.childCards.delete(cardId);
            this.lightCards.delete(cardId);
        }
        this.lightCardsEvents.next(this.lightCards);
    }

    private closeCardIfOpen(cardId) {
        if (cardId === SelectedCardStore.getSelectedCardId()) {
            SelectedCardStore.setCardDeleted(cardId);
        }
    }

    private removeChildCard(cardId) {
        this.childCards.forEach((children, parentCardId) => {
            const childIdx = children.findIndex((c) => c.id === cardId);
            if (childIdx >= 0) {
                const removed = children.splice(childIdx, 1);

                this.deletedLightChildCards.next({cardId: cardId, parentCardId: parentCardId});

                if (
                    this.isLightChildCardFromCurrentUserEntity(removed[0]) &&
                    this.getChildCardsFromCurrentUserEntity(children).length === 0
                ) {
                    const parentCard = this.lightCards.get(parentCardId);
                    parentCard.hasChildCardFromCurrentUserEntity = false;
                }
            }
        });
    }

    private getChildCardsFromCurrentUserEntity(children: LightCard[]) {
        const userEntities = UsersService.getCurrentUserWithPerimeters().userData.entities;
        return children.filter((c) => userEntities.includes(c.publisher));
    }

    public addEntitiesAcksForLightCard(cardId: string, entitiesAcksToAdd: string[]) {
        const card = this.lightCards.get(cardId);

        if (card && entitiesAcksToAdd) {
            card.entitiesAcks = card.entitiesAcks
                ? [...new Set([...card.entitiesAcks, ...entitiesAcksToAdd])]
                : entitiesAcksToAdd;
            card.hasBeenAcknowledged = AcknowledgeService.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(card);
            this.lightCardsEvents.next(this.lightCards);
        }
    }

    public removeEntitiesAcksForLightCard(cardId: string, entitiesAcksToRemove: string[]) {
        const card = this.lightCards.get(cardId);

        if (card?.entitiesAcks && entitiesAcksToRemove) {
            entitiesAcksToRemove.forEach((entityToRemove) => {
                const indexToRemove = card.entitiesAcks.indexOf(entityToRemove);
                if (indexToRemove >= 0) card.entitiesAcks.splice(indexToRemove, 1);
            });
            card.hasBeenAcknowledged = AcknowledgeService.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(card);
            this.lightCardsEvents.next(this.lightCards);
        }
    }

    public getReceivedAcks(): Observable<{cardUid: string; entitiesAcks: string[]; operation: CardOperationType}> {
        return this.receivedAcksSubject.asObservable();
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
    public getLightCards(): Observable<LightCard[]> {
        return this.lightCardsEventsWithLimitedUpdateRate.asObservable();
    }

    public getChildCards(parentCardId: string) {
        return this.childCards.get(parentCardId);
    }

    public getLoadingInProgress() {
        return this.loadingInProgress.asObservable();
    }

    public removeAllLightCards() {
        OpfabEventStreamService.resetAlreadyLoadingPeriod();
        this.lightCards.clear();
        this.lightCardsEvents.next(this.lightCards);
    }

    public setLightCardRead(cardId: string, read: boolean) {
        const card = this.lightCards.get(cardId);
        if (card) {
            card.hasBeenRead = read;
            this.lightCardsEvents.next(this.lightCards);
        }
    }

    public setLightCardAcknowledgment(cardId: string, ack: boolean) {
        const card = this.lightCards.get(cardId);
        if (card) {
            card.hasBeenAcknowledged = ack;

            // Each time hasBeenAcknowledged is updated, we have to compute it again, relating to entities acks
            card.hasBeenAcknowledged = AcknowledgeService.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(card);
            this.lightCardsEvents.next(this.lightCards);
        }
    }
}
