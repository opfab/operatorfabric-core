

import { archiveInitialState, ArchiveState } from '@ofStates/archive.state';
import { ArchiveActions, ArchiveActionTypes } from '@ofActions/archive.actions';




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
