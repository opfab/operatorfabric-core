/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {catchError, map, Observable, of} from 'rxjs';
import {AuthHandler, HttpAuthInfo} from './auth-handler';
import {HttpHeaders} from '@angular/common/http';
import {I18n} from '@ofModel/i18n.model';
import {Message, MessageLevel} from '@ofModel/message.model';

export class PasswordAuthenticationHandler extends AuthHandler {
    initializeAuthentication() {
        this.checkAuthentication().subscribe((payload) => {
            // no token stored or token invalid
            if (!payload) this.rejectAuthentication.next(new Message('No token (password mode)'));
            else {
                if (!this.isExpirationDateOver()) {
                    this.userAuthenticated.next(null);
                } else
                    this.rejectAuthentication.next(
                        new Message(
                            'The stored token has expired',
                            MessageLevel.ERROR,
                            new I18n('login.error.token.expiration')
                        )
                    );
            }
        });
    }

    tryToLogin(username: string, password: string) {
        this.askToken(username, password)
            .pipe(
                map((authenticationInfo) => {
                    this.userAuthenticated.next(this.getUserFromAuthInfo(authenticationInfo));
                }),
                catchError((errorResponse) => {
                    this.handleErrorOnTokenGeneration(errorResponse, 'authenticate');
                    return of(null);
                })
            )
            .subscribe();
    }

    askToken(login: string, password: string): Observable<HttpAuthInfo> {
        const params = new URLSearchParams();
        params.append('username', login);
        params.append('password', password);
        params.append('grant_type', 'password');
        params.append('clientId', this.clientId);
        const headers = new HttpHeaders({'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'});
        return this.httpClient.post<HttpAuthInfo>(this.askTokenUrl, params.toString(), {headers: headers});
    }
}
