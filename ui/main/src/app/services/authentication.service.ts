/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';
import {Guid} from 'guid-typescript';
import {PayloadForSuccessfulAuthentication} from '@ofActions/authentication.actions';
import {environment} from "@env/environment";
import {GuidService} from "@ofServices/guid.service";
import {AppState} from "@ofStore/index";
import {Store} from "@ngrx/store";
import {buildConfigSelector} from "@ofSelectors/config.selectors";
import * as jwt_decode from "jwt-decode";
import * as _ from "lodash";

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
    private clientId: string;
    private clientSecret: string;
    private loginClaim: string;
    private expireClaim: string;

    /**
     * @constructor
     * @param httpClient - Angular build-in
     * @param guidService - create and store the unique id for this application and user
     * @param store NGRX store
     */
    constructor(private httpClient: HttpClient, private guidService: GuidService, private store: Store<AppState>) {
        store.select(buildConfigSelector('security'))
            .subscribe(oauth2Conf => {
                this.assignConfigurationProperties(oauth2Conf);

            });
    }

    assignConfigurationProperties(oauth2Conf) {
        this.clientId = _.get(oauth2Conf, 'oauth2.client-id', null);
        this.clientSecret = _.get(oauth2Conf, 'oauth2.client-secret', null);
        this.loginClaim = _.get(oauth2Conf, 'jwt.login-claim', 'sub');
        this.expireClaim = _.get(oauth2Conf, 'jwt.expire-claim', 'exp');
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
                catchError(AuthenticationService.handleError)
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
        if (!this.clientId || !this.clientSecret || !this.loginClaim)
            return throwError('The authentication service is no correctly initialized');
        const params = new URLSearchParams();
        params.append('code', code);
        params.append('grant_type', 'authorization_code');
// beware clientId for token defines a type of authentication
        params.append('clientId', this.clientId);
        params.append('redirect_uri', AuthenticationService.computeRedirectUri());

        const headers = new HttpHeaders({'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'});
        return this.handleNewToken(this.httpClient.post<AuthObject>(this.askTokenUrl, params.toString(), {headers: headers}));
    }

    /**
     * Given a pair of connection, ask the web service generating jwt authentication token a token if the pair is
     * a registered one.
     * @param login
     * @param password
     */
    askTokenFromPassword(login
                             :
                             string, password
                             :
                             string
    ):
        Observable<any> {
        if (!
            this.clientId || !this.clientSecret
        )
            return throwError('The authentication service is no correctly initialized');
        const params = new URLSearchParams();
        params.append('username', login);
        params.append('password', password);
        params.append('grant_type', 'password');
// beware clientId for token defines a type of authentication
        params.append('clientId', this.clientId);
        params.append('client_secret', this.clientSecret);

        const headers = new HttpHeaders({'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'});
        return this.handleNewToken(this.httpClient.post<AuthObject>(this.askTokenUrl, params.toString(), {headers: headers}));
    }

    private handleNewToken(call: Observable<AuthObject>): Observable<PayloadForSuccessfulAuthentication> {
        return call.pipe(
            map(data => {
                return {...data, clientId: this.guidService.getCurrentGuid()}
            }),
            map((auth: AuthObject) => this.convert(auth)),
            tap(AuthenticationService.saveAuthenticationInformation),
            catchError(AuthenticationService.handleError)
        );
    }

    private static handleError(error: any) {
        console.error(error);
        return throwError(error);
    }

    /**
     * extract the jwt authentication token from the localstorage
     */
    static extractToken(): string {
        return localStorage.getItem(LocalStorageAuthContent.token);
    }

    /**
     * @return true if the expiration date stored in the `localestorage` is still running, false otherwise.
     */
    static verifyExpirationDate(): boolean {
        // + to convert the stored number as a string back to number
        const expirationDate = +localStorage.getItem(LocalStorageAuthContent.expirationDate);
        const isNotANumber = isNaN(expirationDate);
        const stillValid = isInTheFuture(expirationDate);
        return !isNotANumber && stillValid;
    }

    /**
     * @return true if the expiration date stored in the `localstorage` is over, false otherwise
     */
    static isExpirationDateOver(): boolean {
        return !AuthenticationService.verifyExpirationDate();
    }

    /**
     * clear the `localstorage` from all its content.
     */
    static clearAuthenticationInformation(): void {
        localStorage.clear();
    }

    /**
     * save the authentication informatios such as identifier, jwt token, expiration date and clientId in the
     * `localstorage`.
     * @param payload
     */
    static saveAuthenticationInformation(payload: PayloadForSuccessfulAuthentication) {
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
    static extractIdentificationInformation(): PayloadForSuccessfulAuthentication {
        return new PayloadForSuccessfulAuthentication(
            localStorage.getItem(LocalStorageAuthContent.identifier),
            Guid.parse(localStorage.getItem(LocalStorageAuthContent.clientId)),
            localStorage.getItem(LocalStorageAuthContent.token),
            // as getItem return a string, `+` isUsed
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
        const jwt = AuthenticationService.decodeToken(payload.access_token);
        if (!!payload.expires_in)
            expirationDate = Date.now() + ONE_SECOND * payload.expires_in;
        else if (!!this.expireClaim)
            expirationDate = jwt[this.expireClaim];
        else
            expirationDate = 0;

        return new PayloadForSuccessfulAuthentication(jwt[this.loginClaim],
            payload.clientId,
            payload.access_token,
            new Date(expirationDate)
        );
    }

    /**
     * helper method to put the jwt token into an appropriate string usable as an http header
     */
    static getSecurityHeader() {
        return {'Authorization': `Bearer ${AuthenticationService.extractToken()}`};
    }

    public moveToCodeFlowLoginPage() {
        if (!this.clientId || !this.clientSecret)
            return throwError('The authentication service is no correctly iniitialized');
        window.location.href = `${environment.urls.auth}/code/redirect_uri=${AuthenticationService.computeRedirectUri()}`;
    }

    static computeRedirectUri(){
        const uriBase = location.origin;
        const pathEnd = (location.pathname.length > 1)?location.pathname:'';
        return `${uriBase}${pathEnd}`
    }

    static decodeToken(token: string): any {
        try {
            return jwt_decode(token);
        }
        catch (Error) {
            return null;
        }
    }
}

/**
 * class used to try to login using the authentication web service.
 */
export class AuthObject {

    constructor(
        public access_token: string,
        public expires_in: number,
        public clientId: Guid,
        public identifier?: string
    ) {
    }

}

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
