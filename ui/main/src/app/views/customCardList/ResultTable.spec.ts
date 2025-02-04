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
import {getOneLightCard, setEntities, setProcessConfiguration} from '@tests/helpers';
import {ConfigService} from '@ofServices/config/ConfigService';
import {DateTimeFormatterService} from '@ofServices/dateTimeFormatter/DateTimeFormatterService';
import {ConfigServerMock} from '@tests/mocks/configServer.mock';
import {Process, State, TypeOfStateEnum} from '@ofServices/processes/model/Processes';
import {Card} from 'app/model/Card';
import {RoleEnum} from '@ofServices/entities/model/RoleEnum';
import {Severity} from 'app/model/Severity';
import {TranslationLibMock} from '@tests/mocks/TranslationLib.mock';
import {TranslationService} from '@ofServices/translation/TranslationService';

describe('CustomScreenView - ResultTable', () => {
    const getResultTable = (customScreenDefintionResults: any) => {
        const customScreenDefinition = new CustomScreenDefinition();
        customScreenDefinition.id = 'testId';
        customScreenDefinition.name = 'testName';
        customScreenDefinition.results = customScreenDefintionResults;
        return new ResultTable(customScreenDefinition);
    };

    const emptyChildCardsList = new Map<string, Array<Card>>();

    beforeAll(() => {
        TranslationService.setTranslationLib(new TranslationLibMock());

        setEntities([
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
    beforeEach(() => {
        ConfigService.setConfigServer(new ConfigServerMock());
        DateTimeFormatterService.init();
    });

    it('should return columDefinition for agGrid', () => {
        const resultTable = getResultTable({
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
                },
                {
                    headerName: 'Responses',
                    fieldType: FieldType.RESPONSES,
                    flex: 2
                }
            ]
        });
        expect(resultTable.getColumnsDefinitionForAgGrid()).toEqual([
            {field: 'testField', headerName: 'Process', type: 'default', flex: 2},
            {field: 'testField2', headerName: 'Start Date', type: 'default', flex: 1},
            {field: 'responses', headerName: 'Responses', type: 'responses', flex: 2}
        ]);
    });

    it('should return specific columDefinition for agGrid with severity', () => {
        const resultTable = getResultTable({
            columns: [
                {
                    field: 'severity',
                    cardField: 'processId',
                    fieldType: FieldType.SEVERITY
                }
            ]
        });

        expect(resultTable.getColumnsDefinitionForAgGrid()).toEqual([
            {field: 'severity', headerName: '', type: 'severity'}
        ]);
    });
    it('should return specific columDefinition for agGrid with type_of_state', () => {
        const resultTable = getResultTable({
            columns: [
                {
                    headerName: 'Status',
                    fieldType: FieldType.TYPE_OF_STATE
                }
            ]
        });
        expect(resultTable.getColumnsDefinitionForAgGrid()).toEqual([
            {field: 'typeOfState', headerName: 'Status', type: 'typeOfState', flex: undefined}
        ]);
    });

    it('should get only card fields defines in state screen defintion + cardId', () => {
        const resultTable = getResultTable({
            columns: [
                {
                    field: 'testField',
                    headerName: 'Process',
                    cardField: 'process',
                    fieldType: FieldType.STRING,
                    flex: 2
                },
                {
                    field: 'testField2',
                    headerName: 'State',
                    cardField: 'state',
                    fieldType: FieldType.STRING,
                    flex: 1
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
        const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
        expect(dataArray).toEqual([
            {cardId: 'id1', testField: 'processId1', testField2: 'state1'},
            {cardId: 'id2', testField: 'processId2', testField2: 'state2'}
        ]);
    });

    it('should get nested fields defines in state screen defintion + cardId', () => {
        const resultTable = getResultTable({
            columns: [
                {
                    field: 'nestedField',
                    headerName: 'Test',
                    cardField: 'data.test',
                    fieldType: FieldType.STRING,
                    flex: 2
                }
            ]
        });
        const cards = [
            getOneLightCard({
                process: 'processId1',
                startDate: new Date(),
                state: 'state1',
                id: 'id1',
                data: {test: 'testData'}
            })
        ];
        const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
        expect(dataArray).toEqual([{cardId: 'id1', nestedField: 'testData'}]);
    });

    it('should get filter card by business period startDate', () => {
        const resultTable = getResultTable({
            columns: [
                {
                    field: 'testField',
                    headerName: 'Process',
                    cardField: 'process',
                    fieldType: FieldType.STRING,
                    flex: 2
                }
            ]
        });

        resultTable.setBusinessDateFilter(10, 200);
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

    it('should get filter card by business period startDate and endDate', () => {
        const resultTable = getResultTable({
            columns: [
                {
                    field: 'testField',
                    headerName: 'Process',
                    cardField: 'process',
                    fieldType: FieldType.STRING,
                    flex: 2
                }
            ]
        });
        resultTable.setBusinessDateFilter(10, 200);
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

    it('should get filter card by process', () => {
        const resultTable = getResultTable({
            columns: [
                {
                    field: 'testField',
                    headerName: 'Process',
                    cardField: 'process',
                    fieldType: FieldType.STRING
                }
            ]
        });

        resultTable.setProcessFilter(['processId1', 'processId2']);
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
    it('should get filter card by type of state', () => {
        const resultTable = getResultTable({
            columns: [
                {
                    field: 'testField',
                    headerName: 'Process',
                    cardField: 'process',
                    fieldType: FieldType.STRING
                }
            ]
        });
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

        setProcessConfiguration(process);

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
        resultTable.setTypesOfStateFilter(['INPROGRESS', 'FINISHED']);
        const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
        expect(dataArray).toEqual([
            {cardId: 'id0', testField: 'processId0'},
            {cardId: 'id1', testField: 'processId0'}
        ]);
    });

    it('should return the entity name if field type is publisher', () => {
        const resultTable = getResultTable({
            columns: [
                {
                    field: 'publisher',
                    cardField: 'publisher',
                    fieldType: FieldType.PUBLISHER
                }
            ]
        });
        const cards = [
            getOneLightCard({
                id: 'card1',
                publisher: 'entity1',
                publisherType: 'ENTITY'
            })
        ];
        const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
        expect(dataArray).toEqual([{cardId: 'card1', publisher: 'entity1 name'}]);
    });
    it('Should return the publisher field if field type is publisher and publisher type is not ENTITY', () => {
        const resultTable = getResultTable({
            columns: [
                {
                    field: 'publisher',
                    cardField: 'publisher',
                    fieldType: FieldType.PUBLISHER
                }
            ]
        });
        const cards = [
            getOneLightCard({
                id: 'card1',
                publisher: 'entity1',
                publisherType: 'EXTERNAL'
            })
        ];
        const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
        expect(dataArray).toEqual([{cardId: 'card1', publisher: 'entity1'}]);
    });
    it('Should return the representative user if representative user is defined', () => {
        const resultTable = getResultTable({
            columns: [
                {
                    field: 'publisher',
                    cardField: 'publisher',
                    fieldType: FieldType.PUBLISHER
                }
            ]
        });
        const cards = [
            getOneLightCard({
                id: 'card1',
                publisher: 'entity1',
                publisherType: 'ENTITY',
                representative: 'user1'
            })
        ];
        const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
        expect(dataArray).toEqual([{cardId: 'card1', publisher: 'entity1 name (user1)'}]);
    });

    it('Should return the representative entity if representative entity is defined', () => {
        const resultTable = getResultTable({
            columns: [
                {
                    field: 'publisher',
                    cardField: 'publisher',
                    fieldType: FieldType.PUBLISHER
                }
            ]
        });
        const cards = [
            getOneLightCard({
                id: 'card1',
                publisher: 'entity1',
                publisherType: 'ENTITY',
                representative: 'entity2',
                representativeType: 'ENTITY'
            })
        ];
        const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
        expect(dataArray).toEqual([{cardId: 'card1', publisher: 'entity1 name (entity2 name)'}]);
    });
    it('Should return formatted date if field type is DATE_AND_TIME', () => {
        const resultTable = getResultTable({
            columns: [
                {
                    field: 'date',
                    cardField: 'startDate',
                    fieldType: FieldType.DATE_AND_TIME
                }
            ]
        });
        const cards = [
            getOneLightCard({
                id: 'card1',
                startDate: new Date('2021-01-01T02:00')
            })
        ];
        const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
        expect(dataArray).toEqual([{cardId: 'card1', date: '01/01/2021 2:00 AM'}]);
    });

    it('should return the type of state if field type is type_of_state', () => {
        const resultTable = getResultTable({
            columns: [
                {
                    headerName: 'Status',
                    fieldType: FieldType.TYPE_OF_STATE
                }
            ]
        });
        const cards = [
            getOneLightCard({
                id: 'card1',
                publisher: 'entity1',
                publisherType: 'ENTITY',
                state: 'myState',
                process: 'myProcess'
            }),
            getOneLightCard({
                id: 'card2',
                publisher: 'entity1',
                publisherType: 'ENTITY',
                state: 'myState2',
                process: 'myProcess'
            })
        ];
        const states = new Map<string, State>();
        states.set('myState', {type: TypeOfStateEnum.INPROGRESS});
        states.set('myState2', {type: undefined});
        const process = [new Process('myProcess', '1', null, null, states)];
        setProcessConfiguration(process);
        const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
        expect(dataArray).toEqual([
            {
                cardId: 'card1',
                typeOfState: {
                    text: 'Translation (en) of shared.typeOfState.INPROGRESS',
                    value: 'INPROGRESS'
                }
            },
            {
                cardId: 'card2',
                typeOfState: {
                    text: '',
                    value: undefined
                }
            }
        ]);
    });
    describe('If field type is Responses', () => {
        it('Should return entities required to reponse in alphabetical order and in grey if there is no responses', () => {
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
                    entitiesAllowedToRespond: ['entity2'],
                    entitiesRequiredToRespond: ['entity1', 'entity3']
                })
            ];
            const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
            expect(dataArray).toEqual([
                {
                    cardId: 'card1',
                    responses: [
                        {name: 'entity1 name', color: 'grey'},
                        {name: 'entity3 name', color: 'grey'}
                    ]
                }
            ]);
        });
        it('Should return entities allowed to reponse in alphabetical order if there is no entities required to respond', () => {
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
                    entitiesAllowedToRespond: ['entity3', 'entity2', 'entity1']
                })
            ];
            const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
            expect(dataArray).toEqual([
                {
                    cardId: 'card1',
                    responses: [
                        {name: 'entity1 name', color: 'grey'},
                        {name: 'entity2 name', color: 'grey'},
                        {name: 'entity3 name', color: 'grey'}
                    ]
                }
            ]);
        });

        it('Should not return entity it entity not allowed to send card', () => {
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
                    entitiesAllowedToRespond: ['entity_not_allowed_to_send_card']
                })
            ];
            const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
            expect(dataArray).toEqual([{cardId: 'card1', responses: []}]);
        });
        it('Should include child entity if parent entity is not allowed to send card', () => {
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
                    entitiesAllowedToRespond: ['parent_entity']
                })
            ];
            const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
            expect(dataArray).toEqual([
                {
                    cardId: 'card1',
                    responses: [{name: 'child entity', color: 'grey'}]
                }
            ]);
        });
        it('Should set color entity according to child card severity if child card if present for entity', () => {
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
                }),
                getOneLightCard({
                    publisher: 'entity3',
                    publisherType: 'ENTITY',
                    severity: Severity.COMPLIANT
                }),
                getOneLightCard({
                    publisher: 'child_entity',
                    publisherType: 'ENTITY',
                    severity: Severity.INFORMATION
                })
            ]);
            const dataArray = resultTable.getDataArrayFromCards(cards, childCards);
            expect(dataArray).toEqual([
                {
                    cardId: 'card1',
                    responses: [
                        {name: 'child entity', color: 'blue'},
                        {name: 'entity1 name', color: 'red'},
                        {name: 'entity2 name', color: 'orange'},
                        {name: 'entity3 name', color: 'green'}
                    ]
                }
            ]);
        });
    });
});
