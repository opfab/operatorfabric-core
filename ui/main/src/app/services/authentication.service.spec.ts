/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TestBed} from '@angular/core/testing';

import {
    AuthenticationService,
    AuthObject,
    CheckTokenResponse,
    isInTheFuture,
    LocalStorageAuthContent
} from './authentication.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {PayloadForSuccessfulAuthentication} from '@ofActions/authentication.actions';
import {Guid} from 'guid-typescript';
import {getPositiveRandomNumberWithinRange, getRandomAlphanumericValue} from '@tests/helpers';
import {GuidService} from "@ofServices/guid.service";
import {StoreModule} from "@ngrx/store";
import {appReducer} from "@ofStore/index";
import {environment} from "@env/environment";

describe('AuthenticationService', () => {

    let httpMock: HttpTestingController;
    const token = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJSbXFOVTNLN0x4ck5SRmtIVTJxcTZZcTEya1RDaXNtRkw5U2NwbkNPeDBjIn0.eyJqdGkiOiI5ODIzMDA0MC05YjNiLTQxZmUtYWJlZi0xNGUwYmM5M2YyZmEiLCJleHAiOjE1NTgwMTUwODYsIm5iZiI6MCwiaWF0IjoxNTU4MDE0Nzg2LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0Ojg5L2F1dGgvcmVhbG1zL2RldiIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiI1ZTVhNDY5Zi04ZDIxLTQzMDgtODIyOS0zNTMyZmU2ZTUyZjYiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJvcGZhYi1jbGllbnQiLCJhdXRoX3RpbWUiOjE1NTgwMTQ3NTgsInNlc3Npb25fc3RhdGUiOiJjYTI5ZTU0My04NWMyLTQ1NzktYmU2NS0wZmVjOTRmZThhYzIiLCJhY3IiOiIwIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6ImVtYWlsIHByb2ZpbGUiLCJzdWIiOiJydGUtb3BlcmF0b3IiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInByZWZlcnJlZF91c2VybmFtZSI6InJ0ZS1vcGVyYXRvciJ9.C5FPw-UkG1_oKThscTJEvkNNJ6R6b59X8FdQeb1dJUtdFYobdewoPZTb790wfZJuyd2CButBlnUX372QqZETakiKFsH8I2ZnDdkuRl0OHuSXCLZayNY8mNADYKvXuvvn4eG6eyHLQ_Ol5T0BHYA9fUuBONRDYXgOJmHrQNKy1lAMUoI6JhRw2pzzju0bHFOIr6P9Dt5GeICy5Kxb35vToxzvXXln8A60Bcnx-Aw2NQlx82rfawBxqM28Zm11nWk6Rn2D67woUBca9V6MJDEi12yMqJhaigNja4yXJzuv4eD_FVzhfd38jzvi_RCUhTNWSVNXirKIoPMYMUP5Ehe1ng'
    let securityConf = {};
    securityConf['oauth2']={};
    securityConf['jwt']={};
    securityConf['oauth2']['client-id'] = 'opfab-client';
    securityConf['oauth2']['client-secret'] = 'opfab-client-secret';
    securityConf['jwt']['login-claim'] = 'preferred_username';
    securityConf['jwt']['expire-claim'] = 'exp';
    let service: AuthenticationService;

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule,
                StoreModule.forRoot(appReducer)],
            providers: [AuthenticationService, GuidService]
        });
        httpMock = TestBed.get(HttpTestingController);
        service = TestBed.get(AuthenticationService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should reject a stored date in the past', () => {
        spyOn(localStorage, 'getItem').and.callFake(() => '10');
        expect(AuthenticationService.verifyExpirationDate()).toEqual(false);
        expect(AuthenticationService.isExpirationDateOver()).toEqual(true);
    });

    it('should reject a stored date in the past', () => {
        spyOn(localStorage, 'getItem').and.callFake(() => '10');
        expect(AuthenticationService.verifyExpirationDate()).toEqual(false);
        expect(AuthenticationService.isExpirationDateOver()).toEqual(true);
    });

    it('should reject a stored date isNaN', () => {
        spyOn(localStorage, 'getItem').and.callFake(() => 'abcd');
        expect(AuthenticationService.verifyExpirationDate()).toEqual(false);
        expect(AuthenticationService.isExpirationDateOver()).toEqual(true);
    });

    it('should reject a stored date if it\'s now', () => {
        spyOn(localStorage, 'getItem').and.callFake(() => Date.now().toString());
        expect(AuthenticationService.verifyExpirationDate()).toEqual(false);
        expect(AuthenticationService.isExpirationDateOver()).toEqual(true);
    });

    it('should accept a stored date if it\'s in the future', () => {
        spyOn(localStorage, 'getItem').and.callFake(() => (Date.now() + 10000).toString());
        expect(AuthenticationService.verifyExpirationDate()).toEqual(true);
        expect(AuthenticationService.isExpirationDateOver()).toEqual(false);
    });


    it('should clear the local storage when clearAuthenticationInformation', () => {
        spyOn(localStorage, 'clear').and.callThrough();
        AuthenticationService.clearAuthenticationInformation();
        expect(localStorage.clear).toHaveBeenCalled();
    });

    it('should set items in localStorage when save Authentication Information', () => {
        spyOn(localStorage, 'setItem').and.callThrough();
        const mockPayload = new PayloadForSuccessfulAuthentication('identifier',
            Guid.create(), 'token', new Date());
        AuthenticationService.saveAuthenticationInformation(mockPayload);
        expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should extract the token from the localstorage', () => {
        spyOn(localStorage, 'getItem').and.callThrough();
        AuthenticationService.extractToken();
        expect(localStorage.getItem).toHaveBeenCalled();
    });

    it('should create a congruent payload object from AuthObject', () => {
        service.assignConfigurationProperties(securityConf);
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

    });

    it('should give a security header corresponding to "Authorization" containing the current token stored in local storage', () => {
        const fakeToken = getRandomAlphanumericValue(254);
        localStorage.setItem(LocalStorageAuthContent.token, fakeToken);
        const securityHeader = AuthenticationService.getSecurityHeader();
        expect(securityHeader).toBeTruthy();
        const securityHeaderElement = securityHeader['Authorization'];
        expect(securityHeaderElement).toBeTruthy();
        expect(securityHeaderElement).toEqual(`Bearer ${fakeToken}`);
    });
    describe('#checkAuthentication',()=> {
        it('should check token succesfully', () => {
            const response = new CheckTokenResponse('johndoe', 123, 'opfab-client');
            service.checkAuthentication('fake-token').subscribe((next: CheckTokenResponse) => {
                expect(next.sub).toEqual('johndoe');
                expect(next.exp).toEqual(123);
                expect(next.clientId).toEqual('opfab-client');
            });
            let calls = httpMock.match(req => req.url == `${environment.urls.auth}/check_token`);
            expect(calls.length).toEqual(1);
            calls[0].flush(response);

        });

        it('should fail if check token unsuccesfully', () => {
            const response = new CheckTokenResponse('johndoe', 123, 'opfab-client');
            service.checkAuthentication('fake-token').subscribe((next) => {
                fail(`unexpected value:${next}`)
            }, (err) => {
                expect(err).not.toBeNull();
            });
            let calls = httpMock.match(req => req.url == `${environment.urls.auth}/check_token`);
            expect(calls.length).toEqual(1);
            calls[0].error(new ErrorEvent('invalid token'));

        });
        it('should emit null token empty', () => {
            const response = new CheckTokenResponse('johndoe', 123, 'opfab-client');
            service.checkAuthentication(null).subscribe(next => expect(next).toBeNull());
            let calls = httpMock.match(req => req.url == `${environment.urls.auth}/check_token`);
            expect(calls.length).toEqual(0);

        });
    });
    describe('#askTokenFromCode',()=> {
        beforeEach(()=>{
            service.assignConfigurationProperties(securityConf);
        });
        it('should ask token succesfully', () => {
            const response = new AuthObject(token,123, Guid.create(),'johndoe');
            service.askTokenFromCode('fake-code').subscribe((next: PayloadForSuccessfulAuthentication) => {
                expect(next.token).toEqual(token);
            });
            let calls = httpMock.match(req => req.url == `${environment.urls.auth}/token`);
            expect(calls.length).toEqual(1);
            calls[0].flush(response);

        });

        it('should fail if ask token unsuccesfully', () => {
            service.askTokenFromCode('fake-code').subscribe((next) => {
                fail(`unexpected value:${next}`)
            }, (err) => {
                expect(err).not.toBeNull();
            });
            let calls = httpMock.match(req => req.url == `${environment.urls.auth}/token`);
            expect(calls.length).toEqual(1);
            calls[0].error(new ErrorEvent('invalid code'));

        });
        it('should fail if not properly configured', () => {
            service.assignConfigurationProperties({...securityConf,oauth2:{}});
            service.askTokenFromCode('fake-code').subscribe((next) => {
                fail(`unexpected value:${next}`)
            }, (err) => {
                expect(err).not.toBeNull();
            });
            let calls = httpMock.match(req => req.url == `${environment.urls.auth}/token`);
            expect(calls.length).toEqual(0);

        });
    });
    describe('#askTokenFromPassword',()=> {
        beforeEach(()=>{
            service.assignConfigurationProperties(securityConf);
        });
        it('should ask token succesfully', () => {
            const response = new AuthObject(token,123, Guid.create(),'johndoe');
            service.askTokenFromPassword('fake-login','fake-pwd').subscribe((next: PayloadForSuccessfulAuthentication) => {
                expect(next.token).toEqual(token);
            });
            let calls = httpMock.match(req => req.url == `${environment.urls.auth}/token`);
            expect(calls.length).toEqual(1);
            calls[0].flush(response);

        });

        it('should fail if ask token unsuccesfully', () => {
            service.askTokenFromPassword('fake-login','fake-pwd').subscribe((next) => {
                fail(`unexpected value:${next}`)
            }, (err) => {
                expect(err).not.toBeNull();
            });
            let calls = httpMock.match(req => req.url == `${environment.urls.auth}/token`);
            expect(calls.length).toEqual(1);
            calls[0].error(new ErrorEvent('invalid code'));

        });
        it('should fail if not properly configured', () => {
            service.assignConfigurationProperties({...securityConf, oauth2:{}});
            service.askTokenFromPassword('fake-login','fake-pwd').subscribe((next) => {
                fail(`unexpected value:${next}`)
            }, (err) => {
                expect(err).not.toBeNull();
            });
            let calls = httpMock.match(req => req.url == `${environment.urls.auth}/token`);
            expect(calls.length).toEqual(0);

        });
    });
    describe('convert',()=>{
        beforeEach(()=>{
            service.assignConfigurationProperties(securityConf);
        });
       it('convert using expiration payload', ()=>{
           const authObj = new AuthObject(token,123, Guid.create(),'johndoe');
            const conversion = service.convert(authObj);
            expect(conversion.identifier).toEqual('rte-operator');
            expect(conversion.token).toEqual(token);
            expect(conversion.clientId).toEqual(authObj.clientId);
            expect(conversion.expirationDate.valueOf()/100).toBeCloseTo((Date.now()+123000)/100,1);
       });
        it('convert using expiration payload', ()=>{
            const authObj = new AuthObject(token,null, Guid.create(),'johndoe');
            const conversion = service.convert(authObj);
            expect(conversion.identifier).toEqual('rte-operator');
            expect(conversion.token).toEqual(token);
            expect(conversion.clientId).toEqual(authObj.clientId);
            expect(conversion.expirationDate.valueOf()).toEqual(1558015086);
        });
    });

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
