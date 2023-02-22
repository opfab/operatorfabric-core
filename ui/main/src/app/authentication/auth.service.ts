/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Message} from '@ofModel/message.model';
import {SoundNotificationService} from 'app/business/services/sound-notification.service';
import {OAuthService} from 'angular-oauth2-oidc';
import {ConfigService} from 'app/business/services/config.service';
import {GuidService} from 'app/business/services/guid.service';
import {OpfabLoggerService} from 'app/business/services/logs/opfab-logger.service';
import {OpfabEventStreamService} from 'app/business/services/opfabEventStream.service';
import {UserService} from 'app/business/services/user.service';
import {CurrentUserStore} from 'app/business/store/current-user.store';
import {Observable, Subject} from 'rxjs';
import {AuthHandler} from './auth-handler';
import {AuthenticatedUser, AuthenticationMode} from './auth.model';
import {CodeAuthenticationHandler} from './code-authentication-handler';
import {ImplicitAuthenticationHandler} from './implicit-authentication-handler';
import {NoneAuthenticationHandler} from './none-authentication-handler';
import {PasswordAuthenticationHandler} from './password-authentication-handler';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private mode: AuthenticationMode = AuthenticationMode.NONE;
    private rejectLoginMessage = new Subject<Message>();
    private login: string;

    private authHandler: AuthHandler;

    constructor(
        private configService: ConfigService,
        private currentUserStore: CurrentUserStore,
        private opfabEventStreamService: OpfabEventStreamService,
        private logger: OpfabLoggerService,
        private soundNotificationService: SoundNotificationService,
        private router: Router,
        private oauthServiceForImplicitMode: OAuthService,
        private httpClient: HttpClient,
        private guidService: GuidService,
        private userService: UserService
    ) {}

    public initializeAuthentication() {
        this.login = localStorage.getItem('identifier');
        this.currentUserStore.setToken(localStorage.getItem('token'));
        this.mode = this.configService
            .getConfigValue('security.oauth2.flow.mode', 'password')
            .toLowerCase() as AuthenticationMode;
        this.logger.info(`Auth mode set to ${this.mode}`);
        if (this.mode !== AuthenticationMode.NONE) this.currentUserStore.setAuthenticationUsesToken();
        switch (this.mode) {
            case AuthenticationMode.PASSWORD:
                this.authHandler = new PasswordAuthenticationHandler(this.configService, this.httpClient, this.logger);
                break;
            case AuthenticationMode.CODE:
                this.authHandler = new CodeAuthenticationHandler(this.configService, this.httpClient, this.logger);
                break;
            case AuthenticationMode.NONE:
                this.authHandler = new NoneAuthenticationHandler(
                    this.configService,
                    this.httpClient,
                    this.logger,
                    this.userService
                );
                break;
            case AuthenticationMode.IMPLICIT:
                this.authHandler = new ImplicitAuthenticationHandler(
                    this.configService,
                    this.httpClient,
                    this.logger,
                    this.oauthServiceForImplicitMode
                );
                break;
            default:
                this.logger.error('No valid authentication mode');
                return;
        }
        this.startAuthentication();
    }

    private startAuthentication() {
        this.authHandler.getUserAuthenticated().subscribe((user) => {
            if (user !== null) {
                user.clientId = this.guidService.getCurrentGuid();
                this.login = user.login;
                this.saveUserInStorage(user);
                this.currentUserStore.setToken(user.token);
            }
            this.currentUserStore.setCurrentUserAuthenticationValid(this.login);
            this.authHandler.regularCheckTokenValidity();
            this.redirectToCurrentLocation();
        });
        this.authHandler.getSessionExpired().subscribe(() => {
            this.currentUserStore.setSessionExpired();
        });
        this.authHandler.getRejectAuthentication().subscribe((message) => {
            this.logger.error('Authentication reject ' + JSON.stringify(message));
            this.rejectLogin(message);
        });
        this.authHandler.initializeAuthentication();
    }

    private saveUserInStorage(user: AuthenticatedUser) {
        localStorage.setItem('identifier', user.login);
        localStorage.setItem('token', user.token);
        localStorage.setItem('expirationDate', user.expirationDate?.getTime().toString());
        localStorage.setItem('clientId', user.clientId.toString());
    }

    private redirectToCurrentLocation(): void {
            const pathname = window.location.hash;
            const hashLength = pathname.length;
            const lastDestination = hashLength > 2 ? pathname.substring(1, hashLength) : '/feed';
            this.router.navigate([lastDestination]);
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
        localStorage.removeItem('clientId');
    }

    public logout() {
        this.logger.info('Logout');
        this.soundNotificationService.stopService();
        this.opfabEventStreamService.closeEventStream();
        this.removeUserFromStorage();
        this.authHandler.logout();
        window.location.href = this.configService.getConfigValue('security.logout-url', 'https://opfab.github.io');
    }

    private goBackToLoginPage() {
        this.logger.info('Go back to login page');
        this.removeUserFromStorage();
        this.redirectToCurrentLocation();
    }

    public getAuthMode(): AuthenticationMode {
        return this.mode;
    }

    public getRejectLoginMessage(): Observable<Message> {
        return this.rejectLoginMessage;
    }

    public tryToLogin(username: string, password: string) {
        console.log("Try to login");
        this.authHandler.tryToLogin(username, password);
    }
}
