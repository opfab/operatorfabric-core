/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import 'jest';
import RealTimeCardsDiffusionControl from '../domain/application/realTimeCardsDiffusionControl';
import {getLogger} from '../common/server-side/logger';
import CardsDiffusionRateLimiter from '../domain/application/cardsDiffusionRateLimiter';

import {
    OpfabServicesInterfaceStub,
    OpfabBusinessConfigServicesInterfaceStub,
    DatabaseServiceStub,
    SendMailServiceStub,
    getFormattedDateAndTimeFromEpochDate
} from './testHelpers';

const logger = getLogger();

describe('Cards external diffusion', function () {
    let realTimeCardsDiffusionControl: RealTimeCardsDiffusionControl;
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
        realTimeCardsDiffusionControl = new RealTimeCardsDiffusionControl()
            .setLogger(logger)
            .setOpfabServicesInterface(opfabServicesInterfaceStub)
            .setOpfabBusinessConfigServicesInterface(opfabBusinessConfigServicesInterfaceStub)
            .setCardsExternalDiffusionDatabaseService(databaseServiceStub)
            .setMailService(mailService)
            .setFrom('test@opfab.com')
            .setSubjectPrefix('Subject')
            .setBodyPrefix('Prefix')
            .setBodyPostfix('Postfix')
            .setPublisherEntityPrefix('Sent by ')
            .setOpfabUrlInMailContent('http://localhost')
            .setWindowInSecondsForCardSearch(120)
            .setDefaultTimeZone('Europe/Paris')
            .setCustomConfig({customParam1: 'Param1'});
    }

    it('Should send card when publishDate is after configured period', async function () {
        const publishDate = Date.now();
        setup();
        opfabServicesInterfaceStub.allUsers = [{login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}];

        opfabServicesInterfaceStub.usersWithPerimeters = [
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
                publisher: 'publisher1',
                publishDate,
                startDate: publishDate,
                titleTranslated: 'Title1',
                summaryTranslated: 'Summary1',
                process: 'defaultProcess',
                state: 'processState',
                entityRecipients: ['ENTITY1']
            }
        ];

        await realTimeCardsDiffusionControl.checkCardsNeedToBeSent();
        await new Promise((resolve) => setTimeout(resolve, 1));
        const startDateString = getFormattedDateAndTimeFromEpochDate(publishDate);

        expect(mailService.numberOfMailsSent).toEqual(1);
        expect(mailService.sent[0].fromAddress).toEqual('test@opfab.com');
        expect(mailService.sent[0].toAddress).toEqual('operator_2@opfab.com');
        expect(mailService.sent[0].body).toEqual(
            'Prefix <a href=" http://localhost/#/feed/cards/defaultProcess.process1 ">Title1 - Summary1 - ' +
                startDateString +
                ' - </a> <br/>Postfix'
        );
    });

    it('Body of email should fit card content when valid email is sent', async function () {
        const publishDate = Date.now();
        setup();
        opfabServicesInterfaceStub.allUsers = [{login: 'operator_1', entities: ['ENTITY1']}];

        opfabServicesInterfaceStub.usersWithPerimeters = [
            {
                userData: {login: 'operator_1', entities: ['ENTITY1']},
                sendCardsByEmail: true,
                email: 'operator_1@opfab.com',
                processesStatesNotifiedByEmail: {defaultProcess: ['processState']},
                computedPerimeters: perimeters
            }
        ];

        opfabBusinessConfigServicesInterfaceStub.config = {
            id: 'defaultProcess',
            name: 'Process example',
            version: '1',
            states: {
                processState: {
                    emailBodyTemplate: 'testTemplateMail'
                }
            }
        };

        opfabServicesInterfaceStub.card = {
            uid: '1001',
            id: 'defaultProcess.process1',
            publisher: 'publisher1',
            publishDate,
            startDate: publishDate,
            titleTranslated: 'Title1',
            summaryTranslated: 'Summary1',
            process: 'defaultProcess',
            state: 'processState',
            entityRecipients: ['ENTITY1']
        };

        databaseServiceStub.cards = [opfabServicesInterfaceStub.card];
        const startDateString = getFormattedDateAndTimeFromEpochDate(publishDate);

        opfabBusinessConfigServicesInterfaceStub.template = '{{card.titleTranslated}} {{config.customParam1}}';

        await realTimeCardsDiffusionControl.checkCardsNeedToBeSent();
        await new Promise((resolve) => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(1);
        expect(mailService.sent[0].fromAddress).toEqual('test@opfab.com');
        expect(mailService.sent[0].toAddress).toEqual('operator_1@opfab.com');
        expect(mailService.sent[0].body).toEqual(
            'Prefix <a href=" http://localhost/#/feed/cards/defaultProcess.process1 ">Title1 - Summary1 - ' +
                startDateString +
                ' - ' +
                '</a> <br> Title1 Param1 <br/>Postfix'
        );
    });

    it('Body of email should contain publisherEntityPrefix when publisher is an entity', async function () {
        const publishDate = Date.now();
        setup();
        opfabServicesInterfaceStub.allUsers = [{login: 'operator_1', entities: ['ENTITY1']}];

        opfabServicesInterfaceStub.usersWithPerimeters = [
            {
                userData: {login: 'operator_1', entities: ['ENTITY1']},
                sendCardsByEmail: true,
                email: 'operator_1@opfab.com',
                processesStatesNotifiedByEmail: {defaultProcess: ['processState']},
                computedPerimeters: perimeters
            }
        ];

        opfabBusinessConfigServicesInterfaceStub.config = {
            id: 'defaultProcess',
            name: 'Process example',
            version: '1',
            states: {
                processState: {
                    emailBodyTemplate: 'testTemplateMail'
                }
            }
        };

        opfabServicesInterfaceStub.card = {
            uid: '8101',
            id: 'defaultProcess.process1',
            publisher: 'ENTITY2',
            publisherType: 'ENTITY',
            publishDate,
            startDate: publishDate,
            titleTranslated: 'Title1 & <br>',
            summaryTranslated: '" Summary1 <br>',
            process: 'defaultProcess',
            state: 'processState',
            entityRecipients: ['ENTITY1']
        };

        databaseServiceStub.cards = [opfabServicesInterfaceStub.card];

        opfabBusinessConfigServicesInterfaceStub.template = '{{card.titleTranslated}}';

        const startDateString = getFormattedDateAndTimeFromEpochDate(publishDate);

        await realTimeCardsDiffusionControl.checkCardsNeedToBeSent();
        await new Promise((resolve) => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(1);
        expect(mailService.sent[0].body).toEqual(
            'Prefix <a href=" http://localhost/#/feed/cards/defaultProcess.process1 ">Title1 &amp; &lt;br&gt; - &quot; Summary1 &lt;br&gt; - ' +
                startDateString +
                ' - ' +
                '</a> <br> Title1 &amp; &lt;br&gt; <br/>Sent by ENTITY2 name. <br/>Postfix'
        );
    });

    it('Body of email should escape HTML in title and summary', async function () {
        const publishDate = Date.now();
        setup();
        opfabServicesInterfaceStub.allUsers = [{login: 'operator_1', entities: ['ENTITY1']}];

        opfabServicesInterfaceStub.usersWithPerimeters = [
            {
                userData: {login: 'operator_1', entities: ['ENTITY1']},
                sendCardsByEmail: true,
                email: 'operator_1@opfab.com',
                processesStatesNotifiedByEmail: {defaultProcess: ['processState']},
                computedPerimeters: perimeters
            }
        ];

        opfabBusinessConfigServicesInterfaceStub.config = {
            id: 'defaultProcess',
            name: 'Process example',
            version: '1',
            states: {
                processState: {
                    emailBodyTemplate: 'testTemplateMail'
                }
            }
        };

        opfabServicesInterfaceStub.card = {
            uid: '1001',
            id: 'defaultProcess.process1',
            publisher: 'publisher1',
            publishDate,
            startDate: publishDate,
            titleTranslated: 'Title1 & <br>',
            summaryTranslated: '" Summary1 <br>',
            process: 'defaultProcess',
            state: 'processState',
            entityRecipients: ['ENTITY1']
        };

        databaseServiceStub.cards = [opfabServicesInterfaceStub.card];

        opfabBusinessConfigServicesInterfaceStub.template = '{{card.titleTranslated}}';

        await realTimeCardsDiffusionControl.checkCardsNeedToBeSent();
        await new Promise((resolve) => setTimeout(resolve, 1));
        const startDateString = getFormattedDateAndTimeFromEpochDate(publishDate);

        expect(mailService.numberOfMailsSent).toEqual(1);
        expect(mailService.sent[0].body).toEqual(
            'Prefix <a href=" http://localhost/#/feed/cards/defaultProcess.process1 ">Title1 &amp; &lt;br&gt; - &quot; ' +
                'Summary1 &lt;br&gt; - ' +
                startDateString +
                ' - </a> <br> Title1 &amp; &lt;br&gt; <br/>Postfix'
        );
    });

    it('Should not send same card twice', async function () {
        const publishDate = Date.now();
        setup();
        opfabServicesInterfaceStub.allUsers = [{login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}];

        opfabServicesInterfaceStub.usersWithPerimeters = [
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
                uid: '1002',
                id: 'defaultProcess.process1',
                publisher: 'publisher1',
                publishDate,
                startDate: publishDate,
                titleTranslated: 'Title1',
                summaryTranslated: 'Summary1',
                process: 'defaultProcess',
                state: 'processState',
                entityRecipients: ['ENTITY1']
            }
        ];

        await realTimeCardsDiffusionControl.checkCardsNeedToBeSent();
        await new Promise((resolve) => setTimeout(resolve, 1));
        expect(mailService.numberOfMailsSent).toEqual(1);

        await realTimeCardsDiffusionControl.checkCardsNeedToBeSent();
        await new Promise((resolve) => setTimeout(resolve, 1));
    });

    it('Should not send card when setting sendCardsByEmail is set to false', async function () {
        const publishDate = Date.now();
        setup();
        opfabServicesInterfaceStub.allUsers = [{login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}];

        opfabServicesInterfaceStub.usersWithPerimeters = [
            {
                userData: {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']},
                sendCardsByEmail: false,
                email: 'operator_2@opfab.com',
                processesStatesNotifiedByEmail: {defaultProcess: ['processState']},
                computedPerimeters: perimeters
            }
        ];

        databaseServiceStub.cards = [
            {
                uid: '1003',
                id: 'defaultProcess.process1',
                publisher: 'publisher1',
                publishDate,
                startDate: publishDate,
                titleTranslated: 'Title1',
                summaryTranslated: 'Summary1',
                process: 'defaultProcess',
                state: 'processState',
                entityRecipients: ['ENTITY1']
            }
        ];

        await realTimeCardsDiffusionControl.checkCardsNeedToBeSent();
        await new Promise((resolve) => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(0);
    });

    it('Should not send card when setting sendCardsByEmail is not set', async function () {
        const publishDate = Date.now();
        setup();
        opfabServicesInterfaceStub.allUsers = [{login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}];

        opfabServicesInterfaceStub.usersWithPerimeters = [
            {
                userData: {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']},
                email: 'operator_2@opfab.com',
                processesStatesNotifiedByEmail: {defaultProcess: ['processState']},
                computedPerimeters: perimeters
            }
        ];

        databaseServiceStub.cards = [
            {
                uid: '1004',
                id: 'defaultProcess.process1',
                publisher: 'publisher1',
                publishDate,
                startDate: publishDate,
                titleTranslated: 'Title1',
                summaryTranslated: 'Summary1',
                process: 'defaultProcess',
                state: 'processState',
                entityRecipients: ['ENTITY1']
            }
        ];

        await realTimeCardsDiffusionControl.checkCardsNeedToBeSent();
        await new Promise((resolve) => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(0);
    });

    it('Should not send email when email address is not set', async function () {
        const publishDate = Date.now();
        setup();
        opfabServicesInterfaceStub.allUsers = [{login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}];

        opfabServicesInterfaceStub.usersWithPerimeters = [
            {
                userData: {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']},
                sendCardsByEmail: true,
                processesStatesNotifiedByEmail: {defaultProcess: ['processState']},
                computedPerimeters: perimeters
            }
        ];

        databaseServiceStub.cards = [
            {
                uid: '1005',
                id: 'defaultProcess.process1',
                publisher: 'publisher1',
                publishDate,
                startDate: publishDate,
                titleTranslated: 'Title1',
                summaryTranslated: 'Summary1',
                process: 'defaultProcess',
                state: 'processState',
                entityRecipients: ['ENTITY1']
            }
        ];

        await realTimeCardsDiffusionControl.checkCardsNeedToBeSent();
        await new Promise((resolve) => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(0);
    });

    it('Should not send card when email is empty', async function () {
        const publishDate = Date.now();
        setup();
        opfabServicesInterfaceStub.allUsers = [{login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}];

        opfabServicesInterfaceStub.usersWithPerimeters = [
            {
                userData: {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']},
                sendCardsByEmail: true,
                email: '',
                processesStatesNotifiedByEmail: {defaultProcess: ['processState']},
                computedPerimeters: perimeters
            }
        ];

        databaseServiceStub.cards = [
            {
                uid: '1006',
                id: 'defaultProcess.process1',
                publisher: 'publisher1',
                publishDate,
                startDate: publishDate,
                titleTranslated: 'Title1',
                summaryTranslated: 'Summary1',
                process: 'defaultProcess',
                state: 'processState',
                entityRecipients: ['ENTITY1']
            }
        ];

        await realTimeCardsDiffusionControl.checkCardsNeedToBeSent();
        await new Promise((resolve) => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(0);
    });

    it('Should send card to all enabled users', async function () {
        const publishDate = Date.now();
        setup();
        opfabServicesInterfaceStub.allUsers = [
            {login: 'operator_1', entities: ['ENTITY1']},
            {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}
        ];

        opfabServicesInterfaceStub.usersWithPerimeters = [
            {
                userData: {login: 'operator_1', entities: ['ENTITY1']},
                sendCardsByEmail: true,
                email: 'operator_1@opfab.com',
                processesStatesNotifiedByEmail: {defaultProcess: ['processState']},
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
                uid: '1007',
                id: 'defaultProcess.process1',
                publisher: 'publisher1',
                publishDate,
                startDate: publishDate,
                titleTranslated: 'Title1',
                summaryTranslated: 'Summary1',
                process: 'defaultProcess',
                state: 'processState',
                entityRecipients: ['ENTITY1']
            }
        ];

        await realTimeCardsDiffusionControl.checkCardsNeedToBeSent();
        await new Promise((resolve) => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(2);
        expect(mailService.sent[0].toAddress).toEqual('operator_1@opfab.com');
        expect(mailService.sent[1].toAddress).toEqual('operator_2@opfab.com');
    });

    it('Should not send card when cardsDiffusionRateLimiter is active and rate limit is reached', async function () {
        const publishDate = Date.now();
        setup();

        opfabServicesInterfaceStub.allUsers = [
            {login: 'operator_1', entities: ['ENTITY1']},
            {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}
        ];

        opfabServicesInterfaceStub.usersWithPerimeters = [
            {
                userData: {login: 'operator_1', entities: ['ENTITY1']},
                sendCardsByEmail: true,
                email: 'operator_1@opfab.com',
                processesStatesNotifiedByEmail: {defaultProcess: ['processState']},
                computedPerimeters: perimeters
            }
        ];
        databaseServiceStub.cards = [
            {
                uid: '2006',
                id: 'defaultProcess.process1',
                publisher: 'publisher1',
                publishDate,
                startDate: publishDate,
                titleTranslated: 'Title1',
                summaryTranslated: 'Summary1',
                process: 'defaultProcess',
                state: 'processState',
                entityRecipients: ['ENTITY1']
            }
        ];

        const cardsDiffusionRateLimiter = new CardsDiffusionRateLimiter().setLimitPeriodInSec(30).setSendRateLimit(1);

        realTimeCardsDiffusionControl.setCardsDiffusionRateLimiter(cardsDiffusionRateLimiter);
        realTimeCardsDiffusionControl.setActivateCardsDiffusionRateLimiter(true);

        expect(cardsDiffusionRateLimiter.isNewSendingAllowed('operator_1@opfab.com')).toBeTruthy();
        cardsDiffusionRateLimiter.registerNewSending('operator_1@opfab.com');
        expect(cardsDiffusionRateLimiter.isNewSendingAllowed('operator_1@opfab.com')).toBeFalsy();

        let registeredMailSent = await databaseServiceStub.getSentMail('2006', 'operator_1@opfab.com');
        expect(registeredMailSent).toBeUndefined();

        await realTimeCardsDiffusionControl.checkCardsNeedToBeSent();
        await new Promise((resolve) => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(0);
        registeredMailSent = await databaseServiceStub.getSentMail('2006', 'operator_1@opfab.com');
        expect(registeredMailSent.cardUid).toEqual('2006');
        expect(registeredMailSent.email).toEqual('operator_1@opfab.com');
    });

    it('Should send cards if cardsDiffusionRateLimiter is not active', async function () {
        const publishDate = Date.now();
        setup();

        opfabServicesInterfaceStub.allUsers = [
            {login: 'operator_1', entities: ['ENTITY1']},
            {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}
        ];

        opfabServicesInterfaceStub.usersWithPerimeters = [
            {
                userData: {login: 'operator_1', entities: ['ENTITY1']},
                sendCardsByEmail: true,
                email: 'operator_1@opfab.com',
                processesStatesNotifiedByEmail: {defaultProcess: ['processState']},
                computedPerimeters: perimeters
            }
        ];
        databaseServiceStub.cards = [
            {
                uid: '2007',
                id: 'defaultProcess.process1',
                publisher: 'publisher1',
                publishDate,
                startDate: publishDate,
                titleTranslated: 'Title1',
                summaryTranslated: 'Summary1',
                process: 'defaultProcess',
                state: 'processState',
                entityRecipients: ['ENTITY1']
            }
        ];

        const cardsDiffusionRateLimiter = new CardsDiffusionRateLimiter().setLimitPeriodInSec(30).setSendRateLimit(1);
        realTimeCardsDiffusionControl.setCardsDiffusionRateLimiter(cardsDiffusionRateLimiter);
        realTimeCardsDiffusionControl.setActivateCardsDiffusionRateLimiter(false);

        expect(cardsDiffusionRateLimiter.isNewSendingAllowed('operator_1@opfab.com')).toBeTruthy();
        cardsDiffusionRateLimiter.registerNewSending('operator_1@opfab.com');
        expect(cardsDiffusionRateLimiter.isNewSendingAllowed('operator_1@opfab.com')).toBeFalsy();

        await realTimeCardsDiffusionControl.checkCardsNeedToBeSent();
        await new Promise((resolve) => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(1);
    });
});
