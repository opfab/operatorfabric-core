/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {createSelector} from '@ngrx/store';
import {LightCardAdapter} from '@ofStates/light-card.state';
import {AppState} from "@ofStore/index";

export const selectLightCardsState = (state:AppState) => state.lightCard;

export const {
  selectIds: selectLightCardIds,
  selectAll: selectAllLightCards,
  selectEntities: selectLightCardEntities
} = LightCardAdapter.getSelectors(selectLightCardsState);

export const selectLightCardSelection = createSelector(
    selectLightCardsState,
    state => state.selectedCardId)

