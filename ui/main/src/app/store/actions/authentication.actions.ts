/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Action} from '@ngrx/store';
import {Guid} from 'guid-typescript';
import {Message} from "@ofModel/message.model";

export enum AuthenticationActionTypes {
    InitAuthStatus = '[Authentication] Init Authentication Status',
    CheckAuthenticationStatus = '[Authentication] Check Authentication Status',
    AcceptLogIn = '[Authentication] Accept the user log in attempt',
    RejectLogIn = '[Authentication] Reject the user log in attempt',
    TryToLogIn = '[Authentication] Try to log the user in',
    TryToLogOut = '[Authentication] Try to log the user out',
    AcceptLogOut = '[Authentication] Accept the user log out attempt',
    AcceptLogOutSuccess = '[Authentication] Success Accept the user log out attempt',
}

/**
 * Authentication success payload
 */
export class PayloadForSuccessfulAuthentication {
    constructor(public identifier: string,
                public clientId: Guid,
                public token: string,
                public expirationDate: Date) {
    }
}

/**
 * It aims to validate the current authentication if exists.
 *
 */
export class InitAuthStatus implements Action {
    readonly type = AuthenticationActionTypes.InitAuthStatus;
    /* istanbul ignore next */
    constructor(public payload:{code: string}){}
}

/**
 * It aims to validate the current authentication if exists.
 *
 */
export class CheckAuthenticationStatus implements Action {
    /* istanbul ignore next */
    readonly type = AuthenticationActionTypes.CheckAuthenticationStatus;
}

/**
 * Action used to update the state with the authentication information
 *
 * Emitted by {AuthenticationEffects} in the following {Observable} @members:
 *  * TryToLogIn
 *  * CheckAuthentication via handleLogInAttempt @method
 *
 * Used in the {function} reducer of the {authentication.reducer.ts} file to create a new state
 * containing the authentication information by filtering on the {AuthenticationActionTypes.AcceptLogIn} type.
 *
 */
export class AcceptLogIn implements Action {
    readonly type = AuthenticationActionTypes.AcceptLogIn;

    /* istanbul ignore next */
    constructor(public payload: PayloadForSuccessfulAuthentication) {}
}

/**
 * Action used to push login/password pair to the authentication service
 *
 * Emitted by {LoginComponent} in the onSubmit @method which is called
 * when the user click on the `Login` button of the login page form.
 */
export class TryToLogIn implements Action {
    readonly type= AuthenticationActionTypes.TryToLogIn;

    /* istanbul ignore next */
    constructor(public payload: {username: string, password: string}){}
}

/**
 * Action used when the user logout
 *
 * Emitted by {NavbarComponent} win the logOut @method which is called
 * when the user click on the `logOut` button of the `navbar`
 */
export class TryToLogOut implements Action {
    /* istanbul ignore next */
    readonly type = AuthenticationActionTypes.TryToLogOut;
}

/**
 * Action used to notify the store that the authentication is not possible.
 *
 * Emmited by {AuthenticationEffect} in the following {Observable} @members:
 *  * `TryToLogin`;
 *  *  `CheckAuthentication`
 *  and in the `handleRejectedLogin` @method called by the `ChecAuthentication` {Observable}
 *
 * Used in the {function} reducer of the {authentication.reducer.ts} file to create a new state
 * without any authentication information and containing a message about login rejection
 * by filtering on the {AuthenticationActionTypes.RejectLogIn} type.
 *
 */
export class RejectLogIn implements Action {
    readonly type = AuthenticationActionTypes.RejectLogIn;

    /* istanbul ignore next */
    constructor(public payload: { error: Message }) {}
}

/**
 * Action used to removes authentication information of the system and thus logOut the user.
 *
 * Emitted by {AuthenticationEffect} in the following {Observable} @members:
 *  * `TryToLogOut`
 *  * `RejectLogInAttempt`
 *
 *  Consume by {AuthenticationEffect} in the `AcceptLogOut` {Observable} @member
 *
 */
export class AcceptLogOut implements Action {
    readonly type = AuthenticationActionTypes.AcceptLogOut;

    /* istanbul ignore next */
    constructor(){}
}

/**
 * Action used to notify the store to remove authentication information
 *
 * Emitted by {AuthenticationEffect} in `AcceptLogOut` {Observable} @member.
 *
 * Used in the {function} reducer of the {authentication.reducer.ts} file to create a new state
 * without any authentication information by filtering on the {AuthenticationActionTypes.AcceptLogOut} type.
 */
export class AcceptLogOutSuccess implements Action {
    /* istanbul ignore next */
    readonly type = AuthenticationActionTypes.AcceptLogOutSuccess;
}

export type AuthenticationActions =
    InitAuthStatus
    | AcceptLogIn
    | RejectLogIn
    | TryToLogIn
    | TryToLogOut
    | CheckAuthenticationStatus
    | AcceptLogOut
    | AcceptLogOutSuccess;
