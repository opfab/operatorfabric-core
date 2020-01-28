/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TestBed} from '@angular/core/testing';

import {
    AuthenticationModeHandler,
    AuthenticationService,
    AuthObject,
    CheckTokenResponse, ImplicitAuthenticationHandler,
    isInTheFuture,
    LocalStorageAuthContent,
    PasswordOrCodeAuthenticationHandler
} from './authentication.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {
    ImplicitlyAuthenticated,
    PayloadForSuccessfulAuthentication,
    UnAuthenticationFromImplicitFlow
} from '@ofActions/authentication.actions';
import {Guid} from 'guid-typescript';
import {getPositiveRandomNumberWithinRange, getRandomAlphanumericValue} from '@tests/helpers';
import {GuidService} from '@ofServices/guid.service';
import {Store, StoreModule} from '@ngrx/store';
import {appReducer} from '@ofStore/index';
import {environment} from '@env/environment';
import {
    OAuthEvent,
    OAuthLogger,
    OAuthService,
    UrlHelperService,
    EventType as OauthEventType,
    OAuthSuccessEvent
} from 'angular-oauth2-oidc';
import createSpyObj = jasmine.createSpyObj;
import {create} from "domain";
import any = jasmine.any;


export const AuthenticationImportHelperForSpecs = [AuthenticationService,
    GuidService,
    OAuthService,
    UrlHelperService,
    OAuthLogger];

describe('AuthenticationService', () => {

    let httpMock: HttpTestingController;
    const token = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJSbXFOVTNLN0x4ck5SRmtIVTJxcTZZcTEya1RDaXNtRkw5U2N' +
        'wbkNPeDBjIn0.eyJqdGkiOiI5ODIzMDA0MC05YjNiLTQxZmUtYWJlZi0xNGUwYmM5M2YyZmEiLCJleHAiOjE1NTgwMTUwODYsIm' +
        '5iZiI6MCwiaWF0IjoxNTU4MDE0Nzg2LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0Ojg5L2F1dGgvcmVhbG1zL2RldiIsImF1ZCI6I' +
        'mFjY291bnQiLCJzdWIiOiI1ZTVhNDY5Zi04ZDIxLTQzMDgtODIyOS0zNTMyZmU2ZTUyZjYiLCJ0eXAiOiJCZWFyZXIiLCJhenAi' +
        'OiJvcGZhYi1jbGllbnQiLCJhdXRoX3RpbWUiOjE1NTgwMTQ3NTgsInNlc3Npb25fc3RhdGUiOiJjYTI5ZTU0My04NWMyLTQ1Nzk' +
        'tYmU2NS0wZmVjOTRmZThhYzIiLCJhY3IiOiIwIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW' +
        '1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50I' +
        'iwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6ImVtYWlsIHByb2ZpbGUiLCJzdWIiOiJy' +
        'dGUtb3BlcmF0b3IiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInByZWZlcnJlZF91c2VybmFtZSI6InJ0ZS1vcGVyYXRvciJ9.C5' +
        'FPw-UkG1_oKThscTJEvkNNJ6R6b59X8FdQeb1dJUtdFYobdewoPZTb790wfZJuyd2CButBlnUX372QqZETakiKFsH8I2ZnDdkuR' +
        'l0OHuSXCLZayNY8mNADYKvXuvvn4eG6eyHLQ_Ol5T0BHYA9fUuBONRDYXgOJmHrQNKy1lAMUoI6JhRw2pzzju0bHFOIr6P9Dt5G' +
        'eICy5Kxb35vToxzvXXln8A60Bcnx-Aw2NQlx82rfawBxqM28Zm11nWk6Rn2D67woUBca9V6MJDEi12yMqJhaigNja4yXJzuv4eD' +
        '_FVzhfd38jzvi_RCUhTNWSVNXirKIoPMYMUP5Ehe1ng';
    const securityConf = {};
    securityConf['oauth2'] = {};
    securityConf['jwt'] = {};
    securityConf['oauth2']['client-id'] = 'opfab-client';
    securityConf['oauth2']['client-secret'] = 'opfab-client-secret';
    securityConf['jwt']['login-claim'] = 'preferred_username';
    securityConf['jwt']['expire-claim'] = 'exp';
    let service: AuthenticationService;

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule,
                StoreModule.forRoot(appReducer)],
            providers: [AuthenticationImportHelperForSpecs]
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
        expect(service.verifyExpirationDate()).toEqual(false);
        expect(service.isExpirationDateOver()).toEqual(true);
    });

    it('should reject a stored date in the past', () => {
        spyOn(localStorage, 'getItem').and.callFake(() => '10');
        expect(service.verifyExpirationDate()).toEqual(false);
        expect(service.isExpirationDateOver()).toEqual(true);
    });

    it('should reject a stored date isNaN', () => {
        spyOn(localStorage, 'getItem').and.callFake(() => 'abcd');
        expect(service.verifyExpirationDate()).toEqual(false);
        expect(service.isExpirationDateOver()).toEqual(true);
    });

    it('should reject a stored date if it\'s now', () => {
        spyOn(localStorage, 'getItem').and.callFake(() => Date.now().toString());
        expect(service.verifyExpirationDate()).toEqual(false);
        expect(service.isExpirationDateOver()).toEqual(true);
    });

    it('should accept a stored date if it\'s in the future', () => {
        spyOn(localStorage, 'getItem').and.callFake(() => (Date.now() + 10000).toString());
        expect(service.verifyExpirationDate()).toEqual(true);
        expect(service.isExpirationDateOver()).toEqual(false);
    });


    it('should clear the local storage when clearAuthenticationInformation', () => {
        spyOn(localStorage, 'clear').and.callThrough();
        service.clearAuthenticationInformation();
        expect(localStorage.clear).toHaveBeenCalled();
    });

    it('should set items in localStorage when save Authentication Information', () => {
        spyOn(localStorage, 'setItem').and.callThrough();
        const mockPayload = new PayloadForSuccessfulAuthentication('identifier',
            Guid.create(), 'token', new Date());
        service.saveAuthenticationInformation(mockPayload);
        expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should extract the token from the localstorage', () => {
        spyOn(localStorage, 'getItem').and.callThrough();
        service.extractToken();
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
        const securityHeader = service.getSecurityHeader();
        expect(securityHeader).toBeTruthy();
        const securityHeaderElement = securityHeader['Authorization'];
        expect(securityHeaderElement).toBeTruthy();
        expect(securityHeaderElement).toEqual(`Bearer ${fakeToken}`);
    });
    describe('#checkAuthentication', () => {
        it('should check token successfully', () => {
            const response = new CheckTokenResponse('johndoe', 123, 'opfab-client');
            service.checkAuthentication('fake-token').subscribe((next: CheckTokenResponse) => {
                expect(next.sub).toEqual('johndoe');
                expect(next.exp).toEqual(123);
                expect(next.clientId).toEqual('opfab-client');
            });
            const calls = httpMock.match(req => req.url === `${environment.urls.auth}/check_token`);
            expect(calls.length).toEqual(1);
            calls[0].flush(response);

        });

        it('should fail if check token unsuccessfully', () => {
            // const response = new CheckTokenResponse('johndoe', 123, 'opfab-client');
            service.checkAuthentication('fake-token').subscribe((next) => {
                fail(`unexpected value:${next}`);
            }, (err) => {
                expect(err).not.toBeNull();
            });
            const calls = httpMock.match(req => req.url === `${environment.urls.auth}/check_token`);
            expect(calls.length).toEqual(1);
            calls[0].error(new ErrorEvent('invalid token'));

        });
        it('should emit null token empty', () => {
            // const response = new CheckTokenResponse('johndoe', 123, 'opfab-client');
            service.checkAuthentication(null).subscribe(next => expect(next).toBeNull());
            const calls = httpMock.match(req => req.url === `${environment.urls.auth}/check_token`);
            expect(calls.length).toEqual(0);

        });
    });
    describe('#askTokenFromCode', () => {
        beforeEach(() => {
            service.assignConfigurationProperties(securityConf);
        });
        it('should ask token successfully', () => {
            const response = new AuthObject(token, 123, Guid.create(), 'johndoe');
            service.askTokenFromCode('fake-code').subscribe((next: PayloadForSuccessfulAuthentication) => {
                expect(next.token).toEqual(token);
                expect(next.firstName).toEqual('john');
                expect(next.lastName).toEqual('doe');
            });
            const tokenCalls = httpMock.match(req => req.url === `${environment.urls.auth}/token`);
            expect(tokenCalls.length).toEqual(1);
            tokenCalls[0].flush(response);
            const userCalls = httpMock.match(req => req.url === `${environment.urls.users}/users/rte-operator`);
            expect(userCalls.length).toEqual(1);
            userCalls[0].flush({firstName: 'john', lastName: 'doe'});

        });

        it('should fail if ask token unsuccessfully', () => {
            service.askTokenFromCode('fake-code').subscribe((next) => {
                fail(`unexpected value:${next}`);
            }, (err) => {
                expect(err).not.toBeNull();
            });
            const calls = httpMock.match(req => req.url === `${environment.urls.auth}/token`);
            expect(calls.length).toEqual(1);
            calls[0].error(new ErrorEvent('invalid code'));

        });
        it('should fail if not properly configured', () => {
            service.assignConfigurationProperties({...securityConf, oauth2: {}});
            service.askTokenFromCode('fake-code').subscribe((next) => {
                fail(`unexpected value:${next}`);
            }, (err) => {
                expect(err).not.toBeNull();
            });
            const calls = httpMock.match(req => req.url === `${environment.urls.auth}/token`);
            expect(calls.length).toEqual(0);

        });
    });
    describe('#askTokenFromPassword', () => {
        beforeEach(() => {
            service.assignConfigurationProperties(securityConf);
        });
        it('should ask token successfully', () => {
            const response = new AuthObject(token, 123, Guid.create(), 'johndoe');
            service.askTokenFromPassword('fake-login', 'fake-pwd').subscribe((next: PayloadForSuccessfulAuthentication) => {
                expect(next.token).toEqual(token);
                expect(next.firstName).toEqual('john');
                expect(next.lastName).toEqual('doe');
            });
            const calls = httpMock.match(req => req.url === `${environment.urls.auth}/token`);
            expect(calls.length).toEqual(1);
            calls[0].flush(response);
            const userCalls = httpMock.match(req => req.url === `${environment.urls.users}/users/rte-operator`);
            expect(userCalls.length).toEqual(1);
            userCalls[0].flush({firstName: 'john', lastName: 'doe'});

        });

        it('should fail if ask token unsuccessfully', () => {
            service.askTokenFromPassword('fake-login', 'fake-pwd').subscribe((next) => {
                fail(`unexpected value:${next}`);
            }, (err) => {
                expect(err).not.toBeNull();
            });
            const calls = httpMock.match(req => req.url === `${environment.urls.auth}/token`);
            expect(calls.length).toEqual(1);
            calls[0].error(new ErrorEvent('invalid code'));

        });
        it('should fail if not properly configured', () => {
            service.assignConfigurationProperties({...securityConf, oauth2: {}});
            service.askTokenFromPassword('fake-login', 'fake-pwd').subscribe((next) => {
                fail(`unexpected value:${next}`);
            }, (err) => {
                expect(err).not.toBeNull();
            });
            const calls = httpMock.match(req => req.url === `${environment.urls.auth}/token`);
            expect(calls.length).toEqual(0);

        });
    });
    describe('convert', () => {
        beforeEach(() => {
            service.assignConfigurationProperties(securityConf);
        });
        it('convert using expiration payload', () => {
            const authObj = new AuthObject(token, 123, Guid.create(), 'johndoe');
            const conversion = service.convert(authObj);
            expect(conversion.identifier).toEqual('rte-operator');
            expect(conversion.token).toEqual(token);
            expect(conversion.clientId).toEqual(authObj.clientId);
            expect(conversion.expirationDate.valueOf() / 100).toBeCloseTo((Date.now() + 123000) / 100, 1);
        });
        it('convert using expiration payload', () => {
            const authObj = new AuthObject(token, null, Guid.create(), 'johndoe');
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
    });

    it('should find current time to be wrong', () => {
        expect(isInTheFuture(Date.now())).not.toEqual(true);
    });

    it('should find tomorrow time to be true', () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        expect(isInTheFuture(tomorrow.getTime())).toEqual(true);
    });

});

describe('AuthenticationService', () => {
    const httpClientMock = createSpyObj('HttpClient', ['request']);
    const guidServiceMock = createSpyObj('GuidService', ['getCurrentGuid', 'getCurrentGuidString']);
    const store = createSpyObj('Store', ['select', 'dispatch']);
    store.select.and.returnValue({
        subscribe: (func: () => {}) => {
        }
    });
    const oAuthServiceMock = createSpyObj('OAuthService', ['configure'
        , 'restartSessionChecksIfStillLoggedIn'
        , 'setupAutomaticSilentRefresh'
        , 'loadDiscoveryDocumentAndTryLogin'
        , 'setStorage'
        , 'fetchTokenUsingPasswordFlowAndLoadUserProfile'
        , 'loadUserProfile'
        , 'fetchTokenUsingPasswordFlow'
        , 'refreshToken'
        , 'silentRefresh'
        , 'initImplicitFlowInPopup'
        , 'initImplicitFlowInternal'
        , 'initImplicitFlow'
        , 'resetImplicitFlow'
        , 'tryLogin'
        , 'tryLoginCodeFlow'
        , 'tryLoginImplicitFlow'
        , 'processIdToken'
        , 'getIdentityClaims'
        , 'getGrantedScopes'
        , 'getGrantedScopes'
        , 'getAccessToken'
        , 'getRefreshToken'
        , 'getAccessTokenExpiration'
    ]);
    const service = new AuthenticationService(httpClientMock, guidServiceMock, store, oAuthServiceMock);
    describe('dispatchAppStateActionFromOAuth2Events', () => {
        it('should dispatch an `ImplicitlyAuthenticated` on `token_received` events',
            () => {
                const tokenReceivedEvent = new OAuthSuccessEvent('token_received');
                service.dispatchAppStateActionFromOAuth2Events(tokenReceivedEvent);
                expect(store.dispatch).toHaveBeenCalledWith(any(ImplicitlyAuthenticated));
            });
        it('should dispatch an `UnAuthenticationFromImplicitFlow` on `token_error` events',
            () => {
                const tokenReceivedEvent = new OAuthSuccessEvent('token_error');
                service.dispatchAppStateActionFromOAuth2Events(tokenReceivedEvent);
                expect(store.dispatch).toHaveBeenCalledWith(any(UnAuthenticationFromImplicitFlow));
            });
        it('should dispatch an `UnAuthenticationFromImplicitFlow` on `token_refresh_error` events',
            () => {
                const tokenReceivedEvent = new OAuthSuccessEvent('token_refresh_error');
                service.dispatchAppStateActionFromOAuth2Events(tokenReceivedEvent);
                expect(store.dispatch).toHaveBeenCalledWith(any(UnAuthenticationFromImplicitFlow));
            });
        it('should dispatch an `UnAuthenticationFromImplicitFlow` on `logout` events',
            () => {
                const tokenReceivedEvent = new OAuthSuccessEvent('logout');
                service.dispatchAppStateActionFromOAuth2Events(tokenReceivedEvent);
                expect(store.dispatch).toHaveBeenCalledWith(any(UnAuthenticationFromImplicitFlow));
            });
    });
    describe('instantiateAuthModeHandler', () => {
        it('should instantiate a `ImplicitFlowConfiguration` and the `Implicit Configuration` ' +
            'when mode is `implicit`', () => {
            const spy = spyOn(service, 'instantiateImplicitFlowConfiguration').and.callThrough();
            const result = service.instantiateAuthModeHandler('implicit');
            expect(result).toEqual(new ImplicitAuthenticationHandler(service, store, sessionStorage));
            expect(spy).toHaveBeenCalled();
        });
        it('should return a `PasswordOrCodeFlowAuthenticationHandler` ' +
            'when mode is different from `implicit`', () => {
            function stringDifferentFromImplicit() {
                const mode = getRandomAlphanumericValue(4, 12);
                return (mode === 'implicit') ? stringDifferentFromImplicit() : mode;
            }

            const result = service.instantiateAuthModeHandler(stringDifferentFromImplicit());
            expect(result).toEqual(new PasswordOrCodeAuthenticationHandler(service, store));
        });
    });

});

describe('AuthenticationModeHandler', () => {
    const store = createSpyObj('Store', ['dispatch', 'pipe']);
    store.pipe.and.returnValue({
        subscribe: (func: (t: boolean) => {}) => {
            func(true);
        }
    });

    const authServiceSpy = createSpyObj('AuthenticationService',
        ['initializeAuthentication',
            'linkAuthenticationStatus',
            'getAuthenticationMode',
            'initAndLoadAuth',
            'moveToCodeFlowLoginPage'
        ]);
    let test: boolean;
    const linker = (isAuthenticated: boolean) => test = isAuthenticated;

    beforeEach(() => {
        store.pipe.calls.reset();
    });
    describe('implemented as PasswordOrCodeAuthenticationHandler', () => {
        const underTest = new PasswordOrCodeAuthenticationHandler(authServiceSpy, store);
        beforeEach(() => {
            store.dispatch.calls.reset();
        });
        describe('initializeAuthentication', () => {
            it(`should dispatch an InitAuthStatus Action when 'window.location.href' contains 'code=' as query parameter`, () => {
                underTest.initializeAuthentication('http://abcdef.com?code=authentication');
                expect(store.dispatch).toHaveBeenCalled();
            });
            it(`should dispatch any action when 'window.location.href' contains no queryParameters
             of type 'code=' `, () => {
                underTest.initializeAuthentication('http://abcdefgh.com');
                expect(store.dispatch).not.toHaveBeenCalled();
            });
        });
        describe('linkAuthenticationStatus', () => {

            it(`should subscribe linker to expirationTime changes when called`, () => {
                underTest.linkAuthenticationStatus(linker);
                expect(store.pipe).toHaveBeenCalled();
            });
        });
        describe('move', () => {
            it('should use moveToCodeFlowLoginPage', () => {
                underTest.move();
                expect(authServiceSpy.moveToCodeFlowLoginPage).toHaveBeenCalled();
            });
        });
    });
    describe('implemented as ImplicitAuthentication', () => {
        const storage = createSpyObj('sessionStorage', ['getItem']);
        const underTest = new ImplicitAuthenticationHandler(authServiceSpy, store, storage);
        beforeEach(() => {
            authServiceSpy.initAndLoadAuth.calls.reset();
        });
        describe('initializedAuthentication', () => {
            it('should call getAuthenticationMode and initAndLoadAuth methods from `authenticationService`' +
                ' when AuthenticationMode is set to `IMPLICIT',
                () => {
                    authServiceSpy.getAuthenticationMode.and.returnValue('IMPLICIT');
                    underTest.initializeAuthentication(getRandomAlphanumericValue(1, 12));
                    expect(authServiceSpy.getAuthenticationMode).toHaveBeenCalled();
                    expect(authServiceSpy.initAndLoadAuth).toHaveBeenCalled();

                });
            it('should do nothing when  `getAuthenticationMode` of `AuthenticationService` return something ' +
                ' else than `IMPLICIT`', () => {
                authServiceSpy.getAuthenticationMode.and.returnValue(getRandomAlphanumericValue(9, 15));
                underTest.initializeAuthentication(getRandomAlphanumericValue(5, 12));
                expect(authServiceSpy.getAuthenticationMode).toHaveBeenCalled();
                expect(authServiceSpy.initAndLoadAuth).not.toHaveBeenCalled();

            });

        });
        describe('linkAuthenticationStatus', () => {
            it('should call subscribe linker on the slice of selectIsImplicitlyAuthenticated', () => {
                underTest.linkAuthenticationStatus(linker);
                expect(store.pipe).toHaveBeenCalled();
            });
        });
        describe('extractToken', () => {
            it('should ask for `access_token` item from `sessionStorage`', () => {
                underTest.extractToken();
                expect(storage.getItem).toHaveBeenCalled();
            });
        });
    });
});
