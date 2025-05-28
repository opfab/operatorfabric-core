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
import {getOneLightCard, mockTranslation, setEntities, setProcessConfiguration, setUserPerimeter} from '@tests/helpers';
import {Process, State, TypeOfStateEnum} from '@ofServices/processes/model/Processes';
import {Card} from 'app/model/Card';
import {RoleEnum} from '@ofServices/entities/model/RoleEnum';
import {Severity} from 'app/model/Severity';

describe('CustomScreenView - ResultTable', () => {
    const getResultTable = (customScreenDefinitionResults: any) => {
        const customScreenDefinition = new CustomScreenDefinition();
        customScreenDefinition.id = 'testId';
        customScreenDefinition.name = 'testName';
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
    describe('Should get columns definition for ag-grid', () => {
        it('columDefinitions', () => {
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
                        field: 'testField3',
                        headerName: 'keywords',
                        cardField: 'keywords',
                        fieldType: FieldType.HTML,
                        flex: 1
                    },
                    {
                        headerName: 'Responses',
                        fieldType: FieldType.RESPONSES,
                        flex: 2
                    },
                    {
                        fieldType: FieldType.RESPONSE_FROM_MY_ENTITIES
                    },
                    {
                        fieldType: FieldType.ACKNOWLEDGMENT
                    },
                    {
                        field: 'stateName',
                        headerName: 'State Name',
                        fieldType: FieldType.STATE_NAME
                    },
                    {
                        field: 'processName',
                        headerName: 'Process Name',
                        fieldType: FieldType.PROCESS_NAME
                    },
                    {
                        field: 'coloredCircleTest',
                        headerName: 'circle',
                        fieldType: FieldType.COLORED_CIRCLE
                    },
                    {
                        field: 'comment',
                        headerName: 'Comment',
                        fieldType: FieldType.INPUT
                    },
                    {
                        field: 'select',
                        headerName: 'Select',
                        fieldType: FieldType.SELECT
                    }
                ]
            });
            expect(resultTable.getColumnsDefinitionForAgGrid()).toEqual([
                {field: 'testField', headerName: 'Process', type: 'default', flex: 2, customParams: {}},
                {field: 'testField2', headerName: 'Start Date', type: 'dateAndTime', flex: 1, customParams: {}},
                {field: 'testField3', headerName: 'keywords', type: 'html', flex: 1, customParams: {}},
                {field: 'responses', headerName: 'Responses', type: 'responses', flex: 2, customParams: {}},
                {field: 'responseFromMyEntities', headerName: '', type: 'responseFromMyEntities', customParams: {}},
                {field: 'hasBeenAcknowledged', headerName: '', type: 'acknowledgment', customParams: {}},
                {field: 'stateName', headerName: 'State Name', type: 'stateName', customParams: {}},
                {field: 'processName', headerName: 'Process Name', type: 'processName', customParams: {}},
                {field: 'coloredCircleTest', headerName: 'circle', type: 'coloredCircle', customParams: {}},
                {field: 'comment', headerName: 'Comment', type: 'input', customParams: {}},
                {field: 'select', headerName: 'Select', type: 'select', customParams: {}}
            ]);
        });

        it('specific columDefinition with severity', () => {
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
                {field: 'severity', headerName: '', type: 'severity', customParams: {}}
            ]);
        });
        it('specific columDefinition with type_of_state', () => {
            const resultTable = getResultTable({
                columns: [
                    {
                        headerName: 'Status',
                        fieldType: FieldType.TYPE_OF_STATE
                    }
                ]
            });
            expect(resultTable.getColumnsDefinitionForAgGrid()).toEqual([
                {field: 'typeOfState', headerName: 'Status', type: 'typeOfState', customParams: {}}
            ]);
        });
        it('specific columDefinition with showTooltips', () => {
            const resultTable = getResultTable({
                columns: [
                    {
                        field: 'test',
                        headerName: 'Status',
                        fieldType: FieldType.STRING,
                        showTooltips: true
                    }
                ]
            });
            expect(resultTable.getColumnsDefinitionForAgGrid()).toEqual([
                {field: 'test', headerName: 'Status', type: 'default', customParams: {showTooltips: true}}
            ]);
        });
        it('specify minWidth if defined in column definition', () => {
            const resultTable = getResultTable({
                columns: [
                    {
                        field: 'testField',
                        headerName: 'Process',
                        cardField: 'processId',
                        fieldType: FieldType.STRING,
                        minWidth: 200
                    },
                    {
                        field: 'testField2',
                        headerName: 'test2',
                        cardField: 'test2'
                    }
                ]
            });
            expect(resultTable.getColumnsDefinitionForAgGrid()).toEqual([
                {field: 'testField', headerName: 'Process', type: 'default', customParams: {}, minWidth: 200},
                {field: 'testField2', headerName: 'test2', type: 'default', customParams: {}}
            ]);
        });
        it('specific columDefinition with autoHeight and wrapText when mutliLineText is true', () => {
            const resultTable = getResultTable({
                columns: [
                    {
                        headerName: 'Status',
                        fieldType: FieldType.TYPE_OF_STATE,
                        multiLinesInCell: true
                    }
                ]
            });
            expect(resultTable.getColumnsDefinitionForAgGrid()).toEqual([
                {
                    field: 'typeOfState',
                    headerName: 'Status',
                    type: 'typeOfState',
                    autoHeight: true,
                    wrapText: true,
                    customParams: {}
                }
            ]);
        });
        it('specific columDefinition with maxInputLenght custom params when maxInputLenght is set', () => {
            const resultTable = getResultTable({
                columns: [
                    {
                        headerName: 'Status',
                        fieldType: FieldType.TYPE_OF_STATE,
                        maxInputLength: 200
                    }
                ]
            });
            expect(resultTable.getColumnsDefinitionForAgGrid()).toEqual([
                {
                    field: 'typeOfState',
                    headerName: 'Status',
                    type: 'typeOfState',
                    customParams: {maxInputLength: 200}
                }
            ]);
        });
    });
    describe('Should get data array from cards', () => {
        it('with only card fields defined in state screen definition + cardId', () => {
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

        it('with nested fields defines in state screen defintion + cardId', () => {
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
        it('with the entity name if field type is publisher', () => {
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
        it('with the publisher field if field type is publisher and publisher type is not ENTITY', () => {
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
        it('with the representative user if representative user is defined', () => {
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

        it('with the representative entity if representative entity is defined', () => {
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
        it('with formatted date if field type is DATE_AND_TIME', () => {
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
                    startDate: new Date('2021-01-01T02:00') // epoch: 1609462800000
                })
            ];
            const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
            expect(dataArray).toEqual([{cardId: 'card1', date: {text: '01/01/2021 2:00 AM', value: 1609462800000}}]);
        });

        it('with the type of state if field type is type_of_state', async () => {
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
            await setProcessConfiguration(process);
            const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
            expect(dataArray).toEqual([
                {
                    cardId: 'card1',
                    typeOfState: {
                        text: 'Translation (en) of shared.typeOfState.INPROGRESS',
                        value: 'INPROGRESS',
                        color: 'darker-orange'
                    }
                },
                {
                    cardId: 'card2',
                    typeOfState: {
                        text: '',
                        value: undefined,
                        color: 'grey'
                    }
                }
            ]);
        });

        it('with getValue method if getValue is defined and fieldType is STRING', () => {
            const resultTable = getResultTable({
                columns: [
                    {
                        field: 'testField',
                        headerName: 'Process',
                        fieldType: FieldType.STRING,
                        getValue: (card: Card) => {
                            return card.process + ' - ' + card.state;
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
            const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
            expect(dataArray).toEqual([{cardId: 'id1', testField: 'processId1 - state1'}]);
        });

        it('with getValueHTML method if fieldType is HTML', () => {
            const resultTable = getResultTable({
                columns: [
                    {
                        field: 'testField',
                        headerName: 'Process',
                        fieldType: FieldType.HTML,
                        cardField: 'process',
                        getHTMLValue: (card: Card) => {
                            return '<i>' + card.process + '</i>';
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
            const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
            expect(dataArray).toEqual([
                {cardId: 'id1', testField: {rowValue: 'processId1', htmlValue: '<i>processId1</i>'}}
            ]);
        });
        it('with get row value with getValue if exist and if fieldType is HTML', () => {
            const resultTable = getResultTable({
                columns: [
                    {
                        field: 'testField',
                        headerName: 'Process',
                        fieldType: FieldType.HTML,
                        cardField: 'process',
                        getHTMLValue: (card: Card) => {
                            return '<i>' + card.process + '</i>';
                        },
                        getValue: (card: Card) => {
                            return card.process + '-test';
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
            const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
            expect(dataArray).toEqual([
                {cardId: 'id1', testField: {rowValue: 'processId1-test', htmlValue: '<i>processId1</i>'}}
            ]);
        });

        it('with the color using custom method getValue() if field type is COLORED_CIRCLE', () => {
            const resultTable = getResultTable({
                columns: [
                    {
                        field: 'myfield',
                        fieldType: FieldType.COLORED_CIRCLE,
                        getValue: (card: Card) => {
                            if (card.severity === Severity.ALARM) return 'red';
                            return 'blue';
                        }
                    }
                ]
            });
            const cards = [
                getOneLightCard({
                    id: 'card1',
                    severity: Severity.ALARM
                }),
                getOneLightCard({
                    id: 'card2',
                    severity: Severity.ACTION
                })
            ];
            const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
            expect(dataArray).toEqual([
                {cardId: 'card1', myfield: 'red'},
                {cardId: 'card2', myfield: 'blue'}
            ]);
        });
        it('with state name and process name', async () => {
            const state = new State();
            state.name = 'State Name';
            const statesList = new Map();
            statesList.set('state1', state);
            const process = [new Process('processId1', '1', 'Process Name', null, statesList)];
            await setProcessConfiguration(process);
            const resultTable = getResultTable({
                columns: [
                    {
                        fieldType: 'PROCESS_NAME'
                    },
                    {
                        fieldType: 'STATE_NAME'
                    }
                ]
            });
            const cards = [
                getOneLightCard({
                    id: 'card1',
                    publisher: 'entity1',
                    state: 'state1',
                    process: 'processId1',
                    publisherType: 'ENTITY',
                    hasChildCardFromCurrentUserEntity: true,
                    entitiesAllowedToRespond: ['entity1', 'entity2', 'entity3', 'child_entity']
                })
            ];
            const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
            expect(dataArray).toEqual([{cardId: 'card1', processName: 'Process Name', stateName: 'State Name'}]);
        });
    });
    describe('Should get responses in data array', () => {
        it('with entities required to reponse in alphabetical order and in grey if there is no responses', () => {
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
                        {entityName: 'entity1 name', color: 'grey'},
                        {entityName: 'entity3 name', color: 'grey'}
                    ]
                }
            ]);
        });
        it('with entities allowed to reponse in alphabetical order if there is no entities required to respond', () => {
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
                        {entityName: 'entity1 name', color: 'grey'},
                        {entityName: 'entity2 name', color: 'grey'},
                        {entityName: 'entity3 name', color: 'grey'}
                    ]
                }
            ]);
        });

        it('with no entity if entity not allowed to send card', () => {
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
        it('with child entity if parent entity is not allowed to send card', () => {
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
                    responses: [{entityName: 'child entity', color: 'grey'}]
                }
            ]);
        });
        it('with color entity according to child card severity if child card if present for entity', () => {
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
                        {entityName: 'child entity', color: 'blue'},
                        {entityName: 'entity1 name', color: 'red'},
                        {entityName: 'entity2 name', color: 'orange'},
                        {entityName: 'entity3 name', color: 'green'}
                    ]
                }
            ]);
        });
        it('with response from my entities set to true if a response from my entities exists', () => {
            const resultTable = getResultTable({
                columns: [
                    {
                        fieldType: FieldType.RESPONSE_FROM_MY_ENTITIES
                    }
                ]
            });
            const cards = [
                getOneLightCard({
                    id: 'card1',
                    publisher: 'entity1',
                    publisherType: 'ENTITY',
                    hasChildCardFromCurrentUserEntity: true,
                    entitiesAllowedToRespond: ['entity1', 'entity2', 'entity3', 'child_entity']
                })
            ];
            const childCards = new Map<string, Array<Card>>();
            childCards.set('card1', [
                getOneLightCard({
                    publisher: 'entity1',
                    publisherType: 'ENTITY',
                    severity: Severity.ALARM
                })
            ]);
            const dataArray = resultTable.getDataArrayFromCards(cards, childCards);
            expect(dataArray).toEqual([
                {
                    cardId: 'card1',
                    responseFromMyEntities: true
                }
            ]);
        });
        it('with acknowledgment set to true if card has been acknowledged', () => {
            const resultTable = getResultTable({
                columns: [
                    {
                        fieldType: FieldType.ACKNOWLEDGMENT
                    }
                ]
            });
            const cards = [
                getOneLightCard({
                    id: 'card1',
                    publisher: 'entity1',
                    publisherType: 'ENTITY',
                    hasBeenAcknowledged: true,
                    entitiesAllowedToRespond: ['entity1']
                })
            ];
            const dataArray = resultTable.getDataArrayFromCards(cards, emptyChildCardsList);
            expect(dataArray).toEqual([
                {
                    cardId: 'card1',
                    hasBeenAcknowledged: true
                }
            ]);
        });
    });

    describe('Should get data  from current user child cards', () => {
        let cards = [];
        let resultTable: ResultTable;
        beforeEach(async () => {
            await setUserPerimeter({
                computedPerimeters: [],
                userData: {
                    login: 'test',
                    firstName: 'firstName',
                    lastName: 'lastName',
                    entities: ['entity1']
                }
            });

            resultTable = getResultTable({
                columns: [
                    {
                        field: 'childData',
                        headerName: 'Comment',
                        cardField: 'data.test',
                        fieldType: FieldType.STRING,
                        isFieldFromCurrentUserChildCard: true
                    }
                ]
            });
            cards = [
                getOneLightCard({
                    id: 'card1',
                    publisher: 'entity1',
                    publisherType: 'ENTITY',
                    entitiesAllowedToRespond: ['entity1', 'entity2', 'entity3', 'child_entity']
                })
            ];
        });
        it('get custom data field', () => {
            const childCards = new Map<string, Array<Card>>();
            childCards.set('card1', [
                getOneLightCard({
                    publisher: 'entity1',
                    publisherType: 'ENTITY',
                    severity: Severity.ALARM,
                    data: {test: 'user comment'}
                }),
                getOneLightCard({
                    publisher: 'entity2',
                    publisherType: 'ENTITY',
                    severity: Severity.ACTION,
                    data: {test: 'user comment2'}
                })
            ]);
            const dataArray = resultTable.getDataArrayFromCards(cards, childCards);

            expect(dataArray).toEqual([
                {
                    cardId: 'card1',
                    childData: 'user comment'
                }
            ]);
        });
        it('get empty value if no child card for current user', () => {
            const childCards = new Map<string, Array<Card>>();
            childCards.set('card1', [
                getOneLightCard({
                    publisher: 'entity2',
                    publisherType: 'ENTITY',
                    severity: Severity.ACTION,
                    data: {test: 'user comment2'}
                })
            ]);
            const dataArray = resultTable.getDataArrayFromCards(cards, childCards);

            expect(dataArray).toEqual([
                {
                    cardId: 'card1',
                    childData: ''
                }
            ]);
        });
    });
    describe('Should get select field', () => {
        const cards = [
            getOneLightCard({
                id: 'card1',
                publisher: 'entity1',
                publisherType: 'ENTITY',
                entitiesAllowedToRespond: ['entity1', 'entity2', 'entity3', 'child_entity']
            })
        ];

        let resultTable = undefined;

        beforeAll(async () => {
            await setUserPerimeter({
                computedPerimeters: [],
                userData: {
                    login: 'test',
                    firstName: 'firstName',
                    lastName: 'lastName',
                    entities: ['entity1']
                }
            });
            resultTable = getResultTable({
                columns: [
                    {
                        field: 'childData',
                        headerName: 'Selection',
                        cardField: 'data.test',
                        fieldType: FieldType.SELECT,
                        isFieldFromCurrentUserChildCard: true,
                        possibleValues: [
                            {value: 'option1', label: 'Label option1'},
                            {value: 'option2', label: 'Label option2'}
                        ],
                        allowNewOptionForSelect: true
                    }
                ]
            });
        });
        it('get field actual value with possibles values', async () => {
            const childCards = new Map<string, Array<Card>>();
            childCards.set('card1', [
                getOneLightCard({
                    publisher: 'entity1',
                    publisherType: 'ENTITY',
                    severity: Severity.ALARM,
                    data: {test: 'option1'}
                })
            ]);
            const dataArray = resultTable.getDataArrayFromCards(cards, childCards);

            expect(dataArray).toEqual([
                {
                    cardId: 'card1',
                    childData: {
                        value: 'option1',
                        possibleValues: [
                            {value: 'option1', label: 'Label option1'},
                            {value: 'option2', label: 'Label option2'}
                        ],
                        allowNewOptionForSelect: true
                    }
                }
            ]);
        });
        it('get empty value if no child card', async () => {
            const childCards = new Map<string, Array<Card>>();

            const dataArray = resultTable.getDataArrayFromCards(cards, childCards);

            expect(dataArray).toEqual([
                {
                    cardId: 'card1',
                    childData: {
                        value: '',
                        possibleValues: [
                            {value: 'option1', label: 'Label option1'},
                            {value: 'option2', label: 'Label option2'}
                        ],
                        allowNewOptionForSelect: true
                    }
                }
            ]);
        });
    });
});
