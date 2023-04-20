/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import 'jest'
import OpfabServicesInterface from '../src/domain/server-side/opfabServicesInterface';
import CardsDiffusionControl from '../src/domain/application/cardsDiffusionControl'
import logger from '../src/domain/server-side/logger';
import GetResponse from '../src/domain/server-side/getResponse';
import SendMailService from '../src/domain/server-side/sendMailService';




class OpfabServicesInterfaceStub extends OpfabServicesInterface {


    public isResponseValid = true;

    cards: Array<any> = new Array();
    allUsers: Array<any> = new Array();
    connectedUsers: Array<any> = new Array();
    settings:  Map<string, any> = new Map();
    perimeters: Array<any> = new Array();;


    async getCards() {
            return new GetResponse(this.cards,this.isResponseValid);
    }

    public getUsers() {
        return this.allUsers;
    }

    public async getUser(login: string) : Promise<GetResponse>{
        return new GetResponse(this.allUsers.find(u => u.login === login), true);
    }

    public async getUsersConnected(): Promise<GetResponse> {
        return new GetResponse(this.connectedUsers,this.isResponseValid);
    }

    public async getUserSettings(login: string): Promise<GetResponse> {
        return new GetResponse(this.settings.get(login), true);
    }


    public async getUserPerimeters(login: string): Promise<GetResponse> {
        return new GetResponse(this.perimeters, true);
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

            return new Promise<any>((resolve, reject) => {
                resolve({messageId: "msg1234"});
            });
        } else return new Promise<any>((resolve, reject) => {
            reject({});
        });
    }
} 

describe('Cards external diffusion', function () {

    let cardsDiffusionControl : CardsDiffusionControl;
    let opfabServicesInterfaceStub : OpfabServicesInterfaceStub;
    let mailService : SendMailServiceStub;

    beforeEach(() => {
        opfabServicesInterfaceStub = new OpfabServicesInterfaceStub();
        opfabServicesInterfaceStub.setOpfabUrl('http://localhost')
        mailService = new SendMailServiceStub({smtpHost: "localhost", smtpPort: 1025});
        cardsDiffusionControl = new CardsDiffusionControl()
        .setLogger(logger)
        .setOpfabServicesInterface(opfabServicesInterfaceStub)
        .setMailService(mailService)
        .setFrom('test@opfab.com')
        .setSubjectPrefix('Subject')
        .setBodyPrefix('Body')
        .setSecondsAfterPublicationToConsiderCardAsNotRead(60)
        .setWindowInSecondsForCardSearch(120);
        
    })

    it('Should not send card when publishDate is before configured period', async function() {
        const publishDateAfterAlertingPeriod = Date.now() - 55 * 1000;
        opfabServicesInterfaceStub.allUsers = [{login: 'operator_1', entities: ['ENTITY1']}, {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}];
        opfabServicesInterfaceStub.perimeters = [{process: "defaultProcess", stateRights:[{state:"processState",right:"ReceiveAndWrite",filteringNotificationAllowed:true}]} ];
        opfabServicesInterfaceStub.connectedUsers = ['operator_1'];
        opfabServicesInterfaceStub.settings.set('operator_2', {sendCardsByEmail: true, email:"operator_2@opfab.com"});
        opfabServicesInterfaceStub.cards = [{uid: "0001", id:"defaultProcess.process1" , publisher: 'publisher1', publishDate: publishDateAfterAlertingPeriod, titleTranslated:"Title1", summaryTranslated:"Summary1", process: "defaultProcess", state: "processState", entityRecipients:["ENTITY1"]}];

        await new Promise(resolve => setTimeout(resolve, 1));

        await cardsDiffusionControl.checkUnreadCards();
        expect(mailService.numberOfMailsSent).toEqual(0);
    })

    
    it('Should send card when publishDate if after configured period', async function() {
        const publishDateAfterAlertingPeriod = Date.now() - 65 * 1000;
        opfabServicesInterfaceStub.allUsers = [{login: 'operator_1', entities: ['ENTITY1']}, {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}];
        opfabServicesInterfaceStub.perimeters = [{process: "defaultProcess", stateRights:[{state:"processState",right:"ReceiveAndWrite",filteringNotificationAllowed:true}]} ];
        opfabServicesInterfaceStub.connectedUsers = ['operator_1'];
        opfabServicesInterfaceStub.settings.set('operator_2', {sendCardsByEmail: true, email:"operator_2@opfab.com"});
        opfabServicesInterfaceStub.cards = [{uid: "1001", id:"defaultProcess.process1" , publisher: 'publisher1', publishDate: publishDateAfterAlertingPeriod, startDate: publishDateAfterAlertingPeriod, titleTranslated:"Title1", summaryTranslated:"Summary1", process: "defaultProcess", state: "processState", entityRecipients:["ENTITY1"]}];

        await cardsDiffusionControl.checkUnreadCards();
        await new Promise(resolve => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(1);
        expect(mailService.sent[0].fromAddress).toEqual('test@opfab.com');
        expect(mailService.sent[0].toAddress).toEqual('operator_2@opfab.com');
        expect(mailService.sent[0].body).toEqual('Body <a href="http://localhost/#/feed/cards/defaultProcess.process1">Title1 - Summary1</a>' );
    })

    it('Should not send same card twice', async function() {
        const publishDateAfterAlertingPeriod = Date.now() - 65 * 1000;
        opfabServicesInterfaceStub.allUsers = [{login: 'operator_1', entities: ['ENTITY1']}, {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}];
        opfabServicesInterfaceStub.perimeters = [{process: "defaultProcess", stateRights:[{state:"processState",right:"ReceiveAndWrite",filteringNotificationAllowed:true}]} ];
        opfabServicesInterfaceStub.connectedUsers = ['operator_1'];
        opfabServicesInterfaceStub.settings.set('operator_2', {sendCardsByEmail: true, email:"operator_2@opfab.com"});
        opfabServicesInterfaceStub.cards = [{uid: "1002", id:"defaultProcess.process1" , publisher: 'publisher1', publishDate: publishDateAfterAlertingPeriod, startDate: publishDateAfterAlertingPeriod, titleTranslated:"Title1", summaryTranslated:"Summary1", process: "defaultProcess", state: "processState", entityRecipients:["ENTITY1"]}];

        await cardsDiffusionControl.checkUnreadCards();
        await new Promise(resolve => setTimeout(resolve, 1));
        expect(mailService.numberOfMailsSent).toEqual(1);

        await cardsDiffusionControl.checkUnreadCards();
        await new Promise(resolve => setTimeout(resolve, 1));
    })

    it('Should not send card when setting sendCardsByEmail is set to false', async function() {
        const publishDateAfterAlertingPeriod = Date.now() - 65 * 1000;
        opfabServicesInterfaceStub.allUsers = [{login: 'operator_1', entities: ['ENTITY1']}, {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}];
        opfabServicesInterfaceStub.perimeters = [{process: "defaultProcess", stateRights:[{state:"processState",right:"ReceiveAndWrite",filteringNotificationAllowed:true}]} ];
        opfabServicesInterfaceStub.connectedUsers = ['operator_1'];
        opfabServicesInterfaceStub.settings.set('operator_2', {sendCardsByEmail: false, email:"operator_2@opfab.com"});
        opfabServicesInterfaceStub.cards = [{uid: "1003", id:"defaultProcess.process1" , publisher: 'publisher1', publishDate: publishDateAfterAlertingPeriod, startDate: publishDateAfterAlertingPeriod, titleTranslated:"Title1", summaryTranslated:"Summary1", process: "defaultProcess", state: "processState", entityRecipients:["ENTITY1"]}];

        await cardsDiffusionControl.checkUnreadCards();
        await new Promise(resolve => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(0);
        
    })

    it('Should not send card when setting sendCardsByEmail is not set', async function() {
        const publishDateAfterAlertingPeriod = Date.now() - 65 * 1000;
        opfabServicesInterfaceStub.allUsers = [{login: 'operator_1', entities: ['ENTITY1']}, {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}];
        opfabServicesInterfaceStub.perimeters = [{process: "defaultProcess", stateRights:[{state:"processState",right:"ReceiveAndWrite",filteringNotificationAllowed:true}]} ];
        opfabServicesInterfaceStub.connectedUsers = ['operator_1'];
        opfabServicesInterfaceStub.settings.set('operator_2', {});
        opfabServicesInterfaceStub.cards = [{uid: "1004", id:"defaultProcess.process1" , publisher: 'publisher1', publishDate: publishDateAfterAlertingPeriod, startDate: publishDateAfterAlertingPeriod, titleTranslated:"Title1", summaryTranslated:"Summary1", process: "defaultProcess", state: "processState", entityRecipients:["ENTITY1"]}];

        await cardsDiffusionControl.checkUnreadCards();
        await new Promise(resolve => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(0);
        
    })
    
    it('Should not send card when email not set', async function() {
        const publishDateAfterAlertingPeriod = Date.now() - 65 * 1000;
        opfabServicesInterfaceStub.allUsers = [{login: 'operator_1', entities: ['ENTITY1']}, {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}];
        opfabServicesInterfaceStub.perimeters = [{process: "defaultProcess", stateRights:[{state:"processState",right:"ReceiveAndWrite",filteringNotificationAllowed:true}]} ];
        opfabServicesInterfaceStub.connectedUsers = ['operator_1'];
        opfabServicesInterfaceStub.settings.set('operator_2',  {sendCardsByEmail: true});
        opfabServicesInterfaceStub.cards = [{uid: "1005", id:"defaultProcess.process1" , publisher: 'publisher1', publishDate: publishDateAfterAlertingPeriod, startDate: publishDateAfterAlertingPeriod, titleTranslated:"Title1", summaryTranslated:"Summary1", process: "defaultProcess", state: "processState", entityRecipients:["ENTITY1"]}];

        await cardsDiffusionControl.checkUnreadCards();
        await new Promise(resolve => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(0);
        
    })

    it('Should not send card when email is empty', async function() {
        const publishDateAfterAlertingPeriod = Date.now() - 65 * 1000;
        opfabServicesInterfaceStub.allUsers = [{login: 'operator_1', entities: ['ENTITY1']}, {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}];
        opfabServicesInterfaceStub.perimeters = [{process: "defaultProcess", stateRights:[{state:"processState",right:"ReceiveAndWrite",filteringNotificationAllowed:true}]} ];
        opfabServicesInterfaceStub.connectedUsers = ['operator_1'];
        opfabServicesInterfaceStub.settings.set('operator_2',  {sendCardsByEmail: true, email: ""});
        opfabServicesInterfaceStub.cards = [{uid: "1006", id:"defaultProcess.process1" , publisher: 'publisher1', publishDate: publishDateAfterAlertingPeriod, startDate: publishDateAfterAlertingPeriod, titleTranslated:"Title1", summaryTranslated:"Summary1", process: "defaultProcess", state: "processState", entityRecipients:["ENTITY1"]}];

        await cardsDiffusionControl.checkUnreadCards();
        await new Promise(resolve => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(0);
        
    })

    it('Should send card to all enabled users', async function() {
        const publishDateAfterAlertingPeriod = Date.now() - 65 * 1000;
        opfabServicesInterfaceStub.allUsers = [{login: 'operator_1', entities: ['ENTITY1']}, {login: 'operator_2', entities: ['ENTITY1', 'ENTITY2']}];
        opfabServicesInterfaceStub.perimeters = [{process: "defaultProcess", stateRights:[{state:"processState",right:"ReceiveAndWrite",filteringNotificationAllowed:true}]} ];
        opfabServicesInterfaceStub.connectedUsers = [];
        opfabServicesInterfaceStub.settings.set('operator_1', {sendCardsByEmail: true, email:"operator_1@opfab.com"});
        opfabServicesInterfaceStub.settings.set('operator_2', {sendCardsByEmail: true, email:"operator_2@opfab.com"});

        opfabServicesInterfaceStub.cards = [{uid: "1007", id:"defaultProcess.process1" , publisher: 'publisher1', publishDate: publishDateAfterAlertingPeriod, startDate: publishDateAfterAlertingPeriod, titleTranslated:"Title1", summaryTranslated:"Summary1", process: "defaultProcess", state: "processState", entityRecipients:["ENTITY1"]}];

        await cardsDiffusionControl.checkUnreadCards();
        await new Promise(resolve => setTimeout(resolve, 1));

        expect(mailService.numberOfMailsSent).toEqual(2);
        expect(mailService.sent[0].toAddress).toEqual('operator_1@opfab.com');
        expect(mailService.sent[1].toAddress).toEqual('operator_2@opfab.com');
    })

})
