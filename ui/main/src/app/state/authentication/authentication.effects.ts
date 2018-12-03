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
    AuthenticationActions,
    AuthenticationActionTypes,
    RejectLogIn
} from '@state/authentication/authentication.actions';
import {AuthenticationService, AuthObjet, CheckTokenResponse, ONE_SECOND} from '@core/services/authentication.service';
import {catchError, map, switchMap} from 'rxjs/operators';

@Injectable()
export class AuthenticationEffects {

    constructor(private actions$: Actions, private authService: AuthenticationService) {
    }

    @Effect()
    TempAutomaticLogin: Observable<AuthenticationActions> =
        this.actions$
            .pipe(
                ofType(AuthenticationActionTypes.TempAutomaticLogIn),
                switchMap(() => this.authService.tempLogin()),
                this.handleTempAutomaticAuth()
            );

    @Effect()
    TempAutomaticReconnection: Observable<AuthenticationActions> =
        this.actions$
            .pipe(
            ofType(AuthenticationActionTypes.RejectLogIn),
            switchMap(() => this.authService.tempLogin()),
            this.handleTempAutomaticAuth()
        );

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
                    if (this.authService.verifyExpirationDate()) {
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

    private handleTempAutomaticAuth() {
        return map((authObj: AuthObjet) => {
            const expirationDate = new Date().getTime() + ONE_SECOND * authObj.expires_in;
            return new AcceptLogIn({
                identifier: authObj.identifier
                , token: authObj.access_token
                , expirationDate: new Date(expirationDate)
            });
        });
    }

    private handleExpirationDateOver(): AuthenticationActions {
        this.authService.clearAuthenticationInformation();
        return new RejectLogIn({denialReason: 'expiration date exceeded'});

    }

    private handleLogInAttempt(payload: CheckTokenResponse, token): AuthenticationActions {
        if (payload) {
            const authInfo = this.authService.registerAuthenticationInformation(payload, token);
            return new AcceptLogIn({
                identifier: authInfo.identifier,
                token: token, expirationDate: authInfo.expirationDate
            });

        }
        this.authService.clearAuthenticationInformation();
        return new RejectLogIn({denialReason: 'invalid token'}) as AuthenticationActions;
    }
}
