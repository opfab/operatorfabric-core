/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {Action} from '@ngrx/store';

export enum SettingsActionTypes {
    LoadSettings = '[Settings] Load Settings',
    LoadSettingsSuccess = '[Settings] Load Settings Success',
    LoadSettingsFailure = '[Settings] Load Settings Fail',

    PatchSettings = '[Settings] Patch Settings',
    PatchSettingsSuccess = '[Settings] Patch Settings Success',
    PatchSettingsFailure = '[Settings] Patch Settings Fail',

    HandleUnexpectedError = '[Settings] Handle unexpected error related to user settings issue'
}
// needed by NGRX entities

export class LoadSettings implements Action {
    readonly type = SettingsActionTypes.LoadSettings;
}
export class LoadSettingsFailure implements Action {
    readonly type = SettingsActionTypes.LoadSettingsFailure;

    /* istanbul ignore next */
    constructor(public payload: { error: Error }) {
    }
}

export class LoadSettingsSuccess implements Action {
    readonly type = SettingsActionTypes.LoadSettingsSuccess;

    /* istanbul ignore next */
    constructor(public payload: { settings: any }) {
    }
}

export class PatchSettings implements Action {
    readonly type = SettingsActionTypes.PatchSettings;
    constructor(public payload: {settings:any}){}
}
export class PatchSettingsFailure implements Action {
    readonly type = SettingsActionTypes.PatchSettingsFailure;

    /* istanbul ignore next */
    constructor(public payload: { error: Error }) {
    }
}

export class PatchSettingsSuccess implements Action {
    readonly type = SettingsActionTypes.PatchSettingsSuccess;

    /* istanbul ignore next */
    constructor(public payload: { settings: any }) {
    }
}

export class HandleUnexpectedError implements Action {
    /* istanbul ignore next */
    readonly type = SettingsActionTypes.HandleUnexpectedError;
    /* istanbul ignore next */
    constructor(public payload: {error: Error}) {

    }
}

export type SettingsActions =
    LoadSettings
    | LoadSettingsSuccess
    | LoadSettingsFailure
    | PatchSettings
    | PatchSettingsSuccess
    | PatchSettingsFailure
    | HandleUnexpectedError;
