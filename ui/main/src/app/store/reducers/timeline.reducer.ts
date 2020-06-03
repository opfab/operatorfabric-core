

import {LightCardActions} from '@ofActions/light-card.actions';
import {TimelineActions, TimelineActionTypes} from "@ofActions/timeline.actions";
import {timelineInitialState, TimelineState} from "@ofStates/timeline.state";
import * as _ from 'lodash';

export function reducer(
    state: TimelineState = timelineInitialState,
    action: LightCardActions|TimelineActions
): TimelineState {
    switch (action.type) {
        case TimelineActionTypes.SetCardDataTimeline: {
            const newData = action.payload.cardsTimeline;
            return {
                ...state,
                data: newData
            };
        }
        default: {
            return state;
        }
    }
}
