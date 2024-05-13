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
import {AgGridCommands} from "../support/agGridCommands";

describe('Monitoring processus screen tests', function () {

    const opfab = new OpfabGeneralCommands();
    const script = new ScriptCommands();
    const agGrid = new AgGridCommands();

    before('Set up configuration', function () {
        script.deleteAllCards();
        script.loadTestConf();
        script.send6TestCards();
    });


    it('Check cards reception for monitoring processus screen', function () {

        opfab.loginWithUser('operator2_fr');

        opfab.navigateToMonitoringProcessus();

        // operator2_fr should see the grid of cards
        cy.get("#opfab-processmonitoring-table-grid").should("exist");

        // Should have 3 cards
        agGrid.countTableRows('#opfab-processmonitoring-table-grid', 3);

        agGrid.cellShould('#opfab-processmonitoring-table-grid', 0, 2, 'have.text', 'Message');
        agGrid.cellShould('#opfab-processmonitoring-table-grid', 0, 3, 'have.text', '');
        agGrid.cellShould('#opfab-processmonitoring-table-grid', 0, 4, 'have.text',
            '{\"ops\":[{\"insert\":\"France-England\'s interconnection is 100% operational / Result of the maintenance is <OK>\\n\"}]}');
        agGrid.cellShould('#opfab-processmonitoring-table-grid', 0, 5, 'have.text',
            'Message received : France-England\'s interconnection is 100% operational / Result of the maintenance is <OK>');
        agGrid.cellShould('#opfab-processmonitoring-table-grid', 0, 6, 'have.text', '');

        agGrid.cellShould('#opfab-processmonitoring-table-grid', 2, 3, 'have.text',
            'ENTITY1_FR, ENTITY2_FR, ENTITY3_FR');

        // No card detail is displayed
        cy.get('of-card').should('not.exist');

        // Opens the first card, checks that its content is visible
        agGrid.clickCell('#opfab-processmonitoring-table-grid', 0, 1);
        cy.get('of-card').first().should('exist');

        // Closes the card content and check card body is no longer visible
        cy.get("#opfab-close-card").click();
        cy.get('of-card').should('not.exist');
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
