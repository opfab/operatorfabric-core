/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import 'jest'
import CardsDiffusionControl from '../src/domain/application/cardsDiffusionControl'
import SendMailService from '../src/domain/server-side/sendMailService';
import GetResponse from '../src/common/server-side/getResponse';
import logger from '../src/common/server-side/logger';
import CardsExternalDiffusionOpfabServicesInterface from '../src/domain/server-side/cardsExternalDiffusionOpfabServicesInterface';
import CardsDiffusionRateLimiter from '../src/domain/application/cardsDiffusionRateLimiter';

class OpfabServicesInterfaceStub extends CardsExternalDiffusionOpfabServicesInterface {

    public isResponseValid = true;

    cards: Array<any> = new Array();
    allUsers: Array<any> = new Array();
    connectedUsers: Array<any> = new Array();

    usersWithPerimeters: Array<any> = new Array();

    async getCards() {
        return new GetResponse(this.cards,this.isResponseValid);
    }

    public getUsers() {
        return this.allUsers;
    }

    public async getUsersConnected(): Promise<GetResponse> {
        return new GetResponse(this.connectedUsers,this.isResponseValid);
    }

    public async getUserWithPerimetersByLogin(login: string): Promise<GetResponse> {
        const foundIndex = this.usersWithPerimeters.findIndex(u => u.userData.login === login);
        return new GetResponse(foundIndex >= 0 ? this.usersWithPerimeters[foundIndex]: null, true);
    }


}

class SendMailServiceStub extends SendMailService {

    numberOfMailsSent = 0;
    sent : Array<any> = [];
    

    public async sendMail(subject: string, body: string, from: string, to: string) {
        
        if(to.indexOf('@') > 0) {
            this.numberOfMailsSent++;

            this.sent.push({
                fromAddress : from,
                toAddress : to,
                subject : subject,
                body : body,
            });

            return Promise.resolve({messageId: "msg1234"});
        } else return Promise.reject(new Error());
    }
} 

describe('Cards external diffusion', function () {

    let cardsDiffusionControl : CardsDiffusionControl;
    let opfabServicesInterfaceStub : OpfabServicesInterfaceStub;
    let mailService : SendMailServiceStub;

    opfabServicesInterfaceStub = new OpfabServicesInterfaceStub();

    mailService = new SendMailServiceStub({smtpHost: "localhost", smtpPort: 1025});
    cardsDiffusionControl = new CardsDiffusionControl()
    .setLogger(logger)
    .setOpfabServicesInterface(opfabServicesInterfaceStub)
    .setMailService(mailService)
    .setFrom('test@opfab.com')
    .setSubjectPrefix('Subject')
    .setBodyPrefix('Body')
    .setOpfabUrlInMailContent('http://localhost')
    .setSecondsAfterPublicationToConsiderCardAsNotRead(60)
    .setWindowInSecondsForCardSearch(120);


    const perimeters = [{process: "defaultProcess", state:"processState", rights:"ReceiveAndWrite",filteringNotificationAllowed:true}];


    // Using this setup function instead of beforeEach hook because it was not working correctly 
    // after making CardsExternalDiffusionOpfabServicesInterface extend OpfabServicesInterface
    function setup() {
        
        opfabServicesInterfaceStub.cards = new Array();
        opfabServicesInterfaceStub.allUsers = new Array();
        opfabServicesInterfaceStub.connectedUsers = new Array();

        mailService.numberOfMailsSent = 0;
        mailService.sent = [];
    }

    it('Should not send card when publishDate is before configured period', async function() {
        const publishDateBeforeAlertingPeriod = Date.now() - 55 * 1000;
        setup();
        opfabServicesInterfaceStub.allUsers = [{login: 'operator_1', entities: ['ENTITY1']}, {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}];
        opfabServicesInterfaceStub.connectedUsers = ['operator_1'];

        opfabServicesInterfaceStub.usersWithPerimeters = [{userData: {login: 'operator_1', entities: ['ENTITY1']}, sendCardsByEmail: true, email: "operator_1@opfab.com", computedPerimeters: perimeters},
                                    {userData: {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}, sendCardsByEmail: true, email: "operator_2@opfab.com", processesStatesNotifiedByEmail: {defaultProcess: ['processState']}, computedPerimeters: perimeters}
                                ];

        
        opfabServicesInterfaceStub.cards = [{uid: "0001", id:"defaultProcess.process1" , publisher: 'publisher1', publishDate: publishDateBeforeAlertingPeriod, titleTranslated:"Title1", summaryTranslated:"Summary1", process: "defaultProcess", state: "processState", entityRecipients:["ENTITY1"]}];

        await cardsDiffusionControl.checkUnreadCards();
        await new Promise(resolve => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(0);
    })


    it('Should send card when publishDate is after configured period', async function() {
        const publishDateAfterAlertingPeriod = Date.now() - 65 * 1000;
        setup();
        opfabServicesInterfaceStub.allUsers = [{login: 'operator_1', entities: ['ENTITY1']}, {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}];
        opfabServicesInterfaceStub.connectedUsers = ['operator_1'];

        opfabServicesInterfaceStub.usersWithPerimeters = [{userData: {login: 'operator_1', entities: ['ENTITY1']}, sendCardsByEmail: true, email: "operator_1@opfab.com", computedPerimeters: perimeters},
                                                            {userData: {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}, sendCardsByEmail: true, email: "operator_2@opfab.com", processesStatesNotifiedByEmail: {defaultProcess: ['processState']}  , computedPerimeters: perimeters}
                                                        ];

        opfabServicesInterfaceStub.cards = [{uid: "1001", id: "defaultProcess.process1", publisher: 'publisher1', publishDate: publishDateAfterAlertingPeriod, startDate: publishDateAfterAlertingPeriod,
            titleTranslated: "Title1", summaryTranslated: "Summary1", process: "defaultProcess", state: "processState", entityRecipients: ["ENTITY1"]}];

        await cardsDiffusionControl.checkUnreadCards();
        await new Promise(resolve => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(1);
        expect(mailService.sent[0].fromAddress).toEqual('test@opfab.com');
        expect(mailService.sent[0].toAddress).toEqual('operator_2@opfab.com');
        expect(mailService.sent[0].body).toEqual('Body <a href="http://localhost/#/feed/cards/defaultProcess.process1">Title1 - Summary1</a>' );
    })


    it('Should not send same card twice', async function() {
        const publishDateAfterAlertingPeriod = Date.now() - 65 * 1000;
        setup();
        opfabServicesInterfaceStub.allUsers = [{login: 'operator_1', entities: ['ENTITY1']}, {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}];
        opfabServicesInterfaceStub.connectedUsers = ['operator_1'];
        
        opfabServicesInterfaceStub.usersWithPerimeters = [{userData: {login: 'operator_1', entities: ['ENTITY1']}, sendCardsByEmail: true, email: "operator_1@opfab.com", computedPerimeters: perimeters},
                                                            {userData: {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}, sendCardsByEmail: true, email: "operator_2@opfab.com", processesStatesNotifiedByEmail: {defaultProcess: ['processState']}  , computedPerimeters: perimeters}
                                                        ];
        
        opfabServicesInterfaceStub.cards = [{uid: "1002", id: "defaultProcess.process1", publisher: 'publisher1', publishDate: publishDateAfterAlertingPeriod, startDate: publishDateAfterAlertingPeriod,
            titleTranslated: "Title1", summaryTranslated: "Summary1", process: "defaultProcess", state: "processState", entityRecipients: ["ENTITY1"]}];

        await cardsDiffusionControl.checkUnreadCards();
        await new Promise(resolve => setTimeout(resolve, 1));
        expect(mailService.numberOfMailsSent).toEqual(1);

        await cardsDiffusionControl.checkUnreadCards();
        await new Promise(resolve => setTimeout(resolve, 1));
    })

    it('Should not send card when setting sendCardsByEmail is set to false', async function() {
        const publishDateAfterAlertingPeriod = Date.now() - 65 * 1000;
        setup();
        opfabServicesInterfaceStub.allUsers = [{login: 'operator_1', entities: ['ENTITY1']}, {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}];
        opfabServicesInterfaceStub.connectedUsers = ['operator_1'];
        
        opfabServicesInterfaceStub.usersWithPerimeters = [{userData: {login: 'operator_1', entities: ['ENTITY1']}, sendCardsByEmail: true, email: "operator_1@opfab.com", computedPerimeters: perimeters},
                                                            {userData: {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}, sendCardsByEmail: false, email: "operator_2@opfab.com", processesStatesNotifiedByEmail: {defaultProcess: ['processState']}  , computedPerimeters: perimeters}
                                                        ];
        
        opfabServicesInterfaceStub.cards = [{uid: "1003", id: "defaultProcess.process1", publisher: 'publisher1', publishDate: publishDateAfterAlertingPeriod, startDate: publishDateAfterAlertingPeriod,
            titleTranslated: "Title1", summaryTranslated: "Summary1", process: "defaultProcess", state: "processState", entityRecipients: ["ENTITY1"]}];

        await cardsDiffusionControl.checkUnreadCards();
        await new Promise(resolve => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(0);
        
    })

    it('Should not send card when setting sendCardsByEmail is not set', async function() {
        const publishDateAfterAlertingPeriod = Date.now() - 65 * 1000;
        setup();
        opfabServicesInterfaceStub.allUsers = [{login: 'operator_1', entities: ['ENTITY1']}, {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}];
        opfabServicesInterfaceStub.connectedUsers = ['operator_1'];
        
        opfabServicesInterfaceStub.usersWithPerimeters = [{userData: {login: 'operator_1', entities: ['ENTITY1']}, sendCardsByEmail: true, email: "operator_1@opfab.com", computedPerimeters: perimeters},
                                                            {userData: {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}, email: "operator_2@opfab.com", processesStatesNotifiedByEmail: {defaultProcess: ['processState']}  , computedPerimeters: perimeters}
                                                        ];
        
        opfabServicesInterfaceStub.cards = [{uid: "1004", id: "defaultProcess.process1", publisher: 'publisher1', publishDate: publishDateAfterAlertingPeriod, startDate: publishDateAfterAlertingPeriod,
            titleTranslated: "Title1", summaryTranslated: "Summary1", process: "defaultProcess", state: "processState", entityRecipients: ["ENTITY1"]}];

        await cardsDiffusionControl.checkUnreadCards();
        await new Promise(resolve => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(0);
        
    })
  
    it('Should not send card when email not set', async function() {
        const publishDateAfterAlertingPeriod = Date.now() - 65 * 1000;
        setup();
        opfabServicesInterfaceStub.allUsers = [{login: 'operator_1', entities: ['ENTITY1']}, {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}];
        opfabServicesInterfaceStub.connectedUsers = ['operator_1'];
        
        opfabServicesInterfaceStub.usersWithPerimeters = [{userData: {login: 'operator_1', entities: ['ENTITY1']}, sendCardsByEmail: true, email: "operator_1@opfab.com", computedPerimeters: perimeters},
                                                            {userData: {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}, sendCardsByEmail: true, processesStatesNotifiedByEmail: {defaultProcess: ['processState']}  , computedPerimeters: perimeters}
                                                        ];

        opfabServicesInterfaceStub.cards = [{uid: "1005", id: "defaultProcess.process1", publisher: 'publisher1', publishDate: publishDateAfterAlertingPeriod, startDate: publishDateAfterAlertingPeriod,
            titleTranslated: "Title1", summaryTranslated: "Summary1", process: "defaultProcess", state: "processState", entityRecipients: ["ENTITY1"]}];

        await cardsDiffusionControl.checkUnreadCards();
        await new Promise(resolve => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(0);
    })

    it('Should not send card when email is empty', async function() {
        const publishDateAfterAlertingPeriod = Date.now() - 65 * 1000;
        setup();
        opfabServicesInterfaceStub.allUsers = [{login: 'operator_1', entities: ['ENTITY1']}, {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}];
        opfabServicesInterfaceStub.connectedUsers = ['operator_1'];
        
        opfabServicesInterfaceStub.usersWithPerimeters = [{userData: {login: 'operator_1', entities: ['ENTITY1']}, sendCardsByEmail: true, email: "operator_1@opfab.com", computedPerimeters: perimeters},
                                                            {userData: {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}, sendCardsByEmail: true, email: "", processesStatesNotifiedByEmail: {defaultProcess: ['processState']}  , computedPerimeters: perimeters}
                                                        ];
        
        opfabServicesInterfaceStub.cards = [{uid: "1006", id: "defaultProcess.process1", publisher: 'publisher1', publishDate: publishDateAfterAlertingPeriod, startDate: publishDateAfterAlertingPeriod,
            titleTranslated: "Title1", summaryTranslated: "Summary1", process: "defaultProcess", state: "processState", entityRecipients: ["ENTITY1"]}];

        await cardsDiffusionControl.checkUnreadCards();
        await new Promise(resolve => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(0);
    })

    it('Should send card to all enabled users', async function() {
        const publishDateAfterAlertingPeriod = Date.now() - 65 * 1000;
        setup();
        opfabServicesInterfaceStub.allUsers = [{login: 'operator_1', entities: ['ENTITY1']}, {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}];
        opfabServicesInterfaceStub.connectedUsers = [];
        
        opfabServicesInterfaceStub.usersWithPerimeters = [{userData: {login: 'operator_1', entities: ['ENTITY1']}, sendCardsByEmail: true, email: "operator_1@opfab.com", processesStatesNotifiedByEmail: {defaultProcess: ['processState']}, computedPerimeters: perimeters},
                                                            {userData: {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}, sendCardsByEmail: true, email: "operator_2@opfab.com", processesStatesNotifiedByEmail: {defaultProcess: ['processState']}  , computedPerimeters: perimeters}
                                                        ];
        opfabServicesInterfaceStub.cards = [{uid: "1007", id: "defaultProcess.process1", publisher: 'publisher1', publishDate: publishDateAfterAlertingPeriod, startDate: publishDateAfterAlertingPeriod,
            titleTranslated: "Title1", summaryTranslated: "Summary1", process: "defaultProcess", state: "processState", entityRecipients: ["ENTITY1"]}];

        await cardsDiffusionControl.checkUnreadCards();
        await new Promise(resolve => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(2);
        expect(mailService.sent[0].toAddress).toEqual('operator_1@opfab.com');
        expect(mailService.sent[1].toAddress).toEqual('operator_2@opfab.com');
    })


    it('Should not send card when cardsDiffusionRateLimiter is active and rate limit is reached', async function() {
        const publishDateAfterAlertingPeriod = Date.now() - 65 * 1000;
        setup();

        opfabServicesInterfaceStub.allUsers = [{login: 'operator_1', entities: ['ENTITY1']}, {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}];
        opfabServicesInterfaceStub.connectedUsers = [];
        
        opfabServicesInterfaceStub.usersWithPerimeters = [{userData: {login: 'operator_1', entities: ['ENTITY1']}, sendCardsByEmail: true, email: "operator_1@opfab.com", processesStatesNotifiedByEmail: {defaultProcess: ['processState']}, computedPerimeters: perimeters}];
        opfabServicesInterfaceStub.cards = [{uid: "2006", id: "defaultProcess.process1", publisher: 'publisher1', publishDate: publishDateAfterAlertingPeriod, startDate: publishDateAfterAlertingPeriod,
            titleTranslated: "Title1", summaryTranslated: "Summary1", process: "defaultProcess", state: "processState", entityRecipients: ["ENTITY1"]}];


        const cardsDiffusionRateLimiter = new CardsDiffusionRateLimiter()
                                                .setLimitPeriodInSec(30)
                                                .setSendRateLimit(1);

        cardsDiffusionControl.setCardsDiffusionRateLimiter(cardsDiffusionRateLimiter);
        cardsDiffusionControl.setActivateCardsDiffusionRateLimiter(true);

        expect(cardsDiffusionRateLimiter.isNewSendingAllowed('operator_1@opfab.com')).toBeTruthy();
        cardsDiffusionRateLimiter.registerNewSending('operator_1@opfab.com');
        expect(cardsDiffusionRateLimiter.isNewSendingAllowed('operator_1@opfab.com')).toBeFalsy();

        await cardsDiffusionControl.checkUnreadCards();
        await new Promise(resolve => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(0);

    })

    it('Should send cards if cardsDiffusionRateLimiter is not active', async function() {
        const publishDateAfterAlertingPeriod = Date.now() - 65 * 1000;
        setup();

        opfabServicesInterfaceStub.allUsers = [{login: 'operator_1', entities: ['ENTITY1']}, {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}];
        opfabServicesInterfaceStub.connectedUsers = [];
        
        opfabServicesInterfaceStub.usersWithPerimeters = [{userData: {login: 'operator_1', entities: ['ENTITY1']}, sendCardsByEmail: true, email: "operator_1@opfab.com", processesStatesNotifiedByEmail: {defaultProcess: ['processState']}, computedPerimeters: perimeters}];
        opfabServicesInterfaceStub.cards = [{uid: "2007", id: "defaultProcess.process1", publisher: 'publisher1', publishDate: publishDateAfterAlertingPeriod, startDate: publishDateAfterAlertingPeriod,
            titleTranslated: "Title1", summaryTranslated: "Summary1", process: "defaultProcess", state: "processState", entityRecipients: ["ENTITY1"]}];

        
        const cardsDiffusionRateLimiter = new CardsDiffusionRateLimiter()
                                                .setLimitPeriodInSec(30)
                                                .setSendRateLimit(1);
        cardsDiffusionControl.setCardsDiffusionRateLimiter(cardsDiffusionRateLimiter);
        cardsDiffusionControl.setActivateCardsDiffusionRateLimiter(false);

        expect(cardsDiffusionRateLimiter.isNewSendingAllowed('operator_1@opfab.com')).toBeTruthy();
        cardsDiffusionRateLimiter.registerNewSending('operator_1@opfab.com');
        expect(cardsDiffusionRateLimiter.isNewSendingAllowed('operator_1@opfab.com')).toBeFalsy();

        await cardsDiffusionControl.checkUnreadCards();
        await new Promise(resolve => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(1);

    })
})
