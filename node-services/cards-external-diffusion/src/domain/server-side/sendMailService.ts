/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import nodemailer, {Transporter} from 'nodemailer';

export default class SendMailService {

    logger: any;
    transporter: Transporter;

    constructor(smtpConfig: any) {
        this.transporter = nodemailer.createTransport(smtpConfig);
        return this;
    }

    public setLogger(logger: any) {
        this.logger = logger;
        return this;
    }

    public async sendMail(subject: string, body: string, from: string, to: string) {

        return await this.transporter.sendMail({
            from: from,
            to: to,
            subject: subject,
            html: body
        });
    }
}