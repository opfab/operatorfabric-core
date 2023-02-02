/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {environment} from '@env/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {ErrorService} from 'app/business/services/error-service';
import {OpfabLoggerService} from './logs/opfab-logger.service';
import {UserActionLog} from '@ofModel/user-action-log.model';
import {Page} from '@ofModel/page.model';
import {AlertMessageService} from '../business/services/alert-message.service';

@Injectable({
    providedIn: 'root'
})
export class UserActionLogsService extends ErrorService {
    readonly userActionsUrl: string;

    /**
     * @constructor
     * @param httpClient - Angular build-in
     */
    constructor(private httpClient: HttpClient, protected loggerService: OpfabLoggerService, protected alertMessageService: AlertMessageService) {
        super(loggerService, alertMessageService);
        this.userActionsUrl = `${environment.urls.userActionLogs}`;
    }

    queryUserActionLogs(filters: Map<string, string[]>): Observable<Page<UserActionLog>> {
        const params = this.convertFiltersIntoHttpParams(filters);
        return this.httpClient.get<Page<UserActionLog>>(this.userActionsUrl, {params});
    }

    convertFiltersIntoHttpParams(filters: Map<string, string[]>): HttpParams {
        let params = new HttpParams();
        filters.forEach((values, key) => values.forEach((value) => (params = params.append(key, value))));
        return params;
    }

}
