/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
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
import {Locale, UIMenuFile} from '@ofModel/menu.model';
import {ConfigServer} from '../server/config.server';
import {MonitoringConfig} from '@ofModel/monitoringConfig.model';
import {ServerResponseStatus} from '../server/serverResponse';
import {LoggerService} from './logs/logger.service';

export class ConfigService {
    private static configServer: ConfigServer;
    private static config;
    private static monitoringConfig: MonitoringConfig;

    private static menuConfig: UIMenuFile;

    private static configChangeEvent = new Subject<any>();
    private static settingsOverrideEvent = new Subject<any>();

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

    public static getMonitoringConfig(): any {
        return ConfigService.monitoringConfig;
    }
}
