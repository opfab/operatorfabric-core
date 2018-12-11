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
    AcceptLogIn, AcceptLogOut,
    IdentificationActions,
    IdentificationActionTypes,
    RejectLogIn, TryToLogIn, TryToLogOut
} from '@state/identification/identification.actions';
import {IdentificationService, AuthObject, CheckTokenResponse, ONE_SECOND} from '@core/services/identification.service';
import {catchError, map, switchMap} from 'rxjs/operators';
import {ofRoute, RouterGo} from "ngrx-router";
import {Action} from "@ngrx/store";


@Injectable()
export class IdentificationEffects {

    constructor(private actions$: Actions, private authService: IdentificationService) {
    }

    @Effect()
    TempAutomaticLogin: Observable<IdentificationActions> =
        this.actions$
            .pipe(
                ofType(IdentificationActionTypes.TempAutomaticLogIn),
                switchMap(() => this.authService.tempLogin()),
                this.handleTempAutomaticAuth()
            );

    @Effect()
    TryToLogIn: Observable<IdentificationActions> =
        this.actions$
            .pipe(
                ofType(IdentificationActionTypes.TryToLogIn),
                switchMap((action: TryToLogIn) => {
                    const payload = action.payload;

                    return this.authService.beg4Login(payload.username, payload.password);
                }),
                map(authenticationInfo => {
                    console.log(`auth.token: '${authenticationInfo.token}',
                     auth.expirin:'${authenticationInfo.expirationDate}'
                     clientId: '${authenticationInfo.clientId}'`);
                    return new AcceptLogIn(authenticationInfo);
                }),
                catchError(error => of(error, new RejectLogIn(error)))
            );

    @Effect()
    TryToLogOut: Observable<IdentificationActions> =
        this.actions$.pipe(
            ofType(IdentificationActionTypes.TryToLogOut),
            map((action: TryToLogOut) => {
                this.authService.clearAuthenticationInformation();
                return new AcceptLogOut();
            })
        );

    @Effect()
    AcceptLogOut: Observable<Action> =
        this.actions$.pipe(
            ofType(IdentificationActionTypes.AcceptLogOut),
            map((action: AcceptLogOut) => {
                return new RouterGo({path:['/login']})
            })
        );

    // @Effect()
    // TempAutomaticReconnection: Observable<IdentificationActions> =
    //     this.actions$
    //         .pipe(
    //         ofType(IdentificationActionTypes.RejectLogIn),
    //         switchMap(() => this.authService.tempLogin()),
    //         this.handleTempAutomaticAuth()
    //     );

    @Effect()
    CheckAuthentication: Observable<IdentificationActions> =
        this.actions$
            .pipe(
                ofType(IdentificationActionTypes.CheckAuthenticationStatus),
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
        return map((authObj: AuthObject) => {
            const expirationDate = new Date().getTime() + ONE_SECOND * authObj.expires_in;
            return new AcceptLogIn({
                identifier: authObj.identifier
                , token: authObj.access_token
                , expirationDate: new Date(expirationDate)
                , clientId: authObj.clientId
            });
        });
    }

    private handleExpirationDateOver(): IdentificationActions {
        this.authService.clearAuthenticationInformation();
        return new RejectLogIn({denialReason: 'expiration date exceeded'});

    }

    private handleLogInAttempt(payload: CheckTokenResponse, token): IdentificationActions {
        if (payload) {
            const authInfo = this.authService.registerAuthenticationInformation(payload, token);
            return new AcceptLogIn({
                identifier: authInfo.identifier,
                token: token,
                expirationDate: authInfo.expirationDate,
                clientId: authInfo.clientId
            });

        }
        this.authService.clearAuthenticationInformation();
        return new RejectLogIn({denialReason: 'invalid token'}) as IdentificationActions;
    }
}
