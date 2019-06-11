import {timeInitialState, TimeState} from "@ofStates/time.state";
import {TimeActions, TimeActionTypes} from "@ofActions/time.actions";

export function reducer(state = timeInitialState, action: TimeActions): TimeState{
    switch (action.type) {
        case TimeActionTypes.Tick: {
            return {
                ...state,
                currentDate: action.payload.currentTime
            };
        }
        case TimeActionTypes.UpdateTimeReference:{
            return {
                ...state,
                timeReference: action.payload.timeReference
            };
        }
        case TimeActionTypes.FailToUpdateTimeReference:{
            return {
                ...state,
                error: action.payload.error
            };
        }

        default:{
            return state;
        }

    }
}
