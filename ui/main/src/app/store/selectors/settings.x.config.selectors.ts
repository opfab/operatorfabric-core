

import {AppState} from "@ofStore/index";
import * as _ from 'lodash';

export function buildSettingsOrConfigSelector(path:string,fallback:any = null){
    return (state:AppState) => {
        const settings = state.settings.settings;
        const config = state.config.config;
        let result = _.get(settings,path,null);
        if(result == null){
            result = _.get(config,`settings.${path}`,null);
        }
        if(result == null && fallback)
            return fallback
        return result;
    }
}
