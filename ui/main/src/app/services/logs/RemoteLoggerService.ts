/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import packageInfo from '../../../../package.json';
import {RemoteLoggerServer} from './server/RemoteLoggerServer';

export class RemoteLoggerService {
    private static remoteLoggerServer: RemoteLoggerServer;
    private static isActive = false;
    private static logQueue: string[] = [];

    public static setRemoteLoggerServer(remoteLoggerServer: RemoteLoggerServer): void {
        RemoteLoggerService.remoteLoggerServer = remoteLoggerServer;
    }

    private static regularlyFlush(): void {
        RemoteLoggerService.flush();
        if (RemoteLoggerService.isActive) setTimeout(() => this.regularlyFlush(), 5000);
    }

    public static setRemoteLoggerActive(active: boolean): void {
        if (active) {
            if (!RemoteLoggerService.isActive) {
                RemoteLoggerService.isActive = true;
                RemoteLoggerService.regularlyFlush();
                RemoteLoggerService.postLog(
                    'Remote log activated - ' + packageInfo.opfabVersion + ' - ' + window.navigator.userAgent
                );
            }
        } else {
            RemoteLoggerService.postLog('Remote log deactivated');
            RemoteLoggerService.isActive = false;
        }
    }

    public static postLog(logLine: string): void {
        if (RemoteLoggerService.isActive) {
            RemoteLoggerService.logQueue.push(logLine);
        }
    }

    public static flush(): void {
        if (RemoteLoggerService.logQueue.length > 0) {
            const logsToPush = RemoteLoggerService.logQueue.join('\n');
            RemoteLoggerService.logQueue = [];
            if (RemoteLoggerService.remoteLoggerServer) {
                RemoteLoggerService.remoteLoggerServer.postLogs(logsToPush).subscribe();
            }
        }
    }
}
