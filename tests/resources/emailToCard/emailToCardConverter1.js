/* Copyright (c) 2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

function convertEmailToCard(email) {
    return {
        publisher: 'opfab',
        process: 'api_test',
        state: 'messageState',
        processVersion: '1',
        processInstanceId: 'emailToCardTest',
        severity: 'ALARM',
        summary: {key: 'detail.title'},
        title: {key: 'detail.title'},
        startDate: 7200000,
        data: {
            content: {
                from: email.from,
                to: email.to,
                subject: email.subject,
                body: email.body
            },
            converter: 'emailToCardConverter1.js'
        },
        entityRecipients: ['ENTITY_FR']
    };
}
