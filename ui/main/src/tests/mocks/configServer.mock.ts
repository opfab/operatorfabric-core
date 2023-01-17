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

export class ConfigServerMock implements ConfigServer {

    private webUiConf = new ReplaySubject<any>();
    private menuConf = new ReplaySubject<any>();
    private monitoringConf = new ReplaySubject<MonitoringConfig>;

    getWebUiConfiguration(): Observable<any> {
        return this.webUiConf.asObservable();
    }

    getMenuConfiguration(): Observable<any> {
        return this.menuConf.asObservable();
    }

    getMonitoringConfiguration(): Observable<MonitoringConfig> {
        return this.monitoringConf.asObservable();
    }

    setWebUIConfiguration(webuiConf:any) {
        this.webUiConf.next(webuiConf);
    }

    setMenuConfiguration(menuConf:any) {
        this.menuConf.next(menuConf);
    }

    setMonitoringConfiguration(monitoringConf: MonitoringConfig) {
        this.monitoringConf.next(monitoringConf);
    }
}
