/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {ReplaySubject, Observable, Subject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CurrentUserStore {
    private connectionEvent = new ReplaySubject<string>(1);
    private sessionWillSoonExpireEvent = new Subject<boolean>();
    private sessionExpiredEvent = new Subject<boolean>();
    private token: string;
    private authenticationUsesToken = false;

    public getCurrentUserLogin(): Observable<string> {
        return this.connectionEvent.asObservable();
    }

    public setSessionWillSoonExpire() {
        this.sessionWillSoonExpireEvent.next(true);
    }

    public getSessionWillSoonExpire(): Observable<boolean> {
        return this.sessionWillSoonExpireEvent.asObservable();
    }

    public setSessionExpired() {
        this.sessionExpiredEvent.next(true);
    }

    public getSessionExpired(): Observable<boolean> {
        return this.sessionExpiredEvent.asObservable();
    }

    public setCurrentUserAuthenticationValid(login: string) {
        this.connectionEvent.next(login);
    }

    public setToken(token: string) {
        this.token = token;
    }

    public getToken(): string {
        return this.token;
    }

    public setAuthenticationUsesToken() {
        this.authenticationUsesToken = true;
    }

    public doesAuthenticationUseToken(): boolean {
        return this.authenticationUsesToken;
    }
}
