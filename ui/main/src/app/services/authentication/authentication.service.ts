/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {catchError, filter, map, switchMap, tap} from 'rxjs/operators';
import {Guid} from 'guid-typescript';
import {
    ImplicitlyAuthenticated,
    InitAuthStatus,
    PayloadForSuccessfulAuthentication,
    UnAuthenticationFromImplicitFlow
} from '@ofActions/authentication.actions';
import {environment} from '@env/environment';
import {GuidService} from '@ofServices/guid.service';
import {AppState} from '@ofStore/index';
import {select, Store} from '@ngrx/store';
import {buildConfigSelector} from '@ofSelectors/config.selectors';
import * as jwt_decode from 'jwt-decode';
import * as _ from 'lodash';
import {User} from '@ofModel/user.model';
import {EventType as OAuthType, JwksValidationHandler, OAuthEvent, OAuthService} from 'angular-oauth2-oidc';
import {implicitAuthenticationConfigFallback} from '@ofServices/authentication/auth-implicit-flow.config';
import {selectExpirationTime, selectIsImplicitlyAuthenticated} from '@ofSelectors/authentication.selectors';

export enum LocalStorageAuthContent {
    token = 'token',
    expirationDate = 'expirationDate',
    identifier = 'identifier',
    clientId = 'clientId'
}

export const ONE_SECOND = 1000;

@Injectable()
export class AuthenticationService {

    /** url to check authentication token (jwt) */
    private checkTokenUrl = `${environment.urls.auth}/check_token`;
    /** url to ask for an authentication token (jwt) */
    private askTokenUrl = `${environment.urls.auth}/token`;
    private userDataUrl = `${environment.urls.users}/users`;
    private clientId: string;
    private clientSecret: string;
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
     */
    constructor(private httpClient: HttpClient
        , private guidService: GuidService
        , private store: Store<AppState>
        , private oauthService: OAuthService
    ) {
        store.select(buildConfigSelector('security'))
            .subscribe(oauth2Conf => {
                this.assignConfigurationProperties(oauth2Conf);
                this.authModeHandler = this.instantiateAuthModeHandler(this.mode);
            });
    }

    /**
     * Choose to handle the OAuth 2.0 using implicit workflow
     * if mode equals to 'implicit' other manage password grand
     * or code flow.
     * @param mode - extracted from config web-service settings
     */
    instantiateAuthModeHandler(mode: string): AuthenticationModeHandler {
        if (mode.toLowerCase() === 'implicit') {
            return new ImplicitAuthenticationHandler(this, this.store, sessionStorage);
        }
        return new PasswordOrCodeAuthenticationHandler(this, this.store);
    }

    /**
     * extract Oauth 2.0 configuration from settings and store it in the service
     * @param oauth2Conf - settings return by the back-end config service
     */
    assignConfigurationProperties(oauth2Conf) {
        this.clientId = _.get(oauth2Conf, 'oauth2.client-id', null);
        this.clientSecret = _.get(oauth2Conf, 'oauth2.client-secret', null);
        this.delegateUrl = _.get(oauth2Conf, 'oauth2.flow.delagate-url', null);
        this.loginClaim = _.get(oauth2Conf, 'jwt.login-claim', 'sub');
        this.givenNameClaim = _.get(oauth2Conf, 'jwt.given-name-claim', 'given_name');
        this.familyNameClaim = _.get(oauth2Conf, 'jwt.family-name-claim', 'family_name');
        this.expireClaim = _.get(oauth2Conf, 'jwt.expire-claim', 'exp');
        this.mode = _.get(oauth2Conf, 'oauth2.flow.mode', 'PASSWORD');
    }

    // TODO push this part into ImplicitAuthenticationHandler class
    instantiateImplicitFlowConfiguration() {
        this.implicitConf = {...this.implicitConf, issuer: this.delegateUrl, clientId: this.clientId};
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
            // const postData = new FormData();
            const postData = new URLSearchParams();
            postData.append('token', token);
            const headers = new HttpHeaders({'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'});
            return this.httpClient.post<CheckTokenResponse>(this.checkTokenUrl, postData.toString(), {headers: headers}).pipe(
                map(check => check),
                catchError(function (error: any) {
                    console.error(error);
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
        if (!this.clientId || !this.clientSecret || !this.loginClaim) {
            return throwError('The authentication service is no correctly initialized');
        }
        const params = new URLSearchParams();
        params.append('code', code);
        params.append('grant_type', 'authorization_code');
// beware clientId for token defines a type of authentication
        params.append('clientId', this.clientId);
        params.append('redirect_uri', this.computeRedirectUri());

        const headers = new HttpHeaders({'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'});
        return this.handleNewToken(this.httpClient.post<AuthObject>(this.askTokenUrl, params.toString(), {headers: headers}));
    }

    /**
     * Given a pair of connection, ask the web service generating jwt authentication token a token if the pair is
     * a registered one.
     * @param login
     * @param password
     */
    askTokenFromPassword(login: string, password: string): Observable<any> {
        if (!this.clientId || !this.clientSecret) {
            return throwError('The authentication service is no correctly initialized');
        }
        const params = new URLSearchParams();
        params.append('username', login);
        params.append('password', password);
        params.append('grant_type', 'password');
// beware clientId for access_token is an oauth parameters
        params.append('clientId', this.clientId);
        params.append('client_secret', this.clientSecret);

        const headers = new HttpHeaders({'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'});
        return this.handleNewToken(this.httpClient.post<AuthObject>(this.askTokenUrl, params.toString(), {headers: headers}));
    }

    private handleNewToken(call: Observable<AuthObject>): Observable<PayloadForSuccessfulAuthentication> {
        return call.pipe(
            map(data => {
                return {...data, clientId: this.guidService.getCurrentGuid()};
            }),
            map((auth: AuthObject) => this.convert(auth)),
            tap(this.saveAuthenticationInformation),
            catchError(function (error: any) {
                console.error(error);
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
        const currentAuthModeHandler = this.authModeHandler;
        return currentAuthModeHandler.extractToken();
    }

    /**
     * @return true if the expiration date stored in the `localestorage` is still running, false otherwise.
     */
    verifyExpirationDate(): boolean {
        // + to convert the stored number as a string back to number
        const expirationDate = +localStorage.getItem(LocalStorageAuthContent.expirationDate);
        const isNotANumber = isNaN(expirationDate);
        const stillValid = isInTheFuture(expirationDate);
        return !isNotANumber && stillValid;
    }

    /**
     * @return true if the expiration date stored in the `localstorage` is over, false otherwise
     */
    isExpirationDateOver(): boolean {
        return !this.verifyExpirationDate();
    }

    /**
     * clear the `localstorage` from all its content.
     */
    clearAuthenticationInformation(): void {
        localStorage.clear();
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
    }        // await this.oauthService.tryLogin();
    /**
     * helper method to put the jwt token into an appropriate string usable as an http header
     */
    public getSecurityHeader() {
        return {'Authorization': `Bearer ${this.extractToken()}`};
    }

    public moveToCodeFlowLoginPage() {
        if (!this.clientId || !this.clientSecret) {
            return throwError('The authentication service is no correctly iniitialized');
        }
        if (!this.delegateUrl) {
            window.location.href = `${environment.urls.auth}/code/redirect_uri=${this.computeRedirectUri()}`;
        } else {
            window.location.href = `${this.delegateUrl}&redirect_uri=${this.computeRedirectUri()}`;
        }
    }

    public async moveToImplicitFlowLoginPage() {
        this.oauthService.configure(this.implicitConf);
        await this.oauthService.loadDiscoveryDocument();
        sessionStorage.setItem('flow', 'implicit');
        this.oauthService.initImplicitFlow();
    }

    public async initAndLoadAuth() {
        this.oauthService.configure(this.implicitConf);
        this.oauthService.setupAutomaticSilentRefresh();
        this.oauthService.tokenValidationHandler = new JwksValidationHandler();
        await this.oauthService.loadDiscoveryDocument()
            .then(() => {
                    this.oauthService.tryLogin();
                }
            ).then(() => {
                if (this.oauthService.hasValidAccessToken()) {
                    return Promise.resolve();
                }
            });

        this.oauthService.events
            .pipe(filter(e => e.type === 'session_terminated'))
            .subscribe(() => {
                console.log('Your session has been terminated!');
            });
        this.askForOauthAccessToken();
        this.dispatchAuthActionFromOAuthEvents();
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

    public dispatchAuthActionFromOAuthEvents() {
        this.oauthService.events.subscribe(e => {
            this.dispatchAppStateActionFromOAuth2Events(e);
        });
    }

    public askForOauthAccessToken() {
        return this.oauthService.getAccessToken();

    }

    public providePayloadForSuccessfulAuthenticationFromImplicitFlow(): PayloadForSuccessfulAuthentication {
        const identityClaims = this.oauthService.getIdentityClaims();
        const identifier = identityClaims['sub'];
        const clientId = this.guidService.getCurrentGuid();
        const token = this.askForOauthAccessToken();
        const expirationDate = new Date(this.oauthService.getAccessTokenExpiration());
        return new PayloadForSuccessfulAuthentication(identifier, clientId, token, expirationDate);
    }

    dispatchAppStateActionFromOAuth2Events(event: OAuthEvent): void {
        const eventType: OAuthType = event.type;
        switch (eventType) {
            case ('token_received'): {
                this.store.dispatch(new ImplicitlyAuthenticated());
                break;
            }
            case ('token_error'):
            case('token_refresh_error'):
            case('logout'): {
                this.store.dispatch(new UnAuthenticationFromImplicitFlow());
                break;
            }
            default: {
                // console.log('no action to dispatch for:', eventType);
            }
        }
    }

    public getAuthenticationMode(): string {
        return this.mode;
    }

    public initializeAuthentication(): void {
        this.authModeHandler.initializeAuthentication(window.location.href);
    }

    public linkAuthenticationStatus(linker: (isAuthenticated: boolean) => void): void {
        this.authModeHandler.linkAuthenticationStatus(linker);
    }

    public move(): void {
        this.authModeHandler.move();
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
 * helper @method to confirm or not if the number corresponding to a given time is in the futur regarding the present
 * moment.
 * @param time - a number corresponding to an UTC time to test
 * @return  true if time is in the future regarding the present moment, false otherwise
 */
export function isInTheFuture(time: number): boolean {
    return time > Date.now();
}

/**
 * interface to handle the mode of authentication
 */
export interface AuthenticationModeHandler {
    initializeAuthentication(currentHrefLocation: string): void;

    linkAuthenticationStatus(linker: (isAuthenticated: boolean) => void): void;

    extractToken(): string;

    move(): void;
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
    }

    linkAuthenticationStatus(linker: (isAuthenticated: boolean) => void): void {
        this.store.pipe(select(selectExpirationTime), map(isInTheFuture))
            .subscribe(linker);
    }

    public extractToken(): string {
        return localStorage.getItem(LocalStorageAuthContent.token);
    }

    move(): void {
        this.authenticationService.moveToCodeFlowLoginPage();
    }
}

/**
 * Implementation class of @Interface AuthenticationModeHandler
 * use the Oidc Connect library to manage OAuth 2.0 implicit authentication mode
 */
export class ImplicitAuthenticationHandler implements AuthenticationModeHandler {
    constructor(private authenticationService: AuthenticationService
        , private store: Store<AppState>
        , private storage: Storage) {
        this.authenticationService.instantiateImplicitFlowConfiguration();
    }

    initializeAuthentication(currentLocationHref: string) {
        if (this.authenticationService.getAuthenticationMode().toLowerCase() === 'implicit') {
            this.authenticationService.initAndLoadAuth();
        }
    }

    linkAuthenticationStatus(linker: (isAuthenticated: boolean) => void): void {
        this.store.pipe(select(selectIsImplicitlyAuthenticated)).subscribe(linker);
    }

    public extractToken(): string {
        return this.storage.getItem('access_token');
    }

    move() {
        this.authenticationService.moveToImplicitFlowLoginPage();
    }
}
