/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import 'jasmine-sse/dist/jasmine-sse.js';
import {TestBed, inject} from '@angular/core/testing';

import {CardService} from './card.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import SpyObj = jasmine.SpyObj;
import {AuthenticationService} from '@ofServices/authentication.service';
import createSpyObj = jasmine.createSpyObj;
import createSpy = jasmine.createSpy;
import {Guid} from "guid-typescript";
import {GuidService} from "@ofServices/guid.service";
import {EventEmitter} from "@angular/core";
import {EventSourcePolyfill, OnMessageEvent} from "ng-event-source";


fdescribe('CardService', () => {
    let httpMock: HttpTestingController;
    let authenticationService: SpyObj<AuthenticationService>;

    beforeEach(() => {
        const authenticationServiceSpy = createSpyObj('authenticationService'
            , ['extractToken'
                , 'verifyExpirationDate'
                , 'clearAuthenticationInformation'
                , 'registerAuthenticationInformation'
            ]);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [CardService
                // ,{provide: AuthenticationService, useValue: authenticationServiceSpy}
                ,AuthenticationService
                ,GuidService
            ]
        });
        httpMock = TestBed.get(HttpTestingController);
        authenticationService = TestBed.get(AuthenticationService);
        jasmine.sse().install();
    });

    afterEach(() => {
            jasmine.sse().uninstall();
        }
    );

    it('should be created', inject([CardService], (service: CardService) => {

        expect(service).toBeTruthy();

    }));
});

