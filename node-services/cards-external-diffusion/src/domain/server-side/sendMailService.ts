/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import nodemailer, {Transporter} from 'nodemailer';
const {htmlToText} = require('html-to-text');

export default class SendMailService {
    logger: any;
    transporter: Transporter;

    constructor(smtpConfig: any) {
        this.transporter = nodemailer.createTransport(smtpConfig);
    }

    public setLogger(logger: any) {
        this.logger = logger;
        return this;
    }

    public async sendMail(subject: string, body: string, from: string, to: string, emailToPlainText: boolean) {
        if (emailToPlainText) {
            return await this.transporter.sendMail({
                from: from,
                to: to,
                subject: subject,
                text: htmlToText(body)
            });
        } else {
            return await this.transporter.sendMail({
                from: from,
                to: to,
                subject: subject,
                html: body
            });
        }
    }
}