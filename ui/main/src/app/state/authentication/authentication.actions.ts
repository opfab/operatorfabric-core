/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Action} from '@ngrx/store';

export enum AuthenticationActionTypes {
    CheckAuthenticationStatus = '[Authentication] Check Authentication Status',
    ConfirmAuthentication = '[Authentication] Confirm that the user is already authenticated',
    AskForLogIn = '[Authentication] Ask user to Log In',
    LogIn = '[Authentication] Log in a user',
    AcceptLogIn = '[Authentication] Accept the user log in attempt',
    RejectLogIn = '[Authentication] Reject the user log in attempt',
    LogOut = '[Authentication] Log the user Out',
    TempAutomaticLogIn = '[Authentication] Temp Automatic Log In'
}

export class PayloadForSuccessfullAuthentication {
    constructor(public identifier: string, public token: string, public expirationDate: Date) {
    }
}

export class TempAutomticLogIn {
    readonly type = AuthenticationActionTypes.TempAutomaticLogIn;
}

export class CheckAuthenticationStatus implements Action {
    readonly type = AuthenticationActionTypes.CheckAuthenticationStatus;
}

export class ConfirmAuthentication implements Action {
    readonly type = AuthenticationActionTypes.ConfirmAuthentication;

    constructor(public payload: PayloadForSuccessfullAuthentication) {
    }

}

export class LogIn implements Action {
    readonly type = AuthenticationActionTypes.LogIn;

    constructor(public payload: PayloadForSuccessfullAuthentication) {
    }
}

export class AskForLogIn implements Action {
    readonly type = AuthenticationActionTypes.AskForLogIn;
}

export class AcceptLogIn implements Action {
    readonly type = AuthenticationActionTypes.AcceptLogIn;

    constructor(public payload: PayloadForSuccessfullAuthentication) {
    }
}

export class RejectLogin implements Action {
    readonly type = AuthenticationActionTypes.RejectLogIn;

    constructor(public payload: { denialReason: string }) {
    }
}

export class LogOut implements Action {
    readonly type = AuthenticationActionTypes.LogOut;
}

export type AuthenticationActions =
    CheckAuthenticationStatus
    | ConfirmAuthentication
    | LogIn
    | AskForLogIn
    | AcceptLogIn
    | RejectLogin
    | LogOut
    | TempAutomticLogIn
    ;
