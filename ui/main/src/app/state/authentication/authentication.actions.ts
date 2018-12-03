/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Action} from '@ngrx/store';

export enum AuthenticationActionTypes {
    CheckAuthenticationStatus = '[Authentication] Check Authentication Status',
    AcceptAuthenticationStatus = '[Authentication] Accept user as Authenticated',
    RejectAuthenticationStatus = '[Authentication] Reject user as Authenticated',
    AbortCheckAuthenticationStatus = '[Authentication] An error arise during check of Authentication Status',
    AcceptLogIn = '[Authentication] Accept the user log in attempt',
    RejectLogIn = '[Authentication] Reject the user log in attempt',
    TryToLogIn = '[Authentication] Try to log the user in',
    AbortLogIn = '[Authentication] An error arise during log in attempt',
    TryToLogOut = '[Authentication] Try to log the user out',
    AcceptLogOut = '[Authentication] Accept the user log out attempt',
    AbortLogOut = '[Authentication] An error arise during log out attempt',
    TempAutomaticLogIn = '[Authentication] Temp Automatic Log In'
}

export class PayloadForSuccessfulAuthentication {
    constructor(public identifier: string, public token: string, public expirationDate: Date) {
    }
}

export class TempAutomaticLogIn implements Action{
    readonly type = AuthenticationActionTypes.TempAutomaticLogIn;
}

export class AcceptLogIn implements Action {
    readonly type = AuthenticationActionTypes.AcceptLogIn;

    constructor(public payload: PayloadForSuccessfulAuthentication) {
    }
}

export class TryToLogIn implements Action {
    readonly type= AuthenticationActionTypes.TryToLogIn;
}

export class TryToLogOut implements Action {
    readonly type = AuthenticationActionTypes.TryToLogOut;
}

export class AbortLogIn implements Action {
    readonly type = AuthenticationActionTypes.AbortLogIn;
}
// ??? necessary ???
export class AbortLogOut implements Action {
    readonly type = AuthenticationActionTypes.AbortLogOut;
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
}

export class AcceptAuthenticatedStatus implements Action {
    readonly  type = AuthenticationActionTypes.AcceptAuthenticationStatus;
}

export class RejectAuthenticatedStatus implements Action {
    readonly  type = AuthenticationActionTypes.RejectAuthenticationStatus;
}

export class AbortAuthenticationStatusCheck implements Action {
    readonly  type = AuthenticationActionTypes.AbortCheckAuthenticationStatus;
}

export type AuthenticationActions =
     AcceptLogIn
    | RejectLogIn
    | TempAutomaticLogIn
    | TryToLogIn
    | TryToLogOut
    | AbortLogIn
    | AbortLogOut
    | CheckAuthenticationStatus
    | AcceptLogOut
    | AcceptAuthenticatedStatus
    | RejectAuthenticatedStatus
    | AbortAuthenticationStatusCheck;
