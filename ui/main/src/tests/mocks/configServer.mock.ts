/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Observable, ReplaySubject} from 'rxjs';
import {ConfigServer} from 'app/business/server/config.server';
import {MonitoringConfig} from '@ofModel/monitoringConfig.model';
import {ServerResponse} from 'app/business/server/serverResponse';

export class ConfigServerMock implements ConfigServer {

    private webUiConf = new ReplaySubject<ServerResponse<any>>();
    private menuConf = new ReplaySubject<ServerResponse<any>>();
    private monitoringConf = new ReplaySubject<ServerResponse<MonitoringConfig>>;

    getWebUiConfiguration(): Observable<ServerResponse<any>> {
        return this.webUiConf.asObservable();
    }

    getMenuConfiguration(): Observable<ServerResponse<any>> {
        return this.menuConf.asObservable();
    }

    getMonitoringConfiguration(): Observable<ServerResponse<MonitoringConfig>> {
        return this.monitoringConf.asObservable();
    }

    setResponseForWebUIConfiguration(webuiConf:ServerResponse<any>) {
        this.webUiConf.next(webuiConf);
    }

    setResponseForMenuConfiguration(menuConf:ServerResponse<any>) {
        this.menuConf.next(menuConf);
    }

    setResponseForMonitoringConfiguration(monitoringConf: ServerResponse<MonitoringConfig>) {
        this.monitoringConf.next(monitoringConf);
    }
}
