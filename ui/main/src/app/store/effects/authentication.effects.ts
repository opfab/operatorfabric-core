/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Observable, of} from 'rxjs';
import {RouterGo} from 'ngrx-router';
import {Action, Store} from '@ngrx/store';
import {
    AcceptLogIn,
    AcceptLogOut,
    AuthenticationActions,
    AuthenticationActionTypes, RejectLogIn,
    TryToLogIn,
    TryToLogOut
} from '@ofActions/authentication.actions';
import {AuthenticationService, CheckTokenResponse} from '../../services/authentication.service';
import {catchError, map, switchMap, tap} from 'rxjs/operators';
import {AppState} from "@ofStore/index";


@Injectable()
export class AuthenticationEffects {

    /* istanbul ignore next */
    constructor(private store: Store<AppState>, private actions$: Actions, private authService: AuthenticationService) {
    }

    @Effect()
    TryToLogIn: Observable<AuthenticationActions> =
        this.actions$
            .pipe(
                ofType(AuthenticationActionTypes.TryToLogIn),
                switchMap((action: TryToLogIn) => {
                    const payload = action.payload;
                    return this.authService.askToken(payload.username, payload.password).pipe(
                        map(authenticationInfo => new AcceptLogIn(authenticationInfo)),
                        catchError(error => {
                                console.error('error while trying log in', error);
                                return of(new RejectLogIn({denialReason: 'unable to authenticate the user'}));
                            }
                        ));
                })
            );

    @Effect()
    TryToLogOut: Observable<AuthenticationActions> =
        this.actions$.pipe(
            ofType(AuthenticationActionTypes.TryToLogOut),
            map((action: TryToLogOut) => {
                this.authService.clearAuthenticationInformation();
                return new AcceptLogOut();
            })
        );

    @Effect()
    AcceptLogOut: Observable<Action> =
        this.actions$.pipe(
            ofType(AuthenticationActionTypes.AcceptLogOut),
            map((action: AcceptLogOut) => {
                return new RouterGo({path: ['/login']})
            })
        );

    @Effect()
    RejectLogInAttempt: Observable<Action> =
        this.actions$.pipe(ofType(AuthenticationActionTypes.RejectLogIn),
            tap(() => {
                this.authService.clearAuthenticationInformation();
            }),
            map(action => new AcceptLogOut()));

    @Effect()
    CheckAuthentication: Observable<AuthenticationActions> =
        this.actions$
            .pipe(
                ofType(AuthenticationActionTypes.CheckAuthenticationStatus),
                switchMap(() => {
                    return this.authService.checkAuthentication(this.authService.extractToken());
                }),
                map((payload: CheckTokenResponse) => {
                    if (this.authService.isExpirationDateOver()) {
                        return this.handleRejectedLogin('expiration date exceeded');
                    }

                    return this.handleLogInAttempt(payload);
                }),
                catchError((err, caught) => {
                    console.error(err);
                    this.store.dispatch(new RejectLogIn({denialReason: err}));
                    return caught;
                })
            );

    @Effect()
    AcceptLogIn: Observable<Action> =
        this.actions$.pipe(
            ofType(AuthenticationActionTypes.AcceptLogIn),
            map((action: AcceptLogIn) => new RouterGo({path: ['/feed']}))
        );

    handleRejectedLogin(errorMsg: string): AuthenticationActions {
        this.authService.clearAuthenticationInformation();
        return new RejectLogIn({denialReason: errorMsg});

    }

    handleLogInAttempt(payload: CheckTokenResponse): AuthenticationActions {
        if (payload) {
            const authInfo = this.authService.extractIdentificationInformation();
            return new AcceptLogIn(authInfo);

        }
        return this.handleRejectedLogin('invalid token');
    }


}
