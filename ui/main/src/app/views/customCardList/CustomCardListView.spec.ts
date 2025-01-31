/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CustomScreenDefinition, FieldType} from '@ofServices/customScreen/model/CustomScreenDefinition';
import {CustomCardListView} from './CustomCardListView';
import {CustomScreenService} from '@ofServices/customScreen/CustomScreenService';
import {OpfabEventStreamServerMock} from '@tests/mocks/opfab-event-stream.server.mock';
import {OpfabEventStreamService} from '@ofServices/events/OpfabEventStreamService';
import {OpfabStore} from '@ofStore/opfabStore';
import {getOneLightCard, setEntities, setProcessConfiguration, setUserPerimeter} from '@tests/helpers';
import {firstValueFrom} from 'rxjs';
import {FilteredLightCardsStore} from '@ofStore/lightcards/lightcards-feed-filter-store';
import {FilterType} from '@ofStore/lightcards/model/Filter';
import {RealTimeDomainService} from '@ofServices/realTimeDomain/RealTimeDomainService';
import {RoleEnum} from '@ofServices/entities/model/RoleEnum';
import {Severity} from 'app/model/Severity';
import {Process, State, TypeOfStateEnum} from '@ofServices/processes/model/Processes';

describe('CustomScreenView', () => {
    let opfabEventStreamServerMock: OpfabEventStreamServerMock;
    let filteredLightCardStore: FilteredLightCardsStore;

    beforeEach(() => {
        CustomScreenService.clearCustomScreenDefinitions();
        opfabEventStreamServerMock = new OpfabEventStreamServerMock();
        OpfabEventStreamService.setEventStreamServer(opfabEventStreamServerMock);
        OpfabStore.reset();
        RealTimeDomainService.init();
        RealTimeDomainService.setStartAndEndPeriod(0, new Date().valueOf() + 1000);
        filteredLightCardStore = OpfabStore.getFilteredLightCardStore();
    });
    it('should return false if custom screen defintion does not exist', () => {
        const customScreenDefinition = new CustomScreenDefinition();
        customScreenDefinition.id = 'testId';
        customScreenDefinition.name = 'testName';
        const customScreenView = new CustomCardListView('unexistingId');
        expect(customScreenView.isCustomScreenDefinitionExist()).toEqual(false);
    });
    it('should return true if custom screen definition exists', () => {
        const customScreenDefinition = new CustomScreenDefinition();
        customScreenDefinition.id = 'testId';
        customScreenDefinition.name = 'testName';
        CustomScreenService.addCustomScreenDefinition(customScreenDefinition);
        const customScreenView = new CustomCardListView('testId');
        expect(customScreenView.isCustomScreenDefinitionExist()).toEqual(true);
    });
    it('should return columDefinition for agGrid', () => {
        const customScreenDefinition = new CustomScreenDefinition();
        customScreenDefinition.id = 'testId';
        customScreenDefinition.name = 'testName';
        customScreenDefinition.results = {
            columns: [
                {
                    field: 'testField',
                    headerName: 'Process',
                    cardField: 'processId',
                    fieldType: FieldType.STRING,
                    flex: 2
                },
                {
                    field: 'testField2',
                    headerName: 'Start Date',
                    cardField: 'startDate',
                    fieldType: FieldType.DATE_AND_TIME,
                    flex: 1
                }
            ]
        };
        CustomScreenService.addCustomScreenDefinition(customScreenDefinition);
        const customScreenView = new CustomCardListView('testId');
        expect(customScreenView.getColumnsDefinitionForAgGrid()).toEqual([
            {field: 'testField', headerName: 'Process', type: 'default', flex: 2},
            {field: 'testField2', headerName: 'Start Date', type: 'default', flex: 1}
        ]);
    });
    it('should return data array from light cards store', async () => {
        // this is necessary to set the user perimeter for child card
        // to be processed correctly by the ligthcard store
        await setUserPerimeter({
            computedPerimeters: [],
            userData: {
                login: 'test',
                firstName: 'firstName',
                lastName: 'lastName',
                entities: []
            }
        });

        setEntities([
            {
                id: 'entity1',
                name: 'entity1 name',
                roles: [RoleEnum.CARD_SENDER]
            }
        ]);
        const customScreenDefinition = new CustomScreenDefinition();
        customScreenDefinition.id = 'testId';
        customScreenDefinition.results = {
            columns: [
                {
                    field: 'testField',
                    headerName: 'Process',
                    cardField: 'process',
                    fieldType: FieldType.STRING,
                    flex: 2
                },
                {
                    field: 'responses',
                    headerName: 'Responses',
                    fieldType: FieldType.RESPONSES
                }
            ]
        };
        CustomScreenService.addCustomScreenDefinition(customScreenDefinition);
        const customScreenView = new CustomCardListView('testId');

        const card = getOneLightCard({
            process: 'process1',
            state: 'state1',
            entitiesAllowedToRespond: ['entity1'],
            id: 'id1'
        });
        const childCard = getOneLightCard({
            process: 'process1',
            state: 'state1',
            parentCardId: 'id1',
            id: 'id2',
            publisher: 'entity1',
            severity: Severity.COMPLIANT
        });
        opfabEventStreamServerMock.sendLightCard(card);
        opfabEventStreamServerMock.sendLightCard(childCard);
        const result = await firstValueFrom(customScreenView.getResults());
        expect(result).toEqual([
            {
                cardId: 'id1',
                testField: 'process1',
                responses: [{name: 'entity1 name', color: 'green'}]
            }
        ]);
    });

    it('should convert data for export', async () => {
        const customScreenDefinition = new CustomScreenDefinition();
        customScreenDefinition.id = 'testId';
        customScreenDefinition.name = 'testName';
        customScreenDefinition.results = {
            columns: [
                {
                    field: 'testField',
                    headerName: 'TEST',
                    cardField: 'data',
                    fieldType: FieldType.STRING,
                    flex: 2
                },
                {
                    headerName: 'TYPE OF STATE',
                    fieldType: FieldType.TYPE_OF_STATE
                },
                {
                    headerName: 'ANSWERS',
                    fieldType: FieldType.RESPONSES
                }
            ]
        };
        CustomScreenService.addCustomScreenDefinition(customScreenDefinition);

        const states = new Map<string, State>();
        states.set('myState', {type: TypeOfStateEnum.INPROGRESS});
        const process = [new Process('myProcess', '1', null, null, states)];
        setProcessConfiguration(process);
        setEntities([
            {
                id: 'entity1',
                name: 'entity1 name',
                roles: [RoleEnum.CARD_SENDER]
            }
        ]);

        const customScreenView = new CustomCardListView('testId');

        const card = getOneLightCard({
            process: 'myProcess',
            state: 'myState',
            data: 'data1',

            entitiesAllowedToRespond: ['entity1'],
            id: 'id1'
        });

        const card2 = getOneLightCard({
            process: 'myProcess',
            state: 'myState',
            data: 'data2',
            entitiesAllowedToRespond: ['entity1'],
            id: 'id2'
        });
        opfabEventStreamServerMock.sendLightCard(card);
        opfabEventStreamServerMock.sendLightCard(card2);

        filteredLightCardStore.updateFilter(
            FilterType.BUSINESSDATE_FILTER,
            true,
            filteredLightCardStore.getBusinessDateFilter().status
        );
        await firstValueFrom(customScreenView.getResults());
        const result = customScreenView.getDataForExport();

        expect(result).toEqual([
            {TEST: 'data1', 'TYPE OF STATE': 'IN PROGRESS', ANSWERS: [{name: 'entity1 name', color: 'grey'}]},
            {TEST: 'data2', 'TYPE OF STATE': 'IN PROGRESS', ANSWERS: [{name: 'entity1 name', color: 'grey'}]}
        ]);
    });
});
