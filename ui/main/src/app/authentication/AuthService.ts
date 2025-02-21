/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Message} from '@ofServices/alerteMessage/model/Message';
import {OAuthService} from 'angular-oauth2-oidc';
import {ConfigService} from 'app/services/config/ConfigService';
import {LoggerService as logger} from 'app/services/logs/LoggerService';
import {CurrentUserStore} from '../store/CurrentUserStore';
import {Observable, Subject} from 'rxjs';
import {AuthHandler} from './AuthHandler';
import {AuthenticatedUser, AuthenticationMode} from './AuthModel';
import {CodeAuthenticationHandler} from './CodeAuthenticationHandler';
import {ImplicitAuthenticationHandler} from './ImplicitAuthenticationHandler';
import {NoneAuthenticationHandler} from './NoneAuthenticationHandler';
import {PasswordAuthenticationHandler} from './PasswordAuthenticationHandler';
import {NavigationService} from '@ofServices/navigation/NavigationService';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private mode: AuthenticationMode = AuthenticationMode.NONE;
    private readonly rejectLoginMessage = new Subject<Message>();
    private login: string;

    private authHandler: AuthHandler;

    constructor(
        private readonly oauthServiceForImplicitMode: OAuthService,
        private readonly httpClient: HttpClient
    ) {}

    public initializeAuthentication() {
        this.login = localStorage.getItem('identifier');
        CurrentUserStore.setToken(localStorage.getItem('token'));
        this.mode = ConfigService.getConfigValue(
            'security.oauth2.flow.mode',
            'password'
        ).toLowerCase() as AuthenticationMode;
        logger.info(`Auth mode set to ${this.mode}`);
        if (this.mode !== AuthenticationMode.NONE) CurrentUserStore.setAuthenticationUsesToken();
        switch (this.mode) {
            case AuthenticationMode.PASSWORD:
                this.authHandler = new PasswordAuthenticationHandler(this.httpClient);
                break;
            case AuthenticationMode.CODE:
                this.authHandler = new CodeAuthenticationHandler(this.httpClient);
                break;
            case AuthenticationMode.NONE:
                this.authHandler = new NoneAuthenticationHandler(this.httpClient);
                break;
            case AuthenticationMode.IMPLICIT:
                this.authHandler = new ImplicitAuthenticationHandler(this.httpClient, this.oauthServiceForImplicitMode);
                break;
            default:
                logger.error('No valid authentication mode');
                return;
        }
        this.startAuthentication();
    }

    private startAuthentication() {
        this.authHandler.getUserAuthenticated().subscribe((user) => {
            if (user !== null) {
                this.login = user.login;
                this.saveUserInStorage(user);
                CurrentUserStore.setToken(user.token);
            }
            CurrentUserStore.setCurrentUserAuthenticationValid(this.login);
            this.authHandler.regularCheckIfTokenExpireSoon();
            this.authHandler.regularCheckIfTokenIsExpired();
            this.redirectToUrlChoosenBeforeLogin();
        });
        this.authHandler.getTokenWillSoonExpire().subscribe(() => {
            CurrentUserStore.setSessionWillSoonExpire();
        });
        this.authHandler.getTokenExpired().subscribe(() => {
            CurrentUserStore.setSessionExpired();
        });
        this.authHandler.getRejectAuthentication().subscribe((message) => {
            logger.error('Authentication reject ' + JSON.stringify(message));
            this.rejectLogin(message);
        });
        this.authHandler.initializeAuthentication();
    }

    private saveUserInStorage(user: AuthenticatedUser) {
        localStorage.setItem('identifier', user.login);
        localStorage.setItem('token', user.token);
        localStorage.setItem('expirationDate', user.expirationDate?.getTime().toString());
    }

    private redirectToUrlChoosenBeforeLogin(): void {
        NavigationService.navigateTo(decodeURI(this.authHandler.getOpfabRouteAfterLogin()));
    }

    public rejectLogin(message: Message) {
        this.removeUserFromStorage();
        this.authHandler.logout();
        this.rejectLoginMessage.next(message);
        this.goBackToLoginPage();
    }

    private removeUserFromStorage() {
        localStorage.removeItem('identifier');
        localStorage.removeItem('token');
        localStorage.removeItem('expirationDate');
    }

    public logout() {
        logger.info('Auth logout');
        this.removeUserFromStorage();
        this.authHandler.logout();
        if (this.mode !== AuthenticationMode.IMPLICIT)
            window.location.href = ConfigService.getConfigValue('security.logout-url', 'https://opfab.github.io');
    }

    private goBackToLoginPage() {
        logger.info('Go back to login page');
        this.removeUserFromStorage();
        this.redirectToUrlChoosenBeforeLogin();
    }

    public getAuthMode(): AuthenticationMode {
        return this.mode;
    }

    public getRejectLoginMessage(): Observable<Message> {
        return this.rejectLoginMessage;
    }

    public tryToLogin(username: string, password: string) {
        logger.info('Try to login');
        this.authHandler.tryToLogin(username, password);
    }
}
