/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import { archiveInitialState, ArchiveState } from '@ofStates/archive.state';
import { ArchiveActions, ArchiveActionTypes, FlushArchivesResult } from '@ofActions/archive.actions';




export function reducer(
    state = archiveInitialState,
    action: ArchiveActions

): ArchiveState {
    switch (action.type) {

        case ArchiveActionTypes.UpdateArchiveFilter: {
            const filters = new Map(action.payload.filters);
            return {
                ...state,
                filters: filters,
                loading: true
            };
        }

        case ArchiveActionTypes.ArchiveQuerySuccess: {
            const { resultPage } = action.payload;
            return {
                ...state,
                resultPage: resultPage,
                loading: false,
                firstLoading : true
            };
        }
        case ArchiveActionTypes.SelectArchivedLightCard: {
            return {
                ...state,
                ...action.payload
            };
        }
        case ArchiveActionTypes.FlushArchivesResult: {
            return archiveInitialState;
        }
        case ArchiveActionTypes.SendArchiveQuery: {
          return {
                ...state,
                firstLoading : true
            };
         }
        default: {
            return state;
        }
    }

}
