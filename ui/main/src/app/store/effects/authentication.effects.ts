/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {from, Observable, of} from 'rxjs';
import {Action, Store} from '@ngrx/store';
import {
    AcceptLogIn,
    AcceptLogOut,
    AcceptLogOutSuccess,
    AuthenticationActions,
    AuthenticationActionTypes,
    CheckAuthenticationStatus,
    CheckImplicitFlowAuthenticationStatus,
    RejectLogIn,
    TryToLogIn,
} from '@ofActions/authentication.actions';
import {AuthenticationService} from '@ofServices/authentication/authentication.service';
import {catchError, flatMap, map, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {AppState} from '@ofStore/index';
import {Router} from '@angular/router';
import {ConfigActionTypes, LoadConfigSuccess} from '@ofActions/config.actions';
import {selectCode} from '@ofSelectors/authentication.selectors';
import {Message, MessageLevel} from '@ofModel/message.model';
import {I18n} from '@ofModel/i18n.model';
import {Map} from '@ofModel/map';
import {CardService} from '@ofServices/card.service';
import {EmptyLightCards} from '@ofActions/light-card.actions';
import {ClearCard} from '@ofActions/card.actions';
import {environment} from '@env/environment';
import { buildConfigSelector } from '@ofStore/selectors/config.selectors';
import {redirectToCurrentLocation} from "../../app-routing.module";

/**
 * Management of the authentication of the current user
 */
@Injectable()
export class AuthenticationEffects {

    /**
     * @constructorCheckImplicitFlowAuthenticationStatus
     * @param store - {Store<AppState>} state manager
     * @param actions$ - {Action} {Observable} of Action of the Application
     * @param authService - service implementing the authentication business rules
     * @param router - router service to redirect user accordingly to the user authentication status or variation of it.
     * @param cardService - service handling request of cards
     *
     * istanbul ignore next */
    constructor(private store: Store<AppState>,
                private actions$: Actions,
                private authService: AuthenticationService,
                private cardService: CardService,
                private router: Router) {
    }

    /**
     * Triggers Authentication Check when the application is ready
     */
    @Effect()
    checkAuthenticationWhenReady: Observable<AuthenticationActions> =
        this.actions$
            .pipe(
                ofType(ConfigActionTypes.LoadConfigSuccess),
                map((loadConfigSuccess: LoadConfigSuccess) => {
                    const flowMode = loadConfigSuccess.payload.config.security.oauth2.flow.mode;
                    if (flowMode && flowMode === 'IMPLICIT') {
                        return new CheckImplicitFlowAuthenticationStatus();
                    }
                    return new CheckAuthenticationStatus();
                })
            );

    /**
     * This {Observable} of {AuthenticationActions} listen {AuthenticationActionTypes.TryToLogIn} type and uses
     * the login payload to get an authentication token from the authentication service if the authentication is
     * valid and emit an {AcceptLogin} action with it.
     * For invalid authentication it emits a {RejectLogIn} Action with the message "unable to authenticate the user"
     * as paload
     *
     * This effect should take action after the user has submitted login information in the login page by clicking
     * on the login button.
     *
     * @member
     * @name TryToLogIn
     * @typedef {Observable<AuthenticationActions>}
     */
    @Effect()
    TryToLogIn: Observable<AuthenticationActions> =
        this.actions$
            .pipe(
                ofType(AuthenticationActionTypes.TryToLogIn),
                switchMap((action: TryToLogIn) => {
                    const payload = action.payload;
                    return this.authService.askTokenFromPassword(payload.username, payload.password).pipe(
                        map(authenticationInfo => new AcceptLogIn(authenticationInfo)),
                        catchError(errorResponse => {
                                return this.handleErrorOnTokenGeneration(errorResponse, 'authenticate');
                            }
                        ));
                })
            );

    /**
     * This {Observable} of {AuthenticationActions} listens for {AuthenticationActionTypes.TryToLogOut} type.
     * It tells the {AuthenticationService} to clear the authentication information from the system and emit
     * an {AcceptLogOut} Action.
     *
     * This effect should take action after the Logout link/button has been clicked by the user.
     *
     * @member
     * @name TryToLogOut
     * @typedef {Observable<AuthenticationActions>}
     */
    @Effect()
    TryToLogOut: Observable<Action> =
        this.actions$.pipe(
            ofType(AuthenticationActionTypes.TryToLogOut),
            switchMap(() => {
                this.resetState();
                return of(new EmptyLightCards(), new ClearCard(), new AcceptLogOut());
            })
        );

    /**
     * This {Observable} of {AuthenticationActions} listens for {AuthenticationActionTypes.AcceptLogOut} type.
     * It tells the {Router} service to navigate to the Login page. and emit an {AcceptLogOutSucess} Action.
     *
     * This {Effect} should be called as a consequence of a {TryLogOut} action
     *
     * @member
     * @name AcceptLogOut flow on demand
     * @typedef {Observable<AuthenticationActions>}
     *
     */
    @Effect()
    AcceptLogOut: Observable<AuthenticationActions> =
        this.actions$.pipe(
            ofType(AuthenticationActionTypes.AcceptLogOut),
            map(() => {
                this.router.navigate(['/login']);
                return new AcceptLogOutSuccess();
            })
        );
    /**
     * This {Observable} of {AuthenticationActions} listens for {AuthenticationActionTypes.RejectLogIn} type.
     * It tells the {AuthenticationService} to clear authentication information from the system
     *
     * This {Effect} should be called after a wrong login attempt.

     * @member
     * @name RejectLogInAttempt
     * @typedef {Observable<AuthenticationActions>}
     */
    @Effect()
    RejectLogInAttempt: Observable<AuthenticationActions> =
        this.actions$.pipe(ofType(AuthenticationActionTypes.RejectLogIn),
            tap(() => {
                this.authService.clearAuthenticationInformation();
            }),
            map(() => new AcceptLogOut()));

    /**
     * This {Observable} of {AuthenticationActions} listens for {AuthenticationActionTypes.CheckAuthenticationStatus} type.
     *It extract the current authentication information if any and checks its validity, the expiration date.
     *  If it's OK then an {AcceptLogIn} Action with check result as payload is emittedby calling
     *  the {handleLogInAttempt} @method,
     *
     *  otherwise a {RejectedLogIn} Action is emitted by calling the {handleRejectedLogin} @method.
     *
     * This {Effect} should be the first effect apply by the application to display the right page accordingly with the
     * current authentication state.
     *
     * @member
     * @name CheckAuthentication
     * @typedef {Observable<AuthenticationActions>}
     *
     */
    @Effect()
    CheckAuthentication: Observable<AuthenticationActions> =
        this.actions$
            .pipe(
                ofType(AuthenticationActionTypes.CheckAuthenticationStatus),
                switchMap(() => {
                    return this.authService.checkAuthentication(this.authService.extractToken())
                        .pipe(catchError(() => of(null)));

                }),
                withLatestFrom(this.store.select(selectCode)),
                switchMap(([payload, code]) => {
                        // no token stored or token invalid
                        if (!payload) {
                            if (!!code) {
                                return this.authService.askTokenFromCode(code).pipe(
                                    tap(() => {
                                        redirectToCurrentLocation(this.router);
                                    }),
                                    map(authenticationInfo => new AcceptLogIn(authenticationInfo)),
                                    catchError(errorResponse => {
                                            return this.handleErrorOnTokenGeneration(errorResponse, 'code');
                                        }
                                    ));
                            }
                            return of(this.handleRejectedLogin(new Message('The stored token is invalid',
                                MessageLevel.ERROR,
                                new I18n('login.error.token.invalid'))));
                        } else {
                            if (!this.authService.isExpirationDateOver()) {
                                const authInfo = this.authService.extractIdentificationInformation();
                                return this.authService.loadUserData(authInfo)
                                    .pipe(
                                        map(auth => {
                                            redirectToCurrentLocation(this.router);
                                            return new AcceptLogIn(auth);
                                        })
                                    );
                                // return of(new AcceptLogIn(authInfo));
                            }
                            return of(this.handleRejectedLogin(new Message('The stored token has expired',
                                MessageLevel.ERROR,
                                new I18n('login.error.token.expiration'))));
                        }
                    }
                ),
                catchError(err => {
                    console.error(err);
                    const parameters = new Map<string>();
                    parameters['message'] = err;
                    return of(this.handleRejectedLogin(new Message(err,
                        MessageLevel.ERROR,
                        new I18n('login.error.unexpected', parameters)
                    )));
                })
            );


    @Effect()
    CheckImplicitFlowAuthentication: Observable<AuthenticationActions> =
        this.actions$
            .pipe(ofType(AuthenticationActionTypes.CheckImplicitFlowAuthenticationStatus),
                flatMap(() => from(this.authService.initAndLoadAuth()).pipe(
                    map ( response => {
                        return response ;
                    }),
                    catchError( error => {
                        return of(error);
                    })
                )),
                // due to implicit flow mode an explicit rerouting to `/feed` is needed once authenticated
                tap ( () => redirectToCurrentLocation(this.router)),
                map(() => {
                    return new  AcceptLogIn(this.authService.providePayloadForSuccessfulAuthenticationFromImplicitFlow());
                }));

    handleErrorOnTokenGeneration(errorResponse, category: string) {
        let message, key;
        const params = new Map<string>();
        switch (errorResponse.status) {
            case 401:
                message = 'Unable to authenticate the user';
                key = `login.error.${category}`;
                break;
            case 0:
            case 500:
                message = 'Authentication service currently unavailable';
                key = 'login.error.unavailable';
                break;
            default:
                message = 'Unexpected error';
                key = 'login.error.unexpected';
                params['error'] = errorResponse.message;
        }
        console.error(message, errorResponse);
        return of(new RejectLogIn({error: new Message(message, MessageLevel.ERROR, new I18n(key, params))}));
    }

    handleRejectedLogin(errorMsg: Message): AuthenticationActions {
        this.authService.clearAuthenticationInformation();
        return new RejectLogIn({error: errorMsg});

    }

    private resetState() {
        this.authService.clearAuthenticationInformation();
        this.store.select(buildConfigSelector('keycloak.realm')).subscribe(realm => {
            if (realm) {
                const redirect = this.authService.computeRedirectUri();
                window.location.href = `${environment.urls.auth}/realms/${realm}/protocol/openid-connect/logout?redirect_uri=${redirect}`;
            }
        });
        this.cardService.unsubscribeCardOperation();
    }

}
