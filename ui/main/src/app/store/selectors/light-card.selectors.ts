/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {createFeatureSelector, createSelector} from '@ngrx/store';
import * as fromLightCards from '../reducers/light-card.reducer';
import {State as lightCardsState} from '../reducers/light-card.reducer';

export const selectLightCardsState = createFeatureSelector<lightCardsState>( 'lightCard');

export const {
  selectIds: selectLightCardIds,
  selectAll: selectAllLightCards,
  selectEntities: selectLightCardEntities
} = fromLightCards.adapter.getSelectors(selectLightCardsState);


export const selectSelectedLightCardId = createSelector(
  selectLightCardsState,
  fromLightCards.getSelectedId
);

export const selectSelectedLightCard = createSelector(
  selectSelectedLightCardId,
  selectLightCardEntities,
  (selectedLightCardId, entities) => selectedLightCardId && entities[selectedLightCardId]
);
