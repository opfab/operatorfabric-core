/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {LightCard} from '@ofModel/light-card.model';
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
import {UserService} from 'app/business/services/users/user.service';
import {OpfabEventStreamService} from 'app/business/services/events/opfabEventStream.service';
import {CardOperationType} from '@ofModel/card-operation.model';
import {LogOption, LoggerService as logger} from 'app/business/services/logs/logger.service';
import {SelectedCardService} from 'app/business/services/card/selectedCard.service';
import {AcknowledgeService} from '../acknowledge.service';

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

export class LightCardsStoreService {
    private static initDone = false;
    private static lightCards = new Map();
    private static childCards = new Map();
    private static lightCardsEvents = new Subject<Map<any, any>>();
    private static lightCardsEventsWithLimitedUpdateRate = new ReplaySubject<Array<any>>();
    private static newLightCards = new Subject<LightCard>();
    private static newLightChildCards = new Subject<LightCard>();
    private static deletedLightChildCards = new Subject<any>();

    private static orphanedLightChildCardsFromCurrentEntity: Set<string> = new Set();

    private static timeOfLastDebounce = 0;
    private static numberOfCardProcessedByPreviousDebounce = 0;

    private static nbCardLoadedInHalfSecondInterval = 0;
    private static nbCardLoadedInPreviousHalfSecondInterval = 0;
    private static loadingInProgress = new Subject();
    private static receivedAcksSubject = new Subject<{cardUid: string; entitiesAcks: string[]}>();

    private static unsubscribe$ = new Subject<void>();

    private static debounceTimeInMs = 200;

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

    private static getLightCardsWithLimitedUpdateRate(): Observable<any> {
        return merge(
            LightCardsStoreService.getLightCardsInterval(),
            LightCardsStoreService.getLightCardDebounce()
        ).pipe(
            map((cards) => {
                const array = new Array();
                cards.forEach((card, id) => {
                    array.push(card);
                });
                return array;
            }),
            tap((cards) => LightCardsStoreService.lightCardsEventsWithLimitedUpdateRate.next(cards))
        );
    }

    private static getLightCardsInterval(): Observable<any> {
        return LightCardsStoreService.lightCardsEvents.pipe(
            sample(interval(1000)),
            filter(
                (results: Map<any, any>) =>
                    new Date().valueOf() - LightCardsStoreService.timeOfLastDebounce > 1000 && // we only need to get cards if no debounce arise in 1 second
                    results.size - LightCardsStoreService.numberOfCardProcessedByPreviousDebounce > 20
            ), // and if there is enough new cards

            tap((results) => {
                console.log(
                    new Date().toISOString(),
                    'Cards flow in progress : ' +
                        (results.size - LightCardsStoreService.numberOfCardProcessedByPreviousDebounce) +
                        ' new cards  '
                );
                LightCardsStoreService.numberOfCardProcessedByPreviousDebounce = results.size;
            })
        );
    }

    // Using debounce permit to avoid too much sorting and filtering of  card
    // when a flow of card is arriving
    private static getLightCardDebounce(): Observable<any> {
        return LightCardsStoreService.lightCardsEvents.pipe(
            debounceTime(LightCardsStoreService.debounceTimeInMs),
            tap(() => (LightCardsStoreService.timeOfLastDebounce = new Date().valueOf()))
        );
    }

    // if the flow is more than 10 cards seconds
    // loading is considered in progress
    private static checkForLoadingInProgress() {
        if (LightCardsStoreService.nbCardLoadedInHalfSecondInterval >= 5) {
            if (LightCardsStoreService.nbCardLoadedInPreviousHalfSecondInterval >= 5) {
                LightCardsStoreService.loadingInProgress.next(true);
            } else {
                LightCardsStoreService.nbCardLoadedInPreviousHalfSecondInterval =
                    LightCardsStoreService.nbCardLoadedInHalfSecondInterval;
            }
            LightCardsStoreService.nbCardLoadedInHalfSecondInterval = 0;
        } else {
            if (LightCardsStoreService.nbCardLoadedInPreviousHalfSecondInterval < 5)
                LightCardsStoreService.loadingInProgress.next(false);
            LightCardsStoreService.nbCardLoadedInPreviousHalfSecondInterval =
                LightCardsStoreService.nbCardLoadedInHalfSecondInterval;
        }
        setTimeout(() => LightCardsStoreService.checkForLoadingInProgress(), 500);
    }

    // debounceTimeInMs is to be modify only in testing case
    // Default value must be kept for production
    public static initStore(debounceTimeInMs:number = 200) {
        LightCardsStoreService.debounceTimeInMs = debounceTimeInMs;
        if (LightCardsStoreService.initDone) {
            // this can happen only in unit test as the init is done once at application startup
            LightCardsStoreService.unsubscribe$.next();
        } else {
            LightCardsStoreService.getLightCardsWithLimitedUpdateRate().subscribe();
            LightCardsStoreService.checkForLoadingInProgress();
        }
        OpfabEventStreamService.getCardOperationStream()
            .pipe(takeUntil(LightCardsStoreService.unsubscribe$))
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
                            LightCardsStoreService.addOrUpdateLightCard(operation.card);
                            if (operation.card.id === SelectedCardService.getSelectedCardId())
                                SelectedCardService.setSelectedCardId(operation.card.id); // to update the selected card
                            break;
                        case CardOperationType.DELETE:
                            logger.info(
                                `LightCardStore - Receive card to delete id=` + operation.cardId,
                                LogOption.LOCAL_AND_REMOTE
                            );
                            LightCardsStoreService.removeLightCard(operation.cardId);
                            break;
                        case CardOperationType.ACK:
                            logger.info(
                                'LightCardStore - Receive ack on card uid=' +
                                    operation.cardUid +
                                    ', id=' +
                                    operation.cardId,
                                LogOption.LOCAL_AND_REMOTE
                            );
                            LightCardsStoreService.addEntitiesAcksForLightCard(
                                operation.cardId,
                                operation.entitiesAcks
                            );
                            LightCardsStoreService.receivedAcksSubject.next({
                                cardUid: operation.cardUid,
                                entitiesAcks: operation.entitiesAcks
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
                    console.error('LightCardStore - Error received from  card operation stream ', error);
                }
            });
        catchError((error, caught) => {
            console.error('LightCardStore - Global  error in subscription ', error);
            return caught;
        });
    }

    public static addOrUpdateLightCard(card) {
        LightCardsStoreService.nbCardLoadedInHalfSecondInterval++;
        if (card.parentCardId) {
            LightCardsStoreService.addChildCard(card);
            const isFromCurrentUser = LightCardsStoreService.isLightChildCardFromCurrentUserEntity(card);
            if (isFromCurrentUser) {
                const parentCard = LightCardsStoreService.lightCards.get(card.parentCardId);
                if (!parentCard) {
                    // if parent does not exist yet keep in memory the information that the card with id=parentCardId has a child
                    // and that this child is from current user entity
                    // this can happen as the back doesn't order the cards before sending them
                    // in the subscription (i.e a child can be received before its parent)
                    LightCardsStoreService.orphanedLightChildCardsFromCurrentEntity.add(card.parentCardId);
                } else {
                    parentCard.hasChildCardFromCurrentUserEntity = true;
                    LightCardsStoreService.addOrUpdateParentLightCard(parentCard);
                }
            }
            LightCardsStoreService.newLightChildCards.next(card);
        } else {
            const oldCardVersion = LightCardsStoreService.lightCards.get(card.id);
            card.hasChildCardFromCurrentUserEntity = LightCardsStoreService.lightCardHasChildFromCurrentUserEntity(
                oldCardVersion,
                card
            );
            card.hasBeenAcknowledged = AcknowledgeService.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(card);
            LightCardsStoreService.addOrUpdateParentLightCard(card);
        }
    }

    private static addChildCard(card: LightCard) {
        if (card.parentCardId) {
            const children = LightCardsStoreService.childCards.get(card.parentCardId);
            if (children) {
                children.push(card);
            } else {
                LightCardsStoreService.childCards.set(card.parentCardId, [card]);
            }
        }
    }

    private static isLightChildCardFromCurrentUserEntity(childCard): boolean {
        return UserService.getCurrentUserWithPerimeters().userData.entities.some(
            (entity) => entity === childCard.publisher
        );
    }

    private static addOrUpdateParentLightCard(card) {
        LightCardsStoreService.lightCards.set(card.id, card);
        LightCardsStoreService.newLightCards.next(card);
        LightCardsStoreService.lightCardsEvents.next(LightCardsStoreService.lightCards);
    }

    private static lightCardHasChildFromCurrentUserEntity(oldCardVersion, newCard): boolean {
        if (oldCardVersion) return newCard.keepChildCards && oldCardVersion.hasChildCardFromCurrentUserEntity;
        else {
            // if a child card form the current user entity has been loaded in the UI before the parent card
            if (LightCardsStoreService.orphanedLightChildCardsFromCurrentEntity.has(newCard.id)) {
                LightCardsStoreService.orphanedLightChildCardsFromCurrentEntity.delete(newCard.id);
                return true;
            }
            return false;
        }
    }

    public static removeLightCard(cardId) {
        LightCardsStoreService.closeCardIfOpen(cardId);
        const card = LightCardsStoreService.lightCards.get(cardId);
        if (!card) {
            // is a child card
            LightCardsStoreService.removeChildCard(cardId);
        } else {
            LightCardsStoreService.childCards.delete(cardId);
            LightCardsStoreService.lightCards.delete(cardId);
        }
        LightCardsStoreService.lightCardsEvents.next(LightCardsStoreService.lightCards);
    }

    private static closeCardIfOpen(cardId) {
        if (cardId === SelectedCardService.getSelectedCardId()) {
            SelectedCardService.setCardDeleted(cardId);
        }
    }

    private static removeChildCard(cardId) {
        LightCardsStoreService.childCards.forEach((children, parentCardId) => {
            const childIdx = children.findIndex((c) => c.id === cardId);
            if (childIdx >= 0) {
                const removed = children.splice(childIdx, 1);

                LightCardsStoreService.deletedLightChildCards.next({cardId: cardId, parentCardId: parentCardId});

                if (
                    LightCardsStoreService.isLightChildCardFromCurrentUserEntity(removed[0]) &&
                    LightCardsStoreService.getChildCardsFromCurrentUserEntity(children).length === 0
                ) {
                    const parentCard = LightCardsStoreService.lightCards.get(parentCardId);
                    parentCard.hasChildCardFromCurrentUserEntity = false;
                }
            }
        });
    }

    private static getChildCardsFromCurrentUserEntity(children: LightCard[]) {
        const userEntities = UserService.getCurrentUserWithPerimeters().userData.entities;
        return children.filter((c) => userEntities.includes(c.publisher));
    }

    public static addEntitiesAcksForLightCard(cardId: string, entitiesAcksToAdd: string[]) {
        const card = LightCardsStoreService.lightCards.get(cardId);

        if (card && entitiesAcksToAdd) {
            card.entitiesAcks = card.entitiesAcks
                ? [...new Set([...card.entitiesAcks, ...entitiesAcksToAdd])]
                : entitiesAcksToAdd;
            card.hasBeenAcknowledged = AcknowledgeService.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(card);
            LightCardsStoreService.lightCardsEvents.next(LightCardsStoreService.lightCards);
        }
    }

    public static getReceivedAcks(): Observable<{cardUid: string; entitiesAcks: string[]}> {
        return LightCardsStoreService.receivedAcksSubject.asObservable();
    }

    public static getLightCard(cardId: string) {
        return LightCardsStoreService.lightCards.get(cardId);
    }

    public static getNewLightCards(): Observable<LightCard> {
        return LightCardsStoreService.newLightCards;
    }

    public static getNewLightChildCards(): Observable<LightCard> {
        return LightCardsStoreService.newLightChildCards;
    }

    public static getDeletedChildCardsIds(): Observable<any> {
        return LightCardsStoreService.deletedLightChildCards;
    }

    // for observable subscribe after the events are emitted we use replaySubject
    public static getLightCards(): Observable<LightCard[]> {
        return LightCardsStoreService.lightCardsEventsWithLimitedUpdateRate.asObservable();
    }

    public static getChildCards(parentCardId: string) {
        return LightCardsStoreService.childCards.get(parentCardId);
    }

    public static getLoadingInProgress() {
        return LightCardsStoreService.loadingInProgress.asObservable();
    }

    public static removeAllLightCards() {
        OpfabEventStreamService.resetAlreadyLoadingPeriod();
        LightCardsStoreService.lightCards.clear();
        LightCardsStoreService.lightCardsEvents.next(LightCardsStoreService.lightCards);
    }

    public static setLightCardRead(cardId: string, read: boolean) {
        const card = LightCardsStoreService.lightCards.get(cardId);
        if (card) {
            card.hasBeenRead = read;
            LightCardsStoreService.lightCardsEvents.next(LightCardsStoreService.lightCards);
        }
    }

    public static setLightCardAcknowledgment(cardId: string, ack: boolean) {
        const card = LightCardsStoreService.lightCards.get(cardId);
        if (card) {
            card.hasBeenAcknowledged = ack;

            // Each time hasBeenAcknowledged is updated, we have to compute it again, relating to entities acks
            card.hasBeenAcknowledged = AcknowledgeService.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(card);
            LightCardsStoreService.lightCardsEvents.next(LightCardsStoreService.lightCards);
        }
    }
}
