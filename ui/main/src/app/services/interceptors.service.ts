/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CurrentUserStore} from 'app/business/store/current-user.store';

@Injectable({
    providedIn: 'root'
})
export class TokenInjector implements HttpInterceptor {
    constructor(private currentUserStore: CurrentUserStore) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(this.addAuthHeadersIfNecessary(request));
    }

    addAuthHeadersIfNecessary(request: HttpRequest<any>): HttpRequest<any> {
        const url = request.url;

        const isUrlWithToken = !(
            url.endsWith('/auth/check_token') ||
            url.endsWith('/auth/token') ||
            url.endsWith('/auth/code')
        );
        if (isUrlWithToken && this.currentUserStore.doesAuthenticationUseToken()) {
            const securityHeader = {Authorization: `Bearer ${this.currentUserStore.getToken()}`}
            const update = {setHeaders: securityHeader};
            request = request.clone(update);
        }
        return request;
    }
}
