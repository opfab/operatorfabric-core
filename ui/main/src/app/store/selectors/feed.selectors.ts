/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {createSelector} from '@ngrx/store';
import {LightCardAdapter} from '@ofStates/feed.state';
import {AppState} from '@ofStore/index';
import {FilterType} from '@ofServices/filter.service';

export const selectLightCardsState = (state: AppState) => state.feed;

export const {
    selectAll: selectFeed,
    selectEntities: selectFeedCardEntities
} = LightCardAdapter.getSelectors(selectLightCardsState);

export const selectLightCardSelection = createSelector(
    selectLightCardsState,
    state => state.selectedCardId);

export const selectLastCardLoaded = createSelector(selectLightCardsState,
    state => state.lastCardLoaded);

export const selectFilter = createSelector(selectLightCardsState,
    state => state.filters);

export const selectActiveFiltersArray = createSelector(selectFilter,
    (filters) => {
        const result = [];
        for (const v of filters.values()) {
            if (v.active) {
                result.push(v);
            }
        }
        return result;
    });
    
export function buildFilterSelector(name: FilterType) {
    return createSelector(selectFilter, (filters) => {
        return filters.get(name);
    });
}

export const fetchLightCard = lightCardId => (state: AppState) => selectFeedCardEntities(state)[lightCardId];

export const selectSortBySeverity = createSelector(selectLightCardsState,
    state => state.sortBySeverity);

export const selectSortByRead = createSelector(selectLightCardsState,
    state => state.sortByRead);


export const selectSortFilter = createSelector(
    selectSortBySeverity,
    selectSortByRead,
    (sortBySeverity, sortByRead) => {
        return {sortBySeverity: sortBySeverity, sortByRead: sortByRead}
    }
);

    
    



    



    