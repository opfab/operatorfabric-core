/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Action} from '@ngrx/store';

export enum AuthenticationActionTypes {
    CheckAuthenticationStatus = '[Authentication] Check Authentication Status',
    AcceptLogIn = '[Authentication] Accept the user log in attempt',
    RejectLogIn = '[Authentication] Reject the user log in attempt',
    LogOut = '[Authentication] Log the user Out',
    TempAutomaticLogIn = '[Authentication] Temp Automatic Log In'
}

export class PayloadForSuccessfulAuthentication {
    constructor(public identifier: string, public token: string, public expirationDate: Date) {
    }
}

export class TempAutomticLogIn {
    readonly type = AuthenticationActionTypes.TempAutomaticLogIn;
}


export class AcceptLogIn implements Action {
    readonly type = AuthenticationActionTypes.AcceptLogIn;

    constructor(public payload: PayloadForSuccessfulAuthentication) {
    }
}

export class RejectLogin implements Action {
    readonly type = AuthenticationActionTypes.RejectLogIn;

    constructor(public payload: { denialReason: string }) {
    }
}

export type AuthenticationActions =
     AcceptLogIn
    | RejectLogin
    | TempAutomticLogIn
    ;
