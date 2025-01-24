/* Copyright (c) 2024-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from '@env/environment';
import {ServerResponse} from 'app/server/ServerResponse';
import {Observable} from 'rxjs';
import {AngularServer} from '../../../server/AngularServer';
import {HandlebarsTemplateServer} from './HandlebarsTemplateServer';

@Injectable({
    providedIn: 'root'
})
export class AngularHandlebarsTemplateServer extends AngularServer implements HandlebarsTemplateServer {
    private readonly processesUrl: string;

    constructor(private readonly httpClient: HttpClient) {
        super();
        this.processesUrl = `${environment.url}businessconfig/processes`;
    }

    getTemplate(processId: string, processVersion: string, templateName: string): Observable<ServerResponse<string>> {
        const params = new HttpParams().set('version', processVersion);
        return this.processHttpResponse(
            this.httpClient.get(`${this.processesUrl}/${processId}/templates/${templateName}`, {
                params,
                responseType: 'text'
            })
        );
    }
}
