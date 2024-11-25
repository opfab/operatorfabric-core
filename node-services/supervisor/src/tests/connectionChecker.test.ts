/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import 'jest';
import ConnectionChecker from '../domain/application/connectionChecker';
import {getLogger} from '../common/server-side/logger';
import {OpfabServicesInterfaceStub} from './helpers/opfabServicesInterfaceStub';
import {EntityToSupervise} from '../domain/application/entityToSupervise';
import GetResponse from '../common/server-side/getResponse';

const logger = getLogger();

describe('connection checker', function () {
    let connectionChecker: ConnectionChecker;
    let opfabInterfaceStub: OpfabServicesInterfaceStub;

    async function checkConnectionXTimes(x: number): Promise<void> {
        for (let i = 0; i < x; i++) {
            await connectionChecker.checkConnection();
        }
    }

    beforeEach(() => {
        opfabInterfaceStub = new OpfabServicesInterfaceStub().setLogger(logger);
        opfabInterfaceStub.userConnected = [
            {login: 'operator3', groups: ['Readonly', 'Dispatcher'], entitiesConnected: ['ENTITY3']}
        ];

        connectionChecker = new ConnectionChecker()
            .setLogger(logger)
            .setOpfabServicesInterface(opfabInterfaceStub)
            .setSecondsBetweenConnectionChecks(120)
            .setNbOfConsecutiveNotConnectedToSendFirstCard(3)
            .setNbOfConsecutiveNotConnectedToSendSecondCard(5)
            .setConsiderConnectedIfUserInGroups(['Dispatcher'])
            .setDisconnectedCardTemplate({
                publisher: 'opfab',
                processVersion: '1',
                process: 'supervisor',
                state: 'disconnectedEntity',
                severity: 'ALARM'
            })
            .setEntitiesToSupervise([
                new EntityToSupervise('ENTITY1', ['ENTITY2']),
                new EntityToSupervise('ENTITY3', ['ENTITY2'])
            ]);
    });

    it('Should send a card after 3 times ENTITY1 is disconnected', async function () {
        await checkConnectionXTimes(2);
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(0);
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(1);
        expect(opfabInterfaceStub.cardSend.data.disconnected).toEqual('ENTITY1 Name');
        expect(opfabInterfaceStub.cardSend.entityRecipients).toEqual(['ENTITY2']);
        expect(opfabInterfaceStub.cardSend.data.minutes).toEqual(6);
    });

    it('Should send a card with disconnected card template configured', async function () {
        await checkConnectionXTimes(3);
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(1);
        expect(opfabInterfaceStub.cardSend.data.disconnected).toEqual('ENTITY1 Name');
        expect(opfabInterfaceStub.cardSend.entityRecipients).toEqual(['ENTITY2']);
        expect(opfabInterfaceStub.cardSend.data.minutes).toEqual(6);
        expect(opfabInterfaceStub.cardSend.publisher).toEqual('opfab');
        expect(opfabInterfaceStub.cardSend.processVersion).toEqual('1');
        expect(opfabInterfaceStub.cardSend.process).toEqual('supervisor');
        expect(opfabInterfaceStub.cardSend.state).toEqual('disconnectedEntity');
        expect(opfabInterfaceStub.cardSend.severity).toEqual('ALARM');
    });

    it('Should send entity name in card title', async function () {
        await checkConnectionXTimes(3);
        expect(opfabInterfaceStub.cardSend.title.key).toEqual('connection.title');
        expect(opfabInterfaceStub.cardSend.title.parameters).toEqual({disconnected: 'ENTITY1 Name'});
    });

    it('Should send entity name and number of minutes in card summary', async function () {
        await checkConnectionXTimes(3);
        expect(opfabInterfaceStub.cardSend.summary.key).toEqual('connection.summary');
        expect(opfabInterfaceStub.cardSend.summary.parameters).toEqual({disconnected: 'ENTITY1 Name', minutes: 6});
    });

    it('Should send a second card after 5 times ENTITY1 is disconnected', async function () {
        await checkConnectionXTimes(3);
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(1);
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(1);
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(2);
        expect(opfabInterfaceStub.cardSend.data.disconnected).toEqual('ENTITY1 Name');
        expect(opfabInterfaceStub.cardSend.entityRecipients).toEqual(['ENTITY2']);
        expect(opfabInterfaceStub.cardSend.data.minutes).toEqual(10);
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(2);
    });

    it('Should use entityId as Name if not able to get entity name', async function () {
        //eslint-disable-next-line @typescript-eslint/no-unused-vars
        opfabInterfaceStub.setGetEntityFunction((id: string) => new GetResponse(null, false));
        await checkConnectionXTimes(3);
        expect(opfabInterfaceStub.cardSend.data.disconnected).toEqual('ENTITY1');
    });

    it('Do not send card if ENTITY1 connected ', async function () {
        opfabInterfaceStub.userConnected = [
            {login: 'operator1', groups: ['Readonly', 'Dispatcher'], entitiesConnected: ['ENTITY1']},
            {login: 'operator3', groups: ['Readonly', 'Dispatcher'], entitiesConnected: ['ENTITY3']}
        ];
        await checkConnectionXTimes(4);
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(0);
    });

    it('Do not send card if user with ENTITY1 and ENTITY3 is connected ', async function () {
        opfabInterfaceStub.userConnected = [
            {login: 'operator4', groups: ['Readonly', 'Dispatcher'], entitiesConnected: ['ENTITY1', 'ENTITY3']}
        ];
        await checkConnectionXTimes(4);
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(0);
    });

    it('Do not send card if ENTITY1 disconnected only two times ', async function () {
        await checkConnectionXTimes(2);
        opfabInterfaceStub.userConnected = [
            {login: 'operator1', groups: ['Readonly', 'Dispatcher'], entitiesConnected: ['ENTITY1']},
            {login: 'operator3', groups: ['Readonly', 'Dispatcher'], entitiesConnected: ['ENTITY3']}
        ];
        await checkConnectionXTimes(2);
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(0);
    });

    it('Should send a card if connected user not in configured groups', async function () {
        opfabInterfaceStub.userConnected = [
            {login: 'operator1', groups: ['Readonly'], entitiesConnected: ['ENTITY1']},
            {login: 'operator3', groups: ['Readonly', 'Dispatcher'], entitiesConnected: ['ENTITY3']}
        ];
        await checkConnectionXTimes(3);
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(1);
        expect(opfabInterfaceStub.cardSend.data.disconnected).toEqual('ENTITY1 Name');
        expect(opfabInterfaceStub.cardSend.entityRecipients).toEqual(['ENTITY2']);
        expect(opfabInterfaceStub.cardSend.data.minutes).toEqual(6);
    });

    it('Should NOT send a card if considerConnectedIfUserInGroups is not set and users are connected', async function () {
        opfabInterfaceStub.userConnected = [
            {login: 'operator1', groups: ['Readonly'], entitiesConnected: ['ENTITY1']},
            {login: 'operator3', groups: ['Readonly', 'Dispatcher'], entitiesConnected: ['ENTITY3']}
        ];
        connectionChecker.setConsiderConnectedIfUserInGroups(null);
        await checkConnectionXTimes(3);
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(0);
    });

    it('Should NOT send a card if considerConnectedIfUserInGroups is empty and users are connected', async function () {
        opfabInterfaceStub.userConnected = [
            {login: 'operator1', groups: ['Readonly'], entitiesConnected: ['ENTITY1']},
            {login: 'operator3', groups: ['Readonly', 'Dispatcher'], entitiesConnected: ['ENTITY3']}
        ];
        connectionChecker.setConsiderConnectedIfUserInGroups([]);
        await checkConnectionXTimes(3);
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(0);
    });

    it('Send card if entity connected 2 times and after disconnected 3 times ', async function () {
        opfabInterfaceStub.userConnected = [
            {login: 'operator1', groups: ['Readonly', 'Dispatcher'], entitiesConnected: ['ENTITY1']},
            {login: 'operator3', groups: ['Readonly', 'Dispatcher'], entitiesConnected: ['ENTITY3']}
        ];
        await checkConnectionXTimes(2);
        opfabInterfaceStub.userConnected = [
            {login: 'operator3', groups: ['Readonly', 'Dispatcher'], entitiesConnected: ['ENTITY3']}
        ];
        await checkConnectionXTimes(2);
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(0);
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(1);
    });

    it('Send no send second card if entity connect after first card ', async function () {
        await checkConnectionXTimes(3);
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(1);
        await connectionChecker.checkConnection();
        opfabInterfaceStub.userConnected = [
            {login: 'operator1', groups: ['Readonly', 'Dispatcher'], entitiesConnected: ['ENTITY1']},
            {login: 'operator3', groups: ['Readonly', 'Dispatcher'], entitiesConnected: ['ENTITY3']}
        ];
        await checkConnectionXTimes(4);
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(1);
    });

    it('Should send 2 card if 2 entities disconnected', async function () {
        opfabInterfaceStub.userConnected = [];
        await checkConnectionXTimes(3);
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(2);
        await checkConnectionXTimes(5);
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(4);
    });

    it('Should restart from zero if reset connection checker', async function () {
        await checkConnectionXTimes(4);
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(1);
        connectionChecker.resetState();
        await checkConnectionXTimes(2);
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(1);
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(2);
        expect(opfabInterfaceStub.cardSend.data.disconnected).toEqual('ENTITY1 Name');
        expect(opfabInterfaceStub.cardSend.entityRecipients).toEqual(['ENTITY2']);
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(2);
    });

    it('Should send a card after 3 times disconnected ENTITY1 with 2 error in get user connected ', async function () {
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(0);
        opfabInterfaceStub.isResponseValid = false;
        await checkConnectionXTimes(2);
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(0);
        opfabInterfaceStub.isResponseValid = true;
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(0);
        await connectionChecker.checkConnection();
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(1);
        expect(opfabInterfaceStub.cardSend.data.disconnected).toEqual('ENTITY1 Name');
        expect(opfabInterfaceStub.cardSend.entityRecipients).toEqual(['ENTITY2']);
        expect(opfabInterfaceStub.cardSend.data.minutes).toEqual(6);
    });

    it('Should send 2 cards after 3 times when connected user has no entities', async function () {
        opfabInterfaceStub.userConnected = [
            {login: 'operator4', groups: ['Readonly', 'Dispatcher'], entitiesConnected: []}
        ];
        await checkConnectionXTimes(3);
        expect(opfabInterfaceStub.numberOfCardSend).toEqual(2);
    });
});
