/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {createFeatureSelector, createSelector} from '@ngrx/store';
import {LightCardAdapter, LightCardStateEntity} from "@ofStates/light-card.state";
import {getSelectedId} from "@ofStore/reducers/light-card.reducer";

export const selectLightCardsState = createFeatureSelector<LightCardStateEntity>( 'lightCard');

export const {
  selectIds: selectLightCardIds,
  selectAll: selectAllLightCards,
  selectEntities: selectLightCardEntities
} = LightCardAdapter.getSelectors(selectLightCardsState);


export const selectSelectedLightCardId = createSelector(
  selectLightCardsState,
  getSelectedId
);

export const selectSelectedLightCard = createSelector(
  selectSelectedLightCardId,
  selectLightCardEntities,
  (selectedLightCardId, entities) => selectedLightCardId && entities[selectedLightCardId]
);
