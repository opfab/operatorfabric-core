/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {LightCardActions, LightCardActionTypes} from '@ofActions/light-card.actions';
import {CardFeedState, feedInitialState} from '@ofStates/feed.state';
import {FeedActions, FeedActionTypes} from '@ofActions/feed.actions';
import {FilterType} from '@ofServices/filter.service';
import {Filter} from '@ofModel/feed-filter.model';


export function changeActivationAndStatusOfFilter(filters: Map<FilterType, Filter>
    , payload: { name: FilterType; active: boolean; status: any }) {
    const filter = filters.get(payload.name).clone();
    filter.active = payload.active;
    filter.status = payload.status;
    return filter;
}

export function reducer(
    state: CardFeedState = feedInitialState,
    action: LightCardActions | FeedActions
): CardFeedState {


    switch (action.type) {

        case LightCardActionTypes.SelectLightCard: {
            return {
                ...state,
                selectedCardId: action.payload.selectedCardId,
            };
        }

        case LightCardActionTypes.ClearLightCardSelection: {
            return {
                ...state,
                selectedCardId: null
            };
        }

        case FeedActionTypes.ApplyFilter: {
            const payload = action.payload;
            if (state.filters.get(payload.name)) {
                const filters = new Map(state.filters);
                const filter = changeActivationAndStatusOfFilter(filters, payload);
                filters.set(payload.name, filter);
                if (payload.name === FilterType.BUSINESSDATE_FILTER) {
                    return {
                        ...state,
                        filters: filters,
                        domainId: payload.status.domainId,
                        domainStartDate: payload.status.start,
                        domainEndDate: payload.status.end
                    };
                }
                 else return {
                    ...state,
                    filters: filters
                };
            } else {
                return {...state};
            }
        }
        case FeedActionTypes.ChangeSort: {
            return {
                ...state,
                sortBySeverity: !state.sortBySeverity
            };
        }
        case FeedActionTypes.ChangeReadSort: {
            return {
                ...state,
                sortByRead: !state.sortByRead
            };
        }

        case FeedActionTypes.ApplySeveralFilters: {
            const filterStatuses = action.payload.filterStatuses;

            return {
                ...state,
                filters: filterStatuses
            };
        }
        default: {
            return state;
        }

    }
}



