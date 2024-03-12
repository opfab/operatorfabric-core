/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Card} from '@ofModel/card.model';
import {Observable, ReplaySubject, Subject} from 'rxjs';

export class SelectedCardService {
    private static selectedCardId: string;
    private static selectedCardIdChange = new ReplaySubject<string>(1);
    private static selectedCardNotFound = false;

    private static selectedCardWithChildrenChange = new ReplaySubject<SelectedCard>(1);

    private static selectedCardDeleted = new Subject<any>();

    public static setSelectedCardId(cardId: string): void {
        SelectedCardService.selectedCardId = cardId;
        SelectedCardService.selectedCardNotFound = false;
        SelectedCardService.selectedCardWithChildrenChange.next(new SelectedCard(null, null, false));
        SelectedCardService.selectedCardIdChange.next(cardId);
    }

    public static setSelectedCardWithChildren(card: Card, childCards: Card[]): void {
        SelectedCardService.selectedCardNotFound = false;
        if (!childCards) childCards = [];
        SelectedCardService.selectedCardWithChildrenChange.next(new SelectedCard(card, childCards, false));
    }

    public static setSelectedCardNotFound(): void {
        SelectedCardService.selectedCardNotFound = true;
        SelectedCardService.selectedCardWithChildrenChange.next(new SelectedCard(null, null, true));
    }

    public static isSelectedCardNotFound(): boolean {
        return SelectedCardService.selectedCardNotFound;
    }

    public static getSelectedCardId(): string {
        return SelectedCardService.selectedCardId;
    }

    public static clearSelectedCardId(): void {
        SelectedCardService.selectedCardId = null;
        SelectedCardService.selectedCardIdChange.next(null);
    }

    public static getSelectCardIdChanges(): Observable<string> {
        return SelectedCardService.selectedCardIdChange.asObservable();
    }

    public static getSelectCard(): Observable<SelectedCard> {
        return SelectedCardService.selectedCardWithChildrenChange.asObservable();
    }

    public static setCardDeleted(cardId: string): void {
        if (SelectedCardService.selectedCardId === cardId) SelectedCardService.selectedCardDeleted.next(cardId);
    }

    public static getSelectedCardsDeleted(): Observable<any> {
        return SelectedCardService.selectedCardDeleted.asObservable();
    }
}

export class SelectedCard {
    public readonly card: Card;
    public readonly childCards: Card[];
    public readonly notFound: boolean;

    constructor(card: Card, childCards: Card[], notFound: boolean) {
        this.card = card;
        this.childCards = childCards;
        this.notFound = notFound;
    }
}
