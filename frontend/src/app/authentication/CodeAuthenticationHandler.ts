/* Copyright (c) 2023-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AuthHandler} from './AuthHandler';
import {HttpClient} from '@angular/common/http';
import {AuthConfig, EventType, JwksValidationHandler, OAuthEvent, OAuthService} from 'angular-oauth2-oidc';
import {CurrentUserStore} from '@ofStore/CurrentUserStore';
import {AuthenticatedUser} from './AuthModel';
import {LoggerService} from '@ofServices/logs/LoggerService';
import {ConfigService} from '@ofServices/config/ConfigService';

export class CodeAuthenticationHandler extends AuthHandler {
    constructor(
        httpClient: HttpClient,
        private readonly oauthService: OAuthService
    ) {
        super(httpClient);
    }

    public async initializeAuthentication() {
        const authConfig: AuthConfig = {
            issuer: this.delegateUrl,
            redirectUri: location.href,
            silentRefreshRedirectUri: `${location.origin}${location.pathname}silent-refresh.html`,
            clientId: this.clientId,
            scope: 'openid profile email',
            showDebugInformation: false,
            sessionChecksEnabled: false,
            clearHashAfterLogin: false,
            requireHttps: false,
            useSilentRefresh: ConfigService.getConfigValue('security.oauth2.useSilentRefresh', false),
            postLogoutRedirectUri: ConfigService.getConfigValue(
                'security.post-logout-url',
                `${location.origin}${location.pathname}`
            )
        };
        // In the code flow, passing a hash in the redirect_uri is not possible, so we store the route before login.
        // Only store the route if this is not the redirect back from the auth server (i.e., after login).
        // We detect a redirect back from the auth server if 'state=' is present in the URL.
        // In case a url contains 'state=' without being a redirect from the auth server, the route will not be saved,
        // and the user will be redirected to '/' after login (which is acceptable).
        if (!globalThis.location.href.includes('state=')) {
            this.saveOpfabRoute();
        }

        this.oauthService.configure(authConfig);
        this.oauthService.setupAutomaticSilentRefresh();
        this.oauthService.tokenValidationHandler = new JwksValidationHandler();
        await this.oauthService.loadDiscoveryDocument().then(() => {
            this.login();
        });
        this.oauthService.events.subscribe((e) => {
            this.dispatchOAuth2Events(e);
        });
    }

    private async login() {
        await this.oauthService.tryLogin().then(() => {
            if (this.oauthService.hasValidAccessToken()) {
                this.setUserAuthenticated();
                this.updateAfterSilentRefresh();
            } else {
                this.oauthService.initCodeFlow();
            }
        });
    }

    // hack to update token as silent refresh updates the token in background
    // we need to update regularly as we do not catch when refresh is done
    updateAfterSilentRefresh() {
        setInterval(() => {
            const token = this.oauthService.getAccessToken();
            const expirationDate = new Date(this.oauthService.getAccessTokenExpiration());
            localStorage.setItem('token', token);
            localStorage.setItem('expirationDate', expirationDate?.getTime().toString());
            CurrentUserStore.setToken(token);
        }, 5000);
    }

    private setUserAuthenticated() {
        const user = new AuthenticatedUser();
        const identityClaims = this.oauthService.getIdentityClaims();
        user.login = identityClaims[this.loginClaim];
        user.token = this.oauthService.getAccessToken();
        user.expirationDate = new Date(this.oauthService.getAccessTokenExpiration());
        this.userAuthenticated.next(user);
    }

    private dispatchOAuth2Events(event: OAuthEvent) {
        const eventType: EventType = event.type;
        switch (eventType) {
            // We can have a token_error or token_refresh_error when it is not possible to refresh token
            // This case arise for example when using a SSO and the session is not valid anymore (session timeout)
            case 'token_error':
            case 'token_refresh_error':
                this.tokenWillSoonExpire.next(true);
                this.tokenExpired.next(true);
                break;
            case 'logout': {
                LoggerService.info('Logout from code flow');
                break;
            }
        }
    }
    // We save in the session storage the route before login.
    // We do not use the local storage because the local storage is shared between tabs
    private saveOpfabRoute() {
        const hash = globalThis.location.hash;
        const hashLength = hash.length;
        const routeAfterLogin = hashLength > 2 ? hash.substring(1, hashLength) : '/';
        globalThis.sessionStorage.setItem('route_after_login_for_code_flow', routeAfterLogin);
    }

    public getOpfabRouteAfterLogin(): string {
        return globalThis.sessionStorage.getItem('route_after_login_for_code_flow');
    }

    public logout() {
        this.oauthService.logOut();
    }
}
