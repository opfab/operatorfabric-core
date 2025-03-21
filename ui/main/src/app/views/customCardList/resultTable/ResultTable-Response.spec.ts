/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CustomScreenService} from '@ofServices/customScreen/CustomScreenService';
import {getOneLightCard, mockTranslation, setEntities, setProcessConfiguration, setUserPerimeter} from '@tests/helpers';
import {RoleEnum} from '@ofServices/entities/model/RoleEnum';
import {RightEnum} from '@ofServices/perimeters/model/Perimeter';
import {ComputedPerimeter} from '@ofServices/users/model/UserWithPerimeters';
import {Process, State} from '@ofServices/processes/model/Processes';
import {Card} from 'app/model/Card';
import {ResultTable} from './ResultTable';
import {FieldType} from '@ofServices/customScreen/model/CustomScreenDefinition';

describe('CustomCardListView - Result array - Response possible', () => {
    const emptyChildCardsList = new Map<string, Array<Card>>();
    let resultTable: ResultTable;
    let card: Card;

    beforeAll(async () => {
        mockTranslation();
        CustomScreenService.clearCustomScreenDefinitions();
        const myState = new State();
        myState.response = {state: 'myState'};
        const statesList = new Map();
        statesList.set('myState', myState);
        const process = [new Process('myProcess', '1', 'my process label', null, statesList)];
        await setProcessConfiguration(process);
        await setEntities([
            {
                id: 'entity1',
                name: 'entity1 name',
                roles: [RoleEnum.CARD_SENDER]
            }
        ]);

        resultTable = new ResultTable({
            id: 'testId',
            name: 'name',
            processIds: [],
            headerFilters: [],
            results: {
                columns: [
                    {
                        field: 'testField',
                        headerName: 'Process',
                        cardField: 'process',
                        fieldType: FieldType.STRING
                    }
                ]
            },
            responseButtons: [
                {
                    id: 'button1',
                    label: 'label1',
                    getUserResponses: undefined
                }
            ]
        });

        card = getOneLightCard({
            publisher: 'entity0',
            publisherType: 'ENTITY',
            process: 'myProcess',
            state: 'myState',
            entitiesAllowedToRespond: ['entity1'],
            id: 'id1'
        });
    });

    it('should be true if user is allowed to respond ', async () => {
        await setUserPerimeter({
            computedPerimeters: [new ComputedPerimeter('myProcess', 'myState', RightEnum.ReceiveAndWrite)],
            userData: {
                login: 'test',
                firstName: 'firstName',
                lastName: 'lastName',
                entities: ['entity1']
            }
        });

        const dataArray = resultTable.getDataArrayFromCards([card], emptyChildCardsList);
        expect(dataArray).toEqual([{cardId: 'id1', testField: 'myProcess', isResponsePossible: true}]);
    });
    it('should be false if user is not allowed to respond ', async () => {
        await setUserPerimeter({
            computedPerimeters: [],
            userData: {
                login: 'test',
                firstName: 'firstName',
                lastName: 'lastName',
                entities: ['entity1']
            }
        });
        const dataArray = resultTable.getDataArrayFromCards([card], emptyChildCardsList);
        expect(dataArray).toEqual([{cardId: 'id1', testField: 'myProcess', isResponsePossible: false}]);
    });
});
