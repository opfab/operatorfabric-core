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
import {Process} from '@ofModel/processes.model';
import {AdminProcessServer} from '../../server/adminprocess.server';
import {ServerResponseStatus} from '../../server/serverResponse';
import {ErrorService} from '../error-service';

export class AdminProcessesService {
    private static readonly processes: Process[];
    private static adminprocessServer: AdminProcessServer;

    public static setAdminProcessServer(adminprocessServer: AdminProcessServer) {
        AdminProcessesService.adminprocessServer = adminprocessServer;
    }

    public static getCachedValues(): Array<Process> {
        return this.getAllProcesses();
    }
    private static getAllProcesses(): Process[] {
        return this.processes;
    }

    public static getAll(): Observable<any[]> {
        return this.queryAllProcesses();
    }
    private static queryAllProcesses(): Observable<Process[]> {
        return this.adminprocessServer.queryAllProcesses().pipe(
            map((adminprocessResponse) => {
                if (adminprocessResponse.status === ServerResponseStatus.OK) {
                    return adminprocessResponse.data;
                } else {
                    ErrorService.handleServerResponseError(adminprocessResponse);
                    return [];
                }
            })
        );
    }

    public static update(data: any): Observable<any> {
        return null;
    }

    public static deleteById(id: string) {
        return AdminProcessesService.adminprocessServer.deleteById(id).pipe(
            map((adminprocessResponse) => {
                if (adminprocessResponse.status !== ServerResponseStatus.OK) {
                    ErrorService.handleServerResponseError(adminprocessResponse);
                }
            })
        );
    }
}
