/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import ConfigDTO from './configDTO';

import fs from 'fs';

export default class ConfigService {
    config: ConfigDTO;
    configFilePath: string | null;
    logger: any;

    constructor(defaultConfig: any, configFilePath: string | null, logger: any) {
        this.configFilePath = configFilePath;
        this.logger = logger;

        try {
            if (configFilePath != null && fs.existsSync(configFilePath)) {
                this.loadFromFile();
            } else {
                this.config = new ConfigDTO();

                this.config.mailFrom = defaultConfig.mailFrom;
                this.config.hourToSendRecapEmail = defaultConfig.hourToSendRecapEmail;
                this.config.minuteToSendRecapEmail = defaultConfig.minuteToSendRecapEmail;
                this.config.dayOfWeekToSendWeeklyRecapEmail = defaultConfig.dayOfWeekToSendWeeklyRecapEmail;
                this.config.dailyEmailTitle = defaultConfig.dailyEmailTitle;
                this.config.weeklyEmailTitle = defaultConfig.weeklyEmailTitle;
                this.config.dailyEmailBodyPrefix = defaultConfig.dailyEmailBodyPrefix;
                this.config.weeklyEmailBodyPrefix = defaultConfig.weeklyEmailBodyPrefix;
                this.config.subjectPrefix = defaultConfig.subjectPrefix;
                this.config.bodyPrefix = defaultConfig.bodyPrefix;
                this.config.bodyPostfix = defaultConfig.bodyPostfix;
                this.config.publisherEntityPrefix = defaultConfig.publisherEntityPrefix;
                this.config.opfabUrlInMailContent = defaultConfig.opfabUrlInMailContent;
                this.config.windowInSecondsForCardSearch = defaultConfig.windowInSecondsForCardSearch;
                this.config.checkPeriodInSeconds = defaultConfig.checkPeriodInSeconds;
                this.config.activateCardsDiffusionRateLimiter = defaultConfig.activateCardsDiffusionRateLimiter;
                this.config.sendRateLimit = defaultConfig.sendRateLimit;
                this.config.sendRateLimitPeriodInSec = defaultConfig.sendRateLimitPeriodInSec;
                this.save();
            }
        } catch (err) {
            this.logger.error(err);
        }
    }

    private loadFromFile(): void {
        if (this.configFilePath != null) {
            const rawdata = fs.readFileSync(this.configFilePath);
            this.config = JSON.parse(rawdata.toString());
        }
    }

    private save(): void {
        if (this.configFilePath != null) {
            const data = JSON.stringify(this.config);
            fs.writeFileSync(this.configFilePath, data);
        }
    }

    getConfig(): ConfigDTO {
        return this.config;
    }

    public patch(update: object): ConfigDTO {
        try {
            for (const [key, value] of Object.entries(update)) {
                if (Object.prototype.hasOwnProperty.call(this.config, key) && value != null) {
                    (this.config as any)[key] = value;
                }
            }
            this.save();
        } catch (error) {
            this.logger.error(error);
        }

        return this.config;
    }
}
