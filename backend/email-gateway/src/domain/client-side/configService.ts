/* Copyright (c) 2023-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import ConfigDTO from './configDTO';
import IncomingEmailsConfigDTO from './incomingEmailsConfigDTO';
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

                this.config.incomingEmails = new IncomingEmailsConfigDTO();
                this.config.incomingEmails.secondsBetweenConnectionChecks =
                    defaultConfig?.incomingEmails?.secondsBetweenConnectionChecks;
                this.config.incomingEmails.mailboxes = defaultConfig?.incomingEmails?.mailboxes;

                this.config.outgoingEmails = new OutgoingEmailsConfigDTO();

                this.config.outgoingEmails.mailFrom = defaultConfig?.outgoingEmails?.mailFrom;
                this.config.outgoingEmails.hourToSendRecapEmail = defaultConfig?.outgoingEmails?.hourToSendRecapEmail;
                this.config.outgoingEmails.minuteToSendRecapEmail =
                    defaultConfig?.outgoingEmails?.minuteToSendRecapEmail;
                this.config.outgoingEmails.dayOfWeekToSendWeeklyRecapEmail =
                    defaultConfig?.outgoingEmails?.dayOfWeekToSendWeeklyRecapEmail;
                this.config.outgoingEmails.dailyEmailTitle = defaultConfig?.outgoingEmails?.dailyEmailTitle;
                this.config.outgoingEmails.weeklyEmailTitle = defaultConfig?.outgoingEmails?.weeklyEmailTitle;
                this.config.outgoingEmails.dailyEmailBodyPrefix = defaultConfig?.outgoingEmails?.dailyEmailBodyPrefix;
                this.config.outgoingEmails.weeklyEmailBodyPrefix = defaultConfig?.outgoingEmails?.weeklyEmailBodyPrefix;
                this.config.outgoingEmails.subjectPrefix = defaultConfig?.outgoingEmails?.subjectPrefix;
                this.config.outgoingEmails.bodyPrefix = defaultConfig?.outgoingEmails?.bodyPrefix;
                this.config.outgoingEmails.bodyPostfix = defaultConfig?.outgoingEmails?.bodyPostfix;
                this.config.outgoingEmails.publisherEntityPrefix = defaultConfig?.outgoingEmails?.publisherEntityPrefix;
                this.config.outgoingEmails.opfabUrlInMailContent = defaultConfig?.outgoingEmails?.opfabUrlInMailContent;
                this.config.outgoingEmails.windowInSecondsForCardSearch =
                    defaultConfig?.outgoingEmails?.windowInSecondsForCardSearch;
                this.config.outgoingEmails.checkPeriodInSeconds = defaultConfig?.outgoingEmails?.checkPeriodInSeconds;
                this.config.outgoingEmails.activateCardsDiffusionRateLimiter =
                    defaultConfig?.outgoingEmails?.activateCardsDiffusionRateLimiter;
                this.config.outgoingEmails.sendRateLimit = defaultConfig?.outgoingEmails?.sendRateLimit;
                this.config.outgoingEmails.sendRateLimitPeriodInSec =
                    defaultConfig?.outgoingEmails?.sendRateLimitPeriodInSec;
                this.config.outgoingEmails.customConfig = defaultConfig?.outgoingEmails?.customConfig;
                this.config.outgoingEmails.showCardUrls = defaultConfig?.outgoingEmails?.showCardUrls;
                this.config.outgoingEmails.forceEmailsInPlainText =
                    defaultConfig?.outgoingEmails?.forceEmailsInPlainText;
                this.config.outgoingEmails.showCardTitleInBody = defaultConfig?.outgoingEmails?.showCardTitleInBody;
                this.config.outgoingEmails.defaultTimeZone = defaultConfig?.outgoingEmails?.defaultTimeZone;
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

    public patch(update: any): ConfigDTO {
        try {
            const udapteOutgoingEmails = update['outgoingEmails'];
            if (udapteOutgoingEmails) {
                for (const [key, value] of Object.entries(udapteOutgoingEmails)) {
                    if (Object.hasOwn(this.config.outgoingEmails, key) && value != null) {
                        (this.config.outgoingEmails as any)[key] = value;
                    }
                }
            }
            const updateIncomingEmails = update['incomingEmails'];
            if (updateIncomingEmails) {
                for (const [key, value] of Object.entries(updateIncomingEmails)) {
                    if (Object.hasOwn(this.config.incomingEmails, key) && value != null) {
                        (this.config.incomingEmails as any)[key] = value;
                    }
                }
            }
            this.save();
        } catch (error) {
            this.logger.error(error);
        }

        return this.config;
    }
}
