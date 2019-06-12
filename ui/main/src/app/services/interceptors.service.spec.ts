/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {inject, TestBed} from '@angular/core/testing';
import {TokenInjector} from '@ofServices/interceptors.service';
import {HttpRequest} from '@angular/common/http';
import {AuthenticationService} from '@ofServices/authentication.service';
import {getRandomAlphanumericValue} from '@tests/helpers';
import createSpyObj = jasmine.createSpyObj;
import SpyObj = jasmine.SpyObj;

describe('Interceptor', () => {

    let authenticationService: SpyObj<AuthenticationService>;

    beforeEach(() => {
        const authenticationServiceSpy = createSpyObj(['getSecurityHeader']);
        TestBed.configureTestingModule({
            providers: [TokenInjector,
                {provide: AuthenticationService, useValue: authenticationServiceSpy},
            ]
        });
        authenticationService = TestBed.get(AuthenticationService);
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