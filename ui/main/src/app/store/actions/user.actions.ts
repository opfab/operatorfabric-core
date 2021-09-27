/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {User} from '@ofModel/user.model';
import {Action} from '@ngrx/store';
import {Entity} from '@ofModel/entity.model';

export enum UserActionsTypes {

    UserApplicationRegistered =         '[User] User application registered',
    QueryAllEntities =                  '[User] Ask to fetch all entities',
    LoadAllEntities =                   '[User] Load all entities',
    UserConfigChange =                  '[User] User config changed'
}

export class UserApplicationRegistered implements Action {
    readonly type = UserActionsTypes.UserApplicationRegistered;
    constructor(public payload: { user: User }) {
    }
}

export class QueryAllEntities implements Action {
    readonly type = UserActionsTypes.QueryAllEntities;
}

export class LoadAllEntities implements Action {
    readonly type = UserActionsTypes.LoadAllEntities;
    constructor(public payload: { entities: Entity[] }) {
    }
}

export class UserConfigChangeAction implements Action {
    readonly type = UserActionsTypes.UserConfigChange;
}

export type UserActions = UserApplicationRegistered
    | QueryAllEntities
    | LoadAllEntities
    | UserConfigChangeAction;

