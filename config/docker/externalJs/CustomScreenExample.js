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
        headerFilters: ['PROCESS', 'TYPE_OF_STATE'],
        results: {
            columns: [
                {
                    field: 'severity',
                    cardField: 'severity',
                    fieldType: 'SEVERITY',
                },
                {
                    field: 'TIME',
                    cardField: 'publishDate',
                    fieldType: 'DATE_AND_TIME'
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
                    headerName: 'ANSWERS',
                    fieldType: 'RESPONSES',
                    flex: 2
                }
            ]
        }
    }

    opfab.businessconfig.registerCustomScreen(customScreenExample);
}
