/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {createFeatureSelector, createSelector} from '@ngrx/store';
import * as fromCards from './card.reducer';
import {State as CardsState} from './card.reducer';

export const getCardsState = createFeatureSelector<CardsState>( 'card');

export const {
  selectIds: getCardIds,
  selectAll: getAllCards,
  selectEntities: getCardEntities
} = fromCards.adapter.getSelectors(getCardsState);


export const getSelectedCardId = createSelector(
  getCardsState,
  fromCards.getSelectedId
);

export const getSelectedCard = createSelector(
  getSelectedCardId,
  getCardEntities,
  (selectedCardId, entities) => selectedCardId && entities[selectedCardId]
);
