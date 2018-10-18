/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

export enum LocalStorageAuthContent {
  token = 'token',
  expirationDate = 'expirationDate',
  identifier = 'identifier'
}

@Injectable()
export class AuthenticationService {

  private authUrl = '/auth/check_token';

  constructor(private httpClient: HttpClient) {}

  checkAuthentication(token: string): Observable<CheckTokenResponse> {

    const postData = new FormData();
    postData.append('token', token);
    return this.httpClient.post<CheckTokenResponse>(this.authUrl, postData).pipe(
      map(check => check ),
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    // TODO verifications but seems useless
    console.error(error);
    return throwError(error);
  }

  // isValidToken(token: string): Observable<any> {
  //   console.log('isvalidToken called at least once');
  //   return this.httpClient
  //     .get<any[]>('assets/authentication-test.json')
  //     .pipe(
  //           // delay(1000),
  //           tap(() => console.log(`in the auth service, token is:'${token}'`)),
  //           map(users => users.filter(user => user.token === token)),
  //       tap(users => console.log(`in the auth service, there are '${users.length}' after verification`)),
  //           map(users => {
  //             if (!users.length || users.length <= 0) {
  //               return users[0];
  //             }
  //               return null;
  //           })
  //     );
  // }


  public extractToken(){
   return localStorage.getItem('token');
  }

  public verifyExpirationDate(): boolean{
    const expirationDate = Date.parse(localStorage.getItem(LocalStorageAuthContent.expirationDate));
    return (!expirationDate && Date.now() > expirationDate) || isNaN(expirationDate);
  }

  public clearAuthenticationInformation():void{
    localStorage.removeItem(LocalStorageAuthContent.token);
    localStorage.removeItem(LocalStorageAuthContent.expirationDate);
    localStorage.removeItem(LocalStorageAuthContent.identifier);
  }

  public registerAuthenticationInformation(payload:CheckTokenResponse, token:string){
    const identifier = payload.sub;
    const expirationDate = new Date(payload.exp);
    localStorage.setItem(LocalStorageAuthContent.identifier, identifier);
    localStorage.setItem(LocalStorageAuthContent.token, token);
    localStorage.setItem(LocalStorageAuthContent.expirationDate, expirationDate.toString());
    return {identifier: identifier, expirationDate: expirationDate};
  }

}

export class AuthObjet {
  access_token: string;
  token_type: string;
  refresh_token: string ;
  expires_in: number;
  scope: string;
  jti: string;
}

export class CheckTokenResponse{
  sub: string;
  scope: string[];
  active: boolean;
  exp: number;
  authorities:string[];
  jit:string;
  client_id:string;
}

