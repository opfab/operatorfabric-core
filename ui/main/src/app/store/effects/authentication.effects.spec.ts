/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {
    AcceptLogOut,
    AuthenticationActions,
    AuthenticationActionTypes,
    CheckAuthenticationStatus,
    PayloadForSuccessfulAuthentication,
    RejectLogIn,
    TryToLogIn,
} from '@ofActions/authentication.actions';

import {TestBed, waitForAsync} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {Observable, of, throwError} from 'rxjs';

import {AuthenticationEffects} from './authentication.effects';
import {Actions} from '@ngrx/effects';
import {
    AuthenticationService,
    CheckTokenResponse,
    LocalStorageAuthContent
} from '@ofServices/authentication/authentication.service';
import {Guid} from 'guid-typescript';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {Router} from '@angular/router';
import {hot} from 'jasmine-marbles';
import * as moment from 'moment';
import {Message} from '@ofModel/message.model';
import {CardService} from '@ofServices/card.service';
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {ConfigService} from '@ofServices/config.service';
import {injectedSpy} from '@tests/helpers';
import SpyObj = jasmine.SpyObj;
import createSpyObj = jasmine.createSpyObj;

describe('AuthenticationEffects', () => {
    let actions$: Observable<any>;
    let effects: AuthenticationEffects;
    let mockStore: SpyObj<Store<AppState>>;
    let authenticationService: SpyObj<AuthenticationService>;
    let cardService: SpyObj<CardService>;
    let router: SpyObj<Router>;
    let translate: TranslateService;
    let configService: SpyObj<ConfigService>;

    beforeEach(waitForAsync(() => {
        const routerSpy = createSpyObj('Router', ['navigate']);
        const authenticationServiceSpy = createSpyObj('authenticationService'
            , ['extractToken',
                'verifyExpirationDate',
                'clearAuthenticationInformation',
                'extractIdentificationInformation',
                'askTokenFromPassword',
                'checkAuthentication',
                'askTokenFromCode',
                'loadUserData',
                'isExpirationDateOver',
                'computeRedirectUri',
                'regularCheckTokenValidity'
            ]);
        
        const cardServiceSpy = createSpyObj('CardService'
            , ['unsubscribeCardOperation']);
        const configServiceSpy = createSpyObj('ConfigService'
        , ['fetchConfiguration']);
        const storeSpy = createSpyObj('Store', ['dispatch', 'select']);
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot()],
            providers: [
                AuthenticationEffects,
                provideMockActions(() => actions$),
                {provide: AuthenticationService, useValue: authenticationServiceSpy},
                {provide: CardService, useValue: cardServiceSpy},
                {provide: Store, useValue: storeSpy},
                {provide: Router, useValue: routerSpy},
                {provide: ConfigService, useValue: configServiceSpy}
            ]
        });

        effects = TestBed.inject(AuthenticationEffects);
        translate = TestBed.inject(TranslateService);
       

    }));

    beforeEach(() => {
        actions$ = TestBed.inject(Actions);
        authenticationService = injectedSpy(AuthenticationService);
        cardService = injectedSpy(CardService);
        router = injectedSpy(Router);
        mockStore = injectedSpy(Store) as SpyObj<Store<AppState>>;;
        configService = injectedSpy(ConfigService);
    });


    describe('TryToLogIn', () => {
        it('should success if JWT is generated from backend', () => {
            const localAction$ = new Actions(hot('-a--', {a: new TryToLogIn({username: 'johndoe', password: 'pwd'})}));
            authenticationService.askTokenFromPassword.and.returnValue(of(
                new PayloadForSuccessfulAuthentication('johndoe', Guid.create(), 'fake-token', new Date())
            ));
            effects = new AuthenticationEffects(mockStore, localAction$, authenticationService, null, null,translate,configService);
            expect(effects).toBeTruthy();
            effects.TryToLogIn.subscribe((action: AuthenticationActions) => expect(action.type).toEqual(AuthenticationActionTypes.AcceptLogIn))
        });
        it('should fail if JWT is not generated from backend', () => {
            const localAction$ = new Actions(hot('-a--', {a: new TryToLogIn({username: 'johndoe', password: 'pwd'})}));
            authenticationService.askTokenFromPassword.and.returnValue(throwError('Something went wrong'));
            effects = new AuthenticationEffects(mockStore, localAction$, authenticationService, null, null,translate,configService);
            expect(effects).toBeTruthy();
            effects.TryToLogIn.subscribe((action: AuthenticationActions) => expect(action.type).toEqual(AuthenticationActionTypes.RejectLogIn))
        });
    });

    describe('AcceptLogout', () => {
        it('should success and navigate', () => {
            const localAction$ = new Actions(hot('-a--', {a: new AcceptLogOut()}));
            router.navigate.and.callThrough();
            effects = new AuthenticationEffects(mockStore, localAction$, null, null, router,translate,configService);
            expect(effects).toBeTruthy();
            effects.AcceptLogOut.subscribe((action: AuthenticationActions) => {
                expect(action.type).toEqual(AuthenticationActionTypes.AcceptLogOutSuccess);
                expect(router.navigate).toHaveBeenCalledWith(['/login']);

            });
        });
    });

    describe('CheckAuthentication', () => {
        it('should success if has valid token', () => {
      const localAction$ = new Actions(hot('-a--', {a: new CheckAuthenticationStatus()}));
            setStorageWithUserData(moment().add(1, 'days').valueOf());
            authenticationService.checkAuthentication.and.returnValue(of(
                new CheckTokenResponse('johndoe', 123, Guid.create().toString())
            ));
            mockStore.select.and.returnValue(of(null));
            authenticationService.loadUserData.and.callFake(auth => of(auth));
            effects = new AuthenticationEffects(mockStore, localAction$, authenticationService, null, router,translate,configService);
            expect(effects).toBeTruthy();
            effects.CheckAuthentication.subscribe((action: AuthenticationActions) => {
                expect(action.type).toEqual(AuthenticationActionTypes.AcceptLogIn);

            });
        });
        it('should fail if has valid expired token', () => {
            const localAction$ = new Actions(hot('-a--', {a: new CheckAuthenticationStatus()}));
            setStorageWithUserData(moment().subtract(1, 'days').valueOf());
            authenticationService.checkAuthentication.and.returnValue(of(
                new CheckTokenResponse('johndoe', 123, Guid.create().toString())
            ));
            mockStore.select.and.returnValue(of(null));
            effects = new AuthenticationEffects(mockStore, localAction$, authenticationService, null, router,translate,configService);
            expect(effects).toBeTruthy();
            effects.CheckAuthentication.subscribe((action: AuthenticationActions) => {
                expect(action.type).toEqual(AuthenticationActionTypes.RejectLogIn);

            });
        });
        it('should fail if has no valid token and an invalid code', () => {
            const localAction$ = new Actions(hot('-a--', {a: new CheckAuthenticationStatus()}));
            authenticationService.checkAuthentication.and.returnValue(throwError('no valid token'));
            authenticationService.askTokenFromCode.and.returnValue(throwError('no valid code'));
            mockStore.select.and.returnValue(of('code'));
            effects = new AuthenticationEffects(mockStore, localAction$, authenticationService, null, router,translate,configService);
            expect(effects).toBeTruthy();
            effects.CheckAuthentication.subscribe((action: AuthenticationActions) => {
                expect(action.type).toEqual(AuthenticationActionTypes.RejectLogIn);
            });
        });
    });


    it('should clear local storage of auth information when sending RejectLogIn Action', () => {
        const errorMsg = new Message('test');
        expect(effects.handleRejectedLogin(errorMsg)).toEqual(new RejectLogIn({error: errorMsg}));
        expect(authenticationService.clearAuthenticationInformation).toHaveBeenCalled();
    })

    describe('handleErrorOnTokenGeneration',()=>{
       it('should manage 401',()=>{
           effects.handleErrorOnTokenGeneration({status:401, message: 'this a 401 error'},'code').subscribe((reject)=>{
               expect(reject.payload.error.message).toEqual('Unable to authenticate the user');
               expect(reject.payload.error.i18n.key).toEqual('login.error.code');
           });
       });
        it('should manage 500',()=>{
            effects.handleErrorOnTokenGeneration({status:500, message: 'this a 500 error'},'code').subscribe((reject)=>{
                expect(reject.payload.error.message).toEqual('Authentication service currently unavailable');
                expect(reject.payload.error.i18n.key).toEqual('login.error.unavailable');
            });
        });
        it('should manage unreachable',()=>{
            effects.handleErrorOnTokenGeneration({status:0, message: 'this a unreachable error'},'code').subscribe((reject)=>{
                expect(reject.payload.error.message).toEqual('Authentication service currently unavailable');
                expect(reject.payload.error.i18n.key).toEqual('login.error.unavailable');
            });
        });
        it('should manage unexpected',()=>{
            effects.handleErrorOnTokenGeneration({message: 'this a unexpected error'},'code').subscribe((reject)=>{
                expect(reject.payload.error.message).toEqual('Unexpected error');
                expect(reject.payload.error.i18n.key).toEqual('login.error.unexpected');
            });
        });
    });

});

function setStorageWithUserData(expiration?) {
    localStorage.setItem(LocalStorageAuthContent.identifier, 'johndoe');
    localStorage.setItem(LocalStorageAuthContent.token, 'fake-token');
    localStorage.setItem(LocalStorageAuthContent.expirationDate, expiration);
    localStorage.setItem(LocalStorageAuthContent.clientId, Guid.create().toString());
}
