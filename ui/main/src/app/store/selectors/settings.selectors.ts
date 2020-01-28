/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {AppState} from "@ofStore/index";
import {createSelector} from "@ngrx/store";
import {SettingsState} from "@ofStates/settings.state";
import * as _ from 'lodash';

export const selectSettings = (state:AppState) => state.settings;
export const selectSettingsLoaded =  createSelector(selectSettings, (settingsState:SettingsState)=> settingsState.loaded)

export const selectSettingsData =  createSelector(selectSettings, (settingsState:SettingsState)=> settingsState.settings)

export function buildSettingsSelector(path:string, fallback: any = null){
    return createSelector(selectSettingsData,(settings)=>{
        let result = _.get(settings,path,null);
        if(!result && fallback)
            return fallback;
        return result;
    });
}