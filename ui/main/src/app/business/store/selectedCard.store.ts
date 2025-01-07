/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Card} from '@ofServices/cards/model/Card';
import {Observable, ReplaySubject, Subject} from 'rxjs';

export class SelectedCardStore {
    private static selectedCardId: string;
    private static readonly selectedCardIdChange = new ReplaySubject<string>(1);
    private static selectedCardNotFound = false;

    private static readonly selectedCardWithChildrenChange = new ReplaySubject<SelectedCard>(1);

    private static readonly selectedCardDeleted = new Subject<any>();

    public static setSelectedCardId(cardId: string): void {
        SelectedCardStore.selectedCardId = cardId;
        SelectedCardStore.selectedCardNotFound = false;
        SelectedCardStore.selectedCardWithChildrenChange.next(new SelectedCard(null, null, false));
        SelectedCardStore.selectedCardIdChange.next(cardId);
    }

    public static setSelectedCardWithChildren(card: Card, childCards: Card[]): void {
        SelectedCardStore.selectedCardNotFound = false;
        if (!childCards) childCards = [];
        SelectedCardStore.selectedCardWithChildrenChange.next(new SelectedCard(card, childCards, false));
    }

    public static setSelectedCardNotFound(): void {
        SelectedCardStore.selectedCardNotFound = true;
        SelectedCardStore.selectedCardWithChildrenChange.next(new SelectedCard(null, null, true));
    }

    public static isSelectedCardNotFound(): boolean {
        return SelectedCardStore.selectedCardNotFound;
    }

    public static getSelectedCardId(): string {
        return SelectedCardStore.selectedCardId;
    }

    public static clearSelectedCardId(): void {
        SelectedCardStore.selectedCardId = null;
        SelectedCardStore.selectedCardIdChange.next(null);
    }

    public static getSelectCardIdChanges(): Observable<string> {
        return SelectedCardStore.selectedCardIdChange.asObservable();
    }

    public static getSelectedCard(): Observable<SelectedCard> {
        return SelectedCardStore.selectedCardWithChildrenChange.asObservable();
    }

    public static setCardDeleted(cardId: string): void {
        if (SelectedCardStore.selectedCardId === cardId) SelectedCardStore.selectedCardDeleted.next(cardId);
    }

    public static getSelectedCardsDeleted(): Observable<any> {
        return SelectedCardStore.selectedCardDeleted.asObservable();
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
