/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    AcceptLogIn,
    IdentificationActions,
    IdentificationActionTypes
} from '@state/identification/identification.actions';
import {Guid} from "guid-typescript";


export interface State {
    identifier: string;
    clientId: Guid;
    token: string;
    expirationDate: Date;
    denialReason: string;
}

export const initialState: State = {
    identifier: null,
    clientId: null,
    token: null,
    expirationDate: new Date(0),// always expired except for time travellers
    denialReason: null
};

export function reducer(state = initialState, action: IdentificationActions): State {
    switch (action.type) {

        case IdentificationActionTypes.AcceptLogIn: {

            const payload = (action as AcceptLogIn).payload;
            return {
                ...state,
                identifier: payload.identifier,
                clientId: payload.clientId,
                token: payload.token,
                expirationDate: payload.expirationDate
            };
        }
        case IdentificationActionTypes.RejectLogIn: {
            return {
                ...state,
                identifier: null,
                clientId: null,
                token:null,
                expirationDate: new Date(0),
                denialReason: action.payload.denialReason
            };
        }
        default:
            return state;
    }
}

export const getIdentifier = (state: State) => state.identifier;
export const getToken = (state: State) => state.token;
export const getExpirationDate = (state: State) => state.expirationDate;

export const isAuthenticatedUntilTime = (state: State) => {
    const expirationDate = getExpirationDate(state);
    const token = getToken(state);
    console.log(`one again!  Token: '${token} and ExpirationDate: '${expirationDate}'`);
    if (token && expirationDate) {
        return expirationDate.getTime();
    } else {
        return new Date(0).getTime;
    }
}