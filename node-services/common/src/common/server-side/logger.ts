/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import config from 'config';

const logFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const logConfiguration : any = config.get("logConfig");

let logger = winston.createLogger({
  format: logFormat,
  transports: [new winston.transports.Console({level: logConfiguration.logLevel})]
});


if (logConfiguration.logFile) {
  const transport = new DailyRotateFile({
    filename: logConfiguration.logFolder + logConfiguration.logFile,
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
    level: logConfiguration.logLevel,
  });
  
  transport.on("rotate", function (oldFilename, newFilename) {
    // call function like upload to s3 or on cloud
  });

  logger = winston.createLogger({
    format: logFormat,
    transports: [transport],
  });
}


export default logger;


