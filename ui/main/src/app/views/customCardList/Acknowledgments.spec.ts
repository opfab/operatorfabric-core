/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CustomScreenService} from '@ofServices/customScreen/CustomScreenService';
import {
    getOneCard,
    getOneLightCard,
    sendLightCard,
    sendLightCards,
    setEntities,
    setProcessConfiguration,
    setUserPerimeter
} from '@tests/helpers';
import {RoleEnum} from '@ofServices/entities/model/RoleEnum';
import {RightEnum} from '@ofServices/perimeters/model/Perimeter';
import {ComputedPerimeter} from '@ofServices/users/model/UserWithPerimeters';
import {AcknowledgmentAllowedEnum, Process, State} from '@ofServices/processes/model/Processes';
import {Acknowledgments} from './Acknowledgments';
import {AcknowledgeServerMock} from '@tests/mocks/AcknowledgmentServer.mock';
import {AcknowledgeService} from '@ofServices/acknowlegment/AcknowledgeService';

describe('CustomCardListView - Acknowledgment', () => {
    beforeEach(async () => {
        CustomScreenService.clearCustomScreenDefinitions();
        setEntities([
            {
                id: 'entity1',
                name: 'entity1 name',
                roles: [RoleEnum.CARD_SENDER]
            }
        ]);
        await setUserPerimeter({
            computedPerimeters: [new ComputedPerimeter('myProcess', 'myState', RightEnum.ReceiveAndWrite)],
            userData: {
                login: 'test',
                firstName: 'firstName',
                lastName: 'lastName',
                entities: ['entity1']
            }
        });
        const myState = new State();
        myState.response = {state: 'myState'};

        const stateWithNoAcknowledgment = new State();
        stateWithNoAcknowledgment.acknowledgmentAllowed = AcknowledgmentAllowedEnum.NEVER;

        const statesList = new Map();
        statesList.set('myState', myState);
        statesList.set('myStateWithNoAcknowledgment', stateWithNoAcknowledgment);

        const process = [new Process('myProcess', '1', 'my process label', null, statesList)];
        setProcessConfiguration(process);
    });
    const customScreenDefinition = {
        id: 'testId',
        name: 'name',
        processIds: [],
        headerFilters: [],
        results: {
            columns: []
        },
        showAcknowledgmentButton: true
    };

    it('isAcknowledgmentPossible should be true if user is allowed to acknowledge ', async () => {
        const acknowledgments = new Acknowledgments(customScreenDefinition);

        const card = getOneLightCard({
            publisher: 'entity0',
            publisherType: 'ENTITY',
            process: 'myProcess',
            state: 'myState',
            id: 'id1'
        });
        sendLightCard(card);
        const resultTable = acknowledgments.addAcknowledgmentPossibleForCardToResults([{cardId: 'id1'}]);
        expect(resultTable).toEqual([{cardId: 'id1', isAcknowledgmentPossible: true}]);
    });
    it('isAcknowledgmentPossible should be false if user is not allowed to acknowledge', async () => {
        const acknowledgments = new Acknowledgments(customScreenDefinition);

        const card = getOneLightCard({
            publisher: 'entity0',
            publisherType: 'ENTITY',
            process: 'myProcess',
            state: 'myStateWithNoAcknowledgment',
            id: 'id1'
        });

        sendLightCard(card);
        const resultTable = acknowledgments.addAcknowledgmentPossibleForCardToResults([{cardId: 'id1'}]);
        expect(resultTable).toEqual([{cardId: 'id1', isAcknowledgmentPossible: false}]);
    });
    it('Should acknowledge cards', async () => {
        const acknowledgmentsServerMock = new AcknowledgeServerMock();
        AcknowledgeService.setAcknowledgeServer(acknowledgmentsServerMock);
        const acknowledgments = new Acknowledgments(customScreenDefinition);
        const cards = [
            getOneCard({
                publisher: 'entity0',
                publisherType: 'ENTITY',
                process: 'myProcess',
                state: 'myState',
                id: 'id1',
                uid: 'uid1'
            }),
            getOneCard({
                publisher: 'entity0',
                publisherType: 'ENTITY',
                process: 'myProcess',
                state: 'myState',
                id: 'id2',
                uid: 'uid2'
            })
        ];
        sendLightCards(cards);
        acknowledgments.sendAcknowledgments(['id1', 'id2']);
        expect(acknowledgmentsServerMock.ackPosted).toEqual([
            {cardUid: 'uid1', entitiesAcks: ['entity1']},
            {cardUid: 'uid2', entitiesAcks: ['entity1']}
        ]);
    });
});
