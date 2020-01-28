
import {AppState} from "@ofStore/index";
import * as _ from 'lodash';

export const selectMergedSettings =  (state:AppState) =>{
    const settings = state.settings.settings;
    const configSettings = _.get(state,`config.config.settings`,{});
    return _.merge(configSettings,settings);
};

export function buildSettingsOrConfigSelector(path:string,fallback:any = null){
    return (state:AppState) => {
        const settings = state.settings.settings;
        const config = state.config.config;
        let result = _.get(settings,path,null);
        if(!result){
            result = _.get(config,`settings.${path}`,null);
        }
        if(!result && fallback)
            return fallback
        return result;
    }
}