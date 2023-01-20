/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {User} from '@ofModel/user.model';
import {Action} from '@ngrx/store';

export enum UserActionsTypes {
    UserApplicationRegistered = '[User] User application registered',
    UserConfigChange = '[User] User config changed',
    UserConfigLoaded = '[User] User config loaded'
}
export class UserApplicationRegisteredAction implements Action {
    readonly type = UserActionsTypes.UserApplicationRegistered;
    constructor(public payload: {user: User}) {}
}

export class UserConfigChangeAction implements Action {
    readonly type = UserActionsTypes.UserConfigChange;
}

export class UserConfigLoadedAction implements Action {
    readonly type = UserActionsTypes.UserConfigLoaded;
}

export type UserActions =
    | UserApplicationRegisteredAction
    | UserConfigChangeAction
    | UserConfigLoadedAction;
