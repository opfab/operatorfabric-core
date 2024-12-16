/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '@env/environment';
import {I18n} from '@ofModel/i18n.model';
import {Message, MessageLevel} from '@ofModel/message.model';
import {ConfigService} from 'app/services/config/ConfigService';
import {LoggerService as logger} from 'app/services/logs/LoggerService';
import {AuthenticatedUser} from './auth.model';
import {jwtDecode} from 'jwt-decode';
import {Observable, of, Subject} from 'rxjs';

export const ONE_SECOND = 1000;
export const MILLIS_TO_WAIT_BETWEEN_TOKEN_EXPIRATION_DATE_CONTROLS = 5000;
export const EXPIRE_CLAIM = 'exp';
export abstract class AuthHandler {
    protected checkTokenUrl = `${environment.url}auth/check_token`;
    protected askTokenUrl = `${environment.url}auth/token`;

    protected tokenWillSoonExpire = new Subject<boolean>();
    protected tokenExpired = new Subject<boolean>();
    protected userAuthenticated = new Subject<AuthenticatedUser>();
    protected rejectAuthentication = new Subject<Message>();

    protected secondsToCloseSession: number;
    protected clientId: string;
    protected delegateUrl: string;
    protected loginClaim: string;

    constructor(protected httpClient: HttpClient) {
        this.secondsToCloseSession = ConfigService.getConfigValue('secondsToCloseSession', 60);
        this.clientId = ConfigService.getConfigValue('security.oauth2.client-id', null);
        this.delegateUrl = ConfigService.getConfigValue('security.oauth2.flow.delegate-url', null);
        this.loginClaim = ConfigService.getConfigValue('security.jwt.login-claim', 'sub');
    }

    abstract initializeAuthentication();

    public tryToLogin(username: string, password: string) {
        // Not implemented by default
    }
    public logout() {
        // not implemented by default
    }

    public getTokenWillSoonExpire(): Observable<boolean> {
        return this.tokenWillSoonExpire.asObservable();
    }

    public getTokenExpired(): Observable<boolean> {
        return this.tokenExpired.asObservable();
    }

    public getUserAuthenticated(): Observable<AuthenticatedUser> {
        return this.userAuthenticated.asObservable();
    }

    public getOpfabRouteAfterLogin(): string {
        const hash = window.location.hash;
        const hashWithoutAuthenticationFields = hash.split('&')[0].split('?')[0];
        const hashLength = hash.length;
        const routeAfterLogin = hashLength > 2 ? hashWithoutAuthenticationFields.substring(1, hashLength) : '/';

        return routeAfterLogin;
    }

    public getRejectAuthentication(): Observable<Message> {
        return this.rejectAuthentication.asObservable();
    }

    protected checkAuthentication(): Observable<any> {
        const token = localStorage.getItem('token');
        if (token) {
            const postData = new URLSearchParams();
            postData.append('token', token);
            const headers = new HttpHeaders({'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'});
            return this.httpClient.post(this.checkTokenUrl, postData.toString(), {headers: headers});
        }
        return of(null);
    }

    protected getUserFromAuthInfo(authInfo: HttpAuthInfo): AuthenticatedUser {
        let expirationDate;
        const jwt = this.decodeToken(authInfo.access_token);
        if (authInfo.expires_in) {
            expirationDate = Date.now() + ONE_SECOND * authInfo.expires_in;
        } else {
            expirationDate = jwt[EXPIRE_CLAIM];
        }
        const user = new AuthenticatedUser();
        user.login = jwt[this.loginClaim];
        user.token = authInfo.access_token;
        user.expirationDate = new Date(expirationDate);
        return user;
    }

    private decodeToken(token: string): any {
        try {
            return jwtDecode(token);
        } catch (err) {
            logger.error(' Error in token decoding ' + err);
            return null;
        }
    }

    protected handleErrorOnTokenGeneration(errorResponse, category: string) {
        let message, key;
        const params = new Object();
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
        logger.error(message + ' - ' + JSON.stringify(errorResponse));
        this.rejectAuthentication.next(new Message(message, MessageLevel.ERROR, new I18n(key, params)));
    }

    public regularCheckIfTokenExpireSoon() {
        if (this.isTokenStillValid()) {
            setTimeout(() => {
                this.regularCheckIfTokenExpireSoon();
            }, MILLIS_TO_WAIT_BETWEEN_TOKEN_EXPIRATION_DATE_CONTROLS);
        } else {
            // Will send Logout if token is expired
            this.tokenWillSoonExpire.next(true);
        }
    }
    protected isTokenStillValid(): boolean {
        // + to convert the stored number as a string back to number
        const expirationDate = +localStorage.getItem('expirationDate');
        const isNotANumber = isNaN(expirationDate);
        const stillValid = expirationDate - this.secondsToCloseSession * 1000 > Date.now();
        return !isNotANumber && stillValid;
    }

    public regularCheckIfTokenIsExpired() {
        if (this.isTokenExpired()) {
            setTimeout(() => {
                this.regularCheckIfTokenIsExpired();
            }, MILLIS_TO_WAIT_BETWEEN_TOKEN_EXPIRATION_DATE_CONTROLS);
        } else {
            // Will send Logout if token is expired
            this.tokenExpired.next(true);
        }
    }

    private isTokenExpired(): boolean {
        // + to convert the stored number as a string back to number
        const expirationDate = +localStorage.getItem('expirationDate');
        const isNotANumber = isNaN(expirationDate);
        const stillValid = expirationDate > Date.now();
        return !isNotANumber && stillValid;
    }
}

export class HttpAuthInfo {
    constructor(
        public access_token: string,
        public expires_in: number,
        public identifier?: string
    ) {}
}
