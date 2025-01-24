/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
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
import {ServerResponseStatus} from '../../server/ServerResponse';
import {AlertMessageService} from '@ofServices/alerteMessage/AlertMessageService';
import {MessageLevel} from '@ofServices/alerteMessage/model/Message';
import {LoggerService} from '@ofServices/logs/LoggerService';

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
                    LoggerService.error(`Error when getting processes :  ${adminProcessesResponse.statusMessage}`);
                    AlertMessageService.sendAlertMessage({
                        message: '',
                        i18n: {key: 'shared.error.process.gettingProcesses'},
                        level: MessageLevel.ERROR
                    });
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
                    LoggerService.error(
                        `Error when deleting processes ${id} :  ${adminProcessesResponse.statusMessage}`
                    );
                    AlertMessageService.sendAlertMessage({
                        message: '',
                        i18n: {key: 'shared.error.process.deleteProcess'},
                        level: MessageLevel.ERROR
                    });
                }
            })
        );
    }
}
