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
import {SelectedCardStore} from '../../store/selectedCard.store';

export class SelectedCardLoaderService {
    public static init() {
        this.loadCardWhenUserSelectCard();
    }

    private static loadCardWhenUserSelectCard() {
        SelectedCardStore.getSelectCardIdChanges()
            .pipe(
                filter((id) => id !== null),
                switchMap((id) => CardService.loadCard(id)),
                map((cardData) => SelectedCardStore.setSelectedCardWithChildren(cardData.card, cardData.childCards)),
                catchError((err, caught) => {
                    SelectedCardStore.setSelectedCardId(null);
                    SelectedCardStore.setSelectedCardWithChildren(null, null);
                    SelectedCardStore.setSelectedCardNotFound();
                    return caught;
                })
            )
            .subscribe();
    }
}
