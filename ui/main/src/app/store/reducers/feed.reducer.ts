/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {LightCardActions, LightCardActionTypes} from '@ofActions/light-card.actions';
import {LightCardAdapter, feedInitialState, CardFeedState} from '@ofStates/feed.state';
import {FeedActions, FeedActionTypes} from "@ofActions/feed.actions";

export function reducer(
    state = feedInitialState,
    action: FeedActions
): CardFeedState {
    switch (action.type) {
        case FeedActionTypes.ApplyFilter: {
            const filters = new Map(state.filters);
            const filter = {...filters.get(action.payload.name)}
            filter.active = action.payload.active;
            filter.status = action.payload.status
            filters.set(action.payload.name,filter);
            return {
                ...state,
                loading: false,
                filters: filters
            };
        }

        default: {
            return state;
        }
    }
}