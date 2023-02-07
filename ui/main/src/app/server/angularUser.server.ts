/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {environment} from '@env/environment';
import {Observable} from 'rxjs';
import {User} from '@ofModel/user.model';
import {UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {AngularServer} from './angular.server';
import {UserServer} from 'app/business/server/user.server';
import {ServerResponse} from 'app/business/server/serverResponse';

@Injectable({
    providedIn: 'root'
})
export class AngularUserServer extends AngularServer implements UserServer {
    readonly userUrl: string;
    readonly connectionsUrl: string;
    readonly willNewSubscriptionDisconnectAnExistingSubscriptionUrl: string;

    /**
     * @constructor
     * @param httpClient - Angular build-in
     */
    constructor(private httpClient: HttpClient) {
        super();
        this.userUrl = `${environment.urls.users}`;
        this.connectionsUrl = `${environment.urls.cards}/connections`;
        this.willNewSubscriptionDisconnectAnExistingSubscriptionUrl = `${environment.urls.cards}/willNewSubscriptionDisconnectAnExistingSubscription`;
    }

    deleteById(login: string) {
        const url = `${this.userUrl}/users/${login}`;
        return this.processHttpResponse(this.processHttpResponse(this.httpClient.delete(url)));
    }

    getUser(user: string): Observable<ServerResponse<User>> {
        return this.processHttpResponse(this.httpClient.get<User>(`${this.userUrl}/users/${user}`));
    }

    synchronizeWithToken(): Observable<ServerResponse<User>> {
        return this.processHttpResponse(this.httpClient.post<User>(`${this.userUrl}/users/synchronizeWithToken`, null));
    }

    currentUserWithPerimeters(): Observable<ServerResponse<UserWithPerimeters>> {
        return this.processHttpResponse(this.httpClient.get<UserWithPerimeters>(`${this.userUrl}/CurrentUserWithPerimeters`));
    }

    queryAllUsers(): Observable<ServerResponse<User[]>> {
        return this.processHttpResponse(this.httpClient.get<User[]>(`${this.userUrl}`));
    }

    updateUser(userData: User): Observable<ServerResponse<User>> {
        return this.processHttpResponse(this.httpClient.post<User>(`${this.userUrl}`, userData));
    }

    loadConnectedUsers(): Observable<ServerResponse<any[]>> {
        return this.processHttpResponse(this.httpClient.get<any[]>(`${this.connectionsUrl}`));
    }

    willNewSubscriptionDisconnectAnExistingSubscription(): Observable<ServerResponse<boolean>> {
        return this.processHttpResponse(this.httpClient.get<boolean>(`${this.willNewSubscriptionDisconnectAnExistingSubscriptionUrl}`));
    }
}
