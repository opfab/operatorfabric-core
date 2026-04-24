/* Copyright (c) 2023-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {forkJoin, Observable} from 'rxjs';
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

    private static queryAllProcesses(): Observable<any[]> {
        const latest$ = AdminProcessesService.adminProcessesServer.queryAllProcesses(false);
        const all$ = AdminProcessesService.adminProcessesServer.queryAllProcesses(true);

        return forkJoin([latest$, all$]).pipe(
            map(([latestResponse, allResponse]) => {
                if (
                    latestResponse.status !== ServerResponseStatus.OK ||
                    allResponse.status !== ServerResponseStatus.OK
                ) {
                    LoggerService.error('Error loading processes');

                    AlertMessageService.sendAlertMessage({
                        message: '',
                        i18n: {key: 'shared.error.process.gettingProcesses'},
                        level: MessageLevel.ERROR
                    });

                    return [];
                }

                const latest = latestResponse.data ?? [];
                const all = allResponse.data ?? [];

                return all.map((process) => ({
                    ...process,
                    currentVersion: latest.some((l) => l.id === process.id && l.version === process.version)
                }));
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

    public static deleteVersion(id: string, version: string) {
        return AdminProcessesService.adminProcessesServer.deleteVersion(id, version).pipe(
            map((response) => {
                if (response.status !== ServerResponseStatus.OK) {
                    LoggerService.error(`Error deleting process ${id} version ${version} : ${response.statusMessage}`);
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
