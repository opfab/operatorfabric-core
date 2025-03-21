/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CustomScreenService} from '@ofServices/customScreen/CustomScreenService';
import {getOneCard, sendLightCards, setEntities, setUserPerimeter} from '@tests/helpers';
import {RightEnum} from '@ofServices/perimeters/model/Perimeter';
import {ComputedPerimeter} from '@ofServices/users/model/UserWithPerimeters';
import {AcknowledgeServerMock} from '@tests/mocks/AcknowledgmentServer.mock';
import {AcknowledgeService} from '@ofServices/acknowlegment/AcknowledgeService';
import {ButtonActions} from './ButtonActions';

describe('CustomCardListView - Button actions', () => {
    beforeEach(async () => {
        CustomScreenService.clearCustomScreenDefinitions();
        await setEntities([
            {
                id: 'entity1',
                name: 'entity1 name'
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
    });
    const customScreenDefinition = {
        id: 'testId',
        name: 'name',
        processIds: [],
        headerFilters: [],
        results: {
            columns: []
        }
    };

    it('Should acknowledge cards', async () => {
        const acknowledgmentsServerMock = new AcknowledgeServerMock();
        AcknowledgeService.setAcknowledgeServer(acknowledgmentsServerMock);
        const buttonActions = new ButtonActions(customScreenDefinition);
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
        buttonActions.sendAcknowledgments(['id1', 'id2']);
        expect(acknowledgmentsServerMock.ackPosted).toEqual([
            {cardUid: 'uid1', entitiesAcks: ['entity1']},
            {cardUid: 'uid2', entitiesAcks: ['entity1']}
        ]);
    });
});
