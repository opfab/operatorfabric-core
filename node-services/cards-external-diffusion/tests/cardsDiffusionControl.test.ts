/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import 'jest';
import CardsDiffusionControl from '../src/domain/application/cardsDiffusionControl';
import SendMailService from '../src/domain/server-side/sendMailService';
import GetResponse from '../src/common/server-side/getResponse';
import Logger from '../src/common/server-side/logger';
import Handlebars from 'handlebars';
import CardsExternalDiffusionOpfabServicesInterface from '../src/domain/server-side/cardsExternalDiffusionOpfabServicesInterface';
import CardsDiffusionRateLimiter from '../src/domain/application/cardsDiffusionRateLimiter';
import CardsExternalDiffusionDatabaseService from '../src/domain/server-side/cardsExternaDiffusionDatabaseService';
import BusinessConfigOpfabServicesInterface from '../src/domain/server-side/BusinessConfigOpfabServicesInterface';

class OpfabServicesInterfaceStub extends CardsExternalDiffusionOpfabServicesInterface {

    public isResponseValid = true;

    cards: Array<any> = new Array();
    card: any;
    allUsers: Array<any> = new Array();
    connectedUsers: Array<any> = new Array();

    usersWithPerimeters: Array<any> = new Array();

    async getCards() {
        return new GetResponse(this.cards, this.isResponseValid);
    }

    async getCard() {
        return new GetResponse(this.card, this.isResponseValid);
    }

    public getUsers() {
        return this.allUsers;
    }

    public async getUsersConnected(): Promise<GetResponse> {
        return new GetResponse(this.connectedUsers, this.isResponseValid);
    }

    public async getUserWithPerimetersByLogin(login: string): Promise<GetResponse> {
        const foundIndex = this.usersWithPerimeters.findIndex((u) => u.userData.login === login);
        return new GetResponse(foundIndex >= 0 ? this.usersWithPerimeters[foundIndex] : null, true);
    }
}

class OpfabBusinessConfigServicesInterfaceStub extends BusinessConfigOpfabServicesInterface {
    public isResponseValid = true;
    config: any;
    template: string;

    async fetchProcessConfig() {
        return this.config;
    }

    async fetchTemplate() {
        return Handlebars.compile(this.template);
    }
}

class SendMailServiceStub extends SendMailService {
    numberOfMailsSent = 0;
    sent: Array<any> = [];

    public async sendMail(subject: string, body: string, from: string, to: string) {
        if (to.indexOf('@') > 0) {
            this.numberOfMailsSent++;

            this.sent.push({
                fromAddress: from,
                toAddress: to,
                subject: subject,
                body: body
            });

            return Promise.resolve({messageId: 'msg1234'});
        } else return Promise.reject(new Error());
    }
}

class DatabaseServiceStub extends CardsExternalDiffusionDatabaseService {
    sent: Array<any> = [];

    public async getSentMail(cardUid: string, email: string) {
        const found = this.sent.find((sentmail) => sentmail.cardUid == cardUid && sentmail.email == email);
        return Promise.resolve(found);
    }

    public async persistSentMail(cardUid: string, email: string): Promise<void> {
        this.sent.push({cardUid: cardUid, email: email, date: Date.now()});
        return Promise.resolve();
    }

    public async deleteMailsSentBefore(dateLimit: number) {
        return Promise.resolve();
    }
}


const logger = Logger.getLogger();

describe('Cards external diffusion', function () {
    let cardsDiffusionControl: CardsDiffusionControl;
    let opfabServicesInterfaceStub: OpfabServicesInterfaceStub;
    let opfabBusinessConfigServicesInterfaceStub: OpfabBusinessConfigServicesInterfaceStub;
    let mailService: SendMailServiceStub;
    let databaseService: DatabaseServiceStub;

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
    function setup() {
        opfabServicesInterfaceStub = new OpfabServicesInterfaceStub();
        opfabBusinessConfigServicesInterfaceStub = new OpfabBusinessConfigServicesInterfaceStub();

        mailService = new SendMailServiceStub({smtpHost: 'localhost', smtpPort: 1025});
        databaseService = new DatabaseServiceStub();
        cardsDiffusionControl = new CardsDiffusionControl()
            .setLogger(logger)
            .setOpfabServicesInterface(opfabServicesInterfaceStub)
            .setOpfabBusinessConfigServicesInterface(opfabBusinessConfigServicesInterfaceStub)
            .setCardsExternalDiffusionDatabaseService(databaseService)
            .setMailService(mailService)
            .setFrom('test@opfab.com')
            .setSubjectPrefix('Subject')
            .setBodyPrefix('Body')
            .setOpfabUrlInMailContent('http://localhost')
            .setSecondsAfterPublicationToConsiderCardAsNotRead(60)
            .setWindowInSecondsForCardSearch(120);
    }

    it('Should not send card when publishDate is before configured period', async function () {
        const publishDateBeforeAlertingPeriod = Date.now() - 55 * 1000;
        setup();
        opfabServicesInterfaceStub.allUsers = [
            {login: 'operator_1', entities: ['ENTITY1']},
            {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}
        ];
        opfabServicesInterfaceStub.connectedUsers = ['operator_1'];

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

        opfabServicesInterfaceStub.cards = [
            {
                uid: '0001',
                id: 'defaultProcess.process1',
                publisher: 'publisher1',
                publishDate: publishDateBeforeAlertingPeriod,
                titleTranslated: 'Title1',
                summaryTranslated: 'Summary1',
                process: 'defaultProcess',
                state: 'processState',
                entityRecipients: ['ENTITY1']
            }
        ];

        await cardsDiffusionControl.checkUnreadCards();
        await new Promise((resolve) => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(0);
    });

    it('Should send card when publishDate is after configured period', async function () {
        const publishDateAfterAlertingPeriod = Date.now() - 65 * 1000;
        setup();
        opfabServicesInterfaceStub.allUsers = [
            {login: 'operator_1', entities: ['ENTITY1']},
            {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}
        ];
        opfabServicesInterfaceStub.connectedUsers = ['operator_1'];

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

        opfabServicesInterfaceStub.cards = [
            {
                uid: '1000',
                id: 'defaultProcess.process1',
                publisher: 'publisher1',
                publishDate: publishDateAfterAlertingPeriod,
                startDate: publishDateAfterAlertingPeriod,
                titleTranslated: 'Title1',
                summaryTranslated: 'Summary1',
                process: 'defaultProcess',
                state: 'processState',
                entityRecipients: ['ENTITY1']
            }
        ];

        await cardsDiffusionControl.checkUnreadCards();
        await new Promise((resolve) => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(1);
        expect(mailService.sent[0].fromAddress).toEqual('test@opfab.com');
        expect(mailService.sent[0].toAddress).toEqual('operator_2@opfab.com');
        expect(mailService.sent[0].body).toEqual(
            'Body <a href=" http://localhost/#/feed/cards/defaultProcess.process1 ">Title1 - Summary1</a>'
        );
    });

    it('Body of email should fit card content when valid email is sent', async function () {
        const publishDateAfterAlertingPeriod = Date.now() - 65 * 1000;
        setup();
        opfabServicesInterfaceStub.allUsers = [{login: 'operator_1', entities: ['ENTITY1']}];
        opfabServicesInterfaceStub.connectedUsers = [];

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
            publishDate: publishDateAfterAlertingPeriod,
            startDate: publishDateAfterAlertingPeriod,
            titleTranslated: 'Title1',
            summaryTranslated: 'Summary1',
            process: 'defaultProcess',
            state: 'processState',
            entityRecipients: ['ENTITY1']
        };

        opfabServicesInterfaceStub.cards = [opfabServicesInterfaceStub.card];

        opfabBusinessConfigServicesInterfaceStub.template = '{{titleTranslated}}';

        await cardsDiffusionControl.checkUnreadCards();
        await new Promise((resolve) => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(1);
        expect(mailService.sent[0].fromAddress).toEqual('test@opfab.com');
        expect(mailService.sent[0].toAddress).toEqual('operator_1@opfab.com');
        expect(mailService.sent[0].body).toEqual(
            'Body <a href=" http://localhost/#/feed/cards/defaultProcess.process1 ">Title1 - Summary1</a> <br> Title1'
        );
    });

    it('Body of email should escape HTML in title and summary', async function () {
        const publishDateAfterAlertingPeriod = Date.now() - 65 * 1000;
        setup();
        opfabServicesInterfaceStub.allUsers = [{login: 'operator_1', entities: ['ENTITY1']}];
        opfabServicesInterfaceStub.connectedUsers = [];

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
            publishDate: publishDateAfterAlertingPeriod,
            startDate: publishDateAfterAlertingPeriod,
            titleTranslated: 'Title1 & <br>',
            summaryTranslated: '" Summary1 </br>',
            process: 'defaultProcess',
            state: 'processState',
            entityRecipients: ['ENTITY1']
        };

        opfabServicesInterfaceStub.cards = [opfabServicesInterfaceStub.card];

        opfabBusinessConfigServicesInterfaceStub.template = '{{titleTranslated}}';

        await cardsDiffusionControl.checkUnreadCards();
        await new Promise((resolve) => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(1);
        expect(mailService.sent[0].body).toEqual(
            'Body <a href=" http://localhost/#/feed/cards/defaultProcess.process1 ">Title1 &amp; &lt;br&gt; - &quot; Summary1 &lt;/br&gt;</a> <br> Title1 &amp; &lt;br&gt;'
        );
    });

    it('Should not send same card twice', async function () {
        const publishDateAfterAlertingPeriod = Date.now() - 65 * 1000;
        setup();
        opfabServicesInterfaceStub.allUsers = [
            {login: 'operator_1', entities: ['ENTITY1']},
            {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}
        ];
        opfabServicesInterfaceStub.connectedUsers = ['operator_1'];

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

        opfabServicesInterfaceStub.cards = [
            {
                uid: '1002',
                id: 'defaultProcess.process1',
                publisher: 'publisher1',
                publishDate: publishDateAfterAlertingPeriod,
                startDate: publishDateAfterAlertingPeriod,
                titleTranslated: 'Title1',
                summaryTranslated: 'Summary1',
                process: 'defaultProcess',
                state: 'processState',
                entityRecipients: ['ENTITY1']
            }
        ];

        await cardsDiffusionControl.checkUnreadCards();
        await new Promise((resolve) => setTimeout(resolve, 1));
        expect(mailService.numberOfMailsSent).toEqual(1);

        await cardsDiffusionControl.checkUnreadCards();
        await new Promise((resolve) => setTimeout(resolve, 1));
    });

    it('Should not send card when setting sendCardsByEmail is set to false', async function () {
        const publishDateAfterAlertingPeriod = Date.now() - 65 * 1000;
        setup();
        opfabServicesInterfaceStub.allUsers = [
            {login: 'operator_1', entities: ['ENTITY1']},
            {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}
        ];
        opfabServicesInterfaceStub.connectedUsers = ['operator_1'];

        opfabServicesInterfaceStub.usersWithPerimeters = [
            {
                userData: {login: 'operator_1', entities: ['ENTITY1']},
                sendCardsByEmail: true,
                email: 'operator_1@opfab.com',
                computedPerimeters: perimeters
            },
            {
                userData: {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']},
                sendCardsByEmail: false,
                email: 'operator_2@opfab.com',
                processesStatesNotifiedByEmail: {defaultProcess: ['processState']},
                computedPerimeters: perimeters
            }
        ];

        opfabServicesInterfaceStub.cards = [
            {
                uid: '1003',
                id: 'defaultProcess.process1',
                publisher: 'publisher1',
                publishDate: publishDateAfterAlertingPeriod,
                startDate: publishDateAfterAlertingPeriod,
                titleTranslated: 'Title1',
                summaryTranslated: 'Summary1',
                process: 'defaultProcess',
                state: 'processState',
                entityRecipients: ['ENTITY1']
            }
        ];

        await cardsDiffusionControl.checkUnreadCards();
        await new Promise((resolve) => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(0);
    });

    it('Should not send card when setting sendCardsByEmail is not set', async function () {
        const publishDateAfterAlertingPeriod = Date.now() - 65 * 1000;
        setup();
        opfabServicesInterfaceStub.allUsers = [
            {login: 'operator_1', entities: ['ENTITY1']},
            {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}
        ];
        opfabServicesInterfaceStub.connectedUsers = ['operator_1'];

        opfabServicesInterfaceStub.usersWithPerimeters = [
            {
                userData: {login: 'operator_1', entities: ['ENTITY1']},
                sendCardsByEmail: true,
                email: 'operator_1@opfab.com',
                computedPerimeters: perimeters
            },
            {
                userData: {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']},
                email: 'operator_2@opfab.com',
                processesStatesNotifiedByEmail: {defaultProcess: ['processState']},
                computedPerimeters: perimeters
            }
        ];

        opfabServicesInterfaceStub.cards = [
            {
                uid: '1004',
                id: 'defaultProcess.process1',
                publisher: 'publisher1',
                publishDate: publishDateAfterAlertingPeriod,
                startDate: publishDateAfterAlertingPeriod,
                titleTranslated: 'Title1',
                summaryTranslated: 'Summary1',
                process: 'defaultProcess',
                state: 'processState',
                entityRecipients: ['ENTITY1']
            }
        ];

        await cardsDiffusionControl.checkUnreadCards();
        await new Promise((resolve) => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(0);
    });

    it('Should not send card when email not set', async function () {
        const publishDateAfterAlertingPeriod = Date.now() - 65 * 1000;
        setup();
        opfabServicesInterfaceStub.allUsers = [
            {login: 'operator_1', entities: ['ENTITY1']},
            {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}
        ];
        opfabServicesInterfaceStub.connectedUsers = ['operator_1'];

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
                processesStatesNotifiedByEmail: {defaultProcess: ['processState']},
                computedPerimeters: perimeters
            }
        ];

        opfabServicesInterfaceStub.cards = [
            {
                uid: '1005',
                id: 'defaultProcess.process1',
                publisher: 'publisher1',
                publishDate: publishDateAfterAlertingPeriod,
                startDate: publishDateAfterAlertingPeriod,
                titleTranslated: 'Title1',
                summaryTranslated: 'Summary1',
                process: 'defaultProcess',
                state: 'processState',
                entityRecipients: ['ENTITY1']
            }
        ];

        await cardsDiffusionControl.checkUnreadCards();
        await new Promise((resolve) => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(0);
    });

    it('Should not send card when email is empty', async function () {
        const publishDateAfterAlertingPeriod = Date.now() - 65 * 1000;
        setup();
        opfabServicesInterfaceStub.allUsers = [
            {login: 'operator_1', entities: ['ENTITY1']},
            {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}
        ];
        opfabServicesInterfaceStub.connectedUsers = ['operator_1'];

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
                email: '',
                processesStatesNotifiedByEmail: {defaultProcess: ['processState']},
                computedPerimeters: perimeters
            }
        ];

        opfabServicesInterfaceStub.cards = [
            {
                uid: '1006',
                id: 'defaultProcess.process1',
                publisher: 'publisher1',
                publishDate: publishDateAfterAlertingPeriod,
                startDate: publishDateAfterAlertingPeriod,
                titleTranslated: 'Title1',
                summaryTranslated: 'Summary1',
                process: 'defaultProcess',
                state: 'processState',
                entityRecipients: ['ENTITY1']
            }
        ];

        await cardsDiffusionControl.checkUnreadCards();
        await new Promise((resolve) => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(0);
    });

    it('Should send card to all enabled users', async function () {
        const publishDateAfterAlertingPeriod = Date.now() - 65 * 1000;
        setup();
        opfabServicesInterfaceStub.allUsers = [
            {login: 'operator_1', entities: ['ENTITY1']},
            {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}
        ];
        opfabServicesInterfaceStub.connectedUsers = [];

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
        opfabServicesInterfaceStub.cards = [
            {
                uid: '1007',
                id: 'defaultProcess.process1',
                publisher: 'publisher1',
                publishDate: publishDateAfterAlertingPeriod,
                startDate: publishDateAfterAlertingPeriod,
                titleTranslated: 'Title1',
                summaryTranslated: 'Summary1',
                process: 'defaultProcess',
                state: 'processState',
                entityRecipients: ['ENTITY1']
            }
        ];

        await cardsDiffusionControl.checkUnreadCards();
        await new Promise((resolve) => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(2);
        expect(mailService.sent[0].toAddress).toEqual('operator_1@opfab.com');
        expect(mailService.sent[1].toAddress).toEqual('operator_2@opfab.com');
    });

    it('Should not send card when cardsDiffusionRateLimiter is active and rate limit is reached', async function () {
        const publishDateAfterAlertingPeriod = Date.now() - 65 * 1000;
        setup();

        opfabServicesInterfaceStub.allUsers = [
            {login: 'operator_1', entities: ['ENTITY1']},
            {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}
        ];
        opfabServicesInterfaceStub.connectedUsers = [];

        opfabServicesInterfaceStub.usersWithPerimeters = [
            {
                userData: {login: 'operator_1', entities: ['ENTITY1']},
                sendCardsByEmail: true,
                email: 'operator_1@opfab.com',
                processesStatesNotifiedByEmail: {defaultProcess: ['processState']},
                computedPerimeters: perimeters
            }
        ];
        opfabServicesInterfaceStub.cards = [
            {
                uid: '2006',
                id: 'defaultProcess.process1',
                publisher: 'publisher1',
                publishDate: publishDateAfterAlertingPeriod,
                startDate: publishDateAfterAlertingPeriod,
                titleTranslated: 'Title1',
                summaryTranslated: 'Summary1',
                process: 'defaultProcess',
                state: 'processState',
                entityRecipients: ['ENTITY1']
            }
        ];

        const cardsDiffusionRateLimiter = new CardsDiffusionRateLimiter().setLimitPeriodInSec(30).setSendRateLimit(1);

        cardsDiffusionControl.setCardsDiffusionRateLimiter(cardsDiffusionRateLimiter);
        cardsDiffusionControl.setActivateCardsDiffusionRateLimiter(true);

        expect(cardsDiffusionRateLimiter.isNewSendingAllowed('operator_1@opfab.com')).toBeTruthy();
        cardsDiffusionRateLimiter.registerNewSending('operator_1@opfab.com');
        expect(cardsDiffusionRateLimiter.isNewSendingAllowed('operator_1@opfab.com')).toBeFalsy();

        let registeredMailSent = await databaseService.getSentMail('2006', 'operator_1@opfab.com');
        expect(registeredMailSent).toBeUndefined();

        await cardsDiffusionControl.checkUnreadCards();
        await new Promise((resolve) => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(0);
        registeredMailSent = await databaseService.getSentMail('2006', 'operator_1@opfab.com');
        expect(registeredMailSent.cardUid).toEqual('2006');
        expect(registeredMailSent.email).toEqual('operator_1@opfab.com');
    });

    it('Should send cards if cardsDiffusionRateLimiter is not active', async function () {
        const publishDateAfterAlertingPeriod = Date.now() - 65 * 1000;
        setup();

        opfabServicesInterfaceStub.allUsers = [
            {login: 'operator_1', entities: ['ENTITY1']},
            {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}
        ];
        opfabServicesInterfaceStub.connectedUsers = [];

        opfabServicesInterfaceStub.usersWithPerimeters = [
            {
                userData: {login: 'operator_1', entities: ['ENTITY1']},
                sendCardsByEmail: true,
                email: 'operator_1@opfab.com',
                processesStatesNotifiedByEmail: {defaultProcess: ['processState']},
                computedPerimeters: perimeters
            }
        ];
        opfabServicesInterfaceStub.cards = [
            {
                uid: '2007',
                id: 'defaultProcess.process1',
                publisher: 'publisher1',
                publishDate: publishDateAfterAlertingPeriod,
                startDate: publishDateAfterAlertingPeriod,
                titleTranslated: 'Title1',
                summaryTranslated: 'Summary1',
                process: 'defaultProcess',
                state: 'processState',
                entityRecipients: ['ENTITY1']
            }
        ];

        const cardsDiffusionRateLimiter = new CardsDiffusionRateLimiter().setLimitPeriodInSec(30).setSendRateLimit(1);
        cardsDiffusionControl.setCardsDiffusionRateLimiter(cardsDiffusionRateLimiter);
        cardsDiffusionControl.setActivateCardsDiffusionRateLimiter(false);

        expect(cardsDiffusionRateLimiter.isNewSendingAllowed('operator_1@opfab.com')).toBeTruthy();
        cardsDiffusionRateLimiter.registerNewSending('operator_1@opfab.com');
        expect(cardsDiffusionRateLimiter.isNewSendingAllowed('operator_1@opfab.com')).toBeFalsy();

        await cardsDiffusionControl.checkUnreadCards();
        await new Promise((resolve) => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(1);
    });
});
