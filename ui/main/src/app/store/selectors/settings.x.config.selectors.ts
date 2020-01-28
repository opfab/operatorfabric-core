/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


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