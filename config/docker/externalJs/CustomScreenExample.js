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
        headerFilters: ['PROCESS', 'TYPE_OF_STATE', 'RESPONSE_FROM_MY_ENTITIES'],
        results: {
            columns: [
                {
                    field: 'severity',
                    cardField: 'severity',
                    fieldType: 'SEVERITY',
                },
                {
                    field: 'TIME',
                    headerName: 'TIME',
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
                    flex: 1
                },
                {
                    field: 'testField2',
                    headerName: 'SUMMARY',
                    cardField: 'summaryTranslated',
                    fieldType: 'STRING',
                    flex: 2
                },
                {
                    fieldType: 'TYPE_OF_STATE',
                    headerName: 'STATUS'

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
                        if (card.severity === 'ALARM') return "red"
                        return "green"
                    },
                    flex: 0.5
                },
                {
                    headerName: 'ANSWERS',
                    fieldType: 'RESPONSES',
                    flex: 2
                }
            ]
        }
    }

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
                        if (card.severity === 'ALARM') return "red"
                        return "green"
                    },
                    flex: 0.25
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
                    flex: 1
                },
                {
                    headerName: 'ANSWERS',
                    fieldType: 'RESPONSES',
                    flex: 2
                }
            ]
        },
        responseButtons: [
            {
                id: 'button1',
                label: 'Accept proposals',
                getUserResponses: (cards) => {
                    const responseCards = [];
                    const responseData = { "choice1": ["on"], "choice2": ["on"], "choice3": ["on"] }
                    cards.forEach((card) => {
                        responseCards.push({ data: responseData });
                    });
                    return { valid: true, errorMsg: '', responseCards: responseCards };
                }
            },
            {
                id: 'button2',
                label: 'Refuse proposals',
                getUserResponses: (cards) => {
                    const responseCards = [];
                    const responseData = {}
                    cards.forEach((card) => {
                        responseCards.push({ data: responseData });
                    });
                    return { valid: true, errorMsg: '', responseCards: responseCards };
                }
            }
        ]
    }

    opfab.businessconfig.registerCustomScreen(customScreenExample);
    opfab.businessconfig.registerCustomScreen(customScreenExample2);
}
