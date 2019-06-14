/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable, Injector} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient, HttpParams, HttpUrlEncodingCodec} from "@angular/common/http";
import {AuthenticationService} from "@ofServices/authentication.service";
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {environment} from "@env/environment";
import {selectIdentifier} from "@ofSelectors/authentication.selectors";

@Injectable()
export class SettingsService {
    private usersUrl: string;
    private userId: string;

    constructor(private httpClient: HttpClient,
                private store: Store<AppState>) {
        this.usersUrl = `${environment.urls.users}`;
        this.store.select(selectIdentifier).subscribe(id=>this.userId=id);
    }

    fetchUserSettings(): Observable<any> {
        return this.httpClient.get(`${this.usersUrl}/users/${this.userId}/settings`)
    }
}
