/* Copyright (c) 2023-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '@env/environment';
import {Observable} from 'rxjs';
import {Process} from '@ofServices/processes/model/Processes';
import {AngularServer} from '../../../server/AngularServer';
import {ServerResponse} from 'app/server/ServerResponse';
import {AdminProcessesServer} from '@ofServices/admin/server/AdminProcessesServer';

@Injectable({
    providedIn: 'root'
})
export class AngularAdminProcessesServer extends AngularServer implements AdminProcessesServer {
    private readonly httpClient = inject(HttpClient);

    readonly processesUrl: string;
    constructor() {
        super();
        this.processesUrl = `${environment.url}businessconfig/processes`;
    }

    queryAllProcesses(allVersions?: boolean): Observable<ServerResponse<Process[]>> {
        const url = allVersions ? `${this.processesUrl}?allVersions=true` : `${this.processesUrl}`;

        return this.processHttpResponse(this.httpClient.get<Process[]>(url));
    }

    update(data: any): Observable<ServerResponse<Process>> {
        return null;
    }

    public deleteById(id: string): Observable<ServerResponse<any>> {
        const url = `${this.processesUrl}/${encodeURIComponent(id)}`;
        return this.processHttpResponse(this.httpClient.delete(url));
    }

    deleteVersion(id: string, version: string): Observable<ServerResponse<any>> {
        const url = `${this.processesUrl}/${encodeURIComponent(id)}/versions/${encodeURIComponent(version)}`;
        return this.processHttpResponse(this.httpClient.delete(url));
    }

    downloadBundle(id: string, version: string): Observable<Blob> {
        const url = `${this.processesUrl}/${encodeURIComponent(id)}/versions/${encodeURIComponent(version)}/download`;

        return this.httpClient.get(url, {responseType: 'blob'});
    }
}
