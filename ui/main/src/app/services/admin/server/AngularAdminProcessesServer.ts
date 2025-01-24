/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
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
    readonly processesUrl: string;
    constructor(private readonly httpClient: HttpClient) {
        super();
        this.processesUrl = `${environment.url}businessconfig/processes`;
    }

    queryAllProcesses(): Observable<ServerResponse<Process[]>> {
        return this.processHttpResponse(this.httpClient.get<Process[]>(`${this.processesUrl}`));
    }

    update(data: any): Observable<ServerResponse<Process>> {
        return null;
    }

    public deleteById(id: string): Observable<ServerResponse<any>> {
        const url = `${this.processesUrl}/${id}`;
        return this.processHttpResponse(this.httpClient.delete(url));
    }
}
