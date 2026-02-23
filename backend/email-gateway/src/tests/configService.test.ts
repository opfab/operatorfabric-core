/* Copyright (c) 2023-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import 'jest';
import {getLogger} from '../common/server-side/logger';
import ConfigService from '../domain/client-side/configService';
import OutgoingEmailsConfigDTO from '../domain/client-side/outgoingEmailsConfigDTO';
import ConfigDTO from '../domain/client-side/configDTO';
import IncomingEmailsConfigDTO from '../domain/client-side/incomingEmailsConfigDTO';

const logger = getLogger();

function getDefaultConfig(): ConfigDTO {
    const defaultConfig = new ConfigDTO();
    const outgoingConfig = new OutgoingEmailsConfigDTO();
    outgoingConfig.checkPeriodInSeconds = 30;
    outgoingConfig.subjectPrefix = 'Mail subject prefix';
    const ingoingConfig = new IncomingEmailsConfigDTO();
    ingoingConfig.secondsBetweenConnectionChecks = 10;
    ingoingConfig.mailboxes = [{mailbox: 'mailbox1', password: 'password1', emailToCardConverter: 'converter1'}];
    defaultConfig.incomingEmails = ingoingConfig;
    defaultConfig.outgoingEmails = outgoingConfig;

    return defaultConfig;
}

describe('config service', function () {
    it('Update config params ', async function () {
        const defaultConfig = getDefaultConfig();
        const configService = new ConfigService(defaultConfig, null, logger);
        expect(configService.getConfig().outgoingEmails.checkPeriodInSeconds).toEqual(30);
        expect(configService.getConfig().outgoingEmails.subjectPrefix).toEqual('Mail subject prefix');
        expect(configService.getConfig().incomingEmails.secondsBetweenConnectionChecks).toEqual(10);
        expect(configService.getConfig().incomingEmails.mailboxes).toEqual([
            {mailbox: 'mailbox1', password: 'password1', emailToCardConverter: 'converter1'}
        ]);

        const confUpdate = {
            outgoingEmails: {checkPeriodInSeconds: 60},
            incomingEmails: {
                secondsBetweenConnectionChecks: 20,
                mailboxes: [{mailbox: 'mailbox2', password: 'password2', emailToCardConverter: 'converter2'}]
            }
        };

        configService.patch(confUpdate);
        expect(configService.getConfig().outgoingEmails.checkPeriodInSeconds).toEqual(60);
        expect(configService.getConfig().outgoingEmails.subjectPrefix).toEqual('Mail subject prefix');
        expect(configService.getConfig().incomingEmails.secondsBetweenConnectionChecks).toEqual(20);
        expect(configService.getConfig().incomingEmails.mailboxes).toEqual([
            {mailbox: 'mailbox2', password: 'password2', emailToCardConverter: 'converter2'}
        ]);

        const updateSubjexctPrefix = {outgoingEmails: {subjectPrefix: 'NEW Mail subject prefix'}};
        configService.patch(updateSubjexctPrefix);
        expect(configService.getConfig().outgoingEmails.checkPeriodInSeconds).toEqual(60);
        expect(configService.getConfig().outgoingEmails.subjectPrefix).toEqual('NEW Mail subject prefix');
    });

    it('Wrong config params are ignored', async function () {
        const defaultConfig = getDefaultConfig();
        const configService = new ConfigService(defaultConfig, null, logger);

        const confUpdate = {outgoingEmails: {checkPeriodInSeconds: 10, wrongParam: 5}};

        configService.patch(confUpdate);
        expect(configService.getConfig().outgoingEmails.checkPeriodInSeconds).toEqual(10);
        expect(configService.getConfig().outgoingEmails.subjectPrefix).toEqual('Mail subject prefix');
    });
});
