import {inject, TestBed} from '@angular/core/testing';

import {CardService} from './card.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {AuthenticationService} from '@ofServices/authentication/authentication.service';
import {GuidService} from "@ofServices/guid.service";
import {StoreModule} from "@ngrx/store";
import {appReducer} from "@ofStore/index";
import SpyObj = jasmine.SpyObj;
import createSpyObj = jasmine.createSpyObj;


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
                , AuthenticationService
                ,GuidService
            ]
        });
        httpMock = TestBed.get(HttpTestingController);
        authenticationService = TestBed.get(AuthenticationService);
    });
});
