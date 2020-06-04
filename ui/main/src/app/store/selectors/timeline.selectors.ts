

import {createSelector} from '@ngrx/store';
import {AppState} from "@ofStore/index";

export const selectTimelineState = (state: AppState) => state.timeline;

export const selectTimelineSelection = createSelector(selectTimelineState,
    state => state.data);

