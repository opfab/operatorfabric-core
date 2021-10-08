/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {inject, TestBed} from '@angular/core/testing';
import {TokenInjector} from '@ofServices/interceptors.service';
import {HttpRequest} from '@angular/common/http';
import {AuthenticationService} from '@ofServices/authentication/authentication.service';
import {getRandomAlphanumericValue, injectedSpy} from '@tests/helpers';
import createSpyObj = jasmine.createSpyObj;
import SpyObj = jasmine.SpyObj;

describe('Interceptor', () => {

    let authenticationService: SpyObj<AuthenticationService>;

    beforeEach(() => {
        const authenticationServiceSpy = createSpyObj(['getSecurityHeader', 'isAuthModeNone']);
        TestBed.configureTestingModule({
            providers: [TokenInjector,
                {provide: AuthenticationService, useValue: authenticationServiceSpy},
            ]
        });
        authenticationService = injectedSpy(AuthenticationService);
        authenticationServiceSpy.getSecurityHeader.and.returnValue({'Authorization': `Bearer dummyToken`});
        authenticationServiceSpy.isAuthModeNone.and.returnValue(false);
    });

    it('should leave headers untouched for the "token checking" end-point'
        , inject([TokenInjector]
            , (service: TokenInjector) => {
                const request = new HttpRequest<any>('GET', 'http://www.test.com/auth/check_token');
                expect(request).toBeTruthy();
                service.addAuthHeadersIfNecessary(request);
                expect(request.headers.get('Authorization')).toBeNull();
                // expect(AuthenticationService.getSecurityHeader).not.toHaveBeenCalled();

            }));

    it('should leave headers untouched for the "token asking" end-point'
        , inject([TokenInjector]
            , (service: TokenInjector) => {
                const request = new HttpRequest<any>('GET', 'http://www.test.com/auth/token');
                expect(request).toBeTruthy();
                service.addAuthHeadersIfNecessary(request);
                expect(request.headers.get('Authorization')).toBeNull();
                // expect(AuthenticationService.getSecurityHeader).not.toHaveBeenCalled();
            }));

    it('should add authentication headers for random end-point'
        , inject([TokenInjector]
            , (service: TokenInjector) => {
                // AuthenticationService.getSecurityHeader.and.callThrough();
                const request = new HttpRequest<any>('GET',
                    'http://www.test.com/' + getRandomAlphanumericValue(13));
                expect(request).toBeTruthy();
                const nuRequest = service.addAuthHeadersIfNecessary(request);
                expect(nuRequest.headers.get('Authorization')).not.toBeNull();
                expect(nuRequest.headers.get('Authorization')).not.toBe('');
                // expect(AuthenticationService.getSecurityHeader).toHaveBeenCalled();
            }));
});

describe('Interceptor with Auth-flow NONE', () => {

    let authenticationService: SpyObj<AuthenticationService>;

    beforeEach(() => {
        const authenticationServiceSpy = createSpyObj(['getSecurityHeader', 'isAuthModeNone']);
        TestBed.configureTestingModule({
            providers: [TokenInjector,
                {provide: AuthenticationService, useValue: authenticationServiceSpy},
            ]
        });
        authenticationService = injectedSpy(AuthenticationService);
        authenticationServiceSpy.getSecurityHeader.and.returnValue({'Authorization': `Bearer dummyToken`});
        authenticationServiceSpy.isAuthModeNone.and.returnValue(true);
    });

    it('should leave headers untouched for all/random end-point'
        , inject([TokenInjector]
            , (service: TokenInjector) => {
                const request = new HttpRequest<any>('GET',
                    'http://www.test.com/' + getRandomAlphanumericValue(13));
                expect(request).toBeTruthy();
                const nuRequest = service.addAuthHeadersIfNecessary(request);
                expect(nuRequest.headers.get('Authorization')).toBeNull();
            }));
});
