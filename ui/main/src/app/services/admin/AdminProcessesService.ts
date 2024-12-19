/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Process} from '@ofServices/processes/model/Processes';
import {AdminProcessesServer} from './server/AdminProcessesServer';
import {ServerResponseStatus} from '../../business/server/serverResponse';
import {ErrorService} from '../../business/services/error-service';

export class AdminProcessesService {
    private static readonly processes: Process[];
    private static adminProcessesServer: AdminProcessesServer;

    public static setAdminProcessesServer(adminProcessesServer: AdminProcessesServer) {
        AdminProcessesService.adminProcessesServer = adminProcessesServer;
    }

    public static getCachedValues(): Array<Process> {
        return AdminProcessesService.getAllProcesses();
    }
    private static getAllProcesses(): Process[] {
        return AdminProcessesService.processes;
    }

    public static getAll(): Observable<any[]> {
        return AdminProcessesService.queryAllProcesses();
    }
    private static queryAllProcesses(): Observable<Process[]> {
        return AdminProcessesService.adminProcessesServer.queryAllProcesses().pipe(
            map((adminProcessesResponse) => {
                if (adminProcessesResponse.status === ServerResponseStatus.OK) {
                    return adminProcessesResponse.data;
                } else {
                    ErrorService.handleServerResponseError(adminProcessesResponse);
                    return [];
                }
            })
        );
    }

    public static update(data: any): Observable<any> {
        return null;
    }

    public static deleteById(id: string) {
        return AdminProcessesService.adminProcessesServer.deleteById(id).pipe(
            map((adminProcessesResponse) => {
                if (adminProcessesResponse.status !== ServerResponseStatus.OK) {
                    ErrorService.handleServerResponseError(adminProcessesResponse);
                }
            })
        );
    }
}
