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
        this.logger.info(`Checking mailbox for ${login} ...`);

        const connection = await this.openImapConnection(login, password);

        try {
            await connection.openBox('INBOX');

            const messages = await connection.search(['UNSEEN'], {bodies: [''], markSeen: true});

            return Promise.all(
                messages
                    .map((msg) => this.extractRawPart(msg))
                    .filter(Boolean)
                    .map((rawPart) => this.parseEmail(rawPart!.body))
            );
        } catch (err: any) {
            this.logger.error('Failed to check mailbox: ' + err.message);
            throw err;
        } finally {
            this.closeConnection(connection);
        }
    }

    private async openImapConnection(login: string, password: string) {
        return imaps.connect({
            imap: {
                user: login,
                password,
                host: this.emailServerConfig.host,
                port: this.emailServerConfig.port,
                tls: this.emailServerConfig.tls,
                authTimeout: this.emailServerConfig.authTimeout ?? 5000
            }
        });
    }

    private extractRawPart(msg: any) {
        return msg.parts.find((p: any) => p.which === '');
    }

    private async parseEmail(rawBody: string): Promise<Email> {
        const parsed = await simpleParser(rawBody);

        return new Email(
            this.formatAddress(parsed.from),
            [this.formatAddress(parsed.to)],
            parsed.subject ?? '<no subject>',
            parsed.text?.trim() || '<empty>',
            this.extractAttachments(parsed.attachments ?? [])
        );
    }

    private extractAttachments(attachments: any[]): {filename: string; content: string}[] {
        return attachments
            .filter((att) => {
                if (att.content.length > MAX_ATTACHMENT_TEXT_SIZE_BYTES) {
                    this.logger.warn(`Attachment ${att.filename} ignored (size=${att.content.length} bytes)`);
                    return false;
                }
                return true;
            })
            .map((att) => ({
                filename: att.filename ?? 'attachment.txt',
                content: att.content.toString('utf-8')
            }));
    }

    private closeConnection(connection: any) {
        try {
            connection?.end();
        } catch (err) {
            this.logger.warn('Error closing connection: ' + err);
        }
    }

    private formatAddress(addr: AddressObject | AddressObject[] | undefined): string {
        if (!addr) return '<unknown>';

        if (Array.isArray(addr)) {
            return addr.flatMap((a) => a.value.map((v) => v.address)).join(', ');
        }

        return addr.value.map((v) => v.address).join(', ');
    }
}
