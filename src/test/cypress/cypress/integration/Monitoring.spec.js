/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OpfabGeneralCommands} from "../support/opfabGeneralCommands"
import {AgGridCommands} from "../support/agGridCommands";
import {ScriptCommands} from "../support/scriptCommands";
import {CardCommands} from "../support/cardCommands"

describe ('Monitoring screen tests',function () {

    const opfab = new OpfabGeneralCommands();
    const agGrid = new AgGridCommands();
    const script = new ScriptCommands();
    const card = new CardCommands();

    before('Set up configuration', function () {
        script.deleteAllSettings();
        script.deleteAllCards();
        script.resetUIConfigurationFiles();
        script.loadTestConf();
        script.send6TestCards();
    });

    it('Check composition of multi-filters for process groups/processes/type of state for operator1_fr', function () {
        opfab.loginWithUser('operator1_fr');

        // We move to monitoring screen
        cy.get('#opfab-navbar-menu-monitoring').click();

        // We check we have 4 items in process multi-filter, even without choosing a process group
        cy.get('#opfab-process').click();
        cy.get('#opfab-process').find('.vscomp-option-text').should('have.length', 4);
        cy.get('#opfab-process').contains('Conference and IT incident').should('exist');
        cy.get('#opfab-process').contains('Message or question').should('exist');
        cy.get('#opfab-process').contains('IGCC').should('exist');
        cy.get('#opfab-process').contains('Process example').should('exist');

        // We check we have 2 items in process groups multi-filter
        cy.get('#opfab-processGroup').click();
        cy.get('#opfab-processGroup').find('.vscomp-option-text').should('have.length', 2);
        cy.get('#opfab-processGroup').contains('Base Examples').should('exist');
        cy.get('#opfab-processGroup').contains('User card examples').should('exist');
        // We select all process groups
        cy.get('#opfab-processGroup').find('.vscomp-toggle-all-button').click();

        // We check we have 4 items in process multi-filter
        cy.get('#opfab-process').click();
        cy.get('#opfab-process').find('.vscomp-option-text').should('have.length', 4);
        cy.get('#opfab-process').contains('Conference and IT incident').should('exist');
        cy.get('#opfab-process').contains('Message or question').should('exist');
        cy.get('#opfab-process').contains('IGCC').should('exist');
        cy.get('#opfab-process').contains('Process example').should('exist');

        cy.get('#opfab-typeOfState').click();
        cy.get('#opfab-typeOfState').find('.vscomp-option-text').should('have.length', 3);
        cy.get('#opfab-typeOfState').contains('IN PROGRESS').should('exist');
        cy.get('#opfab-typeOfState').contains('FINISHED').should('exist');
        cy.get('#opfab-typeOfState').contains('CANCELED').should('exist');
    })

    it('Check composition of multi-filters for process groups/processes/type of state for itsupervisor1', function () {
        opfab.loginWithUser('itsupervisor1');

        // We move to monitoring screen
        cy.get('#opfab-navbar-menu-monitoring').click();

        // We check we have 4 items in process multi-filter, even without choosing a process group
        cy.get('#opfab-process').click();
        cy.get('#opfab-process').find('.vscomp-option-text').should('have.length', 4);
        cy.get('#opfab-process').contains('Conference and IT incident').should('exist');
        cy.get('#opfab-process').contains('Message or question').should('exist');
        cy.get('#opfab-process').contains('IGCC').should('exist');
        cy.get('#opfab-process').contains('Process example').should('exist');

        // We check we have 2 items in process groups multi-filter
        cy.get('#opfab-processGroup').click();
        cy.get('#opfab-processGroup').find('.vscomp-option-text').should('have.length', 2);
        cy.get('#opfab-processGroup').contains('Base Examples').should('exist');
        cy.get('#opfab-processGroup').contains('User card examples').should('exist');
        // We select all process groups
        cy.get('#opfab-processGroup').find('.vscomp-toggle-all-button').click();

        // We check we have 4 items in process multi-filter
        cy.get('#opfab-process').click();
        cy.get('#opfab-process').find('.vscomp-option-text').should('have.length', 4);
        cy.get('#opfab-process').contains('Conference and IT incident').should('exist');
        cy.get('#opfab-process').contains('Message or question').should('exist');
        cy.get('#opfab-process').contains('IGCC').should('exist');
        cy.get('#opfab-process').contains('Process example').should('exist');

        cy.get('#opfab-typeOfState').click();
        cy.get('#opfab-typeOfState').find('.vscomp-option-text').should('have.length', 3);
        cy.get('#opfab-typeOfState').contains('IN PROGRESS').should('exist');
        cy.get('#opfab-typeOfState').contains('FINISHED').should('exist');
        cy.get('#opfab-typeOfState').contains('CANCELED').should('exist');
    })

    it('Check composition of multi-filters for process groups/processes/type of state for admin', function () {
        opfab.loginWithUser('admin');

        // We move to monitoring screen
        cy.get('#opfab-navbar-menu-monitoring').click();

        // We check the 3 multi-filters for service/process/type of state do not exist
        cy.get('#opfab-processGroup').should('not.exist');
        cy.get('#opfab-process').should('not.exist');
        cy.get('#opfab-typeOfState').should('not.exist');

        cy.get('#opfab-monitoring-no-process-state-available').should('exist');
        cy.get('#opfab-monitoring-no-process-state-available').contains('No process/state available').should('exist');
    })

    it('Check composition of multi-filters for processes/states/typeOfState for operator1_fr, with a config without process group', function () {
        opfab.loginWithUser('operator1_fr');

        script.loadEmptyProcessGroups();
        cy.reload();

        // We move to monitoring screen
        cy.get('#opfab-navbar-menu-monitoring').click();

        // We check we have no process groups multi-filter
        cy.get('#opfab-processGroup').should('not.exist');

        // We check we have 4 items in process multi-filter
        cy.get('#opfab-process').click();
        cy.get('#opfab-process').find('.vscomp-option-text').should('have.length', 4);
        cy.get('#opfab-process').contains('Conference and IT incident').should('exist');
        cy.get('#opfab-process').contains('Message or question').should('exist');
        cy.get('#opfab-process').contains('IGCC').should('exist');
        cy.get('#opfab-process').contains('Process example').should('exist');

        cy.get('#opfab-typeOfState').click();
        cy.get('#opfab-typeOfState').find('.vscomp-option-text').should('have.length', 3);
        cy.get('#opfab-typeOfState').contains('IN PROGRESS').should('exist');
        cy.get('#opfab-typeOfState').contains('FINISHED').should('exist');
        cy.get('#opfab-typeOfState').contains('CANCELED').should('exist');

        script.loadTestConf();
        cy.reload();
    })



    it('Check monitoring cards reception', function () {

        opfab.loginWithUser('operator1_fr');

        // We move to monitoring screen
        cy.get('#opfab-navbar-menu-monitoring').click();

        // operator1_fr should see the grid of monitoring cards
        cy.get("#opfab-monitoring-table").find('#opfab-monitoring-table-grid').should("exist");

        // No card detail is displayed
        cy.get('of-card').should('not.exist');

        // Should have the correct number of cards (5 because one card is set not to be visible in monitoring)
        agGrid.countTableRows('#opfab-monitoring-table-grid', 5);
        cy.waitDefaultTime();

        // Opens the first card, checks that its content is visible
        agGrid.clickCell('#opfab-monitoring-table-grid', 1, 1);
        cy.get('of-card').first().should('exist');

        // Closes the card content and check card  body is no longer visible
        cy.get("#opfab-close-card").click();
        cy.get('of-card').should('not.exist');
    })
    

    it('Check filters and reset button', function () {

        opfab.loginWithUser('operator1_fr');

        // Access monitoring screen
        cy.get('#opfab-navbar-menu-monitoring').click();

        // Should have the correct number of cards (5 because one card is set not to be visible in monitoring)
        agGrid.countTableRows('#opfab-monitoring-table-grid', 5);

        // Filter on IN PROGRESS cards
        cy.get('#opfab-typeOfState').click();
        cy.get('#opfab-typeOfState').contains('IN PROGRESS').should('exist');
        cy.get('#opfab-typeOfState').find('.vscomp-option-text').eq(2).click();

        // Press search button to apply the filter
        cy.get('#opfab-monitoring-btn-search').click();

        // Should have the correct number of cards (3 because 3 are IN PROGRESS)
        agGrid.countTableRows('#opfab-monitoring-table-grid', 3);

        // All found cards should be IN PROGRESS
        cy.get('#opfab-monitoring-table-grid').find('.ag-center-cols-container')
                                              .find('.ag-row')
                                              .find(".opfab-typeOfState-INPROGRESS")
                                              .should('have.length', 3);

        
        // Reset displayed cards
        cy.get('#opfab-monitoring-btn-reset').should("exist");
        cy.get('#opfab-monitoring-btn-reset').click();

        // The grid containing monitoring cards should have been reset
        agGrid.countTableRows('#opfab-monitoring-table-grid', 5);


        // Use a filter that will not return any card
        cy.get('#opfab-processGroup').click();
        cy.get('#opfab-processGroup').contains('User card examples').should('exist');
        cy.get('#opfab-processGroup').find('.vscomp-option-text').eq(1).click();

        // Press search button to apply the filter
        cy.get('#opfab-monitoring-btn-search').click();

        // No card should be displayed
        cy.get('#opfab-monitoring-table-grid').should('not.exist');

        // A text saying no result was found should be displayed
        cy.get('#opfab-monitoring-noResult').should('exist');


    })

    it('Check severity sort', function () {

        opfab.loginWithUser('operator1_fr');

        // Access monitoring screen
        cy.get('#opfab-navbar-menu-monitoring').click();

        // Create an alias to shorten the code
        cy.get('#opfab-monitoring-table-grid').find('.ag-header-container').find('.ag-header-row-column').as('monitoring-table-headers');

        // Should have the correct number of cards (5 because one card is set not to be visible in monitoring)
        agGrid.countTableRows('#opfab-monitoring-table-grid', 5);

        // Sorting severities a first time
        cy.get('@monitoring-table-headers').find('.ag-header-cell').eq(0).click();
        cy.wait(500);

        // Cards should be sorted by severity
        agGrid.cellShould('#opfab-monitoring-table-grid', 0, 3, 'have.text', '⚠️ Network Contingencies ⚠️');
        agGrid.cellShould('#opfab-monitoring-table-grid', 1, 3, 'have.text', 'Electricity consumption forecast');
        agGrid.cellShould('#opfab-monitoring-table-grid', 2, 3, 'have.text', '⚡ Planned Outage');
        agGrid.cellShould('#opfab-monitoring-table-grid', 3, 3, 'have.text', 'Process state (calcul)');
        agGrid.cellShould('#opfab-monitoring-table-grid', 4, 3, 'have.text', 'Message');

        // Sorting severities a second time
        cy.get('@monitoring-table-headers').find('.ag-header-cell').eq(0).click();
        cy.wait(500);

        // Cards should be sorted by severity
        agGrid.cellShould('#opfab-monitoring-table-grid', 0, 3, 'have.text', 'Message');
        agGrid.cellShould('#opfab-monitoring-table-grid', 1, 3, 'have.text', 'Process state (calcul)');
        agGrid.cellShould('#opfab-monitoring-table-grid', 2, 3, 'have.text', '⚡ Planned Outage');
        agGrid.cellShould('#opfab-monitoring-table-grid', 3, 3, 'have.text', '⚠️ Network Contingencies ⚠️');
        agGrid.cellShould('#opfab-monitoring-table-grid', 4, 3, 'have.text', 'Electricity consumption forecast');

    })

    it('Check title sort', function () {

        opfab.loginWithUser('operator1_fr');

        // Access monitoring screen
        cy.get('#opfab-navbar-menu-monitoring').click();

        // Create some aliases to shorten the code
        cy.get('#opfab-monitoring-table-grid').find('.ag-center-cols-container').as('monitoring-table');
        cy.get('#opfab-monitoring-table-grid').find('.ag-header-container').find('.ag-header-row-column').as('monitoring-table-headers');

        // Should have the correct number of cards (5 because one card is set not to be visible in monitoring)
        agGrid.countTableRows('#opfab-monitoring-table-grid', 5);

        // Sorting titles a first time
        cy.get('@monitoring-table-headers').find('.ag-header-cell').eq(3).click();
        cy.wait(500);

        // Cards should be sorted by title
        agGrid.cellShould('#opfab-monitoring-table-grid', 0, 3, 'have.text', 'Electricity consumption forecast');
        agGrid.cellShould('#opfab-monitoring-table-grid', 1, 3, 'have.text', 'Message');
        agGrid.cellShould('#opfab-monitoring-table-grid', 2, 3, 'have.text', 'Process state (calcul)');
        agGrid.cellShould('#opfab-monitoring-table-grid', 3, 3, 'have.text', '⚠️ Network Contingencies ⚠️');
        agGrid.cellShould('#opfab-monitoring-table-grid', 4, 3, 'have.text', '⚡ Planned Outage');

        // Sorting titles a second time
        cy.get('@monitoring-table-headers').find('.ag-header-cell').eq(3).click();
        cy.wait(500);

        // Cards should be sorted by title
        agGrid.cellShould('#opfab-monitoring-table-grid', 0, 3, 'have.text', '⚡ Planned Outage');
        agGrid.cellShould('#opfab-monitoring-table-grid', 1, 3, 'have.text', '⚠️ Network Contingencies ⚠️');
        agGrid.cellShould('#opfab-monitoring-table-grid', 2, 3, 'have.text', 'Process state (calcul)');
        agGrid.cellShould('#opfab-monitoring-table-grid', 3, 3, 'have.text', 'Message');
        agGrid.cellShould('#opfab-monitoring-table-grid', 4, 3, 'have.text', 'Electricity consumption forecast');

    })

    it('Check summary sort', function () {

        opfab.loginWithUser('operator1_fr');

        // Access monitoring screen
        cy.get('#opfab-navbar-menu-monitoring').click();

        // Create some aliases to shorten the code
        cy.get('#opfab-monitoring-table-grid').find('.ag-center-cols-container').as('monitoring-table');
        cy.get('#opfab-monitoring-table-grid').find('.ag-header-container').find('.ag-header-row-column').as('monitoring-table-headers');

        // Should have the correct number of cards (5 because one card is set not to be visible in monitoring)
        agGrid.countTableRows('#opfab-monitoring-table-grid', 5);

        // Sorting summaries a first time
        cy.get('@monitoring-table-headers').find('.ag-header-cell').eq(4).click();
        cy.wait(500);

        // Cards should be sorted by summary
        agGrid.cellShould('#opfab-monitoring-table-grid', 0, 4, 'have.text', 'Contingencies report for French network');
        agGrid.cellShould('#opfab-monitoring-table-grid', 1, 4, 'have.text', 'Message received');
        agGrid.cellShould('#opfab-monitoring-table-grid', 2, 4, 'have.text', 'Message received');
        agGrid.cellShould('#opfab-monitoring-table-grid', 3, 4, 'have.text', 'Message received');
        agGrid.cellShould('#opfab-monitoring-table-grid', 4, 4, 'have.text', 'Message received : France-England\'s interconnection is 100% operational / Result of the maintenance is <OK>');
        
        // Sorting summaries a second time
        cy.get('@monitoring-table-headers').find('.ag-header-cell').eq(4).click();
        cy.wait(500);

        // Cards should be sorted by summary
        agGrid.cellShould('#opfab-monitoring-table-grid', 0, 4, 'have.text', 'Message received : France-England\'s interconnection is 100% operational / Result of the maintenance is <OK>');
        agGrid.cellShould('#opfab-monitoring-table-grid', 1, 4, 'have.text', 'Message received');
        agGrid.cellShould('#opfab-monitoring-table-grid', 2, 4, 'have.text', 'Message received');
        agGrid.cellShould('#opfab-monitoring-table-grid', 3, 4, 'have.text', 'Message received');
        agGrid.cellShould('#opfab-monitoring-table-grid', 4, 4, 'have.text', 'Contingencies report for French network');

    })

    it('Check process state sort', function () {

        opfab.loginWithUser('operator1_fr');

        // Access monitoring screen
        cy.get('#opfab-navbar-menu-monitoring').click();

        // Create some aliases to shorten the code
        cy.get('#opfab-monitoring-table-grid').find('.ag-center-cols-container').as('monitoring-table');
        cy.get('#opfab-monitoring-table-grid').find('.ag-header-container').find('.ag-header-row-column').as('monitoring-table-headers');

        // Should have the correct number of cards (5 because one card is set not to be visible in monitoring)
        agGrid.countTableRows('#opfab-monitoring-table-grid', 5);

        // Sorting process states a first time
        cy.get('@monitoring-table-headers').find('.ag-header-cell').eq(5).click();
        cy.wait(500);

        // Cards should be sorted by process states
        agGrid.cellShould('#opfab-monitoring-table-grid', 0, 5, 'have.text', 'CANCELED');
        agGrid.cellShould('#opfab-monitoring-table-grid', 1, 5, 'have.text', 'FINISHED');
        agGrid.cellShould('#opfab-monitoring-table-grid', 2, 5, 'have.text', 'IN PROGRESS');
        agGrid.cellShould('#opfab-monitoring-table-grid', 3, 5, 'have.text', 'IN PROGRESS');
        agGrid.cellShould('#opfab-monitoring-table-grid', 4, 5, 'have.text', 'IN PROGRESS');
        
        // Sorting process states a second time
        cy.get('@monitoring-table-headers').find('.ag-header-cell').eq(5).click();
        cy.wait(500);

        // Cards should be sorted by process states
        agGrid.cellShould('#opfab-monitoring-table-grid', 0, 5, 'have.text', 'IN PROGRESS');
        agGrid.cellShould('#opfab-monitoring-table-grid', 1, 5, 'have.text', 'IN PROGRESS');
        agGrid.cellShould('#opfab-monitoring-table-grid', 2, 5, 'have.text', 'IN PROGRESS');
        agGrid.cellShould('#opfab-monitoring-table-grid', 3, 5, 'have.text', 'FINISHED');
        agGrid.cellShould('#opfab-monitoring-table-grid', 4, 5, 'have.text', 'CANCELED');

    })

    it('Check emitter sort', function () {

        opfab.loginWithUser('operator1_fr');

        // Access monitoring screen
        cy.get('#opfab-navbar-menu-monitoring').click();

        // Create some aliases to shorten the code
        cy.get('#opfab-monitoring-table-grid').find('.ag-center-cols-container').as('monitoring-table');
        cy.get('#opfab-monitoring-table-grid').find('.ag-header-container').find('.ag-header-row-column').as('monitoring-table-headers');

        // Should have the correct number of cards (5 because one card is set not to be visible in monitoring)
        agGrid.countTableRows('#opfab-monitoring-table-grid', 5);


        // Sorting emitters a first time
        cy.get('@monitoring-table-headers').find('.ag-header-cell').eq(6).click();
        cy.wait(500);

        // Cards should be sorted by emitter
        agGrid.cellShould('#opfab-monitoring-table-grid', 0, 6, 'have.text', 'Control Center FR North (publisher_test)');
        agGrid.cellShould('#opfab-monitoring-table-grid', 1, 6, 'have.text', 'publisher_test');
        agGrid.cellShould('#opfab-monitoring-table-grid', 2, 6, 'have.text', 'publisher_test');
        agGrid.cellShould('#opfab-monitoring-table-grid', 3, 6, 'have.text', 'publisher_test');
        agGrid.cellShould('#opfab-monitoring-table-grid', 4, 6, 'have.text', 'publisher_test');
        
        // Sorting emitters a second time
        cy.get('@monitoring-table-headers').find('.ag-header-cell').eq(6).click();
        cy.wait(500);

        // Cards should be sorted by emitter
        agGrid.cellShould('#opfab-monitoring-table-grid', 0, 6, 'have.text', 'publisher_test');
        agGrid.cellShould('#opfab-monitoring-table-grid', 1, 6, 'have.text', 'publisher_test');
        agGrid.cellShould('#opfab-monitoring-table-grid', 2, 6, 'have.text', 'publisher_test');
        agGrid.cellShould('#opfab-monitoring-table-grid', 3, 6, 'have.text', 'publisher_test');
        agGrid.cellShould('#opfab-monitoring-table-grid', 4, 6, 'have.text', 'Control Center FR North (publisher_test)');

    })

    it('Check answer sort', function () {

        opfab.loginWithUser('operator1_fr');

        // Access monitoring screen
        cy.get('#opfab-navbar-menu-monitoring').click();

        // Create some aliases to shorten the code
        cy.get('#opfab-monitoring-table-grid').find('.ag-center-cols-container').as('monitoring-table');
        cy.get('#opfab-monitoring-table-grid').find('.ag-header-container').find('.ag-header-row-column').as('monitoring-table-headers');

        // Should have the correct number of cards (5 because one card is set not to be visible in monitoring)
        agGrid.countTableRows('#opfab-monitoring-table-grid', 5);


        // Sorting answers a first time
        cy.get('@monitoring-table-headers').find('.ag-header-cell').eq(7).click();
        cy.wait(500);

        // Cards should be sorted by answer
        agGrid.cellShould('#opfab-monitoring-table-grid', 0, 7, 'have.text', '');
        agGrid.cellShould('#opfab-monitoring-table-grid', 1, 7, 'have.text', '');
        agGrid.cellShould('#opfab-monitoring-table-grid', 2, 7, 'have.text', '');
        agGrid.cellShould('#opfab-monitoring-table-grid', 3, 7, 'have.text', '');
        agGrid.cellShould('#opfab-monitoring-table-grid', 4, 7, 'not.contain.text', 'Control Center FR East');
        agGrid.cellShould('#opfab-monitoring-table-grid', 4, 7, 'contain.text', 'Control Center FR North');
        agGrid.cellShould('#opfab-monitoring-table-grid', 4, 7, 'contain.text', 'Control Center FR South');
        

        // Sorting answers a second time
        cy.get('@monitoring-table-headers').find('.ag-header-cell').eq(7).click();
        cy.wait(500);

        // Cards should be sorted by emitter
        agGrid.cellShould('#opfab-monitoring-table-grid', 0, 7, 'not.contain.text', 'Control Center FR East');
        agGrid.cellShould('#opfab-monitoring-table-grid', 0, 7, 'contain.text', 'Control Center FR North');
        agGrid.cellShould('#opfab-monitoring-table-grid', 0, 7, 'contain.text', 'Control Center FR South');
        agGrid.cellShould('#opfab-monitoring-table-grid', 1, 7, 'have.text', '');
        agGrid.cellShould('#opfab-monitoring-table-grid', 2, 7, 'have.text', '');
        agGrid.cellShould('#opfab-monitoring-table-grid', 3, 7, 'have.text', '');
        agGrid.cellShould('#opfab-monitoring-table-grid', 4, 7, 'have.text', '');

    })

    it('Check card response', function () {

        opfab.loginWithUser('operator1_fr');

        cy.get('of-light-card').should('have.length', 6);

        // Click on 2nd  card
        cy.get('of-light-card').eq(1).click();
  
        // template is ready
        cy.get("#question-form").should('exist');
        // Respond to the card 
        card.sendResponse();

        cy.waitDefaultTime();

        // Access monitoring screen
        cy.get('#opfab-navbar-menu-monitoring').click();

        agGrid.countTableRows('#opfab-monitoring-table-grid', 5);

        // Check response arrow icon
        agGrid.cellElementShould('#opfab-monitoring-table-grid', 2, 2, 'em', 'have.class', 'fa-reply');

    })

    it('Check export', function () {
        // Standard export, no custom configuration
        script.loadMonitoringConfig('emptyConfig.json');

        opfab.loginWithUser('operator1_fr');

        // Access monitoring screen
        cy.get('#opfab-navbar-menu-monitoring').click();

        agGrid.countTableRows('#opfab-monitoring-table-grid', 5);

        // Check response arrow icon before lauching export , to let the time for child card processing 
        agGrid.cellElementShould('#opfab-monitoring-table-grid', 2, 2, 'em', 'have.class', 'fa-reply');


        // Do export
        cy.get('#opfab-monitoring-btn-exportToExcel').click();

        cy.waitDefaultTime();

            // check download folder contains the export file
            cy.task('list', {dir: './cypress/downloads'}).then((files) => {
            expect(files.length).to.equal(1);
            // check file name
            expect(files[0]).to.match(/^Monitoring_export_\d*\.xlsx/);
            // check file content
            cy.task('readXlsx', { file: './cypress/downloads/' + files[0], sheet: "data" }).then((rows) => {
                expect(rows.length).to.equal(5);

                expect(rows[0]['TIME']).to.match(/^\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}$/);
                expect(rows[0]['BUSINESS PERIOD']).to.match(/^\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}-\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}$/);
                expect(rows[0]['ANSWER']).to.equal('FALSE');
                expect(rows[0].TITLE).to.equal('⚠️ Network Contingencies ⚠️');
                expect(rows[0].SUMMARY).to.equal('Contingencies report for French network');
                expect(rows[0]['PROCESS STATUS']).to.equal('IN PROGRESS');
                expect(rows[0].SEVERITY).to.equal('Alarm');
                expect(rows[0].EMITTER).to.equal('publisher_test');
                expect(rows[0]['REQUIRED ANSWERS']).to.equal('');
                expect(rows[0].ANSWERS).to.equal('');

                expect(rows[1]['TIME']).to.match(/^\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}$/);
                expect(rows[1]['BUSINESS PERIOD']).to.match(/^\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}-$/);
                expect(rows[1]['ANSWER']).to.equal('FALSE');
                expect(rows[1].TITLE).to.equal('Electricity consumption forecast');
                expect(rows[1].SUMMARY).to.equal('Message received');
                expect(rows[1]['PROCESS STATUS']).to.equal('CANCELED');
                expect(rows[1].SEVERITY).to.equal('Alarm');
                expect(rows[1].EMITTER).to.equal('publisher_test');
                expect(rows[1]['REQUIRED ANSWERS']).to.equal('');
                expect(rows[1].ANSWERS).to.equal('');
                
                expect(rows[2]['TIME']).to.match(/^\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}$/);
                expect(rows[2]['BUSINESS PERIOD']).to.match(/^\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}-\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}$/);
                expect(rows[2]['ANSWER']).to.equal('TRUE');
                expect(rows[2].TITLE).to.equal('⚡ Planned Outage');
                expect(rows[2].SUMMARY).to.equal('Message received');
                expect(rows[2]['PROCESS STATUS']).to.equal('IN PROGRESS');
                expect(rows[2].SEVERITY).to.equal('Action');
                expect(rows[2].EMITTER).to.equal('publisher_test');
                expect(rows[2]['REQUIRED ANSWERS']).to.equal('Control Center FR North,Control Center FR South');
                expect(rows[2].ANSWERS).to.equal('Control Center FR North');

                expect(rows[3]['TIME']).to.match(/^\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}$/);
                expect(rows[3]['BUSINESS PERIOD']).to.match(/^\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}-\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}$/);
                expect(rows[3]['ANSWER']).to.equal('FALSE');
                expect(rows[3].TITLE).to.equal('Process state (calcul)');
                expect(rows[3].SUMMARY).to.equal('Message received');
                expect(rows[3]['PROCESS STATUS']).to.equal('IN PROGRESS');
                expect(rows[3].SEVERITY).to.equal('Compliant');
                expect(rows[3].EMITTER).to.equal('publisher_test');
                expect(rows[3]['REQUIRED ANSWERS']).to.equal('');
                expect(rows[3].ANSWERS).to.equal('');

                expect(rows[4]['TIME']).to.match(/^\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}$/);
                expect(rows[4]['BUSINESS PERIOD']).to.match(/^\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}-\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}$/);
                expect(rows[4]['ANSWER']).to.equal('FALSE');
                expect(rows[4].TITLE).to.equal('Message');
                expect(rows[4].SUMMARY).to.equal("Message received : France-England's interconnection is 100% operational / Result of the maintenance is <OK>");
                expect(rows[4]['PROCESS STATUS']).to.equal('FINISHED');
                expect(rows[4].SEVERITY).to.equal('Information');
                expect(rows[4].EMITTER).to.equal('Control Center FR North (publisher_test)');
                expect(rows[4]['REQUIRED ANSWERS']).to.equal('');
                expect(rows[4].ANSWERS).to.equal('');

                // Delete export file
                cy.task('deleteFile', { filename: './cypress/downloads/' + files[0] })
            })
 

        })

    })

    it('Check custom export configuration', function () {
        // Load custom export configuration
        script.loadMonitoringConfig('monitoringConfig.json');

        opfab.loginWithUser('operator1_fr');

        // Access monitoring screen
        cy.get('#opfab-navbar-menu-monitoring').click();

        agGrid.countTableRows('#opfab-monitoring-table-grid', 5);

        // Do export
        cy.get('#opfab-monitoring-btn-exportToExcel').click();

        cy.waitDefaultTime();

            // check download folder contains the export file
            cy.task('list', {dir: './cypress/downloads'}).then((files) => {
            expect(files.length).to.equal(1);
            // check file name
            expect(files[0]).to.match(/^Monitoring_export_\d*\.xlsx/);
            
            // check file content
            cy.task('readXlsx', { file: './cypress/downloads/' + files[0], sheet: "data"}).then((rows) => {
                expect(rows.length).to.equal(5);

                expect(rows[0]['Creation Date']).to.match(/^\d{2}\/\d{2}\/\d{2} \d{2}:\d{2}$/);
                expect(rows[0]['Business Date - start']).to.match(/^\d{2}\/\d{2}\/\d{2} \d{2}:\d{2}$/);
                expect(rows[0]['Business Date - end']).to.match(/^\d{2}\/\d{2}\/\d{2} \d{2}:\d{2}$/);
                expect(rows[0]['Service']).to.equal('Base Examples');
                expect(rows[0]['Process']).to.equal('Process example ');
                expect(rows[0]['Title']).to.equal('⚠️ Network Contingencies ⚠️');
                expect(rows[0]['Summary']).to.equal('Contingencies report for French network');
                expect(rows[0]['Status']).to.equal('IN PROGRESS');
                expect(rows[0]['Severity']).to.equal('Alarm');
                expect(rows[0]['Response from']).to.equal('');
                expect(rows[0]['Response date']).to.equal('');
                expect(rows[0]['Response']).to.equal('');

                expect(rows[1]['Creation Date']).to.match(/^\d{2}\/\d{2}\/\d{2} \d{2}:\d{2}$/);
                expect(rows[1]['Business Date - start']).to.match(/^\d{2}\/\d{2}\/\d{2} \d{2}:\d{2}$/);
                expect(rows[1]['Business Date - end']).to.equal('');
                expect(rows[1]['Service']).to.equal('Base Examples');
                expect(rows[1]['Process']).to.equal('Process example ');
                expect(rows[1]['Title']).to.equal('Electricity consumption forecast');
                expect(rows[1]['Summary']).to.equal('Message received');
                expect(rows[1]['Status']).to.equal('CANCELED');
                expect(rows[1]['Severity']).to.equal('Alarm');
                expect(rows[1]['Response from']).to.equal('');
                expect(rows[1]['Response date']).to.equal('');
                expect(rows[1]['Response']).to.equal('');
 
                expect(rows[2]['Creation Date']).to.match(/^\d{2}\/\d{2}\/\d{2} \d{2}:\d{2}$/);
                expect(rows[2]['Business Date - start']).to.match(/^\d{2}\/\d{2}\/\d{2} \d{2}:\d{2}$/);
                expect(rows[2]['Business Date - end']).to.match(/^\d{2}\/\d{2}\/\d{2} \d{2}:\d{2}$/);
                expect(rows[2]['Service']).to.equal('Base Examples');
                expect(rows[2]['Process']).to.equal('Process example ');
                expect(rows[2]['Title']).to.equal('⚡ Planned Outage');
                expect(rows[2]['Summary']).to.equal('Message received');
                expect(rows[2]['Status']).to.equal('IN PROGRESS');
                expect(rows[2]['Severity']).to.equal('Action');
                expect(rows[2]['Response from']).to.equal('Control Center FR North');
                expect(rows[2]['Response date']).to.match(/^\d{2}\/\d{2}\/\d{2} \d{2}:\d{2}$/);
                expect(rows[2]['Response']).to.equal('');
          
                expect(rows[3]['Creation Date']).to.match(/^\d{2}\/\d{2}\/\d{2} \d{2}:\d{2}$/);
                expect(rows[3]['Business Date - start']).to.match(/^\d{2}\/\d{2}\/\d{2} \d{2}:\d{2}$/);
                expect(rows[3]['Business Date - end']).to.match(/^\d{2}\/\d{2}\/\d{2} \d{2}:\d{2}$/);
                expect(rows[3]['Service']).to.equal('Base Examples');
                expect(rows[3]['Process']).to.equal('Process example ');
                expect(rows[3]['Title']).to.equal('Process state (calcul)');
                expect(rows[3]['Summary']).to.equal('Message received');
                expect(rows[3]['Status']).to.equal('IN PROGRESS');
                expect(rows[3]['Severity']).to.equal('Compliant');
                expect(rows[3]['Response from']).to.equal('');
                expect(rows[3]['Response date']).to.equal('');
                expect(rows[3]['Response']).to.equal('');

                expect(rows[4]['Creation Date']).to.match(/^\d{2}\/\d{2}\/\d{2} \d{2}:\d{2}$/);
                expect(rows[4]['Business Date - start']).to.match(/^\d{2}\/\d{2}\/\d{2} \d{2}:\d{2}$/);
                expect(rows[4]['Business Date - end']).to.match(/^\d{2}\/\d{2}\/\d{2} \d{2}:\d{2}$/);
                expect(rows[4]['Service']).to.equal('Base Examples');
                expect(rows[4]['Process']).to.equal('Process example ');
                expect(rows[4]['Title']).to.equal('Message');
                expect(rows[4]['Summary']).to.equal("Message received : France-England's interconnection is 100% operational / Result of the maintenance is <OK>");
                expect(rows[4]['Status']).to.equal('FINISHED');
                expect(rows[4]['Severity']).to.equal('Information');
                expect(rows[4]['Response from']).to.equal('');
                expect(rows[4]['Response date']).to.equal('');
                expect(rows[4]['Response']).to.equal('');
                // Delete export file
                cy.task('deleteFile', { filename: './cypress/downloads/' + files[0] })
            })

        })

    })

})
