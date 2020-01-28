
import {AppState} from "@ofStore/index";
import {createSelector} from "@ngrx/store";
import {CONFIG_LOAD_MAX_RETRIES, ConfigState} from "@ofStates/config.state";
import * as _ from 'lodash';

export const selectConfig = (state:AppState) => state.config;
export const selectConfigLoaded =  createSelector(selectConfig, (configState:ConfigState)=> configState.loaded)
export const selectConfigRetry =  createSelector(selectConfig, (configState:ConfigState)=> configState.retry)
export const selectMaxedRetries =  createSelector(selectConfigRetry, (retries:number)=> retries >= CONFIG_LOAD_MAX_RETRIES)

export const selectConfigData =  createSelector(selectConfig, (configState:ConfigState)=> configState.config)

export function buildConfigSelector(path:string, fallback: string = null){
    return createSelector(selectConfigData,(config)=>{
        let result = _.get(config,path,null);
        if(!result && fallback)
            return fallback;
        return result;
    });
}

