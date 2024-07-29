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

export default class Logger {
    static logger: winston.Logger;

    static readonly logFormat = winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.align(),
        winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
    );

    static readonly logConfiguration: any = config.get('operatorfabric.logConfig');

    public static getLogger(): winston.Logger {
        if (!this.logger) {
            this.logger = winston.createLogger({
                format: format.combine(
                    format((info) => {
                        info.message = this.prefixNewLinesToAvoidLogInjection(info.message);
                        return info;
                    })(),
                    this.logFormat
                ),
                transports: [new winston.transports.Console({level: this.logConfiguration.logLevel})]
            });

            if (this.logConfiguration.logFile) {
                const transport = new DailyRotateFile({
                    filename: this.logConfiguration.logFolder + this.logConfiguration.logFile,
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '14d',
                    level: this.logConfiguration.logLevel
                });

                transport.on('rotate', function (oldFilename, newFilename) {
                    // call function like upload to s3 or on cloud
                });

                this.logger = winston.createLogger({
                    format: format.combine(
                        format((info) => {
                            info.message = this.prefixNewLinesToAvoidLogInjection(info.message);
                            return info;
                        })(),
                        this.logFormat
                    ),
                    transports: [transport, new winston.transports.Console({level: this.logConfiguration.logLevel})]
                });
            }
        }
        return this.logger;
    }

    public static getLogLevel(): LogLevel {
        return new LogLevel(this.logger.transports[0].level, this.logger.transports[0].level)
    }

    public static setLogLevel(level: string): boolean {
        if (this.logger.levels[level]) {
            this.logger.transports.forEach((transport) => {
                transport.level = level;
            });
            return true;
        }
        return false;
    }

    private static prefixNewLinesToAvoidLogInjection(message: string): string {
        return message.replace(/[\n\r\b\v\f]/g, '\n       ... ');
    }

}

export class LogLevel {
    configuredLevel: string|undefined;
    effectiveLevel: string|undefined;

    constructor(configuredLevel: string|undefined, effectiveLevel: string|undefined) {
        this.configuredLevel = configuredLevel?.toUpperCase();
        this.effectiveLevel = effectiveLevel?.toUpperCase();
    }
}
