/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import 'jest'
import AcknowledgementChecker from '../src/domain/application/acknowledgmentChecker'
import logger from '../src/common/server-side/logger';
import GetResponse from '../src/common/server-side/getResponse';
import OpfabServicesInterface from '../src/common/server-side/opfabServicesInterface';



class OpfabServicesInterfaceForAckStub extends OpfabServicesInterface {

    public unackCardId:string ;
    public missingAcks: string;
    public userRecipients: Array<string> = new Array();
    public entityRecipients: Array<string> = new Array();
    public numberOfCardSend =0;
    public isResponseValid = true;

    public unackCards: Array<any> = new Array();

    async getCards() {
            return new GetResponse(this.unackCards,this.isResponseValid);
        }

    async sendCard(card: any) {

        this.numberOfCardSend++;    
        this.unackCardId = card.data.cardId;
        this.missingAcks = card.data.missingAcks;
        this.userRecipients = card.userRecipients;
        this.entityRecipients = card.entityRecipients;
    }

}



describe('acknowledgement checker', function () {

    let acknowledgementChecker : AcknowledgementChecker;
    let opfabInterfaceStub : OpfabServicesInterfaceForAckStub;

    beforeEach(() => {
        opfabInterfaceStub = new OpfabServicesInterfaceForAckStub();
        
        acknowledgementChecker = new AcknowledgementChecker()
        .setLogger(logger)
        .setOpfabServicesInterface(opfabInterfaceStub)
        .setSecondsAfterPublicationToConsiderCardAsNotAcknowledged(60)
        .setWindowInSecondsForCardSearch(120)
        .setProcessStatesToSupervise([{ process: "defaultProcess", states: ["processState"]}]);
        
    })

    it('Should not send card when publishDate if before configured period', async function() {
        const publishDateAfterAlertingPeriod = Date.now() - 55 *1000;
        
        opfabInterfaceStub.unackCards = [{uid: "1001", id:"defaultProcess.process1" , publisher: 'publisher1', publishDate: publishDateAfterAlertingPeriod, process: "defaultProcess", state: "processState", entityRecipients:["ENTITY1"]}];

        await acknowledgementChecker.checkAcknowledgment();
        await new Promise(resolve => setTimeout(resolve, 1));
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(0);
    })

    it ('Should send only one card when publishDate is after configured period' , async function() {

        const publishDateBeforeAlertingPeriod = Date.now() - 65 *1000;
        opfabInterfaceStub.unackCards = [{uid: "1001",  id:"defaultProcess.process1", publisher: 'publisher1', publishDate: publishDateBeforeAlertingPeriod, process: "defaultProcess", state: "processState", entityRecipients:["ENTITY1"]}];

        await acknowledgementChecker.checkAcknowledgment();
        await new Promise(resolve => setTimeout(resolve, 1));
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(1);
        expect(opfabInterfaceStub.unackCardId).toEqual("defaultProcess.process1");
        expect(opfabInterfaceStub.userRecipients).toEqual(["publisher1"]);
        expect(opfabInterfaceStub.missingAcks).toEqual("ENTITY1");

        await acknowledgementChecker.checkAcknowledgment();
        await new Promise(resolve => setTimeout(resolve, 1));
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(1);

    });

    it ('Check userRecipients' , async function() {

        const publishDateBeforeAlertingPeriod = Date.now() - 65 *1000;
        opfabInterfaceStub.unackCards = [{uid: "1001", id:"defaultProcess.process1", publisher: 'publisher1', publishDate: publishDateBeforeAlertingPeriod, process: "defaultProcess", state: "processState", entityRecipients:["ENTITY1"]}];

        await acknowledgementChecker.checkAcknowledgment();
        await new Promise(resolve => setTimeout(resolve, 1));
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(1);
        expect(opfabInterfaceStub.unackCardId).toEqual("defaultProcess.process1");
        expect(opfabInterfaceStub.userRecipients).toEqual(["publisher1"]);

    });

    it ('Check entityRecipients when publisherType = ENTITY' , async function() {

        const publishDateBeforeAlertingPeriod = Date.now() - 65 *1000;
        opfabInterfaceStub.unackCards = [{uid: "1001", id:"defaultProcess.process2", publisher: 'ENTITY3', publisherType: 'ENTITY', publishDate: publishDateBeforeAlertingPeriod, process: "defaultProcess", state: "processState", entityRecipients:["ENTITY1"]}];

        await acknowledgementChecker.checkAcknowledgment();
        await new Promise(resolve => setTimeout(resolve, 1));
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(1);
        expect(opfabInterfaceStub.unackCardId).toEqual("defaultProcess.process2");
        expect(opfabInterfaceStub.entityRecipients).toEqual(["ENTITY3"]);

    });


    it ('Should send 2 card if 2 cards not acked' , async function() {
        const publishDateAfterAlertingPeriod = Date.now() - 55 *1000;

        const publishDateBeforeAlertingPeriod = Date.now() - 65 *1000;
        opfabInterfaceStub.unackCards = [
            {uid: "1001", id:"defaultProcess.process1", publisher: 'publisher1', publishDate: publishDateAfterAlertingPeriod, process: "defaultProcess", state: "processState", entityRecipients:["ENTITY1"]},
            {uid: "1002", id:"defaultProcess.process2", publisher: 'publisher1', publishDate: publishDateBeforeAlertingPeriod,  process: "defaultProcess", state: "processState", entityRecipients:["ENTITY1"]},
            {uid: "2002", id:"defaultProcess.process3", publisher: 'publisher1', publishDate: publishDateBeforeAlertingPeriod,  process: "defaultProcess", state: "processState", entityRecipients:["ENTITY1"]}];

        await acknowledgementChecker.checkAcknowledgment();
        await new Promise(resolve => setTimeout(resolve, 1));
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(2);

        await acknowledgementChecker.checkAcknowledgment();
        await new Promise(resolve => setTimeout(resolve, 1));
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(2);

    });


    it ('Do not consider recipients for information as required for acknowledgement ' , async function() {
        const publishDateBeforeAlertingPeriod = Date.now() - 65 *1000;

        opfabInterfaceStub.unackCards = [{uid: "1002", id:"defaultProcess.process2", publisher: 'publisher1',  publishDate: publishDateBeforeAlertingPeriod,  process: "defaultProcess", state: "processState", entityRecipients:["ENTITY1", "ENTITY2"], entityRecipientsForInformation:["ENTITY2"], entitiesAcks:["ENTITY1"]}];

        await acknowledgementChecker.checkAcknowledgment();
        await new Promise(resolve => setTimeout(resolve, 1));
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(0);

    });

    it ('Check card missingAcks' , async function() {
        const publishDateBeforeAlertingPeriod = Date.now() - 65 *1000;

        opfabInterfaceStub.unackCards = [{uid: "1001", id:"defaultProcess.process1", publisher: 'publisher1',  publishDate: publishDateBeforeAlertingPeriod,  process: "defaultProcess", state: "processState", entityRecipients:["ENTITY1","ENTITY2"], entitiesAcks:[]}];

        await acknowledgementChecker.checkAcknowledgment();
        await new Promise(resolve => setTimeout(resolve, 1));
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(1);
        expect(opfabInterfaceStub.unackCardId).toEqual("defaultProcess.process1");
        expect(opfabInterfaceStub.userRecipients).toEqual(["publisher1"]);
        expect(opfabInterfaceStub.missingAcks).toEqual("ENTITY1,ENTITY2");
    });
})
