/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {createSelector} from '@ngrx/store';
import {LightCardAdapter} from '@ofStates/feed.state';
import {AppState} from "@ofStore/index";
import {Filter} from "@ofModel/feed-filter.model";
import {LightCard} from "@ofModel/light-card.model";
import {FilterType} from "@ofServices/filter.service";
import {selectLightCardsState} from "@ofSelectors/feed.selectors";

export const selectTimelineState = (state: AppState) => state.timeline;

export const {
  selectIds: selecteTimelineCardIds,
  selectAll: selectTimeline,
  selectEntities: selecteTimelineCardEntities
} = LightCardAdapter.getSelectors(selectTimelineState);

export const selectTimelineSelection = createSelector(selectTimelineState,
    state => state.data);

export const selectLightCardSelection = createSelector(selectLightCardsState,
    state => state.selectedCardId);

export const selectLastCardsSelection = createSelector(selectTimelineState,
    state => state.lastCards);
