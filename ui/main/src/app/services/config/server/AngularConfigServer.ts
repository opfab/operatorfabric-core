/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from '@env/environment';
import {UIMenuFile} from '@ofServices/config/model/UIMenuFile';
import {MonitoringConfig} from '../model/MonitoringConfig';
import {RealTimeScreens} from '../model/RealTimeScreensConfig';
import {ServerResponse} from 'app/business/server/serverResponse';
import {map, Observable} from 'rxjs';
import {ConfigServer} from './ConfigServer';
import {AngularServer} from 'app/server/angular.server';
import {LoggerService as logger} from 'app/services/logs/LoggerService';
import {ProcessMonitoringConfig} from '../model/ProcessMonitoringConfig';

@Injectable({
    providedIn: 'root'
})
export class AngularConfigServer extends AngularServer implements ConfigServer {
    private readonly configUrl: string;
    private readonly menuUrl: string;
    private readonly monitoringConfigUrl: string;
    private readonly processMonitoringConfigUrl: string;
    private readonly localUrl: string;
    private readonly realTimeScreensUrl: string;

    constructor(private readonly httpClient: HttpClient) {
        super();
        this.configUrl = `${environment.url}config/web-ui.json`;
        this.menuUrl = `${environment.url}config/ui-menu.json`;
        this.monitoringConfigUrl = `${environment.url}businessconfig/monitoring`;
        this.processMonitoringConfigUrl = `${environment.url}businessconfig/processmonitoring`;
        this.localUrl = `${environment.url}assets/i18n`;
        this.realTimeScreensUrl = `${environment.url}businessconfig/realtimescreens`;
    }

    getWebUiConfiguration(): Observable<ServerResponse<any>> {
        return this.processHttpResponse(
            this.httpClient.get(`${this.configUrl}`, {responseType: 'text'}).pipe(
                map((config) => {
                    try {
                        config = JSON.parse(config);
                    } catch (error) {
                        logger.error('Invalid web-ui.json file: ' + JSON.stringify(error));
                    }
                    return config;
                })
            )
        );
    }

    getMenuConfiguration(): Observable<ServerResponse<any>> {
        return this.processHttpResponse(this.httpClient.get<UIMenuFile>(this.menuUrl));
    }

    getMonitoringConfiguration(): Observable<ServerResponse<MonitoringConfig>> {
        return this.processHttpResponse(this.httpClient.get<MonitoringConfig>(this.monitoringConfigUrl));
    }

    getProcessMonitoringConfiguration(): Observable<ServerResponse<ProcessMonitoringConfig>> {
        return this.processHttpResponse(this.httpClient.get<ProcessMonitoringConfig>(this.processMonitoringConfigUrl));
    }
    getLocale(locale: string): Observable<ServerResponse<any>> {
        return this.processHttpResponse(this.httpClient.get(`${this.localUrl}/${locale}.json`));
    }

    getRealTimeScreenConfiguration(): Observable<ServerResponse<RealTimeScreens>> {
        return this.processHttpResponse(this.httpClient.get<RealTimeScreens>(`${this.realTimeScreensUrl}`));
    }
}
