/* Copyright (c) 2023-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import ConfigDTO from './configDTO';
import OutgoingEmailsConfigDTO from './outgoingEmailsConfigDTO';

import fs from 'node:fs';

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
                this.config.outgoingEmails = new OutgoingEmailsConfigDTO();

                this.config.outgoingEmails.mailFrom = defaultConfig?.mailFrom;
                this.config.outgoingEmails.hourToSendRecapEmail = defaultConfig?.hourToSendRecapEmail;
                this.config.outgoingEmails.minuteToSendRecapEmail = defaultConfig?.minuteToSendRecapEmail;
                this.config.outgoingEmails.dayOfWeekToSendWeeklyRecapEmail =
                    defaultConfig?.dayOfWeekToSendWeeklyRecapEmail;
                this.config.outgoingEmails.dailyEmailTitle = defaultConfig?.dailyEmailTitle;
                this.config.outgoingEmails.weeklyEmailTitle = defaultConfig?.weeklyEmailTitle;
                this.config.outgoingEmails.dailyEmailBodyPrefix = defaultConfig?.dailyEmailBodyPrefix;
                this.config.outgoingEmails.weeklyEmailBodyPrefix = defaultConfig?.weeklyEmailBodyPrefix;
                this.config.outgoingEmails.subjectPrefix = defaultConfig?.subjectPrefix;
                this.config.outgoingEmails.bodyPrefix = defaultConfig?.bodyPrefix;
                this.config.outgoingEmails.bodyPostfix = defaultConfig?.bodyPostfix;
                this.config.outgoingEmails.publisherEntityPrefix = defaultConfig?.publisherEntityPrefix;
                this.config.outgoingEmails.opfabUrlInMailContent = defaultConfig?.opfabUrlInMailContent;
                this.config.outgoingEmails.windowInSecondsForCardSearch = defaultConfig?.windowInSecondsForCardSearch;
                this.config.outgoingEmails.checkPeriodInSeconds = defaultConfig?.checkPeriodInSeconds;
                this.config.outgoingEmails.activateCardsDiffusionRateLimiter =
                    defaultConfig?.activateCardsDiffusionRateLimiter;
                this.config.outgoingEmails.sendRateLimit = defaultConfig?.sendRateLimit;
                this.config.outgoingEmails.sendRateLimitPeriodInSec = defaultConfig?.sendRateLimitPeriodInSec;
                this.config.outgoingEmails.customConfig = defaultConfig?.customConfig;
                this.config.outgoingEmails.showCardUrls = defaultConfig?.showCardUrls;
                this.config.outgoingEmails.forceEmailsInPlainText = defaultConfig?.forceEmailsInPlainText;
                this.config.outgoingEmails.showCardTitleInBody = defaultConfig?.showCardTitleInBody;
                this.config.outgoingEmails.defaultTimeZone = defaultConfig?.defaultTimeZone;
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
                if (Object.hasOwn(this.config.outgoingEmails, key) && value != null) {
                    (this.config.outgoingEmails as any)[key] = value;
                }
            }
            this.save();
        } catch (error) {
            this.logger.error(error);
        }

        return this.config;
    }
}
