
import {LightCardActions} from '@ofActions/light-card.actions';
import {TimelineActions, TimelineActionTypes} from "@ofActions/timeline.actions";
import {timelineInitialState, TimelineState} from "@ofStates/timeline.state";
import * as _ from 'lodash';

export function reducer(
    state: TimelineState = timelineInitialState,
    action: LightCardActions|TimelineActions
): TimelineState {
    switch (action.type) {
        case TimelineActionTypes.InitTimeline: {
            return {
                ...state,
                loading: false,
                data: action.payload.data
            };
        }
        case TimelineActionTypes.SetCardDataTimeline: {
            const newData = _.cloneDeep(action.payload.cardsTimeline);
            return {
                ...state,
                loading: false,
                data: newData
            };
        }
        default: {
            return state;
        }
    }
}
