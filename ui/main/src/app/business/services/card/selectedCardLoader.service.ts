/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {catchError, filter, map, switchMap} from 'rxjs';
import {CardService} from './card.service';
import {SelectedCardService} from './selectedCard.service';

export class SelectedCardLoaderService {
    public static init() {
        this.loadCardWhenUserSelectCard();
    }

    private static loadCardWhenUserSelectCard() {
        SelectedCardService.getSelectCardIdChanges()
            .pipe(
                filter((id) => id !== null),
                switchMap((id) => CardService.loadCard(id)),
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
}
