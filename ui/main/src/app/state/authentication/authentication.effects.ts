/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Observable, of} from 'rxjs';
import {
    AcceptLogIn,
    AcceptLogOut,
    AuthenticationActions,
    AuthenticationActionTypes,
    RejectLogIn,
    TryToLogIn,
    TryToLogOut
} from '@state/authentication/authentication.actions';
import {CheckTokenResponse, AuthenticationService} from '@core/services/authentication.service';
import {catchError, map, switchMap, tap} from 'rxjs/operators';
import {RouterGo} from "ngrx-router";
import {Action} from "@ngrx/store";


@Injectable()
export class AuthenticationEffects {

    constructor(private actions$: Actions, private authService: AuthenticationService) {
    }

    @Effect()
    TryToLogIn: Observable<AuthenticationActions> =
        this.actions$
            .pipe(
                ofType(AuthenticationActionTypes.TryToLogIn),
                switchMap((action: TryToLogIn) => {
                    const payload = action.payload;

                    return this.authService.beg4Login(payload.username, payload.password);
                }),
                map(authenticationInfo => {
                    return new AcceptLogIn(authenticationInfo);
                }),
                catchError(error => of(error, new RejectLogIn(error)))
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
                return new RouterGo({path:['/login']})
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
                    const token = this.authService.extractToken();
                    return this.authService.checkAuthentication(token);
                }),
                map((payload: CheckTokenResponse) => {
                    if (this.authService.isExpirationDateOver()) {
                        return this.handleExpirationDateOver();
                    }

                    const token = this.authService.extractToken();
                    return this.handleLogInAttempt(payload, token);
                }),
                catchError(err => {
                    console.error(err);
                    return of(new RejectLogIn({denialReason: err}));
                })
            );

    @Effect()
    AcceptLogIn: Observable<Action> =
        this.actions$.pipe(
            ofType(AuthenticationActionTypes.AcceptLogIn),
            map((action:AcceptLogIn) => new RouterGo({path:['/feed']}))
        );

    private handleExpirationDateOver(): AuthenticationActions {
        this.authService.clearAuthenticationInformation();
        return new RejectLogIn({denialReason: 'expiration date exceeded'});

    }

    private handleLogInAttempt(payload: CheckTokenResponse, token): AuthenticationActions {
        if (payload) {
            const authInfo = this.authService.extractIndentificationInformation();
            return new AcceptLogIn(authInfo);

        }
        this.authService.clearAuthenticationInformation();
        return new RejectLogIn({denialReason: 'invalid token'}) as AuthenticationActions;
    }
}
