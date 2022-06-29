/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

describe ('Logging screen tests',function () {

    function checkLoadingSpinnerIsDisplayed() {
        cy.get('#opfab-loading-spinner').should('exist');
    }

    function checkLoadingSpinnerIsNotDisplayed() {
        cy.get('#opfab-loading-spinner').should('not.exist');
    }

    before('Set up configuration', function () {
        cy.loadTestConf();
    });


    it('Check composition of multi-filters for process groups/processes/states for operator1_fr', function () {
        cy.loginOpFab('operator1_fr', 'test');

        // We move to logging screen
        cy.get('#opfab-navbar-menu-logging').click();

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

        // We select all processes
        cy.get('#opfab-process').find('.vscomp-toggle-all-button').click();
        cy.get('#opfab-process').click();

        // We check we have 19 states 
        cy.get('#opfab-state').click();
        cy.get('#opfab-state').find('.vscomp-toggle-all-button').click();
        cy.get('#opfab-state').find('.vscomp-value').contains('+ 18 more').should('exist');

        // We unselect all processes then we select 'Process example' process and we check there are 8 states for this process
        cy.get('#opfab-process').click();
        cy.get('#opfab-process').find('.vscomp-toggle-all-button').click();
        cy.get('#opfab-process').contains('Process example').click();
        cy.get('#opfab-process').click();
        cy.get('#opfab-state').click();
        cy.get('#opfab-state').find('.vscomp-option-text').should('have.length', 9);
        // We check this state is present because it is only a child state but that kind of state must be visible in logging screen
        cy.get('#opfab-state').contains('Planned outage date response').should('exist');
    })

    it('Check composition of multi-filters for process groups/processes/states for itsupervisor1', function () {
        cy.loginOpFab('itsupervisor1', 'test');

        // We move to logging screen
        cy.get('#opfab-navbar-menu-logging').click();

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

        // We select all processes
        cy.get('#opfab-process').find('.vscomp-toggle-all-button').click();
        cy.get('#opfab-process').click();

        // We check we have 12 states (and 4 items for their process)
        cy.get('#opfab-state').click();
        cy.get('#opfab-state').find('.vscomp-toggle-all-button').click();
        cy.get('#opfab-state').find('.vscomp-value').contains('+ 11 more').should('exist');

        // We unselect all processes then we select 'Process example' process and we check there is only 1 state for this process
        cy.get('#opfab-process').click();
        cy.get('#opfab-process').find('.vscomp-toggle-all-button').click();
        cy.get('#opfab-process').contains('Process example').click();
        cy.get('#opfab-process').click();
        cy.get('#opfab-state').click();
        cy.get('#opfab-state').find('.vscomp-option-text').should('have.length', 2);
        cy.get('#opfab-state').contains('Action Required', {matchCase: false}).should('exist');
    })

    it('Check composition of multi-filters for process groups/processes/states for admin', function () {
        cy.loginOpFab('admin', 'test');

        // We move to logging screen
        cy.get('#opfab-navbar-menu-logging').click();

        // We check the 3 multi-filters for service/process/state do not exist
        cy.get('#opfab-processGroup').should('not.exist');
        cy.get('#opfab-process').should('not.exist');
        cy.get('#opfab-state').should('not.exist');

        cy.get('#opfab-logging-no-process-state-available').should('exist');
        cy.get('#opfab-logging-no-process-state-available').contains('No process/state available').should('exist');
    })

    it('Check composition of multi-filters for process groups/processes/states for operator1_fr, with a config without process group', function () {
        cy.loginOpFab('operator1_fr', 'test');

        cy.loadEmptyProcessGroups();
        cy.reload();

        // We move to logging screen
        cy.get('#opfab-navbar-menu-logging').click();

        // We check process groups multi-filter do not exist
        cy.get('#opfab-processGroup').should('not.exist');

        // We check we have 4 items in process multi-filter
        cy.get('#opfab-process').click();
        cy.get('#opfab-process').find('.vscomp-option-text').should('have.length', 4);
        cy.get('#opfab-process').contains('Conference and IT incident').should('exist');
        cy.get('#opfab-process').contains('Message or question').should('exist');
        cy.get('#opfab-process').contains('IGCC').should('exist');
        cy.get('#opfab-process').contains('Process example').should('exist');

        // We select all processes
        cy.get('#opfab-process').find('.vscomp-toggle-all-button').click();
        cy.get('#opfab-process').click();

        // We check we have 19 states (and 4 items for their process)
        cy.get('#opfab-state').click();
        cy.get('#opfab-state').find('.vscomp-toggle-all-button').click();
        cy.get('#opfab-state').find('.vscomp-value').contains('+ 18 more').should('exist');

        // We unselect all processes then we select 'Process example' process and we check there are 8 states for this process
        cy.get('#opfab-process').click();
        cy.get('#opfab-process').find('.vscomp-toggle-all-button').click();
        cy.get('#opfab-process').contains('Process example').click();
        cy.get('#opfab-process').click();
        cy.get('#opfab-state').click();
        cy.get('#opfab-state').find('.vscomp-toggle-all-button').click();
        cy.get('#opfab-state').find('.vscomp-value').contains('+ 7 more').should('exist');
        // We check this state is present because it is only a child state but that kind of state must be visible in logging screen
        cy.get('#opfab-state').contains('Planned outage date response').should('exist');

        cy.loadTestConf();
        cy.reload();
    })

    it('Check export', function () {

        cy.deleteAllArchivedCards();
        cy.send6TestCards();
        cy.loginOpFab('operator1_fr','test');

        // Access logging screen
        cy.get('#opfab-navbar-menu-logging').click();

        cy.get('#opfab-archives-logging-btn-search').click();

        // We should have 6 lines
        cy.get('#opfab-logging-cards-list').find('tr').should('have.length',7); // +1 for the line with the columns name
        cy.get('of-card-detail').should('not.exist');
        cy.get('#opfab-logging-results-number').should('have.text', ' Results number  : 6 ');

        // Do export
        cy.get('#opfab-logging-btn-exportToExcel').click();
        cy.waitDefaultTime();

        // check download folder contains the export file
        cy.task('list', {dir: './cypress/downloads'}).then((files) => {
            expect(files.length).to.equal(1);
            // check file name
            expect(files[0]).to.match(/^Logging_export_\d*\.xlsx/);
            // check file content
            cy.task('readXlsx', { file: './cypress/downloads/' + files[0], sheet: "data" }).then((rows) => {
                expect(rows.length).to.equal(6);

                expect(rows[0]['SEVERITY']).to.equal('Alarm');
                expect(rows[0]['TIME OF ACTION']).to.match(/^\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}$/);
                expect(rows[0]['SERVICE']).to.equal('Base Examples');
                expect(rows[0]['PROCESS']).to.equal('Process example ');
                expect(rows[0]['TITLE']).to.equal('⚠️ Network Contingencies ⚠️');
                expect(rows[0]['SUMMARY']).to.equal('Contingencies report for French network');
                expect(rows[0]['STATE']).to.equal('⚠️ Network Contingencies ⚠️');
                expect(rows[0]['STATE DESCRIPTION']).to.equal('Contingencies state');
                expect(rows[0]['ACTOR']).to.equal('publisher_test');
                expect(rows[0]['REPRESENTATIVE']).to.be.empty;

                expect(rows[1]['SEVERITY']).to.equal('Alarm');
                expect(rows[1]['TIME OF ACTION']).to.match(/^\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}$/);
                expect(rows[1]['SERVICE']).to.equal('Base Examples');
                expect(rows[1]['PROCESS']).to.equal('Process example ');
                expect(rows[1]['TITLE']).to.equal('Electricity consumption forecast');
                expect(rows[1]['SUMMARY']).to.equal('Message received');
                expect(rows[1]['STATE']).to.equal('Electricity consumption forecast');
                expect(rows[1]['STATE DESCRIPTION']).to.equal('Chart line state');
                expect(rows[1]['ACTOR']).to.equal('publisher_test');
                expect(rows[1]['REPRESENTATIVE']).to.be.empty;

                expect(rows[2]['SEVERITY']).to.equal('Action');
                expect(rows[2]['TIME OF ACTION']).to.match(/^\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}$/);
                expect(rows[2]['SERVICE']).to.equal('Base Examples');
                expect(rows[2]['PROCESS']).to.equal('Process example ');
                expect(rows[2]['TITLE']).to.equal('⚡ Planned Outage');
                expect(rows[2]['SUMMARY']).to.equal('Message received');
                expect(rows[2]['STATE']).to.equal('Action required');
                expect(rows[2]['STATE DESCRIPTION']).to.equal('Question state');
                expect(rows[2]['ACTOR']).to.equal('publisher_test');
                expect(rows[2]['REPRESENTATIVE']).to.be.empty;

                expect(rows[3]['SEVERITY']).to.equal('Compliant');
                expect(rows[3]['TIME OF ACTION']).to.match(/^\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}$/);
                expect(rows[3]['SERVICE']).to.equal('Base Examples');
                expect(rows[3]['PROCESS']).to.equal('Process example ');
                expect(rows[3]['TITLE']).to.equal('Process state (calcul)');
                expect(rows[3]['SUMMARY']).to.equal('Message received');
                expect(rows[3]['STATE']).to.equal('Process example ');
                expect(rows[3]['STATE DESCRIPTION']).to.equal('Process state');
                expect(rows[3]['ACTOR']).to.equal('publisher_test');
                expect(rows[3]['REPRESENTATIVE']).to.be.empty;

                expect(rows[4]['SEVERITY']).to.equal('Information');
                expect(rows[4]['TIME OF ACTION']).to.match(/^\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}$/);
                expect(rows[4]['SERVICE']).to.equal('Base Examples');
                expect(rows[4]['PROCESS']).to.equal('Process example ');
                expect(rows[4]['TITLE']).to.equal('Data quality');
                expect(rows[4]['SUMMARY']).to.equal('Message received');
                expect(rows[4]['STATE']).to.equal('Data quality');
                expect(rows[4]['STATE DESCRIPTION']).to.equal('Data quality state');
                expect(rows[4]['ACTOR']).to.equal('publisher_test');
                expect(rows[4]['REPRESENTATIVE']).to.be.empty;

                expect(rows[5]['SEVERITY']).to.equal('Information');
                expect(rows[5]['TIME OF ACTION']).to.match(/^\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}$/);
                expect(rows[5]['SERVICE']).to.equal('Base Examples');
                expect(rows[5]['PROCESS']).to.equal('Process example ');
                expect(rows[5]['TITLE']).to.equal('Message');
                expect(rows[5]['SUMMARY']).to.equal('Message received : France-England\'s interconnection is 100% operational / Result of the maintenance is <OK>');
                expect(rows[5]['STATE']).to.equal('Message');
                expect(rows[5]['STATE DESCRIPTION']).to.equal('Message state');
                expect(rows[5]['ACTOR']).to.equal('Control Center FR North');
                expect(rows[5]['REPRESENTATIVE']).to.equal('publisher_test');

                // Delete export file
                cy.task('deleteFile', { filename: './cypress/downloads/' + files[0] })
            })
        })
    })


    it ('Check spinner is displayed when request is delayed and that spinner disappears once the request arrived ', function () {
        cy.delayRequestResponse('/cards/archives');

        cy.loginOpFab('operator1_fr','test');

        // We move to logging screen
        cy.get('#opfab-navbar-menu-logging').click();
        cy.waitDefaultTime();

        // We click the search button
        cy.get('#opfab-archives-logging-btn-search').click();

        checkLoadingSpinnerIsDisplayed();
        checkLoadingSpinnerIsNotDisplayed();
    })
    
})
