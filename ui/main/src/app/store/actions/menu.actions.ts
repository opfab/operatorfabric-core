/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {Action} from '@ngrx/store';
import {ThirdMenu} from "@ofModel/thirds.model";

export enum MenuActionTypes {
    LoadMenu = '[Menu] Load Menu',
    LoadMenuSuccess = '[Menu] Load Menu Success',
    LoadMenuFailure = '[Menu] Load Menu Fail',
    HandleUnexpectedError = '[Menu] Handle unexpected error',
 
}
// needed by NGRX entities
export class LoadMenu implements Action {
    readonly type = MenuActionTypes.LoadMenu;

    /* istanbul ignore next */
    constructor() {
    }
}
export class LoadMenuFailure implements Action {
    readonly type = MenuActionTypes.LoadMenuFailure;

    /* istanbul ignore next */
    constructor(public payload: { error: Error }) {
    }
}

export class LoadMenuSuccess implements Action {
    readonly type = MenuActionTypes.LoadMenuSuccess;

    /* istanbul ignore next */
    constructor(public payload: { menu: ThirdMenu[] }) {
    }
}

export class HandleUnexpectedError implements Action {
    readonly type = MenuActionTypes.HandleUnexpectedError;

    /* istanbul ignore next */
    constructor(public payload: {error: Error}) {

    }
}



export type MenuActions =
    LoadMenu
    | LoadMenuSuccess
    | LoadMenuFailure
    | HandleUnexpectedError;
