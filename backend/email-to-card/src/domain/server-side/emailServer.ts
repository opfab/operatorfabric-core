/* Copyright (c) 2025-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {EmailServerInterface} from './emailServerInterface';
import {Email} from '../application/email';
import imaps from 'imap-simple';
import {simpleParser} from 'mailparser';
import {EmailServerConfig} from './emailServerConfig';

export default class EmailServer implements EmailServerInterface {
    private logger: any;
    emailServerConfig: EmailServerConfig;

    public setEmailServerConfiguration(emailServerConfig: EmailServerConfig): this {
        this.emailServerConfig = emailServerConfig;
        return this;
    }

    public setLogger(logger: any): this {
        this.logger = logger;
        return this;
    }

    public async fetchMailBox(login: string, password: string): Promise<Email[]> {
        this.logger.info('Checking mailbox for ' + login + ' ...');

        const options = {
            imap: {
                user: login,
                password: password,
                host: this.emailServerConfig.host,
                port: this.emailServerConfig.port,
                tls: this.emailServerConfig.tls,
                authTimeout: this.emailServerConfig.authTimeout ?? 5000
            }
        };
        const emails: Email[] = [];
        let connection;

        try {
            connection = await imaps.connect(options);
            await connection.openBox('INBOX');

            const searchCriteria = ['UNSEEN'];
            const fetchOptions = {
                bodies: ['HEADER', 'TEXT'],
                markSeen: true
            };

            const messages = await connection.search(searchCriteria, fetchOptions);

            for (const msg of messages) {
                const headerPart = msg.parts.find((p: any) => p.which === 'HEADER');
                const bodyPart = msg.parts.find((p: any) => p.which === 'TEXT');

                if (!bodyPart) continue;

                const fullEmail = headerPart?.body + '\r\n' + bodyPart.body;
                const parsed = await simpleParser(fullEmail);

                const email = new Email(
                    headerPart?.body.from[0],
                    headerPart?.body.to ?? [],
                    headerPart?.body.subject[0],
                    parsed.text?.trim() || '<empty>'
                );

                emails.push(email);
            }
        } catch (err: any) {
            this.logger.error('Failed to check mailbox: ' + err.message);
            throw err;
        } finally {
            if (connection) {
                try {
                    connection.end();
                } catch (endErr) {
                    this.logger.warn('Error closing connection: ' + endErr);
                }
            }
        }
        return emails;
    }
}
