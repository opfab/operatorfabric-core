/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {Guid} from 'guid-typescript';
import {PayloadForSuccessfulAuthentication} from '@ofActions/authentication.actions';
import {environment} from "@env/environment";
import {GuidService} from "@ofServices/guid.service";
import {AppState} from "@ofStore/index";
import {Store} from "@ngrx/store";
import {buildConfigSelector} from "@ofSelectors/config.selectors";

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

    /**
     * @constructor
     * @param httpClient - Angular build-in
     * @param guidService - create and store the unique id for this application and user
     */
    constructor(private httpClient: HttpClient,private guidService: GuidService, private store: Store<AppState>) {
        store.select(buildConfigSelector('security.oauth2'))
            .subscribe(oauth2Conf=>{
               this.clientId= oauth2Conf['client-id'];
               this.clientSecret= oauth2Conf['client-secret'];
            });
    }

    /**
     * Call the web service which checks the authentication token. A valid token gives back the authentication information
     * and an invalid one an error.
     *
     * @param token - jwt token
     * @return an {Observable<CheckTokenResponse>} which contains the deserializable content of the token
     * an error is thrown otherwise
     */
    checkAuthentication(token: string): Observable<CheckTokenResponse> {
        const postData = new FormData();
        postData.append('token', token);
        return this.httpClient.post<CheckTokenResponse>(this.checkTokenUrl, postData).pipe(
            map(check => check),
            catchError(this.handleError)
        );
    }

    /**
     * Given a pair of connection, ask the web service generating jwt authentication token a token if the pair is
     * a registered one.
     * @param login 
     * @param password
     */
    askToken(login: string, password: string): Observable<any> {
        if(!this.clientId||!this.clientSecret)
            return throwError('The authentication service is no correctly iniitialized');
        const params = new URLSearchParams();
        params.append('username', login);
        params.append('password', password);
        params.append('grant_type', 'password');
        // beware clientId for token defines a type of authentication
        params.append('client_id', this.clientId);
        params.append('client_secret', this.clientSecret);

        const headers = new HttpHeaders({'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'});
        return this.httpClient.post<AuthObject>(this.askTokenUrl
            , params.toString()
            , {headers: headers}).pipe(
            map(data => {
                const trackism = {...data};

                trackism.identifier = login;
                // this clientId is used to identify unequivocally the session
                trackism.clientId = this.guidService.getCurrentGuid();
                return trackism;
            }),
            map(authObjt => {
                    let successfulAuth = this.convert(authObjt);
                    this.saveAuthenticationInformation(successfulAuth)
                    return successfulAuth;
                }
            ),
            catchError(this.handleError)
        );

    }

    private handleError(error: any) {
        console.error(error);
        return throwError(error);
    }

    /**
     * extract the jwt authentication token from the localstorage
     */
    public extractToken(): string {
        return localStorage.getItem(LocalStorageAuthContent.token);
    }

    /**
     * @return true if the expiration date stored in the `localestorage` is still running, false otherwise.
     */
    public verifyExpirationDate(): boolean {
        // + to convert the stored number as a string back to number
        const expirationDate = +localStorage.getItem(LocalStorageAuthContent.expirationDate);
        const isNotANumber = isNaN(expirationDate);
        const stillValid = isInTheFuture(expirationDate);
        const finalResult = !isNotANumber && stillValid;
        return finalResult;
    }

    /**
     * @return true if the expiration date stored in the `localstorage` is over, false otherwise
     */
    public isExpirationDateOver(): boolean {
        return !this.verifyExpirationDate();
    }
    /**
     * clear the `localstorage` from all its content.
     */
    public clearAuthenticationInformation(): void {
        localStorage.clear();
    }

    /**
     * save the authentication informatios such as identifier, jwt token, expiration date and clientId in the
     * `localstorage`.
     * @param payload
     */
    public saveAuthenticationInformation(payload: PayloadForSuccessfulAuthentication) {
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
    public extractIdentificationInformation(): PayloadForSuccessfulAuthentication {
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
    public convert(payload: AuthObject): PayloadForSuccessfulAuthentication {
        const expirationDate = Date.now() + ONE_SECOND * payload.expires_in;
        return new PayloadForSuccessfulAuthentication(payload.identifier,
            payload.clientId,
            payload.access_token,
            new Date(expirationDate)
        );
    }

    /**
     * helper method to put the jwt token into an appropriate string usable as an http header
     */
    public getSecurityHeader() {
        return {'Authorization': `Bearer ${this.extractToken()}`};
    }
}

/**
 * class used to try to login using the authentication web service.
 */
export class AuthObject {
    identifier?: string;
    access_token: string;
    expires_in: number;
    clientId: Guid;
}

/**
 * class corresponding to the response of the web service checking jwt token when this token is a valid one.
 */
export class CheckTokenResponse {
    sub: string;
    exp: number;
    client_id: string;
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
