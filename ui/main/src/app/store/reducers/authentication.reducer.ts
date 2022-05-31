/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AuthenticationActions, AuthenticationActionTypes} from '@ofActions/authentication.actions';
import {authInitialState, AuthState} from '@ofStates/authentication.state';

export function reducer(state: AuthState = authInitialState, action: AuthenticationActions): AuthState {
    switch (action.type) {
        case AuthenticationActionTypes.InitAuthStatus: {
            return {
                ...state,
                code: action.payload.code,
                message: null
            };
        }

        case AuthenticationActionTypes.AcceptLogIn: {
            const payload = action.payload;
            return {
                ...state,
                identifier: payload.identifier,
                clientId: payload.clientId,
                firstName: payload.firstName,
                lastName: payload.lastName,
                token: payload.token,
                expirationDate: payload.expirationDate,
                message: null
            };
        }
        case AuthenticationActionTypes.AcceptLogOut: {
            return {
                ...state,
                identifier: null,
                clientId: null,
                token: null,
                expirationDate: new Date(0),
                message: null,
                firstName: null,
                lastName: null
            };
        }
        case AuthenticationActionTypes.RejectLogIn: {
            return {
                ...state,
                identifier: null,
                clientId: null,
                token: null,
                expirationDate: new Date(0),
                message: action.payload.error
            };
        }
        case AuthenticationActionTypes.ImplicitlyAuthenticated: {
            return {
                ...state,
                isImplicitlyAuthenticated: true
            };
        }
        case AuthenticationActionTypes.UnAuthenticationFromImplicitFlow: {
            return {
                ...state,
                isImplicitlyAuthenticated: false
            };
        }

        default:
            return state;
    }
}

export const getIdentifier = (state: AuthState) => state.identifier;
export const getToken = (state: AuthState) => state.token;
export const getExpirationDate = (state: AuthState) => state.expirationDate;

const UTC_beginning_time = 0;

/**
 * return the stored expiration time otherwise the beginning
 * of the UTC time which should be always in the past.
 * @param state
 */
export const getExpirationTime = (state: AuthState) => {
    const expirationDate = getExpirationDate(state);
    const token = getToken(state);
    if (token && expirationDate) {
        return expirationDate.getTime();
    } else {
        return UTC_beginning_time;
    }
};
