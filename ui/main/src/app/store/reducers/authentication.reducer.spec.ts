/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {getExpirationTime, reducer} from './authentication.reducer';
import {authInitialState, AuthState} from '@ofStates/authentication.state';
import {
    AcceptLogIn,
    AcceptLogOut, InitAuthStatus,
    PayloadForSuccessfulAuthentication,
    RejectLogIn
} from "@ofActions/authentication.actions";
import {Guid} from "guid-typescript";
import {getRandomAlphanumericValue} from "@tests/helpers";
import {Message} from "@ofModel/message.model";

const previousGuid = Guid.create();
const previousState: AuthState = {
    identifier: getRandomAlphanumericValue(5,15),
    clientId: previousGuid,
    token: getRandomAlphanumericValue(100,150),
    expirationDate: new Date(2000, 1, 1),
    message: null,
    code: null
};


describe('Authentication Reducer', () => {



    describe('unknown action', () => {
        it('should return the initial state on intial state', () => {
            const action = {} as any;

            const result = reducer(authInitialState, action);

            expect(result).toBe(authInitialState);
        });

        it('should return previous state on a living state', () => {
            const action = {} as any;

            const result = reducer(previousState, action);
            expect(result).toBe(previousState);
            expect(result).not.toBe(authInitialState);
        })

    });

    describe('InitAuthStatus Action', () => {

        it('should return a new state with information corresponding to used payload on an Initial State', () => {
            const myPayload = produceMockPayLoadForSucessfulAuthintication();
            const initAction = new InitAuthStatus({code:'123'});
            const result = reducer(authInitialState, initAction);
            expect(result).not.toBe(authInitialState);
            expect(result.code).toEqual('123');
            expect(result.message).toEqual(authInitialState.message);
            expect(result.expirationDate).toBe(authInitialState.expirationDate);
            expect(result.identifier).toBe(authInitialState.identifier);
            expect(result.token).toBe(authInitialState.token);
        });
    });

    describe('AcceptLogin Action', () => {

        it('should return a new state with information corresponding to used payload on an Initial State', () => {
            const myPayload = produceMockPayLoadForSucessfulAuthintication();
            const acceptLoginAction = new AcceptLogIn(myPayload);
            const result = reducer(authInitialState, acceptLoginAction);
            expect(result).not.toBe(authInitialState);
            expect(result.clientId).toBe(myPayload.clientId);
            expect(result.message).toBeNull();
            expect(result.expirationDate).toBe(myPayload.expirationDate);
            expect(result.identifier).toBe(myPayload.identifier);
            expect(result.token).toBe(myPayload.token);
        });
    });

    describe('AcceptLogOut Action', () => {

        it('should leave an empty state on authInitial State', () => {
            const logoutAction = new AcceptLogOut();
            const result = reducer(authInitialState, logoutAction);
            expect(result.clientId).toBeNull();
            expect(result.token).toBeNull();
            expect(result.identifier).toBeNull();
            expect(result.expirationDate).toEqual(new Date(0));
            expect(result.message).toBeNull();
        });

        it('shuold leave an empty state on a logged state', () => {

            const result = reducer(previousState, new AcceptLogOut());
            expect(result).not.toBe(previousState);
            expect(result).not.toBe(authInitialState);
            expect(result).toEqual(authInitialState);

        });
    });

    describe('RejectLogIn Action', () => {

        it('should leave an empty state but with message on an initial state', () => {
            const denialReason = new Message(getRandomAlphanumericValue(5, 15));
            const result = reducer(authInitialState, new RejectLogIn({error: denialReason}));
            expect(result).not.toBe(authInitialState);
            expect(result.message).toBe(denialReason);
            expect(result.clientId).toBeNull();
            expect(result.token).toBeNull();
            expect(result.identifier).toBeNull();
            expect(result.expirationDate).toEqual(new Date(0));

        });

        it('should leave an empty state but with message on a living state', () => {
            const denialReason = new Message(getRandomAlphanumericValue(5, 15));
            const result = reducer(previousState, new RejectLogIn({error: denialReason}));
            expect(result).not.toBe(authInitialState);
            expect(result).not.toBe(previousState);
            expect(result.message).toBe(denialReason);
            expect(result.clientId).toBeNull();
            expect(result.token).toBeNull();
            expect(result.identifier).toBeNull();
            expect(result.expirationDate).toEqual(new Date(0));

        });

    })

});

describe('getExpirationTime', () => {

    it('should return UTC zero date if no token and expirationDate are stored', () => {
        expect(getExpirationTime(authInitialState)).toEqual(0);
    });

    it('should return UTC zero date if no token is stored', () => {
       const nullTokenState: AuthState = {...previousState,
           token: null,
       };
       expect(getExpirationTime(nullTokenState)).toEqual(0);
    });

    it('should return UTC zero date if no expiration date is stored', () => {
        const nullExpirationDateState: AuthState = {...previousState,
            expirationDate: null,
        };
        expect(getExpirationTime(nullExpirationDateState)).toEqual(0);
    });

    it('should return stored expiration time if token and expiration date are stored', () =>{
        expect(getExpirationTime(previousState)).toEqual(previousState.expirationDate.getTime());
    });

});



function produceMockPayLoadForSucessfulAuthintication(id?: string, clientId?: Guid, token?: string, expiration?: Date): PayloadForSuccessfulAuthentication {
    if (!id) {
        id = getRandomAlphanumericValue(12);
    }
    if (!clientId) {
        clientId = Guid.create();
    }
    if (!token) {
        token = getRandomAlphanumericValue(125);
    }
    if (!expiration) {
        expiration = new Date();
    }
    return new PayloadForSuccessfulAuthentication(id, clientId, token, expiration);
}
