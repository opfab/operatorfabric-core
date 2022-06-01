/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Action} from '@ngrx/store';
import {Guid} from 'guid-typescript';
import {Message} from '@ofModel/message.model';

export enum AuthenticationActionTypes {
    InitAuthStatus = '[Authentication] Init Authentication Status',
    CheckAuthenticationStatus = '[Authentication] Check Authentication Status',
    AcceptLogIn = '[Authentication] Accept the user log in attempt',
    RejectLogIn = '[Authentication] Reject the user log in attempt',
    TryToLogIn = '[Authentication] Try to log the user in',
    TryToLogOut = '[Authentication] Try to log the user out',
    AcceptLogOut = '[Authentication] Accept the user log out attempt',
    AcceptLogOutSuccess = '[Authentication] Success Accept the user log out attempt',
    CheckImplicitFlowAuthenticationStatus = '[Authentication] Check Authentication Status specifically for the Implicit Flow',
    ImplicitlyAuthenticated = '[Authentication] User is authentication using Implicit Flow',
    UnAuthenticationFromImplicitFlow = '[Authentication] User is log out by implicit Flow internal management',
    SessionExpired = '[Authentication] The token can not be refresh or is expired'
}

export class PayloadForSuccessfulAuthentication {
    constructor(
        public identifier: string,
        public clientId: Guid,
        public token: string,
        public expirationDate: Date,
        public firstName?: string,
        public lastName?: string
    ) {}
}

export class InitAuthStatusAction implements Action {
    readonly type = AuthenticationActionTypes.InitAuthStatus;
    constructor(public payload: {code: string}) {}
}

export class CheckAuthenticationStatusAction implements Action {
    readonly type = AuthenticationActionTypes.CheckAuthenticationStatus;
}

export class AcceptLogInAction implements Action {
    readonly type = AuthenticationActionTypes.AcceptLogIn;
    constructor(public payload: PayloadForSuccessfulAuthentication) {}
}

export class TryToLogInAction implements Action {
    readonly type = AuthenticationActionTypes.TryToLogIn;
    constructor(public payload: {username: string; password: string}) {}
}

export class TryToLogOutAction implements Action {
    readonly type = AuthenticationActionTypes.TryToLogOut;
}

export class RejectLogInAction implements Action {
    readonly type = AuthenticationActionTypes.RejectLogIn;
    constructor(public payload: {error: Message}) {}
}

export class AcceptLogOutAction implements Action {
    readonly type = AuthenticationActionTypes.AcceptLogOut;
}

export class AcceptLogOutSuccessAction implements Action {
    readonly type = AuthenticationActionTypes.AcceptLogOutSuccess;
}

export class ImplicitlyAuthenticatedAction implements Action {
    readonly type = AuthenticationActionTypes.ImplicitlyAuthenticated;
}

export class UnAuthenticationFromImplicitFlowAction implements Action {
    readonly type = AuthenticationActionTypes.UnAuthenticationFromImplicitFlow;
}

export class SessionExpiredAction implements Action {
    readonly type = AuthenticationActionTypes.SessionExpired;
}

export type AuthenticationActions =
    | InitAuthStatusAction
    | AcceptLogInAction
    | RejectLogInAction
    | TryToLogInAction
    | TryToLogOutAction
    | CheckAuthenticationStatusAction
    | AcceptLogOutAction
    | AcceptLogOutSuccessAction
    | ImplicitlyAuthenticatedAction
    | UnAuthenticationFromImplicitFlowAction
    | SessionExpiredAction;
