/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    AcceptLogOut,
    AuthenticationActions,
    AuthenticationActionTypes,
    CheckAuthenticationStatus,
    PayloadForSuccessfulAuthentication,
    RejectLogIn,
    TryToLogIn,
    TryToLogOut
} from '@ofActions/authentication.actions';

import {async, TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {Observable, of, throwError} from 'rxjs';

import {AuthenticationEffects} from './authentication.effects';
import {Actions} from '@ngrx/effects';
import {AuthenticationService, CheckTokenResponse, LocalStorageAuthContent} from '@ofServices/authentication.service';
import {Guid} from 'guid-typescript';
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {Router} from "@angular/router";
import {cold, hot} from "jasmine-marbles";
import {LoadConfigSuccess} from "@ofActions/config.actions";
import * as moment from 'moment';
import {Message} from "@ofModel/message.model";
import SpyObj = jasmine.SpyObj;
import createSpyObj = jasmine.createSpyObj;
import {CardService} from "@ofServices/card.service";
import {skip} from "rxjs/operators";
import {EmptyLightCards, LightCardActionTypes} from "@ofActions/light-card.actions";
import {ClearCard} from "@ofActions/card.actions";

describe('AuthenticationEffects', () => {
    let actions$: Observable<any>;
    let effects: AuthenticationEffects;
    let mockStore: SpyObj<Store<AppState>>;
    let authenticationService: SpyObj<AuthenticationService>;
    let cardService: SpyObj<CardService>;
    let router: SpyObj<Router>;

    beforeEach(async(() => {
        const routerSpy = createSpyObj('Router', ['navigate']);
        const authenticationServiceSpy = createSpyObj('authenticationService'
            , ['extractToken',
                'verifyExpirationDate',
                'clearAuthenticationInformation',
                'extractIdentificationInformation',
                'askTokenFromPassword',
                'checkAuthentication',
                'askTokenFromCode'
            ]);
        const cardServiceSpy = createSpyObj('CardService'
            , ['unsubscribeCardOperation']);
        const storeSpy = createSpyObj('Store', ['dispatch', 'select']);
        TestBed.configureTestingModule({
            providers: [
                AuthenticationEffects,
                provideMockActions(() => actions$),
                {provide: AuthenticationService, useValue: authenticationServiceSpy},
                {provide: CardService, useValue: cardServiceSpy},
                {provide: Store, useValue: storeSpy},
                {provide: Router, useValue: routerSpy}
            ]
        });

        effects = TestBed.get(AuthenticationEffects);

    }));

    beforeEach(() => {
        actions$ = TestBed.get(Actions);
        authenticationService = TestBed.get(AuthenticationService);
        cardService = TestBed.get(CardService);
        router = TestBed.get(Router);
        mockStore = TestBed.get(Store);
    });

    it('should be created', () => {
        expect(effects).toBeTruthy();
    });

    it('returns CheckAuthenticationStatus on LoadConfigSuccess', () => {
        const localActions$ = new Actions(hot('-a--', {a: new LoadConfigSuccess({config: {}})}));
        effects = new AuthenticationEffects(mockStore, localActions$, null, null, null);
        expect(effects).toBeTruthy();
        effects.checkAuthenticationWhenReady.subscribe((action: AuthenticationActions) => expect(action.type).toEqual(AuthenticationActionTypes.CheckAuthenticationStatus));

    });

    describe('TryToLogIn', () => {
        it('should success if JWT is generated from backend', () => {
            const localAction$ = new Actions(hot('-a--', {a: new TryToLogIn({username: 'johndoe', password: 'pwd'})}));
            authenticationService.askTokenFromPassword.and.returnValue(of(
                new PayloadForSuccessfulAuthentication('johndoe', Guid.create(), 'fake-token', new Date())
            ));
            effects = new AuthenticationEffects(mockStore, localAction$, authenticationService, null, null);
            expect(effects).toBeTruthy();
            effects.TryToLogIn.subscribe((action: AuthenticationActions) => expect(action.type).toEqual(AuthenticationActionTypes.AcceptLogIn))
        });
        it('should fail if JWT is not generated from backend', () => {
            const localAction$ = new Actions(hot('-a--', {a: new TryToLogIn({username: 'johndoe', password: 'pwd'})}));
            authenticationService.askTokenFromPassword.and.returnValue(throwError('Something went wrong'));
            effects = new AuthenticationEffects(mockStore, localAction$, authenticationService, null, null);
            expect(effects).toBeTruthy();
            effects.TryToLogIn.subscribe((action: AuthenticationActions) => expect(action.type).toEqual(AuthenticationActionTypes.RejectLogIn))
        });
    });

    describe('TryToLogOut', () => {
        it('should success and clear localstorage', () => {
            const localAction$ = new Actions(hot('-a--', {a: new TryToLogOut()}));
            setStorageWithUserData();
            cardService.unsubscribeCardOperation.and.callFake(()=>{})
            effects = new AuthenticationEffects(mockStore, localAction$, null, cardService, null);
            expect(effects).toBeTruthy();
            const localExpected = hot('-(abc)', {a: new EmptyLightCards(), b: new ClearCard(), c:new AcceptLogOut()});
            expect(effects.TryToLogOut).toBeObservable(localExpected);
            effects.TryToLogOut.subscribe(() => {
                expect(localStorage.getItem(LocalStorageAuthContent.identifier)).toBeNull();
                expect(localStorage.getItem(LocalStorageAuthContent.token)).toBeNull();
                expect(localStorage.getItem(LocalStorageAuthContent.expirationDate)).toBeNull();
                expect(localStorage.getItem(LocalStorageAuthContent.clientId)).toBeNull();
            });
        });
    });
    describe('AcceptLogout', () => {
        it('should success and navigate', () => {
            const localAction$ = new Actions(hot('-a--', {a: new AcceptLogOut()}));
            router.navigate.and.callThrough();
            effects = new AuthenticationEffects(mockStore, localAction$, null, null, router);
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
            effects = new AuthenticationEffects(mockStore, localAction$, authenticationService, null, router);
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
            effects = new AuthenticationEffects(mockStore, localAction$, authenticationService, null, router);
            expect(effects).toBeTruthy();
            effects.CheckAuthentication.subscribe((action: AuthenticationActions) => {
                expect(action.type).toEqual(AuthenticationActionTypes.RejectLogIn);

            });
        });
        it('should fail if has no valid token and no code', () => {
            const localAction$ = new Actions(hot('-a--', {a: new CheckAuthenticationStatus()}));
            setStorageWithUserData(moment().add(1, 'days').valueOf());
            authenticationService.checkAuthentication.and.returnValue(throwError('no valid token'));
            mockStore.select.and.returnValue(of(null));
            effects = new AuthenticationEffects(mockStore, localAction$, authenticationService, null, router);
            expect(effects).toBeTruthy();
            effects.CheckAuthentication.subscribe((action: AuthenticationActions) => {
                expect(action.type).toEqual(AuthenticationActionTypes.RejectLogIn);
                expect(localStorage.getItem(LocalStorageAuthContent.identifier)).toBeNull();
                expect(localStorage.getItem(LocalStorageAuthContent.token)).toBeNull();
                expect(localStorage.getItem(LocalStorageAuthContent.expirationDate)).toBeNull();
                expect(localStorage.getItem(LocalStorageAuthContent.clientId)).toBeNull();
            });
        });
        it('should success if has no valid token and a valid code', () => {
            const localAction$ = new Actions(hot('-a--', {a: new CheckAuthenticationStatus()}));
            authenticationService.checkAuthentication.and.returnValue(throwError('no valid token'));
            authenticationService.askTokenFromCode.and.returnValue(of(
                new PayloadForSuccessfulAuthentication('johndoe', Guid.create(), 'fake-token', moment().add(1, 'days').toDate())
            ));
            mockStore.select.and.returnValue(of('code'));
            effects = new AuthenticationEffects(mockStore, localAction$, authenticationService, null, router);
            expect(effects).toBeTruthy();
            effects.CheckAuthentication.subscribe((action: AuthenticationActions) => {
                expect(action.type).toEqual(AuthenticationActionTypes.AcceptLogIn);
            });
        });
        it('should fail if has no valid token and an invalid code', () => {
            const localAction$ = new Actions(hot('-a--', {a: new CheckAuthenticationStatus()}));
            authenticationService.checkAuthentication.and.returnValue(throwError('no valid token'));
            authenticationService.askTokenFromCode.and.returnValue(throwError('no valid code'));
            mockStore.select.and.returnValue(of('code'));
            effects = new AuthenticationEffects(mockStore, localAction$, authenticationService, null, router);
            expect(effects).toBeTruthy();
            effects.CheckAuthentication.subscribe((action: AuthenticationActions) => {
                expect(action.type).toEqual(AuthenticationActionTypes.RejectLogIn);
            });
        });
    });


    // it('should send accept loginAction when handling successful login attempt', () => {
    //     const mockCheckTokenResponse = {sub:"",exp:0,clientId:""} as CheckTokenResponse;
    //     const mockIdInfo = new PayloadForSuccessfulAuthentication("",Guid.create(),"",new Date());
    //     authenticationService.extractIdentificationInformation.and.callFake(() => mockIdInfo);
    //     const expectedAction = new AcceptLogIn(mockIdInfo);
    //     expect(effects.handleLogInAttempt(mockCheckTokenResponse)).toEqual(expectedAction);
    //     expect(authenticationService.extractIdentificationInformation).toHaveBeenCalled();
    //
    // })

    // it('should clear local storage of auth information when handling a failing login attempt', () => {
    //     expect(effects.handleLogInAttempt(null)).toEqual(new RejectLogIn( { message: 'invalid token'}));
    //     expect(authenticationService.clearAuthenticationInformation).toHaveBeenCalled();
    // })

    it('should clear local storage of auth information when sending RejectLogIn Action', () => {
        const errorMsg = new Message('test');
        setStorageWithUserData();
        expect(effects.handleRejectedLogin(errorMsg)).toEqual(new RejectLogIn({error: errorMsg}));
        expect(localStorage.getItem(LocalStorageAuthContent.identifier)).toBeNull();
        expect(localStorage.getItem(LocalStorageAuthContent.token)).toBeNull();
        expect(localStorage.getItem(LocalStorageAuthContent.expirationDate)).toBeNull();
        expect(localStorage.getItem(LocalStorageAuthContent.clientId)).toBeNull();
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