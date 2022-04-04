/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {RemoteLoggerService} from './remote-logger.service';


@Injectable({
  providedIn: 'root'
})
export class OpfabLoggerService {

  constructor(private remoteLogger: RemoteLoggerService) {
  }

  private log(log: string, logLevel: string, logOption: LogOption) {
    const logLine = new Date().toISOString() + ' ' + logLevel + ' ' + log;
    switch (logOption) {
      case LogOption.LOCAL:
        console.log(logLine);
        break;
      case LogOption.REMOTE:
        this.remoteLogger.postLog(logLine);
        break;
      case LogOption.LOCAL_AND_REMOTE:
        console.log(logLine);
        this.remoteLogger.postLog(logLine);
        break;
    }
  }

  debug(log: string, logOption: LogOption = LogOption.LOCAL) {
    this.log(log, 'DEBUG', logOption);
  }

  info(log: string, logOption: LogOption = LogOption.LOCAL) {
    this.log(log, 'INFO', logOption);
  }

  warn(log: string, logOption: LogOption = LogOption.LOCAL) {
    this.log(log, 'WARNING', logOption);
  }


  error(log: string, logOption: LogOption = LogOption.LOCAL) {
    this.log(log, 'ERROR', logOption);
  }


}

export enum LogOption {
  LOCAL, REMOTE, LOCAL_AND_REMOTE
}

