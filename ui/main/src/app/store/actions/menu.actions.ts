/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Action} from '@ngrx/store';
import {Menu} from '@ofModel/menu.model';

export enum MenuActionTypes {
    LoadMenu = '[Menu] Load Menu',
    LoadMenuSuccess = '[Menu] Load Menu Success'
}

export class LoadMenu implements Action {
    readonly type = MenuActionTypes.LoadMenu;
}

export class LoadMenuSuccess implements Action {
    readonly type = MenuActionTypes.LoadMenuSuccess;
    constructor(public payload: { menu: Menu[] }) {
    }
}

export type MenuActions =
    LoadMenu
    | LoadMenuSuccess;
