
import {createSelector} from '@ngrx/store';
import {LightCardAdapter} from '@ofStates/feed.state';
import {AppState} from "@ofStore/index";

export const selectTimelineState = (state: AppState) => state.timeline;

export const {
  selectIds: selecteTimelineCardIds,
  selectAll: selectTimeline,
  selectEntities: selecteTimelineCardEntities
} = LightCardAdapter.getSelectors(selectTimelineState);

export const selectTimelineSelection = createSelector(selectTimelineState,
    state => state.data);

/*export const selectLightCardSelection = createSelector(selectLightCardsState,
    state => state.selectedCardId);

export const selectLastCardsSelection = createSelector(selectTimelineState,
    state => state.lastCards);*/
