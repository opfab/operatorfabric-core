/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CustomScreenDefinition, FieldType, HeaderFilter} from '@ofServices/customScreen/model/CustomScreenDefinition';
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
import {RightEnum} from '@ofServices/perimeters/model/Perimeter';
import {ComputedPerimeter} from '@ofServices/users/model/UserWithPerimeters';
import {TranslationService} from '@ofServices/translation/TranslationService';
import {TranslationLibMock} from '@tests/mocks/TranslationLib.mock';

describe('CustomScreenView', () => {
    let opfabEventStreamServerMock: OpfabEventStreamServerMock;
    let filteredLightCardStore: FilteredLightCardsStore;

    const getCustomScreenDefintion = () => {
        const customScreenDefinition = new CustomScreenDefinition();
        customScreenDefinition.id = 'testId';
        customScreenDefinition.name = 'testName';
        return customScreenDefinition;
    };

    beforeAll(() => {
        TranslationService.setTranslationLib(new TranslationLibMock());
    });

    beforeEach(() => {
        CustomScreenService.clearCustomScreenDefinitions();
        opfabEventStreamServerMock = new OpfabEventStreamServerMock();
        OpfabEventStreamService.setEventStreamServer(opfabEventStreamServerMock);
        OpfabStore.reset();
        RealTimeDomainService.init();
        RealTimeDomainService.setStartAndEndPeriod(0, new Date().valueOf() + 1000);
        filteredLightCardStore = OpfabStore.getFilteredLightCardStore();
    });
    describe('custom screen configuration', () => {
        it('should return false if custom screen definition does not exist', () => {
            const customScreenView = new CustomCardListView('unexistingId');
            expect(customScreenView.isCustomScreenDefinitionExist()).toEqual(false);
        });
        it('should return true if custom screen definition exists', () => {
            CustomScreenService.addCustomScreenDefinition(getCustomScreenDefintion());
            const customScreenView = new CustomCardListView('testId');
            expect(customScreenView.isCustomScreenDefinitionExist()).toEqual(true);
        });
        it('should return true if custom screen header filter PROCESS is define visible in customScreenDefinition', () => {
            const customScreenDefinition = getCustomScreenDefintion();
            customScreenDefinition.headerFilters = [HeaderFilter.PROCESS];
            CustomScreenService.addCustomScreenDefinition(customScreenDefinition);
            const customScreenView = new CustomCardListView('testId');
            expect(customScreenView.isFilterVisibleInHeader(HeaderFilter.PROCESS)).toEqual(true);
        });
        it('should return false if custom screen header filter  PROCESS is not define visible in customScreenDefinition', () => {
            const customScreenDefinition = getCustomScreenDefintion();
            customScreenDefinition.headerFilters = [HeaderFilter.TYPE_OF_STATE];
            CustomScreenService.addCustomScreenDefinition(customScreenDefinition);
            const customScreenView = new CustomCardListView('testId');
            expect(customScreenView.isFilterVisibleInHeader(HeaderFilter.PROCESS)).toEqual(false);
        });

        it('should return columDefinition for agGrid', () => {
            const customScreenDefinition = getCustomScreenDefintion();
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
    });
    describe('processes', () => {
        beforeEach(() => {
            const process = [
                new Process('myProcess', '1', 'my process label', null, new Map<string, State>()),
                new Process('myProcess2', '2', null, null, new Map<string, State>())
            ];
            setProcessConfiguration(process);
        });

        it('should return one process from user perimeter if user has one process state visible', async () => {
            const customScreenDefinition = getCustomScreenDefintion();
            CustomScreenService.addCustomScreenDefinition(customScreenDefinition);
            const customScreenView = new CustomCardListView('testId');

            await setUserPerimeter({
                computedPerimeters: [new ComputedPerimeter('myProcess', 'myState', RightEnum.Receive)],
                userData: {
                    login: 'test',
                    firstName: 'firstName',
                    lastName: 'lastName',
                    entities: []
                }
            });
            const result = customScreenView.getProcessList();
            expect(result).toEqual([{id: 'myProcess', label: 'my process label'}]);
        });
        it('should return one process form user perimeter if user has one process with 2 states visible', async () => {
            const customScreenDefinition = getCustomScreenDefintion();
            CustomScreenService.addCustomScreenDefinition(customScreenDefinition);
            const customScreenView = new CustomCardListView('testId');

            await setUserPerimeter({
                computedPerimeters: [
                    new ComputedPerimeter('myProcess', 'myState', RightEnum.Receive),
                    new ComputedPerimeter('myProcess', 'myState2', RightEnum.Receive)
                ],
                userData: {
                    login: 'test',
                    firstName: 'firstName',
                    lastName: 'lastName',
                    entities: []
                }
            });
            const result = customScreenView.getProcessList();
            expect(result).toEqual([{id: 'myProcess', label: 'my process label'}]);
        });
    });
    describe(' custom screen data', () => {
        beforeEach(() => {
            setEntities([
                {
                    id: 'entity1',
                    name: 'entity1 name',
                    roles: [RoleEnum.CARD_SENDER]
                }
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

            const customScreenDefinition = getCustomScreenDefintion();
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

        it('should return data array filtered from light cards store', async () => {
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

            const customScreenDefinition = getCustomScreenDefintion();
            customScreenDefinition.results = {
                columns: [
                    {
                        field: 'testField',
                        headerName: 'Process',
                        cardField: 'process',
                        fieldType: FieldType.STRING,
                        flex: 2
                    }
                ]
            };
            CustomScreenService.addCustomScreenDefinition(customScreenDefinition);
            const customScreenView = new CustomCardListView('testId');

            const card = getOneLightCard({
                process: 'process1',
                state: 'state1',
                id: 'id1'
            });
            const childCard = getOneLightCard({
                process: 'process2',
                state: 'state1',
                id: 'id2'
            });
            opfabEventStreamServerMock.sendLightCard(card);
            opfabEventStreamServerMock.sendLightCard(childCard);
            customScreenView.setProcessList(['process1']);
            customScreenView.search();
            const result = await firstValueFrom(customScreenView.getResults());
            expect(result).toEqual([
                {
                    cardId: 'id1',
                    testField: 'process1'
                }
            ]);
        });

        it('should convert data for export', async () => {
            const customScreenDefinition = getCustomScreenDefintion();
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
                {
                    TEST: 'data1',
                    'TYPE OF STATE': 'Translation (en) of shared.typeOfState.INPROGRESS',
                    ANSWERS: [{name: 'entity1 name', color: 'grey'}]
                },
                {
                    TEST: 'data2',
                    'TYPE OF STATE': 'Translation (en) of shared.typeOfState.INPROGRESS',
                    ANSWERS: [{name: 'entity1 name', color: 'grey'}]
                }
            ]);
        });
    });
});
