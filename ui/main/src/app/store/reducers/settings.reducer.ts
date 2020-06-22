/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
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
        case SettingsActionTypes.LoadSettings: {
            return {
                ...state,
                loading: true
            };
        }
        case SettingsActionTypes.LoadSettingsSuccess: {
            return {
                ...state,
                settings: action.payload.settings,
                loading: false,
                loaded: true,
            };
        }

        case SettingsActionTypes.LoadSettingsFailure: {
            return {
                ...state,
                loading: false,
                error: `error while loading settings: '${action.payload.error}'`,
            };
        }

        case SettingsActionTypes.PatchSettings : {
            return {
                ...state,
                loading: true
            }
        }

        case SettingsActionTypes.PatchSettingsSuccess : {
            return {
                ...state,
                settings: action.payload.settings,
                loading: false,
                loaded: true,
            }
        }

        case SettingsActionTypes.PatchSettingsFailure : {
            return {
                ...state,
                loading: false,
                error: `error while patching settings: '${action.payload.error}'`,
            }
        }

        case SettingsActionTypes.HandleUnexpectedError: {
            return {
                ...state,
                error: action.payload.error.message
            }
        }

        default: {
            return state;
        }
    }
}
