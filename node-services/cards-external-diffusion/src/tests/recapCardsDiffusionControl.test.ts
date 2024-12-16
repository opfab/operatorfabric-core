/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import 'jest';
import RecapCardsDiffusionControl from '../domain/application/recapCardsDiffusionControl';
import {getLogger} from '../common/server-side/logger';
import {
    DatabaseServiceStub,
    OpfabBusinessConfigServicesInterfaceStub,
    OpfabServicesInterfaceStub,
    SendMailServiceStub
} from './testHelpers';

const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000;
const MILLISECONDS_IN_A_WEEK = 7 * MILLISECONDS_IN_A_DAY;

const logger = getLogger();

describe('Cards external diffusion', function () {
    let recapCardsDiffusionControl: RecapCardsDiffusionControl;
    let opfabServicesInterfaceStub: OpfabServicesInterfaceStub;
    let opfabBusinessConfigServicesInterfaceStub: OpfabBusinessConfigServicesInterfaceStub;
    let databaseServiceStub: DatabaseServiceStub;
    let mailService: SendMailServiceStub;

    const perimeters = [
        {
            process: 'defaultProcess',
            state: 'processState',
            rights: 'ReceiveAndWrite',
            filteringNotificationAllowed: true
        }
    ];

    // Using this setup function instead of beforeEach hook because it was not working correctly
    // after making CardsExternalDiffusionOpfabServicesInterface extend OpfabServicesInterface
    function setup(): void {
        opfabServicesInterfaceStub = new OpfabServicesInterfaceStub();
        opfabBusinessConfigServicesInterfaceStub = new OpfabBusinessConfigServicesInterfaceStub();
        databaseServiceStub = new DatabaseServiceStub();
        mailService = new SendMailServiceStub({smtpHost: 'localhost', smtpPort: 1025});
        recapCardsDiffusionControl = new RecapCardsDiffusionControl()
            .setLogger(logger)
            .setOpfabServicesInterface(opfabServicesInterfaceStub)
            .setOpfabBusinessConfigServicesInterface(opfabBusinessConfigServicesInterfaceStub)
            .setCardsExternalDiffusionDatabaseService(databaseServiceStub)
            .setMailService(mailService)
            .setFrom('test@opfab.com')
            .setDailyEmailTitle('Daily Email Title')
            .setWeeklyEmailTitle('Weekly Email Title')
            .setDailyEmailBodyPrefix('Daily Email Body Prefix')
            .setWeeklyEmailBodyPrefix('Weekly Email Body Prefix')
            .setBodyPostfix('Email Body Postfix')
            .setOpfabUrlInMailContent('http://localhost');
    }

    function initConfig(): void {
        opfabServicesInterfaceStub.allUsers = [
            {login: 'operator_1', entities: ['ENTITY1']},
            {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}
        ];
    }

    it('Should not send daily email when cards are older than a day before config date', async function () {
        const time = Date.now();
        const publishDateBeforeConfigDate = time - MILLISECONDS_IN_A_DAY - 1000;
        setup();
        initConfig();

        opfabServicesInterfaceStub.usersWithPerimeters = [
            {
                userData: {login: 'operator_1', entities: ['ENTITY1']},
                sendDailyEmail: true,
                email: 'operator_1@opfab.com',
                computedPerimeters: perimeters
            },
            {
                userData: {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']},
                sendDailyEmail: true,
                email: 'operator_2@opfab.com',
                processesStatesNotifiedByEmail: {defaultProcess: ['processState']},
                computedPerimeters: perimeters
            }
        ];

        databaseServiceStub.cards = [
            {
                uid: '0001',
                id: 'defaultProcess.process1',
                publisher: 'publisher1',
                publishDate: publishDateBeforeConfigDate,
                titleTranslated: 'Title1',
                summaryTranslated: 'Summary1',
                process: 'defaultProcess',
                state: 'processState',
                entityRecipients: ['ENTITY1']
            }
        ];

        await recapCardsDiffusionControl.checkCardsStartingFrom('daily');

        expect(mailService.numberOfMailsSent).toEqual(0);
    });

    it('Should not send weekly email when cards are older than a week before config date', async function () {
        const time = Date.now();
        const publishDateBeforeConfigDate = time - MILLISECONDS_IN_A_WEEK - 1000;
        setup();
        initConfig();

        opfabServicesInterfaceStub.usersWithPerimeters = [
            {
                userData: {login: 'operator_1', entities: ['ENTITY1']},
                sendWeeklyEmail: true,
                email: 'operator_1@opfab.com',
                computedPerimeters: perimeters
            },
            {
                userData: {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']},
                sendWeeklyEmail: true,
                email: 'operator_2@opfab.com',
                processesStatesNotifiedByEmail: {defaultProcess: ['processState']},
                computedPerimeters: perimeters
            }
        ];

        databaseServiceStub.cards = [
            {
                uid: '0001',
                id: 'defaultProcess.process1',
                publisher: 'publisher1',
                publishDate: publishDateBeforeConfigDate,
                titleTranslated: 'Title1',
                summaryTranslated: 'Summary1',
                process: 'defaultProcess',
                state: 'processState',
                entityRecipients: ['ENTITY1']
            }
        ];

        await recapCardsDiffusionControl.checkCardsStartingFrom('weekly');

        expect(mailService.numberOfMailsSent).toEqual(0);
    });

    it('Should send email when publishDate is less than 1 day older than config date', async function () {
        const time = Date.now();
        const publishDateBeforeConfigDate = time - MILLISECONDS_IN_A_DAY / 2;
        setup();
        initConfig();

        opfabServicesInterfaceStub.usersWithPerimeters = [
            {
                userData: {login: 'operator_1', entities: ['ENTITY1']},
                sendCardsByEmail: true,
                email: 'operator_1@opfab.com',
                computedPerimeters: perimeters
            },
            {
                userData: {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']},
                sendCardsByEmail: true,
                sendDailyEmail: true,
                email: 'operator_2@opfab.com',
                processesStatesNotifiedByEmail: {defaultProcess: ['processState']},
                computedPerimeters: perimeters
            }
        ];

        databaseServiceStub.cards = [
            {
                uid: '1000',
                id: 'defaultProcess.process1',
                severity: 'INFORMATION',
                publisher: 'publisher1',
                publishDate: publishDateBeforeConfigDate,
                startDate: publishDateBeforeConfigDate,
                titleTranslated: 'Title1',
                summaryTranslated: 'Summary1',
                process: 'defaultProcess',
                state: 'processState',
                entityRecipients: ['ENTITY1']
            },
            {
                uid: '1001',
                id: 'defaultProcess.process2',
                severity: 'ALARM',
                publisher: 'publisher1',
                publishDate: publishDateBeforeConfigDate,
                startDate: publishDateBeforeConfigDate,
                titleTranslated: 'Title1',
                summaryTranslated: 'Summary1',
                process: 'defaultProcess',
                state: 'processState',
                entityRecipients: ['ENTITY1']
            }
        ];

        await recapCardsDiffusionControl.checkCardsStartingFrom('daily');

        expect(mailService.numberOfMailsSent).toEqual(1);
        expect(mailService.sent[0].fromAddress).toEqual('test@opfab.com');
        expect(mailService.sent[0].toAddress).toEqual('operator_2@opfab.com');
        expect(mailService.sent[0].body).toMatch(`Daily Email Body Prefix`);
        expect(mailService.sent[0].body).toMatch(
            `INFORMATION - <a href=" http://localhost/#/feed/cards/defaultProcess.process1 ">Title1 - Summary1</a>`
        );
        expect(mailService.sent[0].body).toMatch(
            `ALARM - <a href=" http://localhost/#/feed/cards/defaultProcess.process2 ">Title1 - Summary1</a>`
        );
        expect(mailService.sent[0].body).toMatch(`Email Body Postfix`);
    });

    it('Should not send daily recap email when setting sendDailyEmail is set to false', async function () {
        const time = Date.now();
        const publishDateBeforeConfigDate = time - MILLISECONDS_IN_A_DAY / 2;
        setup();
        initConfig();

        opfabServicesInterfaceStub.usersWithPerimeters = [
            {
                userData: {login: 'operator_1', entities: ['ENTITY1']},
                sendCardsByEmail: true,
                email: 'operator_1@opfab.com',
                computedPerimeters: perimeters
            },
            {
                userData: {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']},
                sendCardsByEmail: true,
                sendDailyEmail: false,
                email: 'operator_2@opfab.com',
                processesStatesNotifiedByEmail: {defaultProcess: ['processState']},
                computedPerimeters: perimeters
            }
        ];

        databaseServiceStub.cards = [
            {
                uid: '1000',
                id: 'defaultProcess.process1',
                severity: 'INFORMATION',
                publisher: 'publisher1',
                publishDate: publishDateBeforeConfigDate,
                startDate: publishDateBeforeConfigDate,
                titleTranslated: 'Title1',
                summaryTranslated: 'Summary1',
                process: 'defaultProcess',
                state: 'processState',
                entityRecipients: ['ENTITY1']
            }
        ];

        await recapCardsDiffusionControl.checkCardsStartingFrom('daily');

        expect(mailService.numberOfMailsSent).toEqual(0);
    });

    it('Should not send daily recap email when setting sendDailyEmail is not set', async function () {
        const time = Date.now();
        const publishDateBeforeConfigDate = time - MILLISECONDS_IN_A_DAY / 2;
        setup();
        initConfig();

        opfabServicesInterfaceStub.usersWithPerimeters = [
            {
                userData: {login: 'operator_1', entities: ['ENTITY1']},
                sendCardsByEmail: true,
                email: 'operator_1@opfab.com',
                computedPerimeters: perimeters
            },
            {
                userData: {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']},
                sendCardsByEmail: true,
                email: 'operator_2@opfab.com',
                processesStatesNotifiedByEmail: {defaultProcess: ['processState']},
                computedPerimeters: perimeters
            }
        ];

        databaseServiceStub.cards = [
            {
                uid: '1000',
                id: 'defaultProcess.process1',
                severity: 'INFORMATION',
                publisher: 'publisher1',
                publishDate: publishDateBeforeConfigDate,
                startDate: publishDateBeforeConfigDate,
                titleTranslated: 'Title1',
                summaryTranslated: 'Summary1',
                process: 'defaultProcess',
                state: 'processState',
                entityRecipients: ['ENTITY1']
            }
        ];

        await recapCardsDiffusionControl.checkCardsStartingFrom('daily');

        expect(mailService.numberOfMailsSent).toEqual(0);
    });

    it('Should send daily recap email to all enabled users', async function () {
        const time = Date.now();
        const publishDateBeforeConfigDate = time - MILLISECONDS_IN_A_DAY / 2;
        setup();
        initConfig();

        opfabServicesInterfaceStub.usersWithPerimeters = [
            {
                userData: {login: 'operator_1', entities: ['ENTITY1']},
                sendCardsByEmail: true,
                sendDailyEmail: true,
                email: 'operator_1@opfab.com',
                processesStatesNotifiedByEmail: {defaultProcess: ['processState']},
                computedPerimeters: perimeters
            },
            {
                userData: {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']},
                sendCardsByEmail: true,
                sendDailyEmail: true,
                email: 'operator_2@opfab.com',
                processesStatesNotifiedByEmail: {defaultProcess: ['processState']},
                computedPerimeters: perimeters
            }
        ];

        databaseServiceStub.cards = [
            {
                uid: '1000',
                id: 'defaultProcess.process1',
                severity: 'INFORMATION',
                publisher: 'publisher1',
                publishDate: publishDateBeforeConfigDate,
                startDate: publishDateBeforeConfigDate,
                titleTranslated: 'Title1',
                summaryTranslated: 'Summary1',
                process: 'defaultProcess',
                state: 'processState',
                entityRecipients: ['ENTITY1']
            }
        ];

        await recapCardsDiffusionControl.checkCardsStartingFrom('daily');

        expect(mailService.numberOfMailsSent).toEqual(2);
        expect(mailService.sent[0].toAddress).toEqual('operator_1@opfab.com');
        expect(mailService.sent[1].toAddress).toEqual('operator_2@opfab.com');
    });

    it('Should not send weekly recap email when setting sendWeeklyEmail is not set', async function () {
        const time = Date.now();
        const publishDateBeforeConfigDate = time - 3 * MILLISECONDS_IN_A_DAY;
        setup();
        initConfig();

        opfabServicesInterfaceStub.usersWithPerimeters = [
            {
                userData: {login: 'operator_1', entities: ['ENTITY1']},
                sendCardsByEmail: true,
                email: 'operator_1@opfab.com',
                computedPerimeters: perimeters
            },
            {
                userData: {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']},
                sendCardsByEmail: true,
                email: 'operator_2@opfab.com',
                processesStatesNotifiedByEmail: {defaultProcess: ['processState']},
                computedPerimeters: perimeters
            }
        ];

        databaseServiceStub.cards = [
            {
                uid: '1000',
                id: 'defaultProcess.process1',
                severity: 'INFORMATION',
                publisher: 'publisher1',
                publishDate: publishDateBeforeConfigDate,
                startDate: publishDateBeforeConfigDate,
                titleTranslated: 'Title1',
                summaryTranslated: 'Summary1',
                process: 'defaultProcess',
                state: 'processState',
                entityRecipients: ['ENTITY1']
            }
        ];

        await recapCardsDiffusionControl.checkCardsStartingFrom('weekly');

        expect(mailService.numberOfMailsSent).toEqual(0);
    });

    it('Should send weekly recap email to all enabled users', async function () {
        const time = Date.now();
        const publishDateBeforeConfigDate = time - 3 * MILLISECONDS_IN_A_DAY;
        setup();
        initConfig();

        opfabServicesInterfaceStub.usersWithPerimeters = [
            {
                userData: {login: 'operator_1', entities: ['ENTITY1']},
                sendCardsByEmail: true,
                sendWeeklyEmail: true,
                email: 'operator_1@opfab.com',
                processesStatesNotifiedByEmail: {defaultProcess: ['processState']},
                computedPerimeters: perimeters
            },
            {
                userData: {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']},
                sendCardsByEmail: true,
                sendWeeklyEmail: true,
                email: 'operator_2@opfab.com',
                processesStatesNotifiedByEmail: {defaultProcess: ['processState']},
                computedPerimeters: perimeters
            }
        ];

        databaseServiceStub.cards = [
            {
                uid: '1000',
                id: 'defaultProcess.process1',
                severity: 'INFORMATION',
                publisher: 'publisher1',
                publishDate: publishDateBeforeConfigDate,
                startDate: publishDateBeforeConfigDate,
                titleTranslated: 'Title1',
                summaryTranslated: 'Summary1',
                process: 'defaultProcess',
                state: 'processState',
                entityRecipients: ['ENTITY1']
            }
        ];

        await recapCardsDiffusionControl.checkCardsStartingFrom('weekly');

        expect(mailService.numberOfMailsSent).toEqual(2);
        expect(mailService.sent[0].toAddress).toEqual('operator_1@opfab.com');
        expect(mailService.sent[1].toAddress).toEqual('operator_2@opfab.com');
        expect(mailService.sent[0].body).toMatch(`Weekly Email Body Prefix`);
        expect(mailService.sent[0].body).toMatch(`Email Body Postfix`);
    });
});
