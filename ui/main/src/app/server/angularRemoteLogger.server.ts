/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ServerResponse} from "app/business/server/serverResponse";
import {Observable} from "rxjs";
import {AngularServer} from "./angular.server";
import {HttpClient} from '@angular/common/http';
import {environment} from "@env/environment";
import {Injectable} from "@angular/core";
import {RemoteLoggerServer} from "app/business/server/remote-logger.server";

@Injectable({
    providedIn: 'root'
})
export class AngularRemoteLoggerServer extends AngularServer implements RemoteLoggerServer {
    private remoteLogsUrl;
    constructor(private httpClient: HttpClient) {
        super();
        this.remoteLogsUrl = `${environment.urls.remoteLogs}`;
    }

    postLogs(logsToPush): Observable<ServerResponse<any>> {
        return this.processHttpResponse(this.httpClient.post<string[]>(`${this.remoteLogsUrl}`, logsToPush))

    }
}
