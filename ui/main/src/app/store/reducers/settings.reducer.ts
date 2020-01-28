
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