/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {archiveInitialState, ArchiveState} from "@ofStates/archive.state";
import {ArchiveActions, ArchiveActionTypes} from "@ofActions/archive.actions";
import {LightCardAdapter} from "@ofStates/feed.state";

export function reducer(
    state = archiveInitialState,
    action: ArchiveActions
): ArchiveState {
    switch (action.type) {

        case ArchiveActionTypes.UpdateArchiveFilter : {
            const filters = new Map(state.filters);
            filters.set(action.payload.filterPath, action.payload.filterValues);
            return {
                ...state,
                filters: filters
            };
        }

        case ArchiveActionTypes.ArchiveQuerySuccess : {
            return {
                ...LightCardAdapter.upsertMany(action.payload.lightCards, state), //TODO Will it remove cards that are no longer there ?
                lastCards: action.payload.lightCards
            }
        }

        default: {
            return state;
        }
    }

}
