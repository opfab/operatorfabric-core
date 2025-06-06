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
import {Card} from 'app/model/Card';
import {RoleEnum} from '@ofServices/entities/model/RoleEnum';
import {Process, State, TypeOfStateEnum} from '@ofServices/processes/model/Processes';
import {Severity} from 'app/model/Severity';

describe('CustomScreenView - ResultTable - Export', () => {
    const getResultTable = (customScreenDefinitionResults: any, responseSeverityColumnLabelsForExportFile?) => {
        const customScreenDefinition = new CustomScreenDefinition();
        customScreenDefinition.id = 'testId';
        customScreenDefinition.name = 'testName';
        customScreenDefinition.responseSeverityColumnLabelsForExportFile = responseSeverityColumnLabelsForExportFile;
        customScreenDefinition.results = customScreenDefinitionResults;
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
                id: 'entity4',
                name: 'entity4 name',
                roles: [RoleEnum.CARD_SENDER],
                parents: []
            },
            {
                id: 'child_entity',
                name: 'child entity',
                roles: [RoleEnum.CARD_SENDER],
                parents: ['parent_entity']
            }
        ]);
    });
    it('Should contain header name and field value', () => {
        const resultTable = getResultTable({
            columns: [
                {
                    field: 'testField',
                    headerName: 'Process',
                    cardField: 'process',
                    fieldType: FieldType.STRING
                },
                {
                    field: 'testField2',
                    headerName: 'State',
                    cardField: 'state',
                    fieldType: FieldType.STRING
                }
            ]
        });
        const cards = [
            getOneLightCard({
                process: 'processId1',
                startDate: new Date(),
                state: 'state1',
                id: 'id1'
            }),
            getOneLightCard({
                process: 'processId2',
                startDate: new Date(),
                state: 'state2',
                id: 'id2'
            })
        ];
        resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
        const dataForExport = resultTable.getDataForExport();
        expect(dataForExport).toEqual([
            {Process: 'processId1', State: 'state1'},
            {Process: 'processId2', State: 'state2'}
        ]);
    });
    it('Should not contain responseFromMyEntities', () => {
        const resultTable = getResultTable({
            columns: [
                {
                    field: 'testField',
                    headerName: 'Process',
                    cardField: 'process',
                    fieldType: FieldType.STRING
                },
                {
                    field: 'testField2',
                    fieldType: FieldType.RESPONSE_FROM_MY_ENTITIES
                }
            ]
        });
        const cards = [
            getOneLightCard({
                process: 'processId1',
                startDate: new Date(),
                state: 'state1',
                id: 'id1'
            })
        ];
        resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
        const dataForExport = resultTable.getDataForExport();
        expect(dataForExport).toEqual([{Process: 'processId1'}]);
    });
    it('Should contain value for type of state', async () => {
        const myState = new State();
        myState.response = {state: 'state1'};
        myState.type = TypeOfStateEnum.INPROGRESS;

        const statesList = new Map();
        statesList.set('state1', myState);

        const process = [new Process('process1', '1', 'my process label', null, statesList)];
        await setProcessConfiguration(process);
        const resultTable = getResultTable({
            columns: [
                {
                    field: 'testField',
                    headerName: 'Type of state',
                    fieldType: FieldType.TYPE_OF_STATE
                }
            ]
        });
        const cards = [
            getOneLightCard({
                process: 'process1',
                startDate: new Date(),
                state: 'state1',
                id: 'id1'
            })
        ];
        resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
        const dataForExport = resultTable.getDataForExport();
        expect(dataForExport).toEqual([{'Type of state': 'Translation (en) of shared.typeOfState.INPROGRESS'}]);
    });

    it('Should contain numerical value for colored circle', () => {
        const resultTable = getResultTable({
            columns: [
                {
                    field: 'testField',
                    headerName: 'ColorCircle',
                    fieldType: FieldType.COLORED_CIRCLE,
                    getValue: (card: Card, childCards: Card[]) => {
                        return {color: 'red', numericalValue: 12};
                    }
                }
            ]
        });
        const cards = [
            getOneLightCard({
                process: 'processId1',
                startDate: new Date(),
                state: 'state1',
                id: 'id1'
            })
        ];

        resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
        const dataForExport = resultTable.getDataForExport();
        expect(dataForExport).toEqual([{ColorCircle: 12}]);
    });

    it('Should export string value for HTML field type', () => {
        const resultTable = getResultTable({
            columns: [
                {
                    field: 'testField',
                    headerName: 'html Field',
                    fieldType: FieldType.HTML,
                    getValue: () => {
                        return 'contingencies';
                    }
                }
            ]
        });
        const cards = [
            getOneLightCard({
                process: 'processId1',
                startDate: new Date(),
                state: 'state1',
                id: 'id1'
            })
        ];

        resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
        const dataForExport = resultTable.getDataForExport();
        expect(dataForExport).toEqual([{'html Field': 'contingencies'}]);
    });

    it('Should contain list of entity names that have responded and not responded', () => {
        const resultTable = getResultTable({
            columns: [
                {
                    field: 'responses',
                    headerName: 'Responses',
                    fieldType: FieldType.RESPONSES
                }
            ]
        });
        const cards = [
            getOneLightCard({
                id: 'card1',
                publisher: 'entity1',
                publisherType: 'ENTITY',
                entitiesAllowedToRespond: ['entity1', 'entity2', 'entity3', 'child_entity']
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
        resultTable.getDataArrayFromCards(cards, childCards);

        const dataForExport = resultTable.getDataForExport();
        expect(dataForExport).toEqual([
            {
                Responses: 'entity1 name, entity2 name',
                'Translation (en) of customCardList.notAnswered': 'child entity, entity3 name'
            }
        ]);
    });

    it('Should export per response type and not responded if responseSeverityColumnLabelsForExportFile is defined', () => {
        const responseSeverityColumnLabelsForExportFile = {COMPLIANT: 'yes', ALARM: 'no'};
        const resultTable = getResultTable(
            {
                columns: [{headerName: 'ANSWERS', fieldType: FieldType.RESPONSES}]
            },
            responseSeverityColumnLabelsForExportFile
        );
        const cards = [
            getOneLightCard({
                id: 'card1',
                publisher: 'entity1',
                publisherType: 'ENTITY',
                entitiesAllowedToRespond: ['entity1', 'entity2', 'entity3', 'entity4']
            })
        ];
        const childCards = new Map<string, Array<Card>>();
        childCards.set('card1', [
            getOneLightCard({publisher: 'entity1', publisherType: 'ENTITY', severity: Severity.COMPLIANT}),
            getOneLightCard({publisher: 'entity2', publisherType: 'ENTITY', severity: Severity.ALARM}),
            getOneLightCard({publisher: 'entity3', publisherType: 'ENTITY', severity: Severity.ALARM})
        ]);
        resultTable.getDataArrayFromCards(cards, childCards);
        const dataForExport = resultTable.getDataForExport();
        expect(dataForExport).toEqual([
            {
                'Translation (en) of customCardList.answer:yes': 'entity1 name',
                'Translation (en) of customCardList.answer:no': 'entity2 name, entity3 name',
                'Translation (en) of customCardList.notAnswered': 'entity4 name',
                ANSWERS: 'entity1 name, entity2 name, entity3 name'
            }
        ]);
    });
});
