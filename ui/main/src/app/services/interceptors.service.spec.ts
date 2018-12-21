/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {inject, TestBed} from '@angular/core/testing';
import {TokenInjector} from '@ofServices/interceptors.service';
import {HttpClient, HttpHandler, HttpHeaders, HttpRequest} from '@angular/common/http';
import {AuthenticationService} from '@ofServices/authentication.service';
import createSpyObj = jasmine.createSpyObj;
import SpyObj = jasmine.SpyObj;
import createSpy = jasmine.createSpy;
import {getRandomAlphanumericValue} from '../../tests/helpers';
import {GuidService} from "@ofServices/guid.service";

describe('Interceptor', () => {

    // let httpClient: SpyObj<HttpClient>;
    let authenticationService: SpyObj<AuthenticationService>;
    beforeEach(() => {
        const authenticationServiceSpy = createSpyObj( [
            'extractToken'
                // {extractToken: createSpy('extractToken').and.callThrough()}
                , 'verifyExpirationDate'
                , 'clearAuthenticationInformation'
                , 'registerAuthenticationInformation'
                , 'getSecurityHeader'
        //         , {getSecurityHeader:
        //             spyOn( authenticationService,'getSecurityHeader').and.callThrough()
        // }
                // , spyOn(authenticationService,'getSecurityHeader').and.callThrough()
            ]);
        TestBed.configureTestingModule({
            providers: [TokenInjector,
                {provide: AuthenticationService, useValue: authenticationServiceSpy},
                // AuthenticationService,
                // GuidService
            ]
        });
        authenticationService = TestBed.get(AuthenticationService);


    });

    it('should be created'), inject([TokenInjector], (service: TokenInjector) => {
        expect(service).toBeTruthy();
    });

    it('should leave headers untouched for the "token checking" end-point'
        , inject([TokenInjector]
            , (service: TokenInjector) => {

                const request = new HttpRequest<any>('GET', 'http://www.test.com/auth/check_token');
                expect(request).toBeTruthy();
                const transformedRequest = service.addAuthHeadersIfNecessary(request);
                expect(transformedRequest).toBeTruthy();
                expect(transformedRequest).toEqual(request);
            }));
    it('should leave headers untouched for the "token asking" end-point'
        , inject([TokenInjector]
            , (service: TokenInjector) => {

                const request = new HttpRequest<any>('GET', 'http://www.test.com/auth/token');
                expect(request).toBeTruthy();
                const transformedRequest = service.addAuthHeadersIfNecessary(request);
                expect(transformedRequest).toBeTruthy();
                expect(transformedRequest).toEqual(request);
            }));
    xit('should add authentication headers for random end-point'
        , inject([TokenInjector]
            , (service: TokenInjector) => {
                authenticationService.extractToken.and.callFake(() => 'test');
            authenticationService.getSecurityHeader.and.callThrough();
                const request = new HttpRequest<any>('GET',
                    'http://www.test.com/'+getRandomAlphanumericValue(13));
                request.headers.append('test','test');
                expect(request).toBeTruthy();
                const transformedRequest = service.addAuthHeadersIfNecessary(request);
                expect(transformedRequest).toBeTruthy();
                expect(transformedRequest).not.toEqual(request);
                const headers = transformedRequest.headers;
                expect(headers).toBeTruthy();
                const authorization = headers.get('Authorization');
                expect(authorization).toBeTruthy();
            }));
});