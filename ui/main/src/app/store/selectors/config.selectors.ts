/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {AppState} from "@ofStore/index";
import {createSelector} from "@ngrx/store";
import {CONFIG_LOAD_MAX_RETRIES, ConfigState} from "@ofStates/config.state";
import * as _ from 'lodash';

export const selectConfig = (state:AppState) => state.config;
export const selectConfigLoaded =  createSelector(selectConfig, (configState:ConfigState)=> configState.loaded)
export const selectConfigRetry =  createSelector(selectConfig, (configState:ConfigState)=> configState.retry)
export const selectMaxedRetries =  createSelector(selectConfigRetry, (retries:number)=> retries >= CONFIG_LOAD_MAX_RETRIES)

export const selectConfigData =  createSelector(selectConfig, (configState:ConfigState)=> configState.config)

export function buildConfigSelector(path:string){
    return createSelector(selectConfigData,(config)=>_.get(config,path,{}));
}

