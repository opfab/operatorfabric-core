/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {environment} from '@env/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {ErrorService} from '@ofServices/error-service';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {OpfabLoggerService} from './logs/opfab-logger.service';
import {UserActionLog} from '@ofModel/user-action-log.model';

@Injectable({
    providedIn: 'root'
})
export class UserActionsService extends ErrorService {
    readonly userActionsUrl: string;

    /**
     * @constructor
     * @param httpClient - Angular build-in
     */
    constructor(protected store: Store<AppState>, private httpClient: HttpClient, protected loggerService: OpfabLoggerService) {
        super(store, loggerService);
        this.userActionsUrl = `${environment.urls.userActionLogs}`;
    }

    queryAllUserActions(): Observable<UserActionLog[]> {
        return this.httpClient.get<UserActionLog[]>(this.userActionsUrl);
    }

}
