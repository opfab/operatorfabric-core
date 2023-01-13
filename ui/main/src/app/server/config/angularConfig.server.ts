/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from '@env/environment';
import {UIMenuFile} from '@ofModel/menu.model';
import {map, Observable} from 'rxjs';
import {ConfigServer} from '../../business/config/config.server';

@Injectable({
    providedIn: 'root'
})
export class AngularConfigServer implements ConfigServer {
    private configUrl: string;

    constructor(private httpClient: HttpClient) {
        this.configUrl = `${environment.urls.config}`;
    }

    getWebUiConfiguration(): Observable<any> {
        return this.httpClient.get(`${this.configUrl}`, {responseType: 'text'}).pipe(
            map((config) => {
                try {
                    config = JSON.parse(config);
                } catch (error) {
                    console.error('Invalid web-ui.json file:', error);
                }
                return config;
            })
        );
    }

    getMenuConfiguration(): Observable<any> {
        return this.httpClient
            .get<UIMenuFile>(`${environment.urls.menuConfig}`)
    }
}
