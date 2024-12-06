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
        }
        this.checkAuthentication().subscribe((payload) => {
            // no token stored or token invalid
            if (!payload) {
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
