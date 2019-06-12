/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Action} from '@ngrx/store';
import {ThirdMenu} from "@ofModel/thirds.model";

export enum MenuActionTypes {
    LoadMenu = '[Menu] Load Menu',
    LoadMenuSuccess = '[Menu] Load Menu Success',
    LoadMenuFailure = '[Menu] Load Menu Fail',
    HandleUnexpectedError = '[Menu] Handle unexpected error',
    SelectMenuLink = '[Menu] Select Menu Link',
    SelectMenuLinkSuccess = '[Menu] Select Menu Link Success',
    SelectMenuLinkFailure = '[Menu] Select Menu Link Failure',
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

/**
 * Action used to update the state with the selected menu
 */
//TODO Describe usage (cf authentication example)
export class SelectMenuLink implements Action {
    readonly type = MenuActionTypes.SelectMenuLink;

    /* istanbul ignore next */
    constructor(public payload: {menu_id: string, menu_version: string, menu_entry_id: string}) {}
}

export class SelectMenuLinkSuccess implements Action {
    readonly type = MenuActionTypes.SelectMenuLinkSuccess;

    /* istanbul ignore next */
    constructor(public payload: {iframe_url: string}) {}
}

export class SelectMenuLinkFailure implements Action {
    readonly type = MenuActionTypes.SelectMenuLinkFailure;

    /* istanbul ignore next */
    constructor(public payload: { error: Error }) {
    }
}

export type MenuActions =
    LoadMenu
    | LoadMenuSuccess
    | LoadMenuFailure
    | HandleUnexpectedError
    | SelectMenuLink
    | SelectMenuLinkSuccess
    | SelectMenuLinkFailure;
