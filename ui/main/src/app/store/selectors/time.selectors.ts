import {createFeatureSelector, createSelector} from "@ngrx/store";
import {TimeState} from "@ofStates/time.state";

export const selectTimeState = createFeatureSelector<TimeState>('time');
export const selectError = createSelector(selectTimeState,(timeState)=>timeState.error);
export const selectCurrentDate = createSelector(selectTimeState,(timeState)=> timeState.currentDate);
export const selectTimeReference = createSelector(selectTimeState, (timeState) => timeState.timeReference);
