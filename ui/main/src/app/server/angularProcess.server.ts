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
import {Observable} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AngularProcessServer implements ProcessServer {
    private processesUrl: string;
    private processGroupsUrl: string;
    private monitoringConfigUrl: string;

    constructor(private httpClient: HttpClient) {
        this.processesUrl = `${environment.urls.processes}`;
        this.processGroupsUrl = `${environment.urls.processGroups}`;
        this.monitoringConfigUrl = `${environment.urls.monitoringConfig}`;
    }

    getProcessDefinition(processId: string, processVersion: string):Observable<Process> {
        const params = new HttpParams().set('version', processVersion);
        return this.httpClient.get<Process>(`${this.processesUrl}/${processId}/`, {
            params
        });
    }

    getAllProcessesDefinition(): Observable<Process[]> {
        return this.httpClient.get<Process[]>(this.processesUrl);
    }

    getI18N(processId: string, locale: string,version: string): Observable<any> {
        let params = new HttpParams().set('locale', locale);
        if (version) {
            /*
            `params` override needed otherwise only locale is use in the request.
            It's so because HttpParams.set(...) return a new HttpParams,
            and basically that's why HttpParams can be set with fluent API...
             */
            params = params.set('version', version);
        }
        return this.httpClient.get(`${this.processesUrl}/${processId}/i18n`, {params});
    }

    getProcessGroups(): Observable<any> {
        return this.httpClient.get(this.processGroupsUrl);
    }

    getTemplate(processId: string, processVersion: string, templateName: string) : Observable<string> {
        const params = new HttpParams().set('version', processVersion);
        return this.httpClient.get(`${this.processesUrl}/${processId}/templates/${templateName}`, {
            params,
            responseType: 'text'
        });
    }

    getCss(processId: string, version: string, cssName: string) : Observable<string> {
        return null;
    }
}
