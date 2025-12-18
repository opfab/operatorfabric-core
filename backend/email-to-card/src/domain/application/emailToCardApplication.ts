/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import Config from './config';
import ConfigDTO from './../client-side/configDTO';
import {EmailServerInterface} from '../server-side/emailServerInterface';

export default class EmailToCardApplication {
    private readonly emailServer: EmailServerInterface;
    private active = false;
    private readonly config: Config;

    constructor(
        defaultConfig: any,
        configFilePath: string | null,
        emailServer: EmailServerInterface,
        private readonly logger: any
    ) {
        this.config = new Config(defaultConfig, configFilePath, logger);
        this.emailServer = emailServer;
    }

    public patch(update: object): ConfigDTO {
        const newConfig = this.config.patch(update);
        return newConfig;
    }

    public getEmailToCardConfig(): ConfigDTO {
        return this.config.getEmailToCardConfig();
    }

    public start(): void {
        this.checkMailBoxRegularly();
        this.active = true;
    }

    public stop(): void {
        this.active = false;
    }

    public isActive(): boolean {
        return this.active;
    }

    private checkMailBoxRegularly(): void {
        const intervalSeconds = this.config.getEmailToCardConfig().secondsBetweenConnectionChecks;

        if (intervalSeconds <= 0) {
            this.logger.error('Invalid secondsBetweenConnectionChecks: ' + intervalSeconds + '. Must be positive.');
            return;
        }

        if (this.active) {
            this.logger.info('checkMailBoxRegularly');

            this.config.getEmailToCardConfig().mailboxes.forEach((mailbox) => {
                this.emailServer
                    .fetchMailBox(mailbox.mailbox, mailbox.password)
                    .then((emails) =>
                        this.logger.info('emails for ' + mailbox.mailbox + ' = ' + JSON.stringify(emails, null, 2))
                    )
                    .catch((error) => this.logger.error('error during periodic mailbox check' + error));
            });
        }
        setTimeout(() => {
            this.checkMailBoxRegularly();
        }, intervalSeconds * 1000);
    }
}
