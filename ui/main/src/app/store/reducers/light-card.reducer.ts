/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {LightCardActions, LightCardActionTypes} from '@ofActions/light-card.actions';
import {CardFeedState, feedInitialState, LightCardAdapter} from '@ofStates/feed.state';
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

// export function alternative(filters: Map<FilterType, Filter>
//     , payload: { name: FilterType; active: boolean; status: any }): Filter {
//     const filter = filters.get(payload.name).clone();
//     return {
//         ...filter
//         , active: payload.active
//         , status: payload.status
//     };
// }

export function reducer(
    state: CardFeedState = feedInitialState,
    action: LightCardActions | FeedActions
): CardFeedState {


    switch (action.type) {
        case LightCardActionTypes.LoadLightCardsSuccess: {
            return {
                ...LightCardAdapter.upsertMany(action.payload.lightCards, state),
                loading: false,
                lastCards: action.payload.lightCards
            };
        }
        case LightCardActionTypes.EmptyLightCards: {
            return {
                ...LightCardAdapter.removeAll(state),
                selectedCardId: null,
                loading: false,
                lastCards: []
            };
        }

        case LightCardActionTypes.RemoveLightCard: {
            return {
                ...LightCardAdapter.removeMany(action.payload.cards, state),
                loading: false,
                lastCards: []
            };
        }
        case LightCardActionTypes.LoadLightCardsFailure: {
            return {
                ...state,
                loading: false,
                error: `error while loading cards: '${action.payload.error}'`,
                lastCards: []
            };
        }

        case LightCardActionTypes.SelectLightCard: {
            return {
                ...state,
                selectedCardId: action.payload.selectedCardId,
                lastCards: []
            };
        }

        case LightCardActionTypes.ClearLightCardSelection: {
            return {
                ...state,
                selectedCardId: null
            };
        }

        case LightCardActionTypes.AddLightCardFailure: {
            return {
                ...state,
                loading: false,
                error: `error while adding a single lightCard: '${action.payload.error}'`,
                lastCards: []
            };
        }

        case FeedActionTypes.ApplyFilter: {
            const payload = action.payload;
            if (state.filters.get(payload.name)) {
                const filters = new Map(state.filters);
                const filter = changeActivationAndStatusOfFilter(filters, payload);
                filters.set(payload.name, filter);
                return {
                    ...state,
                    loading: false,
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

        case LightCardActionTypes.UpdateALightCard: {
            return LightCardAdapter.upsertOne(action.payload.card, state);
        }

        case FeedActionTypes.ApplySeveralFilters: {
            const filterStatuses = action.payload.filterStatuses;

            // const newFilters = new Map(state.filters);
            // filterStatuses.forEach(filterStatus => {
            //     const newFilter = changeActivationAndStatusOfFilter(newFilters, filterStatus);
            // })
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



