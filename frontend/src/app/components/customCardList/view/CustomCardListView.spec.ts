/* Copyright (c) 2025-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CustomCardListView} from './CustomCardListView';
import {CustomScreenService} from '@ofServices/customScreen/CustomScreenService';
import {
    getOneLightCard,
    mockTranslation,
    resetServices,
    sendLightCards,
    setEntities,
    setProcessConfiguration,
    setUserPerimeter
} from '@tests/helpers';
import {firstValueFrom} from 'rxjs';
import {RoleEnum} from '@ofServices/entities/model/RoleEnum';
import {Severity} from 'app/model/Severity';
import {Process, State, TypeOfStateEnum} from '@ofServices/processes/model/Processes';
import {RightEnum} from '@ofServices/perimeters/model/Perimeter';
import {ComputedPerimeter} from '@ofServices/users/model/UserWithPerimeters';
import {FilterValues} from '../../../services/customScreen/cardList/FilterValues';
import {OpfabStore} from '@ofStore/OpfabStore';
import {OpfabEventStreamService} from '@ofServices/events/OpfabEventStreamService';
import {OpfabEventStreamServerMock} from '@tests/mocks/opfab-event-stream.server.mock';
import {RealTimeDomainService} from '@ofServices/realTimeDomain/RealTimeDomainService';
import {BusinessPeriodInitState} from '../../customScreen/BusinessPeriodInitState';
import {
    CardListScreenDefinition,
    FieldType,
    HeaderFilter
} from '@ofServices/customScreen/cardList/CardListScreenDefinition';

describe('CustomCardListView', () => {
    const getCardListScreenDefinition = () => {
        const cardListScreenDefinition = new CardListScreenDefinition();
        cardListScreenDefinition.id = 'testId';
        cardListScreenDefinition.name = 'testName';
        return cardListScreenDefinition;
    };

    beforeAll(() => {
        resetServices();
        mockTranslation();

        // init necessary as the constructor of CustomCardListView call the store via RealTimeDomainService
        const opfabEventStreamServerMock = new OpfabEventStreamServerMock();
        OpfabEventStreamService.setEventStreamServer(opfabEventStreamServerMock);
        OpfabStore.reset();
        RealTimeDomainService.init();
    });

    beforeEach(() => {
        CustomScreenService.clearCustomScreenDefinitions();
    });
    describe('Custom screen configuration', () => {
        it('should return false if custom screen definition does not exist', () => {
            const customScreenView = new CustomCardListView('unexistingId');
            expect(customScreenView.isCardListScreenDefinitionExist()).toEqual(false);
        });
        it('should return true if custom screen definition exists', () => {
            CustomScreenService.addCustomScreenDefinition(getCardListScreenDefinition());
            const customScreenView = new CustomCardListView('testId');
            expect(customScreenView.isCardListScreenDefinitionExist()).toEqual(true);
        });
        it('filter visibility should be true if custom screen header filter PROCESS is define visible in customScreenDefinition', () => {
            const customScreenDefinition = getCardListScreenDefinition();
            customScreenDefinition.headerFilters = [HeaderFilter.PROCESS];
            CustomScreenService.addCustomScreenDefinition(customScreenDefinition);
            const customScreenView = new CustomCardListView('testId');
            expect(customScreenView.isFilterVisibleInHeader(HeaderFilter.PROCESS)).toEqual(true);
        });
        it('filter visibility should be false if custom screen header filter  PROCESS is not define visible in customScreenDefinition', () => {
            const customScreenDefinition = getCardListScreenDefinition();
            customScreenDefinition.headerFilters = [HeaderFilter.TYPE_OF_STATE];
            CustomScreenService.addCustomScreenDefinition(customScreenDefinition);
            const customScreenView = new CustomCardListView('testId');
            expect(customScreenView.isFilterVisibleInHeader(HeaderFilter.PROCESS)).toEqual(false);
        });
    });
    describe('Should get processes list', () => {
        beforeEach(async () => {
            const process = [
                new Process('myProcess', '1', 'my process label', null, new Map<string, State>()),
                new Process('myProcess2', '2', 'my process label 2', null, new Map<string, State>())
            ];
            await setProcessConfiguration(process);
        });

        it('with one process from user perimeter if user has one process', async () => {
            const customScreenDefinition = getCardListScreenDefinition();
            CustomScreenService.addCustomScreenDefinition(customScreenDefinition);

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
            const customScreenView = new CustomCardListView('testId');
            const result = customScreenView.getAllProcessesListAvailableForUser();
            expect(result).toEqual([{id: 'myProcess', label: 'my process label'}]);
        });

        it('with two processes from user perimeter if user has two process state visible', async () => {
            const customScreenDefinition = getCardListScreenDefinition();
            CustomScreenService.addCustomScreenDefinition(customScreenDefinition);

            await setUserPerimeter({
                computedPerimeters: [
                    new ComputedPerimeter('myProcess', 'myState', RightEnum.Receive),
                    new ComputedPerimeter('myProcess2', 'myState', RightEnum.Receive)
                ],
                userData: {
                    login: 'test',
                    firstName: 'firstName',
                    lastName: 'lastName',
                    entities: []
                }
            });
            const customScreenView = new CustomCardListView('testId');
            const result = customScreenView.getAllProcessesListAvailableForUser();
            expect(result).toEqual([
                {id: 'myProcess', label: 'my process label'},
                {id: 'myProcess2', label: 'my process label 2'}
            ]);
        });

        it(
            'with two processes from user perimeter if user has two process state visible and customScreenDefinition ' +
                'defines processIds field but it is an empty array',
            async () => {
                const customScreenDefinition = getCardListScreenDefinition();
                customScreenDefinition.processIds = [];
                CustomScreenService.addCustomScreenDefinition(customScreenDefinition);

                await setUserPerimeter({
                    computedPerimeters: [
                        new ComputedPerimeter('myProcess', 'myState', RightEnum.Receive),
                        new ComputedPerimeter('myProcess2', 'myState', RightEnum.Receive)
                    ],
                    userData: {
                        login: 'test',
                        firstName: 'firstName',
                        lastName: 'lastName',
                        entities: []
                    }
                });
                const customScreenView = new CustomCardListView('testId');
                const result = customScreenView.getAllProcessesListAvailableForUser();
                expect(result).toEqual([
                    {id: 'myProcess', label: 'my process label'},
                    {id: 'myProcess2', label: 'my process label 2'}
                ]);
            }
        );

        it(
            'with one process from user perimeter if user has two process state visible but customScreenDefinition ' +
                'restricts the processes list to myProcess',
            async () => {
                await setUserPerimeter({
                    computedPerimeters: [
                        new ComputedPerimeter('myProcess', 'myState', RightEnum.Receive),
                        new ComputedPerimeter('myProcess2', 'myState', RightEnum.Receive)
                    ],
                    userData: {
                        login: 'test',
                        firstName: 'firstName',
                        lastName: 'lastName',
                        entities: []
                    }
                });
                const customScreenDefinition = getCardListScreenDefinition();
                customScreenDefinition.processIds = ['myProcess'];
                CustomScreenService.addCustomScreenDefinition(customScreenDefinition);
                const customScreenView = new CustomCardListView('testId');
                const result = customScreenView.getAllProcessesListAvailableForUser();
                expect(result).toEqual([{id: 'myProcess', label: 'my process label'}]);
            }
        );
    });
    describe('Should return custom screen data', () => {
        beforeEach(async () => {
            const myState = new State();
            myState.response = {state: 'state1'};
            myState.type = TypeOfStateEnum.INPROGRESS;

            const statesList = new Map();
            statesList.set('state1', myState);

            const process = [new Process('process1', '1', 'my process label', null, statesList)];
            await setProcessConfiguration(process);

            await setEntities([
                {
                    id: 'entity1',
                    name: 'entity1 name',
                    roles: [RoleEnum.CARD_SENDER]
                }
            ]);

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
        });

        it('from light cards store', async () => {
            const customScreenDefinition = getCardListScreenDefinition();
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

            const card = getOneLightCard({
                process: 'process1',
                state: 'state1',
                entitiesAllowedToRespond: ['entity1'],
                id: 'id1',
                startDate: Date.now()
            });
            const childCard = getOneLightCard({
                process: 'process1',
                state: 'state1',
                parentCardId: 'id1',
                id: 'id2',
                publisher: 'entity1',
                severity: Severity.COMPLIANT,
                startDate: Date.now()
            });
            sendLightCards([card, childCard]);

            const customScreenView = new CustomCardListView('testId');

            const result = await firstValueFrom(customScreenView.getResults());
            expect(result).toEqual([
                {
                    cardId: 'id1',
                    testField: 'process1',
                    responses: {value: [{entityName: 'entity1 name', color: 'green'}]}
                }
            ]);
            // Prevent occasional error: "An error was thrown in afterAll Error: executing a canceled action"
            // Ensure the observable is properly closed to avoid lingering subscriptions
            customScreenView.destroy();
        });

        it('filtered from light cards store', async () => {
            const customScreenDefinition = getCardListScreenDefinition();
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
            sendLightCards([card, childCard]);

            const customScreenView = new CustomCardListView('testId');

            const filterValues = new FilterValues();
            filterValues.processes = ['process1'];
            customScreenView.setFilters(filterValues);
            customScreenView.search();
            const result = await firstValueFrom(customScreenView.getResults());
            expect(result).toEqual([
                {
                    cardId: 'id1',
                    testField: 'process1'
                }
            ]);
            // Prevent occasional error: "An error was thrown in afterAll Error: executing a canceled action"
            // Ensure the observable is properly closed to avoid lingering subscriptions
            customScreenView.destroy();
        });
    });

    describe('GIVEN initialBusinessPeriod is set to FROM_TODAY_TO_YEAR_END', () => {
        const SCREEN_ID = 'testFromTodayId';

        const getCardListScreenDefinitionWithFromTodayToYearEnd = () => {
            const def = new CardListScreenDefinition();
            def.id = SCREEN_ID;
            def.name = 'testFromToday';
            def.initialBusinessPeriod = 'FROM_TODAY_TO_YEAR_END';
            return def;
        };

        beforeEach(() => {
            BusinessPeriodInitState.reset();
        });

        it('WHEN custom card list is created THEN business period is set from today to year end', () => {
            CustomScreenService.addCustomScreenDefinition(getCardListScreenDefinitionWithFromTodayToYearEnd());

            const view = new CustomCardListView(SCREEN_ID);
            const domain = view.getBusinessPeriod();
            const today = new Date();

            const start = new Date(domain.startDate);
            const end = new Date(domain.endDate);

            expect(start.getFullYear()).toEqual(today.getFullYear());
            expect(start.getMonth()).toEqual(today.getMonth());
            expect(start.getDate()).toEqual(today.getDate());
            expect(start.getHours()).toEqual(0);
            expect(start.getMinutes()).toEqual(0);

            expect(end.getFullYear()).toEqual(today.getFullYear());
            expect(end.getMonth()).toEqual(11); // December
            expect(end.getDate()).toEqual(31);
            expect(end.getHours()).toEqual(23);
            expect(end.getMinutes()).toEqual(59);

            view.destroy();
        });

        it('WHEN user changes business period and reopen the custom card list screen THEN FROM_TODAY_TO_YEAR_END is not reapplied', () => {
            CustomScreenService.addCustomScreenDefinition(getCardListScreenDefinitionWithFromTodayToYearEnd());

            // First open: sets the period and the deactivation flag
            BusinessPeriodInitState.reset();
            const view1 = new CustomCardListView(SCREEN_ID);
            view1.destroy();

            // Simulate user changing the period
            const customStart = new Date(2020, 0, 1).getTime();
            const customEnd = new Date(2020, 11, 31).getTime();
            RealTimeDomainService.setStartAndEndPeriod(customStart, customEnd);

            // Second open: session flag is set, FROM_TODAY_TO_YEAR_END should not be re-applied
            const view2 = new CustomCardListView(SCREEN_ID);
            const domain = view2.getBusinessPeriod();

            expect(domain.startDate).toEqual(customStart);
            expect(domain.endDate).toEqual(customEnd);

            view2.destroy();
        });
    });
});
