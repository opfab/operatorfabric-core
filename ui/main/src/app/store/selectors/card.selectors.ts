/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AppState} from '@ofStore/index';
import {createSelector} from '@ngrx/store';
import {cardInitialState, CardState} from '@ofStates/card.state';
import {Card} from '@ofModel/card.model';

export const selectCardState = (state: AppState) => state.card;
export const selectCardStateSelected = createSelector(selectCardState, (cardState: CardState) => cardState.selected);

export const selectCardStateSelectedWithChildCards = createSelector(selectCardState, (cardState: CardState) => {
    if (cardState === cardInitialState) return [cardInitialState];
    else return [cardState.selected, cardState.selectedChildCards];
});

export const selectCardStateSelectedId = createSelector(selectCardStateSelected, (card: Card) => {
    return card == null ? null : card.id;
});
