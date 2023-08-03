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
import {Process, State} from '@ofModel/processes.model';
import {ProcessServer} from 'app/business/server/process.server';
import {ServerResponse, ServerResponseStatus} from 'app/business/server/serverResponse';
import {map, Observable} from 'rxjs';
import {AngularServer} from './angular.server';

@Injectable({
    providedIn: 'root'
})
export class AngularProcessServer extends AngularServer implements ProcessServer {
    private processesUrl: string;
    private processGroupsUrl: string;

    constructor(private httpClient: HttpClient) {
        super();
        this.processesUrl = `${environment.url}/businessconfig/processes`;
        this.processGroupsUrl = `${environment.url}/businessconfig/processgroups`;
    }

    getProcessDefinition(processId: string, processVersion: string): Observable<ServerResponse<Process>> {
        const params = new HttpParams().set('version', processVersion);
        return this.processHttpResponse(
            this.httpClient.get(`${this.processesUrl}/${processId}`, {
                params: params,
                responseType: 'text'
            })
        ).pipe(map((response) => this.convertProcessStatesInResponseToMap(response)));
    }

    convertProcessStatesInResponseToMap(serverResponse: ServerResponse<any>): ServerResponse<Process> {
        let process = null;
        if (serverResponse.status === ServerResponseStatus.OK) {
            process = <Process>JSON.parse(serverResponse.data, this.convertStatesToMap);
        }
        const newServerResponse = new ServerResponse<Process>(
            process,
            serverResponse.status,
            serverResponse.statusMessage
        );
        return newServerResponse;
    }

    getAllProcessesDefinition(): Observable<ServerResponse<Process[]>> {
        return this.processHttpResponse(this.httpClient.get(this.processesUrl, {responseType: 'text'})).pipe(
            map((response) => this.convertProcessesStatesInResponseToMap(response))
        );
    }

    getAllProcessesWithAllVersions(): Observable<ServerResponse<Process[]>> {
        const params = new HttpParams().set('allVersions', true);
        return this.processHttpResponse(this.httpClient.get(this.processesUrl, {
            params: params,
            responseType: 'text'
        })).pipe(map((response) => this.convertProcessesStatesInResponseToMap(response)));
    }

    convertProcessesStatesInResponseToMap(serverResponse: ServerResponse<any>): ServerResponse<Process[]> {
        let processes = null;
        if (serverResponse.status === ServerResponseStatus.OK) {
            processes = <Process[]>JSON.parse(serverResponse.data, this.convertStatesToMap);
        }
        const newServerResponse = new ServerResponse<Process[]>(
            processes,
            serverResponse.status,
            serverResponse.statusMessage
        );
        return newServerResponse;
    }

    // We need to convert manually the states to have a Map of states
    // otherwise we end up with an object instead of a Map;
    convertStatesToMap(key, value): Map<string, State> {
        if (key === 'states') {
            const mapOfStates = new Map<string, State>();
            for (const state in value) {
                mapOfStates.set(state, value[state]);
            }
            return mapOfStates;
        }
        return value;
    }

    getProcessGroups(): Observable<ServerResponse<any>> {
        return this.processHttpResponse(this.httpClient.get(this.processGroupsUrl));
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

    getCss(processId: string, version: string, cssName: string): Observable<ServerResponse<string>> {
        return null;
    }
}
