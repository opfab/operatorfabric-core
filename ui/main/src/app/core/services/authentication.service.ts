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
import {Guid} from "guid-typescript";
import {PayloadForSuccessfulAuthentication} from "@state/authentication/authentication.actions";

export enum LocalStorageAuthContent {
    token = 'token',
    expirationDate = 'expirationDate',
    identifier = 'identifier',
    clientId = 'clientId'
}

export const ONE_SECOND = 1000;

@Injectable()
export class AuthenticationService {


    private checkTokenUrl = '/auth/check_token';
    private askTokenUrl = '/auth/token';
    readonly guid: Guid;


    constructor(private httpClient: HttpClient) {
        this.guid = Guid.create();
    }

    checkAuthentication(token: string): Observable<CheckTokenResponse> {
        const postData = new FormData();
        postData.append('token', token);
        return this.httpClient.post<CheckTokenResponse>(this.checkTokenUrl, postData).pipe(
            map(check => check),
            catchError(this.handleError)
        );
    }

    askToken(login: string, password: string): Observable<any> {
        const params = new URLSearchParams();
        params.append('username', login);
        params.append('password', password);
        params.append('grant_type', 'password');
        // beware clientId for token defines a type of authentication
        params.append('client_id', 'clientIdPassword');

        const headers = new HttpHeaders({'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'});
        return this.httpClient.post<AuthObject>(this.askTokenUrl
            , params.toString()
            , {headers: headers}).pipe(
            map(data => {
                const trackism = {...data};

                trackism.identifier = login;
                // this clientId is used to identify unequivocally the session
                trackism.clientId = this.guid;
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

    public extractToken(): string {
        return localStorage.getItem(LocalStorageAuthContent.token);
    }

    public verifyExpirationDate(): boolean {
        // + to convert the stored number as a string back to number
        const expirationDate = +localStorage.getItem(LocalStorageAuthContent.expirationDate);
        const isNotANumber = isNaN(expirationDate);
        const stillValid = isInTheFuture(expirationDate);
        const finalResult = !isNotANumber && stillValid;
        return finalResult ;
    }



    public isExpirationDateOver():boolean{
        return ! this.verifyExpirationDate();
    }

    public clearAuthenticationInformation(): void {
        localStorage.clear();
    }

    public saveAuthenticationInformation(payload: PayloadForSuccessfulAuthentication) {
        localStorage.setItem(LocalStorageAuthContent.identifier, payload.identifier);
        localStorage.setItem(LocalStorageAuthContent.token, payload.token);
        localStorage.setItem(LocalStorageAuthContent.expirationDate, payload.expirationDate.getTime().toString());
        localStorage.setItem(LocalStorageAuthContent.clientId, payload.clientId.toString());
    }

    public extractIdentificationInformation(): PayloadForSuccessfulAuthentication{
        return new PayloadForSuccessfulAuthentication(
            localStorage.getItem(LocalStorageAuthContent.identifier),
            Guid.parse(localStorage.getItem(LocalStorageAuthContent.clientId)),
            localStorage.getItem(LocalStorageAuthContent.token),
            // as getItem return a string, `+` isUsed
            new Date(+localStorage.getItem(LocalStorageAuthContent.expirationDate)),

        );
    }

    public convert(payload: AuthObject): PayloadForSuccessfulAuthentication {
        const expirationDate = Date.now() + ONE_SECOND * payload.expires_in;
        return new PayloadForSuccessfulAuthentication(payload.identifier,
            payload.clientId,
            payload.access_token,
            new Date(expirationDate)
        );
    }
}

export class AuthObject {
    identifier?: string;
    access_token: string;
    expires_in: number;
    clientId: Guid;
}

export class CheckTokenResponse {
    sub: string;
    exp: number;
    client_id: string;
}

export function isInTheFuture(time:number):boolean{
    return time > Date.now();
}