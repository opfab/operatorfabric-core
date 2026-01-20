/* Copyright (c) 2025-2026, RTE (http://www.rte-france.com)
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
import OpfabServicesInterface from '../../common/server-side/opfabServicesInterface';

export default class EmailToCardApplication {
    private readonly emailServer: EmailServerInterface;
    private active = false;
    private readonly config: Config;
    private readonly opfabInterface: OpfabServicesInterface;

    constructor(
        defaultConfig: any,
        configFilePath: string | null,
        emailServer: EmailServerInterface,
        opfabInterface: OpfabServicesInterface,
        private readonly logger: any
    ) {
        this.config = new Config(defaultConfig, configFilePath, logger);
        this.emailServer = emailServer;
        this.opfabInterface = opfabInterface;
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
                    .then(async (emails) => {
                        for (const email of emails) {
                            const card = {
                                publisher: 'opfab',
                                process: 'api_test',
                                state: 'messageState',
                                processVersion: '1',
                                processInstanceId: 'emailToCardTest',
                                severity: 'INFORMATION',
                                summary: {key: 'detail.title'},
                                title: {key: 'detail.title'},
                                startDate: 7200000,
                                data: {
                                    content: {
                                        from: email.from,
                                        to: email.to,
                                        subject: email.subject,
                                        body: email.body
                                    }
                                },
                                entityRecipients: ['ENTITY_FR']
                            };

                            await this.opfabInterface.sendCard(card);
                            this.logger.info(`Card sent for email ${email.subject}`);
                        }
                    })
                    .catch((error) => this.logger.error('error during periodic mailbox check' + error));
            });
        }
        setTimeout(() => {
            this.checkMailBoxRegularly();
        }, intervalSeconds * 1000);
    }
}
