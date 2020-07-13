/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {Action} from '@ngrx/store';

export enum ConfigActionTypes {
    LoadConfigSuccess = '[Config] Load Config Success'
}
// needed by NGRX entities

export class LoadConfigSuccess implements Action {
    readonly type = ConfigActionTypes.LoadConfigSuccess;

    /* istanbul ignore next */
    constructor(public payload: { config: any }) {
    }
}


export type ConfigActions = LoadConfigSuccess;
