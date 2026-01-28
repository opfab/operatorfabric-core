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
import imaps, {ImapSimpleOptions} from 'imap-simple';
import {AddressObject, simpleParser} from 'mailparser';
import {EmailServerConfig} from './emailServerConfig';

const MAX_ATTACHMENT_TEXT_SIZE_BYTES = 100_000; // 100 KB

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
        this.logger.info('Checking mailbox...');

        const options: ImapSimpleOptions = {
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
                bodies: [''],
                markSeen: true
            };

            const messages = await connection.search(searchCriteria, fetchOptions);

            for (const msg of messages) {
                const rawPart = msg.parts.find((p: any) => p.which === '');
                if (!rawPart) continue;

                const parsed = await simpleParser(rawPart.body);

                const attachments: {filename: string; content: string}[] = [];
                if (parsed.attachments?.length) {
                    for (const att of parsed.attachments) {
                        if (att.contentType === 'text/plain' && att.content.length <= MAX_ATTACHMENT_TEXT_SIZE_BYTES) {
                            attachments.push({
                                filename: att.filename ?? 'attachment.txt',
                                content: att.content.toString('utf-8')
                            });
                        } else if (att.content.length > MAX_ATTACHMENT_TEXT_SIZE_BYTES) {
                            this.logger.warn(`Attachment ${att.filename} ignored (size=${att.content.length} bytes)`);
                        }
                    }
                }

                const email = new Email(
                    this.formatAddress(parsed.from),
                    [this.formatAddress(parsed.to)],
                    parsed.subject ?? '<no subject>',
                    parsed.text?.trim() || '<empty>',
                    attachments
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

    private formatAddress(addr: AddressObject | AddressObject[] | undefined): string {
        if (!addr) return '<unknown>';

        if (Array.isArray(addr)) {
            return addr.flatMap((a) => a.value.map((v) => v.address)).join(', ');
        }

        return addr.value.map((v) => v.address).join(', ');
    }
}
