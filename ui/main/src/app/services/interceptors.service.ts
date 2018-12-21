/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuthenticationService} from './authentication.service';

@Injectable()
export class TokenInjector implements HttpInterceptor {
    /* istanbul ignore next */
    constructor(private authenticationService: AuthenticationService) {
    }

    /* istanbul ignore next */
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(this.addAuthHeadersIfNecessary(request));
    }


    addAuthHeadersIfNecessary(request: HttpRequest<any>): HttpRequest<any> {
        const url = request.url;

        const notCheckTokenRequest = !(url.endsWith('/auth/check_token') || url.endsWith('/auth/token'));
        if (notCheckTokenRequest) {
            const update = {setHeaders: this.authenticationService.getSecurityHeader()};
            request = request.clone(update);
        }
        return request;
    }
}
