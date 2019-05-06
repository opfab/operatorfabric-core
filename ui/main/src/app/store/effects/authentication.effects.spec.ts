/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    AcceptLogIn, AuthenticationActions, AuthenticationActionTypes,
    CheckAuthenticationStatus,
    PayloadForSuccessfulAuthentication,
    RejectLogIn
} from '@ofActions/authentication.actions';

import {async, TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {Observable} from 'rxjs';

import {AuthenticationEffects} from './authentication.effects';
import {Actions} from '@ngrx/effects';
import {AuthenticationService, CheckTokenResponse} from '@ofServices/authentication.service';
import {Guid} from 'guid-typescript';
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {Router} from "@angular/router";
import SpyObj = jasmine.SpyObj;
import createSpyObj = jasmine.createSpyObj;
import {hot} from "jasmine-marbles";
import {ConfigActions, ConfigActionTypes, LoadConfig, LoadConfigSuccess} from "@ofActions/config.actions";
import {ConfigEffects} from "@ofEffects/config.effects";

describe('AuthenticationEffects', () => {
    let actions$: Observable<any>;
    let effects: AuthenticationEffects;
    let mockStore: Store<AppState>;
    let authenticationService: SpyObj<AuthenticationService>;

    beforeEach(async(() => {
        const routerSpy = createSpyObj('Router',['navigate']);
        const authenticationServiceSpy = createSpyObj('authenticationService'
            , ['extractToken'
                , 'verifyExpirationDate'
                , 'clearAuthenticationInformation'
                ,'extractIdentificationInformation'
            ]);
        const storeSpy = createSpyObj('Store', ['dispatch']);
        TestBed.configureTestingModule({
            providers: [
                AuthenticationEffects,
                provideMockActions(() => actions$),
                {provide: AuthenticationService, useValue: authenticationServiceSpy},
                {provide: Store, useValue: storeSpy},
                {provide: Router, useValue: routerSpy}
            ]
        });

        effects = TestBed.get(AuthenticationEffects);

    }));

    beforeEach(() => {
        actions$ = TestBed.get(Actions);
        authenticationService = TestBed.get(AuthenticationService);
        mockStore = TestBed.get(Store);
    });

    it('should be created', () => {
        expect(effects).toBeTruthy();
    });

    it('returns CheckAuthenticationStatus on LoadConfigSuccess', () => {
        const localActions$ = new Actions(hot('-a--', {a: new LoadConfigSuccess({config:{}})}));
        effects = new AuthenticationEffects(mockStore, localActions$, null,null);
        expect(effects).toBeTruthy();
        effects.checkAuthenticationWhenReady.subscribe((action: AuthenticationActions) => expect(action.type).toEqual(AuthenticationActionTypes.CheckAuthenticationStatus));

    });

    it('should send accept loginAction when handling successful login attempt', () => {
        const mockCheckTokenResponse = {sub:"",exp:0,client_id:""} as CheckTokenResponse;
        const mockIdInfo = new PayloadForSuccessfulAuthentication("",Guid.create(),"",new Date());
        authenticationService.extractIdentificationInformation.and.callFake(() => mockIdInfo);
        const expectedAction = new AcceptLogIn(mockIdInfo);
        expect(effects.handleLogInAttempt(mockCheckTokenResponse)).toEqual(expectedAction);
        expect(authenticationService.extractIdentificationInformation).toHaveBeenCalled();

    })

    it('should clear local storage of auth information when handling a failing login attempt', () => {
        expect(effects.handleLogInAttempt(null)).toEqual(new RejectLogIn( { denialReason: 'invalid token'}));
        expect(authenticationService.clearAuthenticationInformation).toHaveBeenCalled();
    })

    it('should clear local storage of auth information when sending RejectLogIn Action', () => {
        const errorMsg = 'test';
        expect(effects.handleRejectedLogin(errorMsg)).toEqual(new RejectLogIn( { denialReason: errorMsg}));
        expect(authenticationService.clearAuthenticationInformation).toHaveBeenCalled()
    })

});
