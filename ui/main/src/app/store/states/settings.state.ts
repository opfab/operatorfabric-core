
export interface SettingsState{
    settings:any,
    loading: boolean,
    loaded: boolean,
    error: string
}

export const settingsInitialState: SettingsState = {
    settings:{},
    loading: false,
    loaded: false,
    error: null
}