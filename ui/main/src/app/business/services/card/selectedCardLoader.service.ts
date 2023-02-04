/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {CardService} from '@ofServices/card.service';
import {catchError, filter, map, switchMap} from 'rxjs';
import {SelectedCardService} from './selectedCard.service';

@Injectable({
    providedIn: 'root'
})
export class SelectedCardLoaderService {
    constructor(private selectedCardService: SelectedCardService, private cardService: CardService) {
        this.loadCardWhenUserSelectCard();
    }

    private loadCardWhenUserSelectCard() {
        this.selectedCardService
            .getSelectCardIdChanges()
            .pipe(
                filter((id) => id !== null),
                switchMap((id) => this.cardService.loadCard(id)),
                map((cardData) =>
                    this.selectedCardService.setSelectedCardWithChildren(cardData.card, cardData.childCards)
                ),
                catchError((err, caught) => {
                    this.selectedCardService.setSelectedCardId(null);
                    this.selectedCardService.setSelectedCardWithChildren(null, null);
                    this.selectedCardService.setSelectedCardNotFound();
                    return caught;
                })
            )
            .subscribe();
    }
}
