/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {environment} from '@env/environment';
import {selectIdentifier} from '@ofSelectors/authentication.selectors';
import {LogOption, OpfabLoggerService} from './logs/opfab-logger.service';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    readonly usersUrl: string;
    private userId: string;

    constructor(private httpClient: HttpClient, private store: Store<AppState>,private logger: OpfabLoggerService) {
        this.usersUrl = `${environment.urls.users}`;
        this.store.select(selectIdentifier).subscribe((id) => (this.userId = id));
    }

    fetchUserSettings(): Observable<any> {
        return this.httpClient.get(`${this.usersUrl}/users/${this.userId}/settings`);
    }

    patchUserSettings(settings: any): Observable<any> {
        this.logger.debug("Patch settings : " + JSON.stringify(settings),LogOption.REMOTE);
        return this.httpClient.patch(`${this.usersUrl}/users/${this.userId}/settings`, settings);
    }
}
