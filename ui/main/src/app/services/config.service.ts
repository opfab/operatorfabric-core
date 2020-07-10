/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {Injectable} from '@angular/core';
import {map} from 'rxjs/operators';
import * as _ from 'lodash';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {environment} from '@env/environment';

@Injectable()
export class ConfigService {
    private configUrl: string;
    private config;

    constructor(private httpClient: HttpClient,
                private store: Store<AppState>) {
        this.configUrl = `${environment.urls.config}`;
    }

    fetchConfiguration(): Observable<any> {
        return this.httpClient.get(`${this.configUrl}`).pipe(
            map(
            config => this.config = config));
    }

    getConfigValue(path:string, fallback: any = null)
    {
        const result = _.get(this.config, path, null);
        if (!result && fallback) {
            return fallback;
        }
        return result;
    }
}
