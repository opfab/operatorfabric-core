
export const CONFIG_LOAD_MAX_RETRIES = 5;

export interface ConfigState{
    config:any,
    loading: boolean,
    loaded: boolean,
    error: string,
    retry: number
}

export const configInitialState: ConfigState = {
    config:{},
    loading: false,
    loaded: false,
    error: null,
    retry: 0
}