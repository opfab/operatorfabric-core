/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {Card} from '@ofModel/card.model';
import {Observable, ReplaySubject, Subject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SelectedCardService {
    private selectedCardId: string;
    private selectedCardIdChange = new ReplaySubject<string>(1);
    private selectedCardNotFound = false;

    private selectedCardWithChildrenChange = new ReplaySubject<SelectedCard>(1);

    private selectedCardDeleted = new Subject<any>();

    public setSelectedCardId(cardId: string) {
        this.selectedCardId = cardId;
        this.selectedCardNotFound = false;
        this.selectedCardWithChildrenChange.next(new SelectedCard(null,null,false));
        this.selectedCardIdChange.next(cardId);
    }

    public setSelectedCardWithChildren(card: Card, childCards: Card[]) {
        this.selectedCardNotFound = false;
        if (!childCards) childCards = [];
        this.selectedCardWithChildrenChange.next(new SelectedCard(card, childCards,false));
    }

    public setSelectedCardNotFound() {
        this.selectedCardNotFound = true;
        this.selectedCardWithChildrenChange.next(new SelectedCard(null,null,true));
    }

    public isSelectedCardNotFound():boolean {
        return  this.selectedCardNotFound;
    }


    public getSelectedCardId(): string {
        return this.selectedCardId;
    }

    public clearSelectedCardId() {
        this.selectedCardId = null;
        this.selectedCardIdChange.next(null);
    }

    public getSelectCardIdChanges(): Observable<string> {
        return this.selectedCardIdChange.asObservable();
    }

    public getSelectCard(): Observable<SelectedCard> {
        return this.selectedCardWithChildrenChange.asObservable();
    }

    public setCardDeleted(cardId: string) {
        if (this.selectedCardId === cardId)
            this.selectedCardDeleted.next(cardId);
    }

    public getSelectedCardsDeleted(): Observable<any> {
        return this.selectedCardDeleted.asObservable();
    }
}


export class SelectedCard {
    public readonly card: Card;
    public readonly childCards: Card[];
    public readonly notFound: boolean;

    constructor(card:Card,childCards: Card[],notFound: boolean) {
        this.card = card;
        this.childCards = childCards;
        this.notFound = notFound;
    }

}