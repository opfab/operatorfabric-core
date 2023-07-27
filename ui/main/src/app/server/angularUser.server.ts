/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {environment} from '@env/environment';
import {map, Observable} from 'rxjs';
import {User} from '@ofModel/user.model';
import {UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {AngularServer} from './angular.server';
import {UserServer} from 'app/business/server/user.server';
import {ServerResponse, ServerResponseStatus} from 'app/business/server/serverResponse';
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
        this.userUrl = `${environment.url}/users`;
        this.connectionsUrl = `${environment.url}/cards/connections`;
        this.willNewSubscriptionDisconnectAnExistingSubscriptionUrl = `${environment.url}/cards/willNewSubscriptionDisconnectAnExistingSubscription`;
    }
    deleteById(login: string) {
        const url = `${this.userUrl}/users/${login}`;
        return this.processHttpResponse(this.httpClient.delete(url));
    }
    getUser(user: string): Observable<ServerResponse<User>> {
        return this.processHttpResponse(this.httpClient.get<User>(`${this.userUrl}/users/${user}`));
    }
    synchronizeWithToken(): Observable<ServerResponse<User>> {
        return this.processHttpResponse(this.httpClient.post<User>(`${this.userUrl}/users/synchronizeWithToken`, null));
    }
    currentUserWithPerimeters(): Observable<ServerResponse<UserWithPerimeters>> {
        return this.processHttpResponse(
            this.httpClient.get(`${this.userUrl}/CurrentUserWithPerimeters`, {responseType: 'text'})
        ).pipe(map((response) => this.convertUserProcessStatesInResponseToMap(response)));
    }
    convertUserProcessStatesInResponseToMap(serverResponse: ServerResponse<any>): ServerResponse<UserWithPerimeters> {
        let user = null;
        if (serverResponse.status === ServerResponseStatus.OK) {
            user = <UserWithPerimeters>JSON.parse(serverResponse.data, this.convertStatesToMap);
        }
        const newServerResponse = new ServerResponse<UserWithPerimeters>(
            user,
            serverResponse.status,
            serverResponse.statusMessage
        );
        return newServerResponse;
    }
    // We need to convert manually the states to have a Map of states
    // otherwise we end up with an object instead of a Map;
    convertStatesToMap(key, value): Map<string, Array<string>> {
        if (key === 'processesStatesNotNotified') {
            const mapOfStates = new Map<string, Array<string>>();
            for (const state in value) {
                mapOfStates.set(state, value[state]);
            }
            return mapOfStates;
        }
        return value;
    }
    queryAllUsers(): Observable<ServerResponse<User[]>> {
        return this.processHttpResponse(this.httpClient.get<User[]>(`${this.userUrl}/users`));
    }
    updateUser(userData: User): Observable<ServerResponse<User>> {
        return this.processHttpResponse(this.httpClient.post<User>(`${this.userUrl}/users`, userData));
    }
    loadConnectedUsers(): Observable<ServerResponse<any[]>> {
        return this.processHttpResponse(this.httpClient.get<any[]>(`${this.connectionsUrl}`));
    }
    willNewSubscriptionDisconnectAnExistingSubscription(): Observable<ServerResponse<boolean>> {
        return this.processHttpResponse(
            this.httpClient.get<boolean>(`${this.willNewSubscriptionDisconnectAnExistingSubscriptionUrl}`)
        );
    }
}
