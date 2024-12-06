/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Observable} from 'rxjs';
import {AuthHandler, HttpAuthInfo} from './auth-handler';
import {HttpHeaders} from '@angular/common/http';
import {environment} from '@env/environment';

export class CodeAuthenticationHandler extends AuthHandler {
    initializeAuthentication() {
        let authCode;
        const searchCodeString = 'code=';
        const foundIndex = window.location.href.indexOf(searchCodeString);
        if (foundIndex !== -1) {
            authCode = window.location.href.substring(foundIndex + searchCodeString.length);
        } else this.saveOpfabRoute();
        this.checkAuthentication().subscribe((token) => {
            // no token stored or token invalid
            if (!token) {
                if (authCode) {
                    this.askToken(authCode).subscribe({
                        next: (authInfo) => {
                            this.userAuthenticated.next(this.getUserFromAuthInfo(authInfo));
                        },
                        error: (error) => this.handleErrorOnTokenGeneration(error, 'code')
                    });
                } else {
                    this.moveToLoginPage();
                }
            } else {
                if (this.isTokenStillValid()) {
                    this.userAuthenticated.next(null);
                } else {
                    this.moveToLoginPage();
                }
            }
        });
    }
    // With the code flow it is not possible to pass a hash in the redirect_uri
    // so we need to save in the session storage the route before login.
    // We do not use the local storage because the local storage is shared between tabs
    private saveOpfabRoute() {
        const hash = window.location.hash;
        const hashLength = hash.length;
        const routeAfterLogin = hashLength > 2 ? hash.substring(1, hashLength) : '/';
        window.sessionStorage.setItem('route_after_login_for_code_flow', routeAfterLogin);
    }

    public getOpfabRouteAfterLogin(): string {
        return window.sessionStorage.getItem('route_after_login_for_code_flow');
    }

    private askToken(code: string): Observable<HttpAuthInfo> {
        const params = new URLSearchParams();
        params.append('code', code);
        params.append('grant_type', 'authorization_code');
        params.append('clientId', this.clientId);
        params.append('redirect_uri', this.getRedirectUri());

        const headers = new HttpHeaders({'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'});
        return this.httpClient.post<HttpAuthInfo>(this.askTokenUrl, params.toString(), {headers: headers});
    }

    private moveToLoginPage() {
        if (!this.delegateUrl) {
            window.location.href = `${environment.url}auth/code/redirect_uri=${this.getRedirectUri()}`;
        } else {
            window.location.href = `${this.delegateUrl}&redirect_uri=${this.getRedirectUri()}`;
        }
    }

    private getRedirectUri(): string {
        return `${location.origin}${location.pathname}`;
    }
}
