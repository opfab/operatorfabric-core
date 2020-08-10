/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {catchError, map, switchMap, tap} from 'rxjs/operators';
import {Guid} from 'guid-typescript';
import {
    AcceptLogIn,
    CheckAuthenticationStatus,
    InitAuthStatus,
    PayloadForSuccessfulAuthentication,
    UnableToRefreshOrGetToken,
    UnAuthenticationFromImplicitFlow
} from '@ofActions/authentication.actions';
import {environment} from '@env/environment';
import {GuidService} from '@ofServices/guid.service';
import {AppState} from '@ofStore/index';
import {Store} from '@ngrx/store';
import {ConfigService} from '@ofServices/config.service';
import * as jwt_decode from 'jwt-decode';
import * as _ from 'lodash';
import {User} from '@ofModel/user.model';
import {EventType as OAuthType, JwksValidationHandler, OAuthEvent, OAuthService} from 'angular-oauth2-oidc';
import {implicitAuthenticationConfigFallback} from '@ofServices/authentication/auth-implicit-flow.config';
import {redirectToCurrentLocation} from '../../app-routing.module';
import {Router} from '@angular/router';

export enum LocalStorageAuthContent {
    token = 'token',
    expirationDate = 'expirationDate',
    identifier = 'identifier',
    clientId = 'clientId'
}

export const ONE_SECOND = 1000;
export const MILLIS_TO_WAIT_BETWEEN_TOKEN_EXPIRATION_DATE_CONTROLS = 5000;

@Injectable()
export class AuthenticationService {

    /** url to check authentication token (jwt) */
    private checkTokenUrl = `${environment.urls.auth}/check_token`;
    /** url to ask for an authentication token (jwt) */
    private askTokenUrl = `${environment.urls.auth}/token`;
    private userDataUrl = `${environment.urls.users}/users`;
    private clientId: string;
    private loginClaim: string;
    private expireClaim: string;
    private delegateUrl: string;
    private givenNameClaim: string;
    private familyNameClaim: string;
    private mode: string;
    private authModeHandler: AuthenticationModeHandler;
    private implicitConf = implicitAuthenticationConfigFallback;

    /**
     * @constructor
     * @param httpClient - Angular build-in
     * @param guidService - create and store the unique id for this application and user
     * @param store - NGRX store
     * @param oauthService - manage implicit flow for OAuth2
     * @param router - angular router service
     * @param configService - operator fabric loading web-ui.json from back-end

     */
    constructor(private httpClient: HttpClient
        , private guidService: GuidService
        , private store: Store<AppState>
        , private oauthService: OAuthService
        , private router: Router
        , private configService: ConfigService
    ) {
        this.assignConfigurationProperties(this.configService.getConfigValue('security'));
        this.authModeHandler = this.instantiateAuthModeHandler(this.mode);
    }


    /**
     * extract Oauth 2.0 configuration from settings and store it in the service
     * @param oauth2Conf - settings return by the back-end config service
     */
    assignConfigurationProperties(oauth2Conf) {
        this.clientId = _.get(oauth2Conf, 'oauth2.client-id', null);
        this.delegateUrl = _.get(oauth2Conf, 'oauth2.flow.delegate-url', null);
        this.loginClaim = _.get(oauth2Conf, 'jwt.login-claim', 'sub');
        this.givenNameClaim = _.get(oauth2Conf, 'jwt.given-name-claim', 'given_name');
        this.familyNameClaim = _.get(oauth2Conf, 'jwt.family-name-claim', 'family_name');
        this.expireClaim = _.get(oauth2Conf, 'jwt.expire-claim', 'exp');
        this.mode = _.get(oauth2Conf, 'oauth2.flow.mode', 'PASSWORD');
    }


    /**
     * Choose to handle the OAuth 2.0 using implicit workflow
     * if mode equals to 'implicit' other manage password grand
     * or code flow.
     * @param mode - extracted from config web-service settings
     */
    instantiateAuthModeHandler(mode: string): AuthenticationModeHandler {
        if (mode.toLowerCase() === 'implicit') {
            this.implicitConf = {
                ...this.implicitConf
                , issuer: this.delegateUrl
                , clientId: this.clientId
                , clearHashAfterLogin: false
            };
            return new ImplicitAuthenticationHandler(this
                , this.store
                , sessionStorage
                , this.oauthService
                , this.guidService
                , this.router
                , this.implicitConf
                , this.givenNameClaim
                , this.familyNameClaim);
        }
        return new PasswordOrCodeAuthenticationHandler(this, this.store);
    }


    regularCheckTokenValidity() {
        if (this.verifyExpirationDate()) {
            setTimeout(() => {
                this.regularCheckTokenValidity();
            }, MILLIS_TO_WAIT_BETWEEN_TOKEN_EXPIRATION_DATE_CONTROLS);
        } else {// Will send Logout if token is expired
            this.store.dispatch(new UnableToRefreshOrGetToken());
        }

    }

    /**
     * @return true if the expiration date stored in the `localestorage` is still running, false otherwise.
     */
    verifyExpirationDate(): boolean {
        // + to convert the stored number as a string back to number
        const expirationDate = +localStorage.getItem(LocalStorageAuthContent.expirationDate);
        const isNotANumber = isNaN(expirationDate);
        const stillValid = (expirationDate > Date.now());
        return !isNotANumber && stillValid;
    }

    /**
     * @return true if the expiration date stored in the `localstorage` is over, false otherwise
     */
    isExpirationDateOver(): boolean {
        return !this.verifyExpirationDate();
    }

    /**
     * Call the web service which checks the authentication token. A valid token gives back the authentication information
     * and an invalid one an message.
     *
     * @param token - jwt token
     * @return an {Observable<CheckTokenResponse>} which contains the deserializable content of the token
     * an message is thrown otherwise
     */
    checkAuthentication(token: string): Observable<CheckTokenResponse> {
        if (!!token) {
            const postData = new URLSearchParams();
            postData.append('token', token);
            const headers = new HttpHeaders({'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'});
            return this.httpClient.post<CheckTokenResponse>(this.checkTokenUrl, postData.toString(), {headers: headers}).pipe(
                map(check => check),
                catchError(function (error: any) {
                    console.error(new Date().toISOString(), error);
                    return throwError(error);
                })
            );
        }
        return of(null);
    }

    /**
     * Given a pair of connection, ask the web service generating jwt authentication token a token if the pair is
     * a registered one.
     * @param code OIDC code from code flow
     */
    askTokenFromCode(code: string):
        Observable<PayloadForSuccessfulAuthentication> {
        if (!this.clientId || !this.loginClaim) {
            return throwError('The authentication service is no correctly initialized');
        }
        const params = new URLSearchParams();
        params.append('code', code);
        params.append('grant_type', 'authorization_code');
        // beware clientId for token defines a type of authentication
        params.append('clientId', this.clientId);
        params.append('redirect_uri', this.computeRedirectUri());

        const headers = new HttpHeaders({'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'});
        return this.handleNewToken(this.httpClient.post<AuthObject>(this.askTokenUrl
            , params.toString()
            , {headers: headers}));
    }

    /**
     * Given a pair of connection, ask the web service generating jwt authentication token a token if the pair is
     * a registered one.
     * @param login
     * @param password
     */
    askTokenFromPassword(login: string, password: string): Observable<any> {
        if (!this.clientId) {
            return throwError('The authentication service is no correctly initialized');
        }
        const params = new URLSearchParams();
        params.append('username', login);
        params.append('password', password);
        params.append('grant_type', 'password');
        // beware clientId for access_token is an oauth parameters
        params.append('clientId', this.clientId);
        const headers = new HttpHeaders({'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'});
        return this.handleNewToken(this.httpClient.post<AuthObject>(this.askTokenUrl
            , params.toString()
            , {headers: headers}));
    }

    private handleNewToken(call: Observable<AuthObject>): Observable<PayloadForSuccessfulAuthentication> {
        return call.pipe(
            map(data => {
                return {...data, clientId: this.guidService.getCurrentGuid()};
            }),
            map((auth: AuthObject) => this.convert(auth)),
            tap(this.saveAuthenticationInformation),
            catchError(function (error: any) {
                console.error(new Date().toISOString(), error);
                return throwError(error);
            }),
            switchMap((auth) => this.loadUserData(auth))
        );
    }

    public loadUserData(auth: PayloadForSuccessfulAuthentication): Observable<PayloadForSuccessfulAuthentication> {
        return this.httpClient.get<User>(`${this.userDataUrl}/${auth.identifier}`)
            .pipe(
                map(u => {
                    auth.firstName = u.firstName;
                    auth.lastName = u.lastName;
                    return auth;
                }),
                catchError(() => of(auth))
            );
    }

    /**
     * extract the jwt authentication token from the localstorage
     */
    public extractToken(): string {
        return this.authModeHandler.extractToken();
    }


    /**
     * clear the `localstorage` from all its content.
     */
    clearAuthenticationInformation(): void {
        localStorage.removeItem(LocalStorageAuthContent.identifier);
        localStorage.removeItem(LocalStorageAuthContent.token);
        localStorage.removeItem(LocalStorageAuthContent.expirationDate);
        localStorage.removeItem(LocalStorageAuthContent.clientId);
        sessionStorage.clear();
        this.oauthService.logOut();
    }

    /**
     * save the authentication informatios such as identifier, jwt token, expiration date and clientId in the
     * `localstorage`.
     * @param payload
     */
    saveAuthenticationInformation(payload: PayloadForSuccessfulAuthentication) {
        localStorage.setItem(LocalStorageAuthContent.identifier, payload.identifier);
        localStorage.setItem(LocalStorageAuthContent.token, payload.token);
        localStorage.setItem(LocalStorageAuthContent.expirationDate, payload.expirationDate.getTime().toString());
        localStorage.setItem(LocalStorageAuthContent.clientId, payload.clientId.toString());
    }

    /**
     * extract from the `localstorage` the authentication relevant information such as dentifier, jwt token,
     * expiration date and clientId
     * @return {PayloadForSuccessfulAuthentication}
     */
    extractIdentificationInformation(): PayloadForSuccessfulAuthentication {
        return new PayloadForSuccessfulAuthentication(
            localStorage.getItem(LocalStorageAuthContent.identifier),
            Guid.parse(localStorage.getItem(LocalStorageAuthContent.clientId)),
            localStorage.getItem(LocalStorageAuthContent.token),
            // as getItem return a string, `+` is used to convert the string into number
            new Date(+localStorage.getItem(LocalStorageAuthContent.expirationDate)),
        );
    }


    /**
     * helper method to convert an {AuthObject} instance into a {PayloadForSuccessfulAuthentication} instance.
     * @param payload
     */
    public convert(payload: AuthObject):
        PayloadForSuccessfulAuthentication {

        let expirationDate;
        const jwt = this.decodeToken(payload.access_token);
        if (!!payload.expires_in) {
            expirationDate = Date.now() + ONE_SECOND * payload.expires_in;
        } else if (!!this.expireClaim) {
            expirationDate = jwt[this.expireClaim];
        } else {
            expirationDate = 0;
        }
        return new PayloadForSuccessfulAuthentication(jwt[this.loginClaim],
            payload.clientId,
            payload.access_token,
            new Date(expirationDate),
            jwt[this.givenNameClaim],
            jwt[this.familyNameClaim]
        );
    }

    /**
     * helper method to put the jwt token into an appropriate string usable as an http header
     */
    public getSecurityHeader() {
        return {'Authorization': `Bearer ${this.extractToken()}`};
    }

    public moveToCodeFlowLoginPage() {
        if (!this.clientId) {
            return throwError('The authentication service is no correctly initialized');
        }
        if (!this.delegateUrl) {
            window.location.href = `${environment.urls.auth}/code/redirect_uri=${this.computeRedirectUri()}`;
        } else {
            window.location.href = `${this.delegateUrl}&redirect_uri=${this.computeRedirectUri()}`;
        }
    }


    computeRedirectUri() {
        const uriBase = location.origin;
        const pathEnd = (location.pathname.length > 1) ? location.pathname : '';
        return `${uriBase}${pathEnd}`;
    }

    decodeToken(token: string): any {
        try {
            return jwt_decode(token);
        } catch (Error) {
            return null;
        }
    }


    public getAuthenticationMode(): string {
        return this.mode;
    }

    public initializeAuthentication(): void {
        this.assignConfigurationProperties(this.configService.getConfigValue('security'));
        this.authModeHandler = this.instantiateAuthModeHandler(this.mode);
        this.authModeHandler.initializeAuthentication(window.location.href);
    }


    public isAuthModeCodeOrImplicitFlow(): boolean {
        const mode = this.getAuthenticationMode();
        return mode === 'CODE' || mode === 'IMPLICIT';
    }
}


/**
 * class used to login using the authentication web service.
 */
export class AuthObject {

    constructor(
        public access_token: string,
        public expires_in: number,    // token_received,
        public clientId: Guid,
        public identifier?: string
    ) {
    }

}    // token_received,


/**
 * class corresponding to the response of the web service checking jwt token when this token is a valid one.
 */
export class CheckTokenResponse {
    constructor(
        public sub?: string,
        public exp?: number,
        public clientId?: string,
    ) {
    }
}

/**
 * interface to handle the mode of authentication
 */
export interface AuthenticationModeHandler {
    initializeAuthentication(currentHrefLocation: string): void;

    extractToken(): string;

}

/**
 * Implementation class of @Interface AuthenticationModeHandler
 * use the OperatorFabric legacy code to manage the authentication in
 * OAuth 2.0 password grant or code flow mode
 */
export class PasswordOrCodeAuthenticationHandler implements AuthenticationModeHandler {

    constructor(private authenticationService: AuthenticationService,
                private store: Store<AppState>) {
    }

    initializeAuthentication(currentLocationHref: string) {
        const searchCodeString = 'code=';
        const foundIndex = currentLocationHref.indexOf(searchCodeString);
        if (foundIndex !== -1) {
            this.store.dispatch(
                new InitAuthStatus({code: currentLocationHref.substring(foundIndex + searchCodeString.length)}));
        }
        this.store.dispatch(
            new CheckAuthenticationStatus());
    }

    public extractToken(): string {
        return localStorage.getItem(LocalStorageAuthContent.token);
    }

}

/**
 * Implementation class of @Interface AuthenticationModeHandler
 * use the Oidc Connect library to manage OAuth 2.0 implicit authentication mode
 */
export class ImplicitAuthenticationHandler implements AuthenticationModeHandler {
    constructor(private authenticationService: AuthenticationService
        , private store: Store<AppState>
        , private storage: Storage
        , private oauthService: OAuthService
        , private guidService: GuidService
        , private router: Router
        , private implicitConf
        , private givenNameClaim
        , private familyNameClaim) {
    }

    initializeAuthentication(currentLocationHref: string) {
        this.initFlow();
    }


    public async initFlow() {
        this.oauthService.configure(this.implicitConf);
        this.oauthService.setupAutomaticSilentRefresh();
        this.oauthService.tokenValidationHandler = new JwksValidationHandler();
        await this.oauthService.loadDiscoveryDocument()
            .then(() => {
                    this.tryToLogin();
                }
            );
        this.oauthService.events.subscribe(e => {
            this.dispatchAppStateActionFromOAuth2Events(e);
        });
    }

    public async tryToLogin() {
        await this.oauthService.tryLogin()
            .then(() => {
                if (this.oauthService.hasValidAccessToken()) {
                    this.store.dispatch(new AcceptLogIn(this.providePayloadForSuccessfulAuthentication()));
                    redirectToCurrentLocation(this.router);
                } else {
                    sessionStorage.setItem('flow', 'implicit');
                    this.oauthService.initImplicitFlow();
                }

            });
    }


    public providePayloadForSuccessfulAuthentication(): PayloadForSuccessfulAuthentication {
        const identityClaims = this.oauthService.getIdentityClaims();
        const givenName = identityClaims[this.givenNameClaim];
        const familyName = identityClaims[this.familyNameClaim];
        const identifier = identityClaims['sub'];
        const clientId = this.guidService.getCurrentGuid();
        const token = this.oauthService.getAccessToken();
        const expirationDate = new Date(this.oauthService.getAccessTokenExpiration());
        return new PayloadForSuccessfulAuthentication(identifier, clientId, token, expirationDate, givenName, familyName);
    }


    dispatchAppStateActionFromOAuth2Events(event: OAuthEvent): void {
        const eventType: OAuthType = event.type;
        switch (eventType) {
            // We can have a token_error or token_refresh_error when it is not possible to refresh token
            // This case arise for example when using a SSO and the session is not valid anymore (session timeout)
            case ('token_error'):
            case('token_refresh_error'):
                this.store.dispatch(new UnableToRefreshOrGetToken());
                break;
            case('logout'): {
                this.store.dispatch(new UnAuthenticationFromImplicitFlow());
                break;
            }
        }
    }

    public extractToken(): string {
        return this.storage.getItem('access_token');
    }

}
