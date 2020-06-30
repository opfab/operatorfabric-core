/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {createSelector} from '@ngrx/store';
import {compareByPublishDate, compareBySeverityPublishDate, LightCardAdapter} from '@ofStates/feed.state';
import {AppState} from "@ofStore/index";
import {Filter} from "@ofModel/feed-filter.model";
import {LightCard} from "@ofModel/light-card.model";
import {FilterType} from "@ofServices/filter.service";

export const selectLightCardsState = (state:AppState) => state.feed;

export const {
  selectIds: selectFeedCardIds,
  selectAll: selectFeed,
  selectEntities: selectFeedCardEntities
} = LightCardAdapter.getSelectors(selectLightCardsState);

export const selectLightCardSelection = createSelector(
    selectLightCardsState,
    state => state.selectedCardId);
export const selectLastCards = createSelector(selectLightCardsState,
    state => state.lastCards);
export const selectFilter = createSelector(selectLightCardsState,
    state => state.filters)
const selectActiveFiltersArray = createSelector(selectFilter,
    (filters) =>{
      let result = [];
      for(let v of filters.values()) {
        if(v.active)
          result.push(v);
      }
      return result;
    })

export const selectFilteredFeed = createSelector(selectFeed,selectActiveFiltersArray,
    (feed:LightCard[],filters:Filter[])=>{
    if(filters && filters.length>0)
      return feed.filter(card=>Filter.chainFilter(card,filters));
    else return feed;
    })
export function buildFilterSelector(name:FilterType){
    return createSelector(selectFilter,(filters)=>{
        return filters.get(name);
    });
}

export const fetchLightCard = lightCardId =>(state:AppState) => selectFeedCardEntities(state)[lightCardId]

export const selectSortBySeverity = createSelector(selectLightCardsState,
    state => state.sortBySeverity);

export const selectSortedFilterLightCardIds = createSelector(
    selectFilteredFeed,
    selectSortBySeverity,
    ( entityArray, sortBySeverity ) => {
        function compareFn(sortBySeverity: boolean){
            if(sortBySeverity) {
                return compareBySeverityPublishDate;
            } else {
                return compareByPublishDate;
            }
        }
        return entityArray
            .sort( compareFn(sortBySeverity) )
            .map( entity => entity.id );
    });

export const selectSortedFilteredLightCards = createSelector(
    selectFeedCardEntities,
    selectSortedFilterLightCardIds,
    ( entities, sortedIds ) => sortedIds.map( id => entities[id])
)
