/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Action} from '@ngrx/store';
import {Guid} from "guid-typescript";

export enum IdentificationActionTypes {
    CheckAuthenticationStatus = '[Identification] Check Authentication Status',
    AcceptAuthenticationStatus = '[Identification] Accept user as Authenticated',
    RejectAuthenticationStatus = '[Identification] Reject user as Authenticated',
    AbortCheckAuthenticationStatus = '[Identification] An error arise during check of Authentication Status',
    AcceptLogIn = '[Identification] Accept the user log in attempt',
    RejectLogIn = '[Identification] Reject the user log in attempt',
    TryToLogIn = '[Identification] Try to log the user in',
    AbortLogIn = '[Identification] An error arise during log in attempt',
    TryToLogOut = '[Identification] Try to log the user out',
    AcceptLogOut = '[Identification] Accept the user log out attempt',
    AbortLogOut = '[Identification] An error arise during log out attempt',
    TempAutomaticLogIn = '[Identification] Temp Automatic Log In'
}

export class PayloadForSuccessfulAuthentication {
    constructor(public identifier: string,
                public clientId: Guid,
                public token: string,
                public expirationDate: Date) {
    }
}

export class TempAutomaticLogIn implements Action{
    readonly type = IdentificationActionTypes.TempAutomaticLogIn;
}

export class AcceptLogIn implements Action {
    readonly type = IdentificationActionTypes.AcceptLogIn;

    constructor(public payload: PayloadForSuccessfulAuthentication) {
    }
}

export class TryToLogIn implements Action {
    readonly type= IdentificationActionTypes.TryToLogIn;
    constructor(public payload: {username: string, password: string}){}
}

export class TryToLogOut implements Action {
    readonly type = IdentificationActionTypes.TryToLogOut;
}

export class AbortLogIn implements Action {
    readonly type = IdentificationActionTypes.AbortLogIn;
}
// ??? necessary ???
export class AbortLogOut implements Action {
    readonly type = IdentificationActionTypes.AbortLogOut;
}

export class RejectLogIn implements Action {
    readonly type = IdentificationActionTypes.RejectLogIn;

    constructor(public payload: { denialReason: string }) {
    }
}

export class CheckAuthenticationStatus implements Action {
    readonly type = IdentificationActionTypes.CheckAuthenticationStatus;
}

export class AcceptLogOut implements Action {
    readonly type = IdentificationActionTypes.AcceptLogOut;
}

export class AcceptAuthenticatedStatus implements Action {
    readonly  type = IdentificationActionTypes.AcceptAuthenticationStatus;
}

export class RejectAuthenticatedStatus implements Action {
    readonly  type = IdentificationActionTypes.RejectAuthenticationStatus;
}

export class AbortAuthenticationStatusCheck implements Action {
    readonly  type = IdentificationActionTypes.AbortCheckAuthenticationStatus;
}

export type IdentificationActions =
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
