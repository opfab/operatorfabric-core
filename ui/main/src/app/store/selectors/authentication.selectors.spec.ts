/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {AppState} from "@ofStore/index";
import {authInitialState, AuthState} from "@ofStates/authentication.state";
import {
    selectAuthenticationState,
    selectCode,
    selectExpirationTime,
    selectIdentifier,
    selectMessage,
    selectUserNameOrIdentifier
} from "@ofSelectors/authentication.selectors";
import {Message} from "@ofModel/message.model";
import {Guid} from "guid-typescript";
import {emptyAppState4Test} from "@tests/helpers";

describe('AuthenticationSelectors', () => {

    const referenceDate = new Date();
    let emptyAppState: AppState = emptyAppState4Test;

    let loadedConfigState: AuthState = {
        ...authInitialState,
        code: 'test-code',
        identifier: 'test-user',
        clientId: Guid.create(),
        token: 'test-token',
        expirationDate: referenceDate,
        firstName: 'john',
        lastName: 'doe'
    };

    let errorConfigState: AuthState = {
        ...authInitialState,
        message: new Message('this is not working')
    };


    it('manage empty auth', () => {
        let testAppState = {...emptyAppState, authentication: authInitialState};
        expect(selectAuthenticationState(testAppState)).toEqual(authInitialState);
        expect(selectExpirationTime(testAppState)).toEqual(0);
        expect(selectCode(testAppState)).toEqual(null);
        expect(selectMessage(testAppState)).toEqual(null);
        expect(selectIdentifier(testAppState)).toEqual(null);
        expect(selectUserNameOrIdentifier(testAppState)).toEqual(null);
    });

    describe('manage loaded auth', () => {
        it('with names', () => {
            let testAppState = {...emptyAppState, authentication: loadedConfigState};
            expect(selectAuthenticationState(testAppState)).toEqual(loadedConfigState);
            expect(selectExpirationTime(testAppState)).toEqual(referenceDate.getTime());
            expect(selectCode(testAppState)).toEqual('test-code');
            expect(selectMessage(testAppState)).toEqual(null);
            expect(selectIdentifier(testAppState)).toEqual('test-user');
            expect(selectUserNameOrIdentifier(testAppState)).toEqual('John Doe');
        });

        it('without names', () => {
            let testAppState = {...emptyAppState, authentication: {...loadedConfigState, firstName: null}};
            expect(selectAuthenticationState(testAppState)).toEqual({...loadedConfigState, firstName: null});
            expect(selectExpirationTime(testAppState)).toEqual(referenceDate.getTime());
            expect(selectCode(testAppState)).toEqual('test-code');
            expect(selectMessage(testAppState)).toEqual(null);
            expect(selectIdentifier(testAppState)).toEqual('test-user');
            expect(selectUserNameOrIdentifier(testAppState)).toEqual('test-user');
        });
    });

});
