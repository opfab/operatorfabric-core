/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {filter, map, mergeWith} from 'rxjs/operators';
import * as _ from 'lodash-es';
import {Observable, of, Subject} from 'rxjs';
import {Locale} from '@ofServices/config/model/Locale';
import {UIMenuFile} from '@ofServices/config/model/UIMenuFile';
import {ConfigServer} from './server/ConfigServer';
import {MonitoringConfig} from './model/MonitoringConfig';
import {ServerResponseStatus} from '../../business/server/serverResponse';
import {LoggerService} from 'app/services/logs/LoggerService';
import {ProcessMonitoringConfig} from './model/ProcessMonitoringConfig';

export class ConfigService {
    private static configServer: ConfigServer;
    private static config;
    private static monitoringConfig: MonitoringConfig;
    private static processMonitoringConfig: ProcessMonitoringConfig;

    private static menuConfig: UIMenuFile;

    private static readonly configChangeEvent = new Subject<any>();
    private static readonly settingsOverrideEvent = new Subject<any>();

    public static reset() {
        ConfigService.config = null;
    }

    public static setConfigServer(configServer: ConfigServer) {
        this.configServer = configServer;
    }

    public static loadWebUIConfiguration(): Observable<any> {
        return this.configServer.getWebUiConfiguration().pipe(
            map((serverResponse) => {
                this.config = serverResponse.data;
                return this.config;
            })
        );
    }

    public static overrideConfigSettingsWithUserSettings(settings: any) {
        const newConfig = {...this.config};
        newConfig.settings = {...this.config.settings, ...settings};
        this.config = newConfig;
        this.settingsOverrideEvent.next(null);
    }

    public static getConfigValue(path: string, fallback: any = null): any {
        return _.get(this.config, path, fallback);
    }

    public static setConfigValue(path: string, value: any) {
        _.set(this.config, path, value);
        this.configChangeEvent.next({path: path, value: value});
    }

    public static getConfigValueAsObservable(path: string, fallback: any = null): Observable<any> {
        return of(this.getConfigValue(path, fallback)).pipe(
            mergeWith(
                this.settingsOverrideEvent.asObservable().pipe(map(() => this.getConfigValue(path, fallback))),
                this.configChangeEvent.asObservable().pipe(
                    filter((config) => config.path === path),
                    map((config) => {
                        return config.value;
                    })
                )
            )
        );
    }

    public static loadUiMenuConfig(): Observable<void> {
        return this.configServer.getMenuConfiguration().pipe(
            map((serverResponse) => {
                ConfigService.menuConfig = serverResponse.data;
            })
        );
    }

    public static getMenuConfig(): UIMenuFile {
        return ConfigService.menuConfig;
    }

    public static fetchMenuTranslations(): Observable<Locale[]> {
        return ConfigService.configServer
            .getMenuConfiguration()
            .pipe(map((serverResponse) => serverResponse.data?.locales));
    }

    public static loadMonitoringConfig(): Observable<MonitoringConfig> {
        return ConfigService.configServer.getMonitoringConfiguration().pipe(
            map((serverResponse) => {
                const monitoringConfig = serverResponse.data;
                if (monitoringConfig) {
                    ConfigService.monitoringConfig = monitoringConfig;
                    LoggerService.info('Monitoring config loaded');
                } else LoggerService.info('No monitoring config to load');
                if (serverResponse.status !== ServerResponseStatus.OK)
                    LoggerService.error('An error occurred when loading monitoringConfig');
                return monitoringConfig;
            })
        );
    }

    public static loadProcessMonitoringConfig(): Observable<ProcessMonitoringConfig> {
        return ConfigService.configServer.getProcessMonitoringConfiguration().pipe(
            map((serverResponse) => {
                const processMonitoringConfig = serverResponse.data;
                if (processMonitoringConfig) {
                    ConfigService.processMonitoringConfig = processMonitoringConfig;
                    LoggerService.info('Process Monitoring config loaded');
                } else LoggerService.info('No process monitoring config to load');
                if (serverResponse.status !== ServerResponseStatus.OK)
                    LoggerService.error('An error occurred when loading processMonitoringConfig');
                return processMonitoringConfig;
            })
        );
    }

    public static getMonitoringConfig(): MonitoringConfig {
        return ConfigService.monitoringConfig;
    }

    public static getProcessMonitoringConfig(): ProcessMonitoringConfig {
        return ConfigService.processMonitoringConfig;
    }
}
