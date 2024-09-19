/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {MonitoringConfig} from '@ofModel/monitoringConfig.model';
import {RealTimeScreens} from '@ofModel/real-time-screens.model';
import {Observable} from 'rxjs';
import {ServerResponse} from './serverResponse';
import {ProcessMonitoringConfig} from '@ofModel/process-monitoring-config.model';

export abstract class ConfigServer {
    abstract getWebUiConfiguration(): Observable<ServerResponse<any>>;
    abstract getMenuConfiguration(): Observable<ServerResponse<any>>;
    abstract getMonitoringConfiguration(): Observable<ServerResponse<MonitoringConfig>>;
    abstract getProcessMonitoringConfiguration(): Observable<ServerResponse<ProcessMonitoringConfig>>;
    abstract getLocale(locale: string): Observable<ServerResponse<any>>;
    abstract getRealTimeScreenConfiguration(): Observable<ServerResponse<RealTimeScreens>>;
}
