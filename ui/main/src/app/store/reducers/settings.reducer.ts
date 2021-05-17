/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {settingsInitialState, SettingsState} from "@ofStates/settings.state";
import {SettingsActions, SettingsActionTypes} from "@ofActions/settings.actions";

export function reducer(
    state = settingsInitialState,
    action: SettingsActions
): SettingsState {
    switch (action.type) {
        case SettingsActionTypes.LoadSettingsSuccess: {
            return {
                ...state,
                settings: action.payload.settings,
                loaded: true,
            };
        }

        case SettingsActionTypes.PatchSettingsSuccess : {
            return {
                ...state,
                settings: action.payload.settings,
                loaded: true,
            }
        }

        default: {
            return state;
        }
    }
}
