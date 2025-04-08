/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CustomScreenDefinition, FieldType} from '@ofServices/customScreen/model/CustomScreenDefinition';
import {ResultTable} from './ResultTable';
import {getOneLightCard, mockTranslation, setEntities, setProcessConfiguration} from '@tests/helpers';
import {Process, ReadAndAckEnum, State, TypeOfStateEnum} from '@ofServices/processes/model/Processes';
import {Card} from 'app/model/Card';
import {RoleEnum} from '@ofServices/entities/model/RoleEnum';
import {Severity} from 'app/model/Severity';
import {FilterValues} from '../FilterValues';

describe('CustomScreenView - ResultTable - Should Filter card', () => {
    const getResultTable = () => {
        const customScreenDefinition = new CustomScreenDefinition();
        customScreenDefinition.id = 'testId';
        customScreenDefinition.name = 'testName';
        customScreenDefinition.results = {
            columns: [
                {
                    field: 'testField',
                    headerName: 'Process',
                    cardField: 'process',
                    fieldType: FieldType.STRING
                }
            ]
        };
        return new ResultTable(customScreenDefinition);
    };

    const emptyChildCardsList = new Map<string, Array<Card>>();

    beforeAll(async () => {
        mockTranslation();
        await setEntities([
            {
                id: 'entity1',
                name: 'entity1 name',
                roles: [RoleEnum.CARD_SENDER]
            },
            {
                id: 'entity2',
                name: 'entity2 name',
                roles: [RoleEnum.CARD_SENDER]
            },
            {
                id: 'entity3',
                name: 'entity3 name',
                roles: [RoleEnum.CARD_SENDER]
            },
            {
                id: 'entity_not_allowed_to_send_card',
                name: 'entity not allowed to send card'
            },
            {
                id: 'parent_entity',
                name: 'parent entity'
            },
            {
                id: 'child_entity',
                name: 'child entity',
                roles: [RoleEnum.CARD_SENDER],
                parents: ['parent_entity']
            }
        ]);
    });
    describe('by read and acknowledged', () => {
        let cards = [];
        let resultTable: ResultTable;

        function setReadAndAckFilter(readAndAckFilter: string[]) {
            const filterValues = new FilterValues();
            filterValues.readAndAckFilter = readAndAckFilter;
            resultTable.setFilters(filterValues);
        }
        beforeEach(() => {
            resultTable = getResultTable();
            cards = [
                getOneLightCard({
                    process: 'processId0',
                    state: 'state1.0',
                    startDate: 5,
                    publishDate: 5,
                    hasBeenRead: false,
                    hasBeenAcknowledged: false,
                    id: 'id0'
                }),
                getOneLightCard({
                    process: 'processId0',
                    state: 'state1.1',
                    publishDate: 100,
                    startDate: 100,
                    hasBeenRead: true,
                    hasBeenAcknowledged: false,
                    id: 'id1'
                }),
                getOneLightCard({
                    process: 'processId1',
                    state: 'state2.0',
                    startDate: 1000,
                    hasBeenRead: false,
                    hasBeenAcknowledged: true,
                    id: 'id2'
                }),
                getOneLightCard({
                    process: 'processId1',
                    state: 'state2.1',
                    startDate: 1000,
                    hasBeenRead: true,
                    hasBeenAcknowledged: true,
                    id: 'id3'
                })
            ];
        });
        it('none', () => {
            setReadAndAckFilter([]);
            const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
            expect(dataArray).toEqual([
                {cardId: 'id0', testField: 'processId0'},
                {cardId: 'id1', testField: 'processId0'},
                {cardId: 'id2', testField: 'processId1'},
                {cardId: 'id3', testField: 'processId1'}
            ]);
        });
        it('only read', () => {
            setReadAndAckFilter([ReadAndAckEnum.READ]);
            const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
            expect(dataArray).toEqual([
                {cardId: 'id1', testField: 'processId0'},
                {cardId: 'id3', testField: 'processId1'}
            ]);
        });
        it('only not read', () => {
            setReadAndAckFilter([ReadAndAckEnum.NOT_READ]);
            const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
            expect(dataArray).toEqual([
                {cardId: 'id0', testField: 'processId0'},
                {cardId: 'id2', testField: 'processId1'}
            ]);
        });
        it('only acknowledged', () => {
            setReadAndAckFilter([ReadAndAckEnum.ACKNOWLEDGED]);
            const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
            expect(dataArray).toEqual([
                {cardId: 'id2', testField: 'processId1'},
                {cardId: 'id3', testField: 'processId1'}
            ]);
        });
        it('only not acknowledged', () => {
            setReadAndAckFilter([ReadAndAckEnum.NOT_ACKNOWLEDGED]);
            const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
            expect(dataArray).toEqual([
                {cardId: 'id0', testField: 'processId0'},
                {cardId: 'id1', testField: 'processId0'}
            ]);
        });
        it('all', () => {
            setReadAndAckFilter([
                ReadAndAckEnum.READ,
                ReadAndAckEnum.NOT_READ,
                ReadAndAckEnum.ACKNOWLEDGED,
                ReadAndAckEnum.NOT_ACKNOWLEDGED
            ]);
            const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
            expect(dataArray).toEqual([
                {cardId: 'id0', testField: 'processId0'},
                {cardId: 'id1', testField: 'processId0'},
                {cardId: 'id2', testField: 'processId1'},
                {cardId: 'id3', testField: 'processId1'}
            ]);
        });
        it('read and acknowledged', () => {
            setReadAndAckFilter([ReadAndAckEnum.READ, ReadAndAckEnum.ACKNOWLEDGED]);
            const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
            expect(dataArray).toEqual([{cardId: 'id3', testField: 'processId1'}]);
        });
        it('not read and not acknowledged', () => {
            setReadAndAckFilter([ReadAndAckEnum.NOT_READ, ReadAndAckEnum.NOT_ACKNOWLEDGED]);
            const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
            expect(dataArray).toEqual([{cardId: 'id0', testField: 'processId0'}]);
        });
    });
    it('by business period startDate', () => {
        const resultTable = getResultTable();
        const filterValues = new FilterValues();
        filterValues.startDate = 10;
        filterValues.endDate = 200;
        resultTable.setFilters(filterValues);
        const cards = [
            getOneLightCard({
                process: 'processId0',
                startDate: 5,
                id: 'id0'
            }),
            getOneLightCard({
                process: 'processId1',
                startDate: 100,
                id: 'id1'
            }),
            getOneLightCard({
                process: 'processId2',
                startDate: 1000,
                id: 'id2'
            })
        ];
        const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
        expect(dataArray).toEqual([{cardId: 'id1', testField: 'processId1'}]);
    });

    it('by business period startDate and endDate', () => {
        const resultTable = getResultTable();
        const filterValues = new FilterValues();
        filterValues.startDate = 10;
        filterValues.endDate = 200;
        resultTable.setFilters(filterValues);
        const cards = [
            getOneLightCard({
                process: 'processId0',
                startDate: 5,
                endDate: 50,
                id: 'id0'
            }),
            getOneLightCard({
                process: 'processId1',
                startDate: 5,
                endDate: 8,
                id: 'id1'
            }),
            getOneLightCard({
                process: 'processId2',
                startDate: 5,
                endDate: 2000,
                id: 'id2'
            })
        ];
        const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
        expect(dataArray).toEqual([
            {cardId: 'id0', testField: 'processId0'},
            {cardId: 'id2', testField: 'processId2'}
        ]);
    });

    it('by process', () => {
        const resultTable = getResultTable();
        const filterValues = new FilterValues();
        filterValues.processes = ['processId1', 'processId2'];
        resultTable.setFilters(filterValues);
        const cards = [
            getOneLightCard({
                process: 'processId0',
                startDate: 5,
                id: 'id0'
            }),
            getOneLightCard({
                process: 'processId1',
                startDate: 100,
                id: 'id1'
            }),
            getOneLightCard({
                process: 'processId2',
                startDate: 1000,
                id: 'id2'
            })
        ];
        const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
        expect(dataArray).toEqual([
            {cardId: 'id1', testField: 'processId1'},
            {cardId: 'id2', testField: 'processId2'}
        ]);
    });
    it('by type of state', async () => {
        const resultTable = getResultTable();
        const states = new Map<string, State>();
        states.set('state1.0', {type: TypeOfStateEnum.INPROGRESS});
        states.set('state1.1', {type: TypeOfStateEnum.FINISHED});
        const states2 = new Map<string, State>();
        states2.set('state2.0', {type: TypeOfStateEnum.CANCELED});
        states2.set('state2.1', {type: undefined});
        const process = [
            new Process('processId0', '1', null, null, states),
            new Process('processId1', '1', null, null, states2)
        ];

        await setProcessConfiguration(process);

        const cards = [
            getOneLightCard({
                process: 'processId0',
                state: 'state1.0',
                startDate: 5,
                id: 'id0'
            }),
            getOneLightCard({
                process: 'processId0',
                state: 'state1.1',
                startDate: 100,
                id: 'id1'
            }),
            getOneLightCard({
                process: 'processId1',
                state: 'state2.0',
                startDate: 1000,
                id: 'id2'
            }),
            getOneLightCard({
                process: 'processId1',
                state: 'state2.1',
                startDate: 1000,
                id: 'id3'
            })
        ];
        const filterValues = new FilterValues();
        filterValues.typesOfStateFilter = [TypeOfStateEnum.INPROGRESS, TypeOfStateEnum.FINISHED];
        resultTable.setFilters(filterValues);
        const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
        expect(dataArray).toEqual([
            {cardId: 'id0', testField: 'processId0'},
            {cardId: 'id1', testField: 'processId0'}
        ]);
    });
    it('by excluded states', async () => {
        const resultTable = getResultTable();
        const states = new Map<string, State>();
        states.set('state1.0', {});
        states.set('state1.1', {});
        const states2 = new Map<string, State>();
        states2.set('state2.0', {});
        const process = [
            new Process('processId0', '1', null, null, states),
            new Process('processId1', '1', null, null, states2)
        ];

        await setProcessConfiguration(process);

        const cards = [
            getOneLightCard({
                process: 'processId0',
                state: 'state1.0',
                startDate: 5,
                id: 'id0'
            }),
            getOneLightCard({
                process: 'processId0',
                state: 'state1.1',
                startDate: 100,
                id: 'id1'
            }),
            getOneLightCard({
                process: 'processId1',
                state: 'state2.0',
                startDate: 1000,
                id: 'id2'
            })
        ];
        const filterValues = new FilterValues();
        filterValues.statesToExcludeFilter = [{processId: 'processId0', stateIds: ['state1.0']}];
        resultTable.setFilters(filterValues);

        const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
        expect(dataArray).toEqual([
            {cardId: 'id1', testField: 'processId0'},
            {cardId: 'id2', testField: 'processId1'}
        ]);
    });
    it('that have responses from my entities if excludeCardsWithResponseFromMyEntities is called', () => {
        const resultTable = getResultTable();
        const cards = [
            getOneLightCard({
                process: 'processId0',
                state: 'state1.0',
                hasChildCardFromCurrentUserEntity: true,
                id: 'id0'
            }),
            getOneLightCard({
                process: 'processId0',
                state: 'state1.1',
                hasChildCardFromCurrentUserEntity: false,
                startDate: 100,
                id: 'id1'
            })
        ];

        const filterValues = new FilterValues();
        filterValues.includeCardsWithResponseFromMyEntities = false;
        resultTable.setFilters(filterValues);
        const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
        expect(dataArray).toEqual([{cardId: 'id1', testField: 'processId0'}]);
    });
    it('that have all entities entitiesRequiredToRespond responded if excludeCardsWithAllEntitiesHaveResponded is called', () => {
        const resultTable = getResultTable();
        const cards = [
            getOneLightCard({
                process: 'processId1',
                state: 'state1.0',
                entitiesRequiredToRespond: ['entity1', 'entity2'],
                id: 'card1'
            }),
            getOneLightCard({
                process: 'processId2',
                state: 'state1.1',
                entitiesRequiredToRespond: ['entity1', 'entity2'],
                id: 'card2'
            }),
            getOneLightCard({
                process: 'processId3',
                state: 'state1.2',
                entitiesRequiredToRespond: [],
                id: 'card3'
            })
        ];
        const childCards = new Map<string, Array<Card>>();
        childCards.set('card1', [
            getOneLightCard({
                publisher: 'entity1',
                publisherType: 'ENTITY',
                severity: Severity.ALARM
            }),
            getOneLightCard({
                publisher: 'entity2',
                publisherType: 'ENTITY',
                severity: Severity.ACTION
            })
        ]);
        childCards.set('card2', [
            getOneLightCard({
                publisher: 'entity1',
                publisherType: 'ENTITY',
                severity: Severity.COMPLIANT
            })
        ]);
        const filterValues = new FilterValues();
        filterValues.includeCardsWithResponsesFromAllEntities = false;
        resultTable.setFilters(filterValues);
        const dataArray = resultTable.getDataArrayFromCards(cards, childCards);
        expect(dataArray).toEqual([
            {
                cardId: 'card2',
                testField: 'processId2'
            },
            {
                cardId: 'card3',
                testField: 'processId3'
            }
        ]);
    });
    it('that have all entities in entitiesAllowedToRespond responded if entitiesRequiredToRespond is empty and excludeCardsWithAllEntitiesHaveResponded is called', () => {
        const resultTable = getResultTable();
        const cards = [
            getOneLightCard({
                process: 'processId1',
                state: 'state1.0',
                entitiesAllowedToRespond: ['entity1', 'entity2'],
                id: 'card1'
            }),
            getOneLightCard({
                process: 'processId2',
                state: 'state1.1',
                entitiesAllowedToRespond: ['entity1', 'entity2'],
                id: 'card2'
            })
        ];
        const childCards = new Map<string, Array<Card>>();
        childCards.set('card1', [
            getOneLightCard({
                publisher: 'entity1',
                publisherType: 'ENTITY',
                severity: Severity.ALARM
            }),
            getOneLightCard({
                publisher: 'entity2',
                publisherType: 'ENTITY',
                severity: Severity.ACTION
            })
        ]);
        childCards.set('card2', [
            getOneLightCard({
                publisher: 'entity1',
                publisherType: 'ENTITY',
                severity: Severity.COMPLIANT
            })
        ]);
        const filterValues = new FilterValues();
        filterValues.includeCardsWithResponsesFromAllEntities = false;
        resultTable.setFilters(filterValues);
        const dataArray = resultTable.getDataArrayFromCards(cards, childCards);
        expect(dataArray).toEqual([
            {
                cardId: 'card2',
                testField: 'processId2'
            }
        ]);
    });
});
