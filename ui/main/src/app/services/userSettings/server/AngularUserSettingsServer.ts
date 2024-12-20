/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ServerResponse} from 'app/business/server/serverResponse';
import {UserSettingsServer} from '@ofServices/userSettings/server/UserSettingsServer';
import {Observable} from 'rxjs';
import {AngularServer} from '../../../server/angular.server';
import {HttpClient} from '@angular/common/http';
import {environment} from '@env/environment';
import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AngularUserSettingsServer extends AngularServer implements UserSettingsServer {
    usersUrl: string;
    constructor(private readonly httpClient: HttpClient) {
        super();
        this.usersUrl = `${environment.url}users`;
    }

    getUserSettings(userId: string): Observable<ServerResponse<any>> {
        return this.processHttpResponse(this.httpClient.get(`${this.usersUrl}/users/${userId}/settings`));
    }

    patchUserSettings(userId: string, settings: any): Observable<ServerResponse<any>> {
        return this.processHttpResponse(this.httpClient.patch(`${this.usersUrl}/users/${userId}/settings`, settings));
    }
}
