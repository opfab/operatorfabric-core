/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {configInitialState, ConfigState} from "@ofStates/config.state";
import {ConfigActions, ConfigActionTypes} from "@ofActions/config.actions";

export function reducer(
    state = configInitialState,
    action: ConfigActions
): ConfigState {
    switch (action.type) {
        case ConfigActionTypes.LoadConfig: {
            return {
                ...state,
                loading: true
            };
        }
        case ConfigActionTypes.LoadConfigSuccess: {
            return {
                ...state,
                config: action.payload.config,
                loading: false
            };
        }

        case ConfigActionTypes.LoadConfigFailure: {
            return {
                ...state,
                loading: false,
                error: `error while loading a Config: '${action.payload.error}'`
            };
        }
        default: {
            return state;
        }
    }
}