/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
import ConfigDTO from '../client-side/configDTO';
import fs from 'node:fs';

export default class Config {
    emailToCardConfig: ConfigDTO;
    configFilePath: string | null;
    logger: any;

    constructor(defaultConfig: any, configFilePath: string | null, logger: any) {
        this.configFilePath = configFilePath;
        this.logger = logger;

        try {
            if (configFilePath != null && fs.existsSync(configFilePath)) {
                this.loadFromFile();
            } else {
                this.emailToCardConfig = new ConfigDTO();
                this.emailToCardConfig.secondsBetweenConnectionChecks = defaultConfig.secondsBetweenConnectionChecks;
                this.emailToCardConfig.mailboxes = defaultConfig.mailboxes;
                this.emailToCardConfig.host = defaultConfig.host;
                this.emailToCardConfig.port = defaultConfig.port;
                this.emailToCardConfig.tls = defaultConfig.tls;
                this.emailToCardConfig.authTimeout = defaultConfig.authTimeout;
                this.save();
            }
        } catch (err) {
            this.logger.error(err);
        }
    }

    private loadFromFile(): void {
        if (this.configFilePath != null) {
            const rawdata = fs.readFileSync(this.configFilePath);
            this.emailToCardConfig = JSON.parse(rawdata.toString());
        }
    }

    private save(): void {
        if (this.configFilePath != null) {
            const data = JSON.stringify(this.emailToCardConfig);
            fs.writeFileSync(this.configFilePath, data);
        }
    }

    getEmailToCardConfig(): ConfigDTO {
        return this.emailToCardConfig;
    }

    public patch(update: object): ConfigDTO {
        try {
            for (const [key, value] of Object.entries(update)) {
                if (
                    Object.prototype.hasOwnProperty.call(this.emailToCardConfig, key) &&
                    value != null &&
                    key !== 'entitiesToSupervise'
                ) {
                    (this.emailToCardConfig as any)[key] = value;
                }
            }
            this.save();
        } catch (error) {
            this.logger.error(error);
        }

        return this.emailToCardConfig;
    }
}
