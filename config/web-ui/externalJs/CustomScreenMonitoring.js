/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

{
    const CustomScreenMonitoring = {
        id: 'monitoringId',
        name: 'monitoring',
        headerFilters: ['PROCESS', 'TYPE_OF_STATE', 'RESPONSE_FROM_MY_ENTITIES'],

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
                    field: 'title',
                    headerName: 'TITLE',
                    cardField: 'titleTranslated',
                    fieldType: 'STRING',
                    flex: 1,
                    minWidth: 150
                },
                {
                    field: 'summary',
                    headerName: 'SUMMARY',
                    cardField: 'summaryTranslated',
                    fieldType: 'STRING',
                    flex: 2,
                    minWidth: 150,
                    showTooltips: true
                },
                {
                    fieldType: 'TYPE_OF_STATE',
                    headerName: 'PROCESS STATUS',
                    flex: 0.6,
                    minWidth: 150
                },
                {
                    field: 'publisher',
                    headerName: 'EMITTER',
                    cardField: 'publisher',
                    fieldType: 'PUBLISHER',
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
    opfab.businessconfig.registerCustomScreen(CustomScreenMonitoring);
}
