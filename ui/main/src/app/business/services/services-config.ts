/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {catchError, Observable, Subject} from 'rxjs';
import {ConfigService} from './config.service';
import {LoggerService as logger} from 'app/business/services/logs/logger.service';
import {RemoteLoggerService} from './logs/remote-logger.service';

export class ServicesConfig {
    private static loadDone = new Subject();

    public static setServers(servers) {
        ConfigService.setConfigServer(servers.configServer);
        RemoteLoggerService.setRemoteLoggerServer(servers.remoteLoggerServer);
    }

    public static load(): Observable<any> {
        ConfigService.loadWebUIConfiguration().subscribe({
            //This configuration needs to be loaded first as it defines the authentication mode
            next: (config) => {
                if (config) {
                    logger.info(`Configuration loaded (web-ui.json)`);
                    this.setTitleInBrowser();
                    this.setLoggerConfiguration();
                    this.loadDone.next(true);
                } else {
                    logger.info('No valid web-ui.json configuration file, stop application loading');
                }
            },
            error: catchError((err, caught) => {
                logger.error('Impossible to load configuration file web-ui.json' + err);
                return caught;
            })
        });
        return this.loadDone.asObservable();
    }

    private static setLoggerConfiguration() {
        ConfigService.getConfigValueAsObservable('settings.remoteLoggingEnabled', false).subscribe(
            (remoteLoggingEnabled) => RemoteLoggerService.setRemoteLoggerActive(remoteLoggingEnabled)
        );
    }

    private static setTitleInBrowser() {
        document.title = ConfigService.getConfigValue('title', 'OperatorFabric');
    }
}
