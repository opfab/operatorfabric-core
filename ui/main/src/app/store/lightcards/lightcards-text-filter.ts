/* Copyright (c) 2022, Alliander (http://www.alliander.com)
 * Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Observable, Subject} from 'rxjs';
import {LightCard} from 'app/model/LightCard';

export class LightCardsTextFilter {
    private readonly searchChanges = new Subject();
    private searchTerm = '';

    public getSearchChanges(): Observable<any> {
        return this.searchChanges.asObservable();
    }

    public setSearchTerm(searchTerm: string) {
        this.searchTerm = searchTerm.toUpperCase();
        this.searchChanges.next(this.searchTerm);
    }

    public searchLightCards(cards: LightCard[]): LightCard[] {
        if (!this.searchTerm || this.searchTerm.length === 0) {
            return cards;
        } else {
            const titleCards = cards.filter((card) => card.titleTranslated?.toUpperCase().includes(this.searchTerm));
            const summaryCards = cards.filter((card) =>
                card.summaryTranslated?.toUpperCase().includes(this.searchTerm)
            );
            const searchedCards = titleCards.concat(summaryCards);
            return searchedCards.filter((card, index) => searchedCards.indexOf(card) === index);
        }
    }
}
