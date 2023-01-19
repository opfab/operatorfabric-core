/* Copyright (c) 2023, RTE (http://www.rte-france.com)
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
import {Process} from '@ofModel/processes.model';
import {ProcessServer} from 'app/business/server/process.server';
import {ServerResponse} from 'app/business/server/serverResponse';
import {Observable} from 'rxjs';
import {AngularServer} from './angular.server';

@Injectable({
    providedIn: 'root'
})
export class AngularProcessServer extends AngularServer implements ProcessServer {
    private processesUrl: string;
    private processGroupsUrl: string;

    constructor(private httpClient: HttpClient) {
        super();
        this.processesUrl = `${environment.urls.processes}`;
        this.processGroupsUrl = `${environment.urls.processGroups}`;
    }

    getProcessDefinition(processId: string, processVersion: string): Observable<ServerResponse<Process>> {
        const params = new HttpParams().set('version', processVersion);
        return this.processHttpResponse(
            this.httpClient.get<Process>(`${this.processesUrl}/${processId}/`, {
                params
            })
        );
    }

    getAllProcessesDefinition(): Observable<ServerResponse<Process[]>> {
        return this.processHttpResponse(this.httpClient.get<Process[]>(this.processesUrl));
    }

    getProcessGroups(): Observable<ServerResponse<any>> {
        return this.processHttpResponse(this.httpClient.get(this.processGroupsUrl));
    }

    getTemplate(processId: string, processVersion: string, templateName: string): Observable<ServerResponse<string>> {
        const params = new HttpParams().set('version', processVersion);
        return this.processHttpResponse(this.httpClient.get(`${this.processesUrl}/${processId}/templates/${templateName}`, {
            params,
            responseType: 'text'
        }));
    }

    getCss(processId: string, version: string, cssName: string): Observable<ServerResponse<string>> {
        return null;
    }
}
