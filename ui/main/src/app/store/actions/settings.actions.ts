/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
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
    PatchSettings = '[Settings] Patch Settings',
    PatchSettingsSuccess = '[Settings] Patch Settings Success'
}


export class LoadSettings implements Action {
    readonly type = SettingsActionTypes.LoadSettings;
}
export class LoadSettingsSuccess implements Action {
    readonly type = SettingsActionTypes.LoadSettingsSuccess;
    constructor(public payload: { settings: any }) {
    }
}

export class PatchSettings implements Action {
    readonly type = SettingsActionTypes.PatchSettings;
    constructor(public payload: {settings:any}){}
}
export class PatchSettingsSuccess implements Action {
    readonly type = SettingsActionTypes.PatchSettingsSuccess;

    constructor(public payload: { settings: any }) {
    }
}


export type SettingsActions =
    LoadSettings
    | LoadSettingsSuccess
    | PatchSettings
    | PatchSettingsSuccess
