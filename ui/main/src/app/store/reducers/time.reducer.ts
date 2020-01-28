/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
