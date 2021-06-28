/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
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
import {Card} from '@ofModel/card.model';
import {Update} from '@ngrx/entity';

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

        case LightCardActionTypes.LoadLightParentCard: {
            return {
                ...LightCardAdapter.upsertOne(action.payload.lightCard, state),
                lastCardLoaded: action.payload.lightCard
            };
        }

        case LightCardActionTypes.LoadLightChildCard: {
            if (action.payload.isFromCurrentUserEntity) {
                const updateIsFromUserEntity: Update<Card> = {
                    id: action.payload.lightCard.parentCardId,
                    changes: {
                        hasChildCardFromCurrentUserEntity: true
                    }
                }
                return {
                    ...LightCardAdapter.updateOne(updateIsFromUserEntity, state),
                    lastCardLoaded: action.payload.lightCard
                }
            }
            return {
                ...state,
                lastCardLoaded: action.payload.lightCard
            }

        }
        case LightCardActionTypes.EmptyLightCards: {
            return {
                ...LightCardAdapter.removeAll(state),
                selectedCardId: null
            };
        }
        case LightCardActionTypes.RemoveLightCard: {
            return {
                ...LightCardAdapter.removeOne(action.payload.card, state)
            };
        }
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

        case LightCardActionTypes.AddLightCardFailure: {
            return {
                ...state
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
        case LightCardActionTypes.UpdateLightCardRead: {
            const update: Update<Card> = {
                id: action.payload.cardId,
                changes: {
                    hasBeenRead: action.payload.hasBeenRead
                }
            }
            return {
                ...LightCardAdapter.updateOne(update, state),
            }
        }

        case LightCardActionTypes.UpdateLightCardAcknowledgment: {
            const update: Update<Card> = {
                id: action.payload.cardId,
                changes: {
                    hasBeenAcknowledged: action.payload.hasBeenAcknowledged
                }
            }
            return {
                ...LightCardAdapter.updateOne(update, state),
            }
        }

        case LightCardActionTypes.RemindLightCard: {
            const update: Update<Card> = {
                id: action.payload.lightCard.id,
                changes: {
                    hasBeenAcknowledged:false,
                    hasBeenRead: false
                }
            }
            return {
                ...LightCardAdapter.updateOne(update, state),
            }
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



