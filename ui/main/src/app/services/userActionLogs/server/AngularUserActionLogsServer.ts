/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ServerResponse} from 'app/business/server/serverResponse';
import {Observable} from 'rxjs';
import {AngularServer} from '../../../server/angular.server';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '@env/environment';
import {Injectable} from '@angular/core';
import {UserActionLogsServer} from '@ofServices/userActionLogs/server/UserActionLogsServer';
import {Page} from '@ofModel/page.model';
import {UserActionLog} from '@ofServices/userActionLogs/model/UserActionLog';

@Injectable({
    providedIn: 'root'
})
export class AngularUserActionLogsServer extends AngularServer implements UserActionLogsServer {
    readonly userActionsUrl: string;

    constructor(private readonly httpClient: HttpClient) {
        super();
        this.userActionsUrl = `${environment.url}users/userActionLogs`;
    }

    queryUserActionLogs(filters: Map<string, string[]>): Observable<ServerResponse<Page<UserActionLog>>> {
        const params = this.convertFiltersIntoHttpParams(filters);
        return this.processHttpResponse(this.httpClient.get<Page<UserActionLog>>(this.userActionsUrl, {params}));
    }

    convertFiltersIntoHttpParams(filters: Map<string, string[]>): HttpParams {
        let params = new HttpParams();
        filters.forEach((values, key) => values.forEach((value) => (params = params.append(key, value))));
        return params;
    }
}
