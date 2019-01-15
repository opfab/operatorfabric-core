/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Action} from '@ngrx/store';
import {Guid} from 'guid-typescript';

export enum AuthenticationActionTypes {
    CheckAuthenticationStatus = '[Authentication] Check Authentication Status',
    AcceptLogIn = '[Authentication] Accept the user log in attempt',
    RejectLogIn = '[Authentication] Reject the user log in attempt',
    TryToLogIn = '[Authentication] Try to log the user in',
    TryToLogOut = '[Authentication] Try to log the user out',
    AcceptLogOut = '[Authentication] Accept the user log out attempt',
    AcceptLogOutSuccess = '[Authentication] Success Accept the user log out attempt',
}

export class PayloadForSuccessfulAuthentication {
    constructor(public identifier: string,
                public clientId: Guid,
                public token: string,
                public expirationDate: Date) {
    }
}

export class AcceptLogIn implements Action {
    readonly type = AuthenticationActionTypes.AcceptLogIn;

    constructor(public payload: PayloadForSuccessfulAuthentication) {
    }
}

export class TryToLogIn implements Action {
    readonly type= AuthenticationActionTypes.TryToLogIn;
    constructor(public payload: {username: string, password: string}){}
}

export class TryToLogOut implements Action {
    readonly type = AuthenticationActionTypes.TryToLogOut;
}

export class RejectLogIn implements Action {
    readonly type = AuthenticationActionTypes.RejectLogIn;

    constructor(public payload: { denialReason: string }) {
    }
}

export class CheckAuthenticationStatus implements Action {
    readonly type = AuthenticationActionTypes.CheckAuthenticationStatus;
}

export class AcceptLogOut implements Action {
    readonly type = AuthenticationActionTypes.AcceptLogOut;
    constructor(public payload: {count: number}){}
}

export class AcceptLogOutSuccess implements Action {
    readonly type = AuthenticationActionTypes.AcceptLogOutSuccess;
}

export type AuthenticationActions =
     AcceptLogIn
    | RejectLogIn
    | TryToLogIn
    | TryToLogOut
    | CheckAuthenticationStatus
    | AcceptLogOut
    | AcceptLogOutSuccess;
