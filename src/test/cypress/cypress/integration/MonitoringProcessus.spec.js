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
import {UserCardCommands} from "../support/userCardCommands";
import {ArchivesAndLoggingCommands} from "../support/archivesAndLoggingCommands";

describe('Monitoring processus screen tests', function () {

    const opfab = new OpfabGeneralCommands();
    const script = new ScriptCommands();
    const agGrid = new AgGridCommands();
    const usercard = new UserCardCommands();
    const archivesAndLogging = new ArchivesAndLoggingCommands();

    before('Set up configuration', function () {
        script.deleteAllCards();
        script.loadTestConf();
        script.send6TestCards();
    });

    after('Clean export directory', function () {
        script.cleanDownloadsDir();
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
        agGrid.cellShould('#opfab-processmonitoring-table-grid', 0, 4, 'have.text', '');
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

        // We check the column with data.stateName is filled
        clickSeeOnlyTheCardsIAmRecipientOf(); // we uncheck
        clickSearch();
        agGrid.cellShould('#opfab-processmonitoring-table-grid', 2, 2, 'have.text', 'Process state (calcul)');
        agGrid.cellShould('#opfab-processmonitoring-table-grid', 2, 3, 'have.text', '');
        agGrid.cellShould('#opfab-processmonitoring-table-grid', 2, 4, 'have.text', 'CALCUL1');
        agGrid.cellShould('#opfab-processmonitoring-table-grid', 2, 5, 'have.text',
            'Message received');
        agGrid.cellShould('#opfab-processmonitoring-table-grid', 2, 6, 'have.text', '');
        clickSeeOnlyTheCardsIAmRecipientOf(); // we re-check
    });


    it('Check the columns displayed change following the selected process', () => {
        opfab.loginWithUser('operator2_fr');
        opfab.navigateToUserCard();
        usercard.selectService('User card examples');
        usercard.selectProcess('Conference and IT incident');
        usercard.selectState('Conference Call ☏');
        usercard.previewThenSendCard();

        opfab.navigateToUserCard();
        usercard.selectService('User card examples');
        usercard.selectProcess('Message or question');
        usercard.selectState('Message or question list');
        cy.get('#message-select').click();
        cy.get('#message-select').find('.vscomp-search-input').type('Confirmation the issues have been fixed');
        cy.get('#message-select').find('.vscomp-option-text').eq(0).click();
        usercard.previewThenSendCard();
        cy.waitDefaultTime();

        opfab.navigateToMonitoringProcessus();

        // operator2_fr should see the grid of cards
        cy.get("#opfab-processmonitoring-table-grid").should("exist");

        // Should have 5 cards
        agGrid.countTableRows('#opfab-processmonitoring-table-grid', 5);

        // No process is selected, so we should see 7 columns (default configuration (including severity))
        agGrid.countTableColumns('#opfab-processmonitoring-table-grid', 7);
        agGrid.cellShould('#opfab-processmonitoring-table-grid', 0, 2, 'have.text', 'Message');
        agGrid.cellShould('#opfab-processmonitoring-table-grid', 0, 3, 'have.text', '');
        agGrid.cellShould('#opfab-processmonitoring-table-grid', 0, 4, 'have.text', '');
        agGrid.cellShould('#opfab-processmonitoring-table-grid', 0, 5, 'have.text',
            'Message received : France-England\'s interconnection is 100% operational / Result of the maintenance is <OK>');
        agGrid.cellShould('#opfab-processmonitoring-table-grid', 0, 6, 'have.text', '');
        agGrid.cellShould('#opfab-processmonitoring-table-grid', 2, 3, 'have.text',
            'ENTITY1_FR, ENTITY2_FR, ENTITY3_FR');

        // The user selects only "Conference and IT incident" process, so we should see 4 columns and only 1 card
        archivesAndLogging.selectProcess('Conference and IT incident');
        clickSearch();
        agGrid.countTableColumns('#opfab-processmonitoring-table-grid', 4);
        agGrid.countTableRows('#opfab-processmonitoring-table-grid', 1);

        agGrid.cellShould('#opfab-processmonitoring-table-grid', 0, 2, 'have.text', 'Conference Call ☏');
        agGrid.cellShould('#opfab-processmonitoring-table-grid', 0, 3, 'have.text',
            'IT_SUPERVISOR_ENTITY');

        // The user selects only "Message or question" process, so we should see 5 columns and only 1 card
        clickOnResetButton();
        archivesAndLogging.clickOnProcessSelect();
        cy.selectProcess('Message or question');
        clickSearch();
        agGrid.countTableColumns('#opfab-processmonitoring-table-grid', 5);
        agGrid.countTableRows('#opfab-processmonitoring-table-grid', 1);

        agGrid.cellShould('#opfab-processmonitoring-table-grid', 0, 3, 'have.text', 'Confirmation the issues have been fixed');
        agGrid.cellShould('#opfab-processmonitoring-table-grid', 0, 4, 'have.text',
            'ENTITY1_FR,ENTITY2_FR,ENTITY4_FR,ENTITY1_IT,ENTITY1_NL');

        // The user selects all the processes, so we should see 7 columns (default conf.) and 5 cards
        clickOnResetButton();
        archivesAndLogging.clickOnProcessSelect();
        cy.selectProcess('Conference and IT incident');
        cy.selectProcess('Message or question');
        cy.selectProcess('Process example');
        clickSearch();
        agGrid.countTableColumns('#opfab-processmonitoring-table-grid', 7);
        agGrid.countTableRows('#opfab-processmonitoring-table-grid', 5);
    });


    it('Check export', function () {
        opfab.loginWithUser('operator2_fr');
        opfab.navigateToMonitoringProcessus();

        clickOnExportButton();
        cy.waitDefaultTime();

        // check download folder contains the export file
        cy.task('list', {dir: './cypress/downloads'}).then((files) => {
            expect(files.length).to.equal(1);

            // check file name
            expect(files[0]).to.match(/^ProcessMonitoring_export_\d*\.xlsx/);
            // check file content
            cy.task('readXlsx', {file: './cypress/downloads/' + files[0], sheet: 'data'}).then((rows) => {
                expect(rows.length).to.equal(5);

                expect(rows[0]['SEVERITY']).to.equal('ALARM');
                checkStartDateForExportRow(rows[0]);
                expect(rows[0]['Entity Recipients']).to.equal('IT_SUPERVISOR_ENTITY');
                expect(rows[0]['Title']).to.equal('Conference Call ☏');
                expect(rows[0]['My field']).to.equal(undefined);
                expect(rows[0]['Summary']).to.equal('You are invited to a conference');
                expect(rows[0]['My second field']).to.equal(undefined);
            });
        });

        script.cleanDownloadsDir();

        // The user selects only "Conference and IT incident" process, so we should have 4 columns and only 1 card
        archivesAndLogging.clickOnProcessSelect();
        cy.selectProcess('Conference and IT incident');
        clickSearch();

        clickOnExportButton();
        cy.waitDefaultTime();

        // check download folder contains the export file
        cy.task('list', {dir: './cypress/downloads'}).then((files) => {
            expect(files.length).to.equal(1);

            // check file name
            expect(files[0]).to.match(/^ProcessMonitoring_export_\d*\.xlsx/);
            // check file content
            cy.task('readXlsx', {file: './cypress/downloads/' + files[0], sheet: 'data'}).then((rows) => {
                expect(rows.length).to.equal(1);

                expect(rows[0]['SEVERITY']).to.equal('ALARM');
                checkStartDateForExportRow(rows[0]);
                expect(rows[0]['Entity Recipients']).to.equal('IT_SUPERVISOR_ENTITY');
                expect(rows[0]['Title']).to.equal('Conference Call ☏');
                expect(rows[0]['Summary']).to.equal(undefined); // The summary must not be displayed 
            });
        });
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

    function clickOnResetButton() {
        cy.get('#opfab-process-monitoring-btn-reset').click();
        cy.wait(200); // wait reset is done
    }

    function checkStartDateForExportRow(row) {
        expect(row['Start Date']).to.match(/^\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}$/);
    }

    function clickOnExportButton() {
        cy.get('#opfab-processmonitoring-btn-exportToExcel').click();
    }

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

    function clickSeeOnlyTheCardsIAmRecipientOf() {
        cy.get('#opfab-process-monitoring-see-only-cards-i-am-recipient-of-checkbox').click();
    }

    function clickSearch() {
        cy.get('#opfab-process-monitoring-btn-search').click();
    }
});
