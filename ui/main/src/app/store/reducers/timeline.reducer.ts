/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
