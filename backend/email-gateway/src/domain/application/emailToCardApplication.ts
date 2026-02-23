/* Copyright (c) 2025-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {EmailServerInterface} from '../server-side/emailServerInterface';
import OpfabServicesInterface from '../../common/server-side/opfabServicesInterface';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {XMLParser} from 'fast-xml-parser';

export default class EmailToCardApplication {
    private readonly emailServer: EmailServerInterface;
    private readonly opfabInterface: OpfabServicesInterface;
    private mailboxes: any[] = [];

    constructor(
        emailServer: EmailServerInterface,
        opfabInterface: OpfabServicesInterface,
        private readonly logger: any
    ) {
        this.emailServer = emailServer;
        this.opfabInterface = opfabInterface;
    }

    public setMailboxes(mailboxes: any): void {
        this.logger.info('Setting mailboxes : ' + JSON.stringify(mailboxes));
        this.mailboxes = mailboxes;
    }

    public checkMailBoxes(): void {
        this.mailboxes?.forEach((mailbox) => {
            this.emailServer
                .fetchMailBox(mailbox.mailbox, mailbox.password)
                .then(async (emails) => {
                    const filePath = 'config/js/' + mailbox.emailToCardConverter + '.js';
                    const code = fs.readFileSync(filePath, 'utf8');
                    const globals = {
                        helpers: {
                            XMLToJSON: (xml: string) => this.XMLToJSON(xml)
                        }
                    };

                    const context = vm.createContext(globals);

                    vm.runInContext(code, context, {
                        filename: path.basename(filePath)
                    });

                    for (const email of emails) {
                        const card = context.convertEmailToCard(email);
                        this.logger.info(`Card returned : ${JSON.stringify(card, null, 2)}`);
                        await this.opfabInterface.sendCard(card);
                        this.logger.info(`Card sent for email ${email.subject}`);
                    }
                })
                .catch((error) => this.logger.error('error during periodic mailbox check. Error : ' + error));
        });
    }

    private XMLToJSON(xml: string): any {
        try {
            const parser = new XMLParser({
                ignoreAttributes: false,
                attributeNamePrefix: '@_',
                trimValues: true
            });

            return parser.parse(xml);
        } catch (error: any) {
            this.logger.error('Failed to parse XML: ' + error.message);
            throw error;
        }
    }
}
