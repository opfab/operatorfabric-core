/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
import {Observable, ReplaySubject, Subject, catchError, filter, map, switchMap} from 'rxjs';
import {CardsService} from '../cards/CardsService';
import {Card} from 'app/model/Card';
import {SelectedCard} from './model/SelectedCard';

export class SelectedCardService {
    private static selectedCardId: string;
    private static readonly selectedCardIdChange = new ReplaySubject<string>(1);
    private static selectedCardNotFound = false;

    private static readonly selectedCardWithChildrenChange = new ReplaySubject<SelectedCard>(1);

    private static readonly selectedCardDeleted = new Subject<any>();

    public static init() {
        this.loadCardWhenUserSelectsCard();
    }

    private static loadCardWhenUserSelectsCard() {
        SelectedCardService.getSelectedCardIdChanges()
            .pipe(
                filter((id) => id !== null),
                switchMap((id) => CardsService.loadCard(id)),
                map((cardData) => SelectedCardService.setSelectedCardWithChildren(cardData.card, cardData.childCards)),
                catchError((err, caught) => {
                    SelectedCardService.setSelectedCardId(null);
                    SelectedCardService.setSelectedCardWithChildren(null, null);
                    SelectedCardService.setSelectedCardNotFound();
                    return caught;
                })
            )
            .subscribe();
    }

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

    public static getSelectedCardIdChanges(): Observable<string> {
        return SelectedCardService.selectedCardIdChange.asObservable();
    }

    public static getSelectedCard(): Observable<SelectedCard> {
        return SelectedCardService.selectedCardWithChildrenChange.asObservable();
    }

    public static setCardDeleted(cardId: string): void {
        if (SelectedCardService.selectedCardId === cardId) SelectedCardService.selectedCardDeleted.next(cardId);
    }

    public static getSelectedCardsDeleted(): Observable<any> {
        return SelectedCardService.selectedCardDeleted.asObservable();
    }
}
