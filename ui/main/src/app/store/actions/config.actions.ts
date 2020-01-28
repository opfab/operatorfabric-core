/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {Action} from '@ngrx/store';

export enum ConfigActionTypes {
    LoadConfig = '[Config] Load Config',
    LoadConfigSuccess = '[Config] Load Config Success',
    LoadConfigFailure = '[Config] Load Config Fail',
    HandleUnexpectedError = '[Config] Handle unexpected error related to configuration issue'
}
// needed by NGRX entities
export class LoadConfig implements Action {
    readonly type = ConfigActionTypes.LoadConfig;
}
export class LoadConfigFailure implements Action {
    readonly type = ConfigActionTypes.LoadConfigFailure;

    /* istanbul ignore next */
    constructor(public payload: { error: Error }) {
    }
}

export class LoadConfigSuccess implements Action {
    readonly type = ConfigActionTypes.LoadConfigSuccess;

    /* istanbul ignore next */
    constructor(public payload: { config: any }) {
    }
}

export class HandleUnexpectedError implements Action {
    /* istanbul ignore next */
    readonly type = ConfigActionTypes.HandleUnexpectedError;
    /* istanbul ignore next */
    constructor(public payload: {error: Error}) {

    }
}

export type ConfigActions =
    LoadConfig
    | LoadConfigSuccess
    | LoadConfigFailure
    | HandleUnexpectedError;
