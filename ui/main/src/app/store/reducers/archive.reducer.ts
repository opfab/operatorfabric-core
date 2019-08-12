/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {archiveInitialState, ArchiveState} from '@ofStates/archive.state';
import {ArchiveActions, ArchiveActionTypes} from '@ofActions/archive.actions';


export function reducer(
    state = archiveInitialState,
    action: ArchiveActions
): ArchiveState {
    switch (action.type) {

        case ArchiveActionTypes.UpdateArchiveFilter : {
            const {filters} = action.payload;
            return {
                ...state,
                filters,
                loading: true
            };
        }

        case ArchiveActionTypes.ArchiveQuerySuccess : {
            return {
                ...state,
                resultPage: action.payload.resultPage,
                loading: false
            }
        }

        case ArchiveActionTypes.SelectArchivedLightCard: {
            return {
                ...state,
                ...action.payload
            }
        }

        default: {
            return state;
        }
    }

}
