/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import 'jasmine-sse/dist/jasmine-sse.js';
import {inject, TestBed} from '@angular/core/testing';

import {CardService} from './card.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {AuthenticationService} from '@ofServices/authentication.service';
import {GuidService} from "@ofServices/guid.service";
import SpyObj = jasmine.SpyObj;
import createSpyObj = jasmine.createSpyObj;
import {StoreModule} from "@ngrx/store";
import {appReducer} from "@ofStore/index";


describe('CardService', () => {
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
            imports: [HttpClientTestingModule,
                StoreModule.forRoot(appReducer)],
            providers: [CardService
                ,AuthenticationService
                ,GuidService
            ]
        });
        httpMock = TestBed.get(HttpTestingController);
        authenticationService = TestBed.get(AuthenticationService);
    });

    it('should be created', inject([CardService], (service: CardService) => {

        expect(service).toBeTruthy();

    }));
});

