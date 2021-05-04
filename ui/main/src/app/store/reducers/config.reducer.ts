/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {configInitialState, ConfigState} from "@ofStates/config.state";
import {ConfigActions, ConfigActionTypes} from "@ofActions/config.actions";

export function reducer(
    state = configInitialState,
    action: ConfigActions
): ConfigState {
    switch (action.type) {
        case ConfigActionTypes.LoadConfigSuccess: {
            return {
                ...state,
                config: action.payload.config
            };
        }
        default: {
            return state;
        }
    }
}
