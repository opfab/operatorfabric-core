/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import winston, {format} from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import config from 'config';

let logger: winston.Logger;

const logFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.align(),
    winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

const logConfiguration: any = config.get('operatorfabric.logConfig');

export function getLogger(): winston.Logger {
    if (logger === undefined) {
        logger = winston.createLogger({
            format: format.combine(
                format((info) => {
                    info.message = prefixNewLinesToAvoidLogInjection(info.message as string);
                    return info;
                })(),
                logFormat
            ),
            transports: [new winston.transports.Console({level: logConfiguration.logLevel})]
        });

        if (logConfiguration.logFile != null) {
            const transport = new DailyRotateFile({
                filename: logConfiguration.logFolder + logConfiguration.logFile,
                datePattern: 'YYYY-MM-DD',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '14d',
                level: logConfiguration.logLevel
            });
            //eslint-disable-next-line @typescript-eslint/no-unused-vars
            transport.on('rotate', function (oldFilename, newFilename) {
                // call function like upload to s3 or on cloud
            });

            logger = winston.createLogger({
                format: format.combine(
                    format((info) => {
                        info.message = prefixNewLinesToAvoidLogInjection(info.message as string);
                        return info;
                    })(),
                    logFormat
                ),
                transports: [transport, new winston.transports.Console({level: logConfiguration.logLevel})]
            });
        }
    }
    return logger;
}

export function getLogLevel(): LogLevel {
    return new LogLevel(logger.transports[0].level, logger.transports[0].level);
}

export function setLogLevel(level: string): boolean {
    if (logger.levels[level] != null) {
        logger.transports.forEach((transport) => {
            transport.level = level;
        });
        return true;
    }
    return false;
}

function prefixNewLinesToAvoidLogInjection(message: string): string {
    return message.replace(/[\n\r\b\v\f]/g, '\n       ... ');
}

export class LogLevel {
    configuredLevel: string | undefined;
    effectiveLevel: string | undefined;

    constructor(configuredLevel: string | undefined, effectiveLevel: string | undefined) {
        this.configuredLevel = configuredLevel?.toUpperCase();
        this.effectiveLevel = effectiveLevel?.toUpperCase();
    }
}
