/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import packageInfo from '../../../../../package.json';
import {RemoteLoggerServer} from 'app/business/server/remote-logger.server';

export class RemoteLoggerService {
    private static remoteLoggerServer: RemoteLoggerServer;
    private static isActive = false;
    private static logs = [];

    public static setRemoteLoggerServer(remoteLoggerServer: RemoteLoggerServer) {
        RemoteLoggerService.remoteLoggerServer = remoteLoggerServer;
    }

    private static regularlyFlush() {
        this.flush();
        if (RemoteLoggerService.isActive) setTimeout(() => this.regularlyFlush(), 5000);
    }

    public static setRemoteLoggerActive(active: boolean) {
        if (active) {
            if (!RemoteLoggerService.isActive) {
                RemoteLoggerService.isActive = true;
                RemoteLoggerService.regularlyFlush();
                RemoteLoggerService.postLog(
                    'Remote log activated - ' + packageInfo.opfabVersion + ' - ' + window.navigator.userAgent
                );
            }
        } else {
            RemoteLoggerService.postLog('Remote log deactivated ');
            RemoteLoggerService.isActive = false;
        }
    }

    public static postLog(logLine: string) {
        if (this.isActive) this.logs.push(logLine);
    }

    public static flush() {
        if (this.logs.length > 0) {
            const logsToPush = RemoteLoggerService.buildLogsToPush(this.logs);
            this.logs = [];
            if (this.remoteLoggerServer) this.remoteLoggerServer.postLogs(logsToPush).subscribe();
        }
    }

    private static buildLogsToPush(logs: any[]) {
        let logsToPush = '';
        let first = true;
        logs.forEach((log) => {
            if (!first) logsToPush += '\n';
            logsToPush += log;
            first = false;
        });
        return logsToPush;
    }
}
