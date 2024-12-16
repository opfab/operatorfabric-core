/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {RemoteLoggerService} from './RemoteLoggerService';

export enum LogOption {
    LOCAL,
    REMOTE,
    LOCAL_AND_REMOTE
}

export enum LogLevel {
    DEBUG,
    INFO,
    WARNING,
    ERROR
}

export class LoggerService {
    // Default value ERROR so we do not pollute unit test
    private static logLevel: LogLevel = LogLevel.ERROR;

    private static log(log: string, logLevel: string, logOption: LogOption) {
        const logLine = new Date().toISOString() + ' ' + logLevel + ' ' + log;
        switch (logOption) {
            case LogOption.LOCAL:
                /* eslint-disable-next-line no-console */
                console.log(logLine);
                break;
            case LogOption.REMOTE:
                RemoteLoggerService.postLog(logLine);
                break;
            case LogOption.LOCAL_AND_REMOTE:
                /* eslint-disable-next-line no-console */
                console.log(logLine);
                RemoteLoggerService.postLog(logLine);
                break;
        }
    }

    public static setLogLevel(logLevel: LogLevel) {
        LoggerService.logLevel = logLevel;
    }

    public static debug(log: string, logOption: LogOption = LogOption.LOCAL) {
        if (LoggerService.logLevel === LogLevel.DEBUG) LoggerService.log(log, 'DEBUG', logOption);
    }

    public static info(log: string, logOption: LogOption = LogOption.LOCAL) {
        if (LoggerService.logLevel < LogLevel.WARNING) LoggerService.log(log, 'INFO', logOption);
    }

    public static warn(log: string, logOption: LogOption = LogOption.LOCAL) {
        if (LoggerService.logLevel < LogLevel.ERROR) LoggerService.log(log, 'WARNING', logOption);
    }

    public static error(log: string, logOption: LogOption = LogOption.LOCAL) {
        LoggerService.log(log, 'ERROR', logOption);
    }
}
