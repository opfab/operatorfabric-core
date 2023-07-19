/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import 'jest'
import ConnectionChecker from '../src/domain/application/connectionChecker'
import logger from '../src/common/server-side/logger';
import GetResponse from '../src/common/server-side/getResponse';
import OpfabServicesInterface from '../src/common/server-side/opfabServicesInterface';



class OpfabServicesInterfaceStub extends OpfabServicesInterface {
    public disconnectedEntity: string;
    public entityRecipients: Array<string> = new Array();
    public minutes: number = 0;
    public numberOfCardSend = 0;
    public isResponseValid = true;

    public userConnected: Array<any> = new Array();

    async getUsersConnected() {
        return new GetResponse(this.userConnected, this.isResponseValid);
    }

    public async getEntity(id: string): Promise<GetResponse> {
        return new GetResponse({"id": id, "name": id + " Name"}, true);
    }
    async sendCard(card: any) {
        this.numberOfCardSend++;
        this.disconnectedEntity = card.data.disconnected;
        this.entityRecipients = card.entityRecipients;
        this.minutes = card.data.minutes;
    }
}



describe('connection checker', function () {

    let connectionChecker : ConnectionChecker;
    let opfabInterfaceStub : OpfabServicesInterfaceStub;

    beforeEach(() => {
        opfabInterfaceStub = new OpfabServicesInterfaceStub().setLogger(logger);
        opfabInterfaceStub.userConnected = [{login: 'operator3', entitiesConnected: ['ENTITY3']}];

        connectionChecker = new ConnectionChecker()
        .setLogger(logger)
        .setOpfabServicesInterface(opfabInterfaceStub)
        .setSecondsBetweenConnectionChecks(120)
        .setNbOfConsecutiveNotConnectedToSendFirstCard(3)
        .setNbOfConsecutiveNotConnectedToSendSecondCard(5)
        .setEntitiesToSupervise([{id:"ENTITY1",supervisors:["ENTITY2"]},{id:"ENTITY3",supervisors:["ENTITY2"]}]);

    })

    it ('Should send a card after 3 times ENTITY1 is disconnected' , async function() {
       
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(0);
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(0);
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(1);
        expect(opfabInterfaceStub.disconnectedEntity).toEqual("ENTITY1 Name");
        expect(opfabInterfaceStub.entityRecipients).toEqual(["ENTITY2"]);
        expect(opfabInterfaceStub.minutes).toEqual(6);

    });

    it ('Should send a second card after 5 times ENTITY1 is disconnected' , async function() {

        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(0);
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(0);
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(1);
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(1);
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(2);
        expect(opfabInterfaceStub.disconnectedEntity).toEqual("ENTITY1 Name");
        expect(opfabInterfaceStub.entityRecipients).toEqual(["ENTITY2"]);
        expect(opfabInterfaceStub.minutes).toEqual(10);
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(2);
    });


    it ('Do not send card if ENTITY1 connected ' , async function() {
        opfabInterfaceStub.userConnected = [{login: 'operator1', entitiesConnected: ['ENTITY1']},{login: 'operator3', entitiesConnected: ['ENTITY3']}];
        await connectionChecker.checkConnection();
        await connectionChecker.checkConnection();
        await connectionChecker.checkConnection();
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(0);

    });

    it ('Do not send card if user with ENTITY1 and ENTITY3 is connected ' , async function() {
        opfabInterfaceStub.userConnected = [{login: 'operator4', entitiesConnected: ['ENTITY1','ENTITY3']}];
        await connectionChecker.checkConnection();
        await connectionChecker.checkConnection();
        await connectionChecker.checkConnection();
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(0);

    });

    it ('Do not send card if ENTITY1 disconnected only two times ' , async function() {

        await connectionChecker.checkConnection();
        await connectionChecker.checkConnection();
        opfabInterfaceStub.userConnected = [{login: 'operator1', entitiesConnected: ['ENTITY1']},{login: 'operator3', entitiesConnected: ['ENTITY3']}];
        await connectionChecker.checkConnection();
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(0);

    });

    it ('Send card if entity connected 2 times and after disconnected 3 times ' , async function() {

        opfabInterfaceStub.userConnected = [{login: 'operator1', entitiesConnected: ['ENTITY1']},{login: 'operator3', entitiesConnected: ['ENTITY3']}];
        await connectionChecker.checkConnection();
        await connectionChecker.checkConnection();
        opfabInterfaceStub.userConnected = [{login: 'operator3', entitiesConnected: ['ENTITY3']}];
        await connectionChecker.checkConnection();
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(0);
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(1);

    });

    it ('Send no send second card if entity connect after first card ' , async function() {

        await connectionChecker.checkConnection();
        await connectionChecker.checkConnection();
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(1);
        await connectionChecker.checkConnection();
        opfabInterfaceStub.userConnected = [{login: 'operator1', entitiesConnected: ['ENTITY1']},{login: 'operator3', entitiesConnected: ['ENTITY3']}];
        await connectionChecker.checkConnection();
        await connectionChecker.checkConnection();
        await connectionChecker.checkConnection();
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(1);

    });

    it ('Should send 2 card if 2 entities disconnected' , async function() {

        opfabInterfaceStub.userConnected = [];
        await connectionChecker.checkConnection();
        await connectionChecker.checkConnection();
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(2);
        await connectionChecker.checkConnection();
        await connectionChecker.checkConnection();
        await connectionChecker.checkConnection();
        await connectionChecker.checkConnection();
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(4);

    });


    it ('Should restart from zero if reset connection checker' , async function() {

        await connectionChecker.checkConnection();
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(0);
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(1);
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(1);
        connectionChecker.resetState();
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(1);
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(1);
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(2);
        expect(opfabInterfaceStub.disconnectedEntity).toEqual("ENTITY1 Name");
        expect(opfabInterfaceStub.entityRecipients).toEqual(["ENTITY2"]);
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(2);
    });

    it ('Should send a card after 3 times disconnected ENTITY1 with 2 error in get user connected ' , async function() {
       
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(0);
        opfabInterfaceStub.isResponseValid = false;
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(0);
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(0);
        opfabInterfaceStub.isResponseValid = true;
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(0);
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(1);
        expect(opfabInterfaceStub.disconnectedEntity).toEqual("ENTITY1 Name");
        expect(opfabInterfaceStub.entityRecipients).toEqual(["ENTITY2"]);
        expect(opfabInterfaceStub.minutes).toEqual(6);

    });

    it ('Should send 2 cards after 3 times when connected user has no entities' , async function() {

        opfabInterfaceStub.userConnected = [{login: 'operator4', entitiesConnected: []}];

        await connectionChecker.checkConnection();
        await connectionChecker.checkConnection();
        await connectionChecker.checkConnection();

        expect(opfabInterfaceStub.numberOfCardSend).toEqual(2);

    });

})
