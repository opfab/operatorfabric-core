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
    CreateUserApplication =             '[User] Create the User in the application',
    CreateUserApplicationOnSuccess =    '[User] Create the User in the application on success',
    CreateUserApplicationOnFailure =    '[User] Create the User in the application on failure',
    HandleUnexpectedError =             '[User] Handle unexpected error related to user creation issue',
    QueryAllEntities =                  '[User] Ask to fetch all entities',
    LoadAllEntities =                   '[User] Load all entities'
}

export class UserApplicationRegistered implements Action {
    /* istanbul ignore next */
    readonly type = UserActionsTypes.UserApplicationRegistered;

    constructor(public payload: { user: User }) {
    }
}

export class CreateUserApplication implements Action {
    /* istanbul ignore next */
    readonly type = UserActionsTypes.CreateUserApplication;

    constructor(public payload: { user: User }) {
    }
}


export class CreateUserApplicationOnSuccess implements Action {
    /* istanbul ignore next */
    readonly type = UserActionsTypes.CreateUserApplicationOnSuccess;

    constructor(public payload: { user: User }) {
    }
}

export class CreateUserApplicationOnFailure implements Action {
    /* istanbul ignore next */
    readonly type = UserActionsTypes.CreateUserApplicationOnFailure;

    constructor(public payload: { error: Error }) {
    }
}

export class HandleUnexpectedError implements Action {
    /* istanbul ignore next */
    readonly type = UserActionsTypes.HandleUnexpectedError;

    constructor(public payload: { error: Error }) {
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

export type UserActions = UserApplicationRegistered
    | CreateUserApplication
    | CreateUserApplicationOnSuccess
    | CreateUserApplicationOnFailure
    | HandleUnexpectedError
    | QueryAllEntities
    | LoadAllEntities;

