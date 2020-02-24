/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {Action} from '@ngrx/store';
import {Guid} from 'guid-typescript';
import {Message} from "@ofModel/message.model";

export enum AuthenticationActionTypes {
    InitAuthStatus = '[Authentication] Init Authentication Status'
    ,CheckAuthenticationStatus = '[Authentication] Check Authentication Status'
    ,AcceptLogIn = '[Authentication] Accept the user log in attempt'
    ,RejectLogIn = '[Authentication] Reject the user log in attempt'
    ,TryToLogIn = '[Authentication] Try to log the user in'
    ,TryToLogOut = '[Authentication] Try to log the user out'
    ,AcceptLogOut = '[Authentication] Accept the user log out attempt'
    ,AcceptLogOutSuccess = '[Authentication] Success Accept the user log out attempt'
    ,CheckImplicitFlowAuthenticationStatus = '[Authentication] Check Authentication Status specifically for the Implicit Flow'
    ,UselessAuthAction = '[Authentication] Test purpose action'
    // TODO the following actions should be merge with password and code flow management of authentication
    ,ImplicitallyAuthenticated = '[Authentication] User is authentication using Implicit Flow' 
    ,UnAuthenticationFromImplicitFlow = '[Authentication] User is log out by implicit Flow internal managment'
    ,UnableToRefreshOrGetToken = '[Authentication] The token can not be refresh or we cannot get a token'
}

/**
 * Authentication success payload
 */
export class PayloadForSuccessfulAuthentication {
    constructor(public identifier: string,
                public clientId: Guid,
                public token: string,
                public expirationDate: Date,
                public firstName?:string,
                public lastName?:string) {
    }
}

/**
 * It aims to validate the current authentication if exists.
 *
 */
export class InitAuthStatus implements Action {
    /* istanbul ignore next */
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
 */
export class AcceptLogIn implements Action {
    /* istanbul ignore next */
    readonly type = AuthenticationActionTypes.AcceptLogIn;

    /* istanbul ignore next */
    constructor(public payload: PayloadForSuccessfulAuthentication) {}
}

/**
 * Action used to push login/password pair to the authentication service
 *
 */
export class TryToLogIn implements Action {
    /* istanbul ignore next */
    readonly type= AuthenticationActionTypes.TryToLogIn;

    /* istanbul ignore next */
    constructor(public payload: {username: string, password: string}){}
}

/**
 * Action used when the user logout`
 */
export class TryToLogOut implements Action {
    /* istanbul ignore next */
    readonly type = AuthenticationActionTypes.TryToLogOut;
}

/**
 * Action used to notify the store that the authentication is not possible.
 *
 */
export class RejectLogIn implements Action {
    /* istanbul ignore next */
    readonly type = AuthenticationActionTypes.RejectLogIn;

    /* istanbul ignore next */
    constructor(public payload: { error: Message }) {}
}

/**
 * Action used to removes authentication information of the system and thus logOut the user.
 *
 */
export class AcceptLogOut implements Action {
    /* istanbul ignore next */
    readonly type = AuthenticationActionTypes.AcceptLogOut;
     
    /* istanbul ignore next */
     constructor(){}
}

/**
 * Action used to notify the store to remove authentication information
 *
 */
export class AcceptLogOutSuccess implements Action {
    /* istanbul ignore next */
    readonly type = AuthenticationActionTypes.AcceptLogOutSuccess;
}

export class CheckImplicitFlowAuthenticationStatus implements Action {
    /* istanbul ignore next */
    readonly type = AuthenticationActionTypes.CheckImplicitFlowAuthenticationStatus;
}

export class UselessAuthAction implements  Action{
    /* istanbul ignore next */
    readonly type = AuthenticationActionTypes.UselessAuthAction;

}

export class ImplicitlyAuthenticated implements Action {
    /* istanbul ignore next */
    readonly type = AuthenticationActionTypes.ImplicitallyAuthenticated;
}

export class UnAuthenticationFromImplicitFlow implements Action {
    /* istanbul ignore next */
    readonly type = AuthenticationActionTypes.UnAuthenticationFromImplicitFlow;
}

export class UnableToRefreshOrGetToken implements Action {
    /* istanbul ignore next */
    readonly type = AuthenticationActionTypes.UnableToRefreshOrGetToken;

}

export type AuthenticationActions =
    InitAuthStatus
    | AcceptLogIn
    | RejectLogIn
    | TryToLogIn
    | TryToLogOut
    | CheckAuthenticationStatus
    | AcceptLogOut
    | AcceptLogOutSuccess
    | CheckImplicitFlowAuthenticationStatus
    | UselessAuthAction
    | ImplicitlyAuthenticated
    | UnAuthenticationFromImplicitFlow
    | UnableToRefreshOrGetToken;
