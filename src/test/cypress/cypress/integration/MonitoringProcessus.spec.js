/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OpfabGeneralCommands} from "../support/opfabGeneralCommands"
import {ScriptCommands} from "../support/scriptCommands";

describe('Monitoring processus screen tests', function () {

    const opfab = new OpfabGeneralCommands();
    const script = new ScriptCommands();

    before('Set up configuration', function () {
        script.deleteAllCards();
        script.loadTestConf();
        script.send6TestCards();
    });


    it('Check navigation between dates', function () {
        const currentDate = new Date(2024, 3, 16, 11, 35);
        opfab.loginWithUser('operator2_fr');
        cy.clock(currentDate);

        opfab.navigateToMonitoringProcessus();
        cy.waitDefaultTime();

        checkDatePickerValue('#opfab-active-from', '2024-01-01T00:00');
        checkDatePickerValue('#opfab-active-to', '2025-01-01T00:00');

        navigateBackward();
        checkDatePickerValue('#opfab-active-from', '2023-01-01T00:00');
        checkDatePickerValue('#opfab-active-to', '2024-01-01T00:00');

        navigateForward();
        navigateForward();
        checkDatePickerValue('#opfab-active-from', '2025-01-01T00:00');
        checkDatePickerValue('#opfab-active-to', '2026-01-01T00:00');

        clickMonthPeriod();
        checkDatePickerValue('#opfab-active-from', '2024-04-01T00:00');
        checkDatePickerValue('#opfab-active-to', '2024-05-01T00:00');
    });

    function checkDatePickerValue(inputId, value) {
        cy.get(inputId).should('have.value', value);
    }

    function navigateBackward() {
        cy.get('#opfab-processmonitoring-left-arrow').click();
    }

    function navigateForward() {
        cy.get('#opfab-processmonitoring-right-arrow').click();
    }

    function clickMonthPeriod() {
        cy.get('#opfab-processmonitoring-period-month').click();
    }
});
