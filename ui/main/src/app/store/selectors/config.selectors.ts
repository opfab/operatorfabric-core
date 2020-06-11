/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
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

export function buildConfigSelector(path:string, fallback: string = null){
    return createSelector(selectConfigData,(config)=>{
        let result = _.get(config,path,null);
        if(!result && fallback)
            return fallback;
        return result;
    });
}

