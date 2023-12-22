/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {RemoteLoggerService} from './remote-logger.service';

export class LoggerService {

    private static log(log: string, logLevel: string, logOption: LogOption) {
        const logLine = new Date().toISOString() + ' ' + logLevel + ' ' + log;
        switch (logOption) {
            case LogOption.LOCAL:
                console.log(logLine);
                break;
            case LogOption.REMOTE:
                RemoteLoggerService.postLog(logLine);
                break;
            case LogOption.LOCAL_AND_REMOTE:
                console.log(logLine);
                RemoteLoggerService.postLog(logLine);
                break;
        }
    }

    public static debug(log: string, logOption: LogOption = LogOption.LOCAL) {
        LoggerService.log(log, 'DEBUG', logOption);
    }

    public static info(log: string, logOption: LogOption = LogOption.LOCAL) {
        LoggerService.log(log, 'INFO', logOption);
    }

    public static warn(log: string, logOption: LogOption = LogOption.LOCAL) {
        LoggerService.log(log, 'WARNING', logOption);
    }

    public static error(log: string, logOption: LogOption = LogOption.LOCAL) {
        LoggerService.log(log, 'ERROR', logOption);
    }
}

export enum LogOption {
    LOCAL,
    REMOTE,
    LOCAL_AND_REMOTE
}
