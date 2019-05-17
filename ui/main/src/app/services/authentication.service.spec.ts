/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {inject, TestBed} from '@angular/core/testing';

import {AuthenticationService, AuthObject, isInTheFuture, LocalStorageAuthContent} from './authentication.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {PayloadForSuccessfulAuthentication} from '@ofActions/authentication.actions';
import {Guid} from 'guid-typescript';
import {getPositiveRandomNumberWithinRange, getRandomAlphanumericValue} from '@tests/helpers';
import {GuidService} from "@ofServices/guid.service";
import {StoreModule} from "@ngrx/store";
import {appReducer} from "@ofStore/index";

describe('AuthenticationService', () => {

    let httpMock: HttpTestingController;
    const token = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJSbXFOVTNLN0x4ck5SRmtIVTJxcTZZcTEya1RDaXNtRkw5U2NwbkNPeDBjIn0.eyJqdGkiOiI5ODIzMDA0MC05YjNiLTQxZmUtYWJlZi0xNGUwYmM5M2YyZmEiLCJleHAiOjE1NTgwMTUwODYsIm5iZiI6MCwiaWF0IjoxNTU4MDE0Nzg2LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0Ojg5L2F1dGgvcmVhbG1zL2RldiIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiI1ZTVhNDY5Zi04ZDIxLTQzMDgtODIyOS0zNTMyZmU2ZTUyZjYiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJvcGZhYi1jbGllbnQiLCJhdXRoX3RpbWUiOjE1NTgwMTQ3NTgsInNlc3Npb25fc3RhdGUiOiJjYTI5ZTU0My04NWMyLTQ1NzktYmU2NS0wZmVjOTRmZThhYzIiLCJhY3IiOiIwIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6ImVtYWlsIHByb2ZpbGUiLCJzdWIiOiJydGUtb3BlcmF0b3IiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInByZWZlcnJlZF91c2VybmFtZSI6InJ0ZS1vcGVyYXRvciJ9.C5FPw-UkG1_oKThscTJEvkNNJ6R6b59X8FdQeb1dJUtdFYobdewoPZTb790wfZJuyd2CButBlnUX372QqZETakiKFsH8I2ZnDdkuRl0OHuSXCLZayNY8mNADYKvXuvvn4eG6eyHLQ_Ol5T0BHYA9fUuBONRDYXgOJmHrQNKy1lAMUoI6JhRw2pzzju0bHFOIr6P9Dt5GeICy5Kxb35vToxzvXXln8A60Bcnx-Aw2NQlx82rfawBxqM28Zm11nWk6Rn2D67woUBca9V6MJDEi12yMqJhaigNja4yXJzuv4eD_FVzhfd38jzvi_RCUhTNWSVNXirKIoPMYMUP5Ehe1ng'
    let oauth2Conf = {};
    oauth2Conf['client-id']='opfab-client';
    oauth2Conf['client-secret']='opfab-client-secret';
    oauth2Conf['login-claim']='preferred_username';
    oauth2Conf['expire-claim']='exp';

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule,
                StoreModule.forRoot(appReducer)],
            providers: [AuthenticationService,GuidService]
        });
        httpMock = TestBed.get(HttpTestingController);
    });

    it('should be created', inject([AuthenticationService], (service: AuthenticationService) => {
        expect(service).toBeTruthy();
    }));

    it('should reject a stored date in the past', inject([AuthenticationService], (service: AuthenticationService) => {
        spyOn(localStorage, 'getItem').and.callFake(() => '10');
        expect(AuthenticationService.verifyExpirationDate()).toEqual(false);
        expect(AuthenticationService.isExpirationDateOver()).toEqual(true);
    }));

    it('should reject a stored date in the past', inject([AuthenticationService], (service: AuthenticationService) => {
        spyOn(localStorage, 'getItem').and.callFake(() => '10');
        expect(AuthenticationService.verifyExpirationDate()).toEqual(false);
        expect(AuthenticationService.isExpirationDateOver()).toEqual(true);
    }));

    it('should reject a stored date isNaN', inject([AuthenticationService], (service: AuthenticationService) => {
        spyOn(localStorage, 'getItem').and.callFake(() => 'abcd');
        expect(AuthenticationService.verifyExpirationDate()).toEqual(false);
        expect(AuthenticationService.isExpirationDateOver()).toEqual(true);
    }));

    it('should reject a stored date if it\'s now', inject([AuthenticationService], (service: AuthenticationService) => {
        spyOn(localStorage, 'getItem').and.callFake(() => Date.now().toString());
        expect(AuthenticationService.verifyExpirationDate()).toEqual(false);
        expect(AuthenticationService.isExpirationDateOver()).toEqual(true);
    }));

    it('should accept a stored date if it\'s in the future', inject([AuthenticationService], (service: AuthenticationService) => {
        spyOn(localStorage, 'getItem').and.callFake(() => (Date.now() + 10000).toString());
        expect(AuthenticationService.verifyExpirationDate()).toEqual(true);
        expect(AuthenticationService.isExpirationDateOver()).toEqual(false);
    }));


    it('should clear the local storage when clearAuthenticationInformation', inject([AuthenticationService], (service: AuthenticationService) => {
        spyOn(localStorage, 'clear').and.callThrough();
        AuthenticationService.clearAuthenticationInformation();
        expect(localStorage.clear).toHaveBeenCalled();
    }));

    it('should set items in localStorage when save Authentication Information', inject([AuthenticationService], (service: AuthenticationService) => {
        spyOn(localStorage, 'setItem').and.callThrough();
        const mockPayload = new PayloadForSuccessfulAuthentication('identifier',
            Guid.create(), 'token', new Date());
        AuthenticationService.saveAuthenticationInformation(mockPayload);
        expect(localStorage.setItem).toHaveBeenCalled();
    }));

    it('should extract the token from the localstorage', inject([AuthenticationService]
        , (service: AuthenticationService) => {
            spyOn(localStorage, 'getItem').and.callThrough();
            AuthenticationService.extractToken();
            expect(localStorage.getItem).toHaveBeenCalled();
        }));

    it('should create a congruent payload object from AuthObject', inject([AuthenticationService]
        , (service: AuthenticationService) => {
        service.assignConfigurationProperties(oauth2Conf);
            const guid = Guid.create();
            const expirationTime = getPositiveRandomNumberWithinRange(12, 2500);
            const authObj = {
                identifier: 'rte-operator',
                access_token: token,
                expires_in: expirationTime,
                clientId: guid
            } as AuthObject;
            const result = service.convert(authObj);
            expect(result.token).toEqual(token);
            expect(result.identifier).toEqual('rte-operator');
            expect(result.clientId).toEqual(guid);
            expect(result.expirationDate.getTime()).toBeGreaterThanOrEqual(Date.now() + expirationTime);

        }));

    it('should give a security header corresponding to "Authorization" containing the current token stored in local storage',
        inject([AuthenticationService], (service: AuthenticationService) => {
            const fakeToken = getRandomAlphanumericValue(254);
            localStorage.setItem(LocalStorageAuthContent.token, fakeToken);
            const securityHeader = AuthenticationService.getSecurityHeader();
            expect(securityHeader).toBeTruthy();
            const securityHeaderElement = securityHeader['Authorization'];
            expect(securityHeaderElement).toBeTruthy();
            expect(securityHeaderElement).toEqual(`Bearer ${fakeToken}`);
    }))

});

describe('isInTheFuture', () => {

    it('should find 0 UTC time to be wrong', () => {
        expect(isInTheFuture(0)).not.toEqual(true);
    })

    it('should find current time to be wrong', () => {
        expect(isInTheFuture(Date.now())).not.toEqual(true);
    })

    it('should find tomorrow time to be true', () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        expect(isInTheFuture(tomorrow.getTime())).toEqual(true);
    });

});
