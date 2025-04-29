/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

{
    console.log(new Date().toISOString(), 'INFO Custom screen example loaded');
    const customScreenExample = {
        id: 'testId',
        name: 'testName',
        processIds: [
            'api_test',
            'cypress',
            'defaultProcess',
            'gridCooperation',
            'messageOrQuestionExample',
            'supervisor',
            'taskAdvancedExample',
            'taskExample'
        ],
        statesToExclude: [{processId: 'messageOrQuestionExample', stateIds: ['confirmationState']}],
        headerFilters: [
            'PROCESS',
            'TYPE_OF_STATE',
            'READ_ACK',
            'RESPONSE_FROM_MY_ENTITIES',
            'RESPONSE_FROM_ALL_ENTITIES'
        ],
        results: {
            columns: [
                {
                    field: 'severity',
                    cardField: 'severity',
                    fieldType: 'SEVERITY'
                },
                {
                    field: 'TIME',
                    headerName: 'TIME',
                    cardField: 'publishDate',
                    fieldType: 'DATE_AND_TIME',
                    minWidth: 150,
                    flex: 0.5
                },
                {
                    fieldType: 'RESPONSE_FROM_MY_ENTITIES'
                },
                {
                    field: 'testField',
                    headerName: 'TITLE',
                    cardField: 'titleTranslated',
                    fieldType: 'STRING',
                    flex: 1,
                    minWidth: 150
                },
                {
                    field: 'testField2',
                    headerName: 'SUMMARY',
                    cardField: 'summaryTranslated',
                    fieldType: 'STRING',
                    flex: 2,
                    minWidth: 150,
                    showTooltips: true
                },
                {
                    fieldType: 'TYPE_OF_STATE',
                    headerName: 'STATUS',
                    flex: 0.5,
                    minWidth: 150
                },
                {
                    field: 'publisher',
                    headerName: 'EMITTER',
                    cardField: 'publisher',
                    fieldType: 'PUBLISHER'
                },
                {
                    field: 'urgency',
                    headerName: 'URGENCY',
                    fieldType: 'COLORED_CIRCLE',
                    getValue: (card) => {
                        if (card.severity === 'ALARM') return {color: 'red', numericalValue: 20};
                        return {color: 'green', numericalValue: 10};
                    },
                    flex: 0.5,
                    minWidth: 100
                },
                {
                    field: 'keywords',
                    headerName: 'keywords field',
                    cardField: 'data.keywords',
                    getHTMLValue: (card) => {
                        if (card.data?.keywords) {
                            return '<i>' + opfab.utils.escapeHtml(card.data.keywords) + '</i>';
                        }
                        return '';
                    },
                    fieldType: 'HTML',
                    flex: 1,
                    minWidth: 150,
                    showTooltips: true
                },
                {
                    field: 'nestedField',
                    headerName: 'nested field',
                    cardField: 'data.nested.field',
                    fieldType: 'STRING',
                    flex: 1,
                    minWidth: 150
                },
                {
                    headerName: 'ANSWERS',
                    fieldType: 'RESPONSES',
                    flex: 2,
                    minWidth: 400
                }
            ]
        }
    };

    const customScreenExample2 = {
        id: 'testId2',
        name: 'testName',
        headerFilters: ['PROCESS'],
        results: {
            columns: [
                {
                    field: 'urgency',
                    headerName: 'URGENCY',
                    fieldType: 'COLORED_CIRCLE',
                    getValue: (card) => {
                        if (card.severity === 'ALARM') return {color: 'red', numericalValue: 20};
                        return {color: 'green', numericalValue: 10};
                    },
                    flex: 0.25,
                    minWidth: 100
                },
                {
                    field: 'TIME',
                    headerName: 'PUBLISH DATE',
                    cardField: 'publishDate',
                    fieldType: 'DATE_AND_TIME'
                },
                {
                    fieldType: 'RESPONSE_FROM_MY_ENTITIES'
                },
                {
                    field: 'testField',
                    headerName: 'TITLE',
                    cardField: 'titleTranslated',
                    fieldType: 'STRING',
                    minWidth: 300,
                    flex: 1
                },
                {
                    headerName: 'ANSWERS',
                    fieldType: 'RESPONSES',
                    minWidth: 300,
                    flex: 2
                },
                {
                    fieldType: 'SELECT',
                    field: 'reason',
                    cardField: 'data.reason',
                    possibleValues: [
                        {label: 'Time frame is too short to decide', value: 'Time frame is too short to decide'},
                        {label: 'Constraints on the network', value: 'Constraints on the network'},
                        {label: 'Low margin on the network', value: 'Low margin on the network'},
                        {label: 'Critical situation', value: 'Critical situation'},
                        {label: 'Other (Please specify)', value: 'Other'}
                    ],
                    isFieldFromCurrentUserChildCard: true,
                    headerName: 'REASON',
                    minWidth: 300
                },
                {
                    fieldType: 'INPUT',
                    field: 'comment',
                    cardField: 'data.comment',
                    isFieldFromCurrentUserChildCard: true,
                    headerName: 'COMMENT',
                    minWidth: 256,
                    maxInputLength: 256
                }
            ]
        },
        responseOnlyAllowedForEntitiesRequiredToRespond: false,
        responseButtons: [
            {
                id: 'button1',
                label: 'ACCEPT PROPOSALS',
                getUserResponses: (selectedCards, userInputs) => {
                    const responseCards = [];

                    selectedCards.forEach((card) => {
                        const userInput = userInputs.get(card.id);
                        const comment = userInput?.comment ?? '';
                        const responseData = {propositionRefused: false, comment: comment};
                        responseCards.push({data: responseData, severity: 'COMPLIANT'});
                    });
                    return {valid: true, errorMsg: '', responseCards: responseCards};
                }
            },
            {
                id: 'button2',
                label: 'REFUSE PROPOSALS',
                getUserResponses: (selectedCards, userInputs) => {
                    const responseCards = [];
                    let hasAlwaysComment = true;
                    selectedCards.forEach((card) => {
                        const userInput = userInputs.get(card.id);
                        const comment = userInput?.comment ?? '';
                        const reason = userInput?.reason ?? '';
                        if (comment === '') {
                            hasAlwaysComment = false;
                        }
                        const responseData = {propositionRefused: true, comment: comment, reason: reason};
                        responseCards.push({data: responseData, severity: 'ALARM'});
                    });
                    if (!hasAlwaysComment) {
                        return {valid: false, errorMsg: 'Please fill in the comment field for all cards'};
                    }
                    return {valid: true, errorMsg: '', responseCards: responseCards};
                }
            }
        ]
    };

    function getDateTime(epoch) {
        const date = new Date(epoch);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }

    const customScreenExample3 = {
        id: 'testId3',
        name: 'testName',
        headerFilters: ['PROCESS'],
        showAcknowledgmentButton: true,
        results: {
            columns: [
                {
                    field: 'businessDate',
                    headerName: 'BUSINESS DATE',
                    fieldType: 'STRING',
                    getValue: (card) => {
                        let field = getDateTime(card.startDate);
                        if (card.endDate) field += ' - ' + getDateTime(card.endDate);
                        return field;
                    },
                    minWidth: 100,
                    multiLinesInCell: true
                },
                {
                    fieldType: 'RESPONSE_FROM_MY_ENTITIES'
                },
                {
                    fieldType: 'ACKNOWLEDGMENT'
                },
                {
                    field: 'testField',
                    headerName: 'TITLE',
                    cardField: 'titleTranslated',
                    fieldType: 'STRING',
                    minWidth: 600,
                    flex: 1
                },
                {
                    headerName: 'ANSWERS',
                    fieldType: 'RESPONSES',
                    flex: 2
                },
                {
                    fieldType: 'SELECT',
                    field: 'reason',
                    cardField: 'data.reason',
                    possibleValues: [
                        {label: 'Time frame is too short to decide', value: 'Time frame is too short to decide'},
                        {label: 'Constraints on the network', value: 'Constraints on the network'},
                        {label: 'Low margin on the network', value: 'Low margin on the network'},
                        {label: 'Critical situation', value: 'Critical situation'},
                        {label: 'Other (Please specify)', value: 'Other'}
                    ],
                    isFieldFromCurrentUserChildCard: true,
                    headerName: 'REASON',
                    minWidth: 300
                },
                {
                    fieldType: 'INPUT',
                    field: 'comment',
                    cardField: 'data.comment',
                    isFieldFromCurrentUserChildCard: true,
                    headerName: 'COMMENT',
                    minWidth: 100,
                    maxInputLength: 100
                }
            ]
        },
        responseOnlyAllowedForEntitiesRequiredToRespond: false,
        responseButtons: [
            {
                id: 'button1',
                label: 'ACCEPT PROPOSALS',
                getUserResponses: (selectedCards, userInputs) => {
                    const responseCards = [];

                    selectedCards.forEach((card) => {
                        const userInput = userInputs.get(card.id);
                        const comment = userInput?.comment ?? '';
                        const responseData = {propositionRefused: false, comment: comment};
                        responseCards.push({data: responseData, severity: 'COMPLIANT'});
                    });
                    return {valid: true, errorMsg: '', responseCards: responseCards};
                }
            },
            {
                id: 'button2',
                label: 'REFUSE PROPOSALS',
                getUserResponses: (selectedCards, userInputs) => {
                    const responseCards = [];
                    let hasAlwaysComment = true;
                    selectedCards.forEach((card) => {
                        const userInput = userInputs.get(card.id);
                        const comment = userInput?.comment ?? '';
                        const reason = userInput?.reason ?? '';
                        if (comment === '') {
                            hasAlwaysComment = false;
                        }
                        const responseData = {propositionRefused: true, comment: comment, reason: reason};
                        responseCards.push({data: responseData, severity: 'ALARM'});
                    });
                    if (!hasAlwaysComment) {
                        return {valid: false, errorMsg: 'Please fill in the comment field for all cards'};
                    }
                    return {valid: true, errorMsg: '', responseCards: responseCards};
                }
            }
        ]
    };
    opfab.businessconfig.registerCustomScreen(customScreenExample);
    opfab.businessconfig.registerCustomScreen(customScreenExample2);
    opfab.businessconfig.registerCustomScreen(customScreenExample3);
}
