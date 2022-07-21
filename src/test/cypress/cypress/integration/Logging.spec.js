/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

describe('Logging screen tests', function () {
    before('Set up configuration', function () {
        cy.loadTestConf();
    });

    it('Check composition of multi-filters for process groups/processes/states for operator1_fr', function () {
        cy.loginOpFab('operator1_fr', 'test');

        moveToLoggingScreen();
        cy.checkAdminModeCheckboxDoesNotExist();
        cy.checkAdminModeLinkDoesNotExist();

        // We check we have 4 items in process multi-filter, even without choosing a process group
        cy.clickOnProcessSelect();
        cy.checkNumberOfProcessEntriesIs(4);
        cy.checkProcessSelectContains('Conference and IT incident');
        cy.checkProcessSelectContains('Message or question');
        cy.checkProcessSelectContains('IGCC');
        cy.checkProcessSelectContains('Process example');

        // We check we have 2 items in process groups multi-filter
        cy.clickOnProcessGroupSelect();
        cy.checkNumberOfProcessGroupEntriesIs(2);
        cy.checkProcessGroupSelectContains('Base Examples');
        cy.checkProcessGroupSelectContains('User card examples');
        cy.selectAllProcessGroups();

        // We check we have 4 items in process multi-filter
        cy.clickOnProcessSelect();
        cy.checkNumberOfProcessEntriesIs(4);
        cy.checkProcessSelectContains('Conference and IT incident');
        cy.checkProcessSelectContains('Message or question');
        cy.checkProcessSelectContains('IGCC');
        cy.checkProcessSelectContains('Process example');
        cy.selectAllProcesses();
        cy.clickOnProcessSelect();

        // We check we have 19 states
        cy.clickOnStateSelect();
        cy.selectAllStates();
        cy.checkNumberOfStateSelectedIs(19);

        // We unselect all processes then we select 'Process example' process, and we check there are 8 states for this process
        cy.clickOnProcessSelect();
        cy.unselectAllProcesses();
        cy.selectProcess('Process example');
        cy.clickOnProcessSelect();
        cy.clickOnStateSelect();
        cy.checkNumberOfStateEntriesIs(9);
        cy.checkStateSelectContains('Planned outage date response');
    });

    it('Check composition of multi-filters for process groups/processes/states for itsupervisor1', function () {
        cy.deleteAllArchivedCards();
        cy.send6TestCards();
        cy.loginOpFab('itsupervisor1', 'test');

        moveToLoggingScreen();
        cy.checkAdminModeLinkDoesNotExist();
        cy.checkAdminModeCheckboxIsDisplayed();
        cy.checkAdminModeCheckboxIsNotChecked();

        checkMultifiltersForNotAdminModeForItsupervisor1();

        cy.clickOnSearchButton();
        checkNumberOfLineDisplayedIs(1);

        // We activate the admin mode
        cy.clickAdminModeCheckbox();
        cy.checkAdminModeCheckboxIsChecked();

        checkMultifiltersWhenAllProcessStatesAreDisplayed();

        cy.clickOnSearchButton();
        checkNumberOfLineDisplayedIs(6);

        // We deactivate the admin mode
        cy.clickAdminModeCheckbox();
        cy.checkAdminModeCheckboxIsNotChecked();

        checkMultifiltersForNotAdminModeForItsupervisor1();
    });

    it('Check composition of multi-filters for process groups/processes/states for admin', function () {
        cy.deleteAllArchivedCards();
        cy.send6TestCards();
        cy.loginOpFab('admin', 'test');

        moveToLoggingScreen();

        cy.checkProcessGroupSelectDoesNotExist();
        cy.checkProcessSelectDoesNotExist;
        cy.checkStateSelectDoesNotExist();
        cy.checkNoProcessStateMessageIsDisplayed();

        cy.checkAdminModeCheckboxDoesNotExist();
        cy.checkAdminModeLinkIsDisplayed();

        // We activate the admin mode
        cy.clickAdminModeLink();

        cy.checkAdminModeCheckboxIsDisplayed();
        cy.checkAdminModeCheckboxIsChecked();

        checkMultifiltersWhenAllProcessStatesAreDisplayed();

        cy.clickOnSearchButton();
        checkNumberOfLineDisplayedIs(6);

        // We deactivate the admin mode
        cy.clickAdminModeCheckbox();

        cy.checkNoProcessStateMessageIsDisplayed();
        cy.checkAdminModeCheckboxDoesNotExist();
        cy.checkAdminModeLinkIsDisplayed();
    });

    it('Check composition of multi-filters for process groups/processes/states for operator1_fr, with a config without process group', function () {
        cy.loginOpFab('operator1_fr', 'test');

        cy.loadEmptyProcessGroups();
        cy.reload();

        moveToLoggingScreen();
        cy.checkAdminModeCheckboxDoesNotExist();
        cy.checkAdminModeLinkDoesNotExist();

        cy.checkProcessGroupSelectDoesNotExist();

        // We check we have 4 items in process multi-filter
        cy.clickOnProcessSelect();
        cy.checkNumberOfProcessEntriesIs(4);
        cy.checkProcessSelectContains('Conference and IT incident');
        cy.checkProcessSelectContains('Message or question');
        cy.checkProcessSelectContains('IGCC');
        cy.checkProcessSelectContains('Process example');
        cy.selectAllProcesses();
        cy.clickOnProcessSelect();

        // We check we have 19 states (and 4 items for their process)
        cy.clickOnStateSelect();
        cy.selectAllStates();
        cy.checkNumberOfStateSelectedIs(19);

        cy.clickOnProcessSelect();
        cy.unselectAllProcesses();
        cy.selectProcess('Process example');
        cy.clickOnProcessSelect();
        cy.clickOnStateSelect();
        cy.checkNumberOfStateEntriesIs(9);
        cy.checkStateSelectContains('Planned outage date response');

        cy.loadTestConf();
        cy.reload();
    });

    it('Check composition of multi-filters for operator6_fr (no rights on process/state and not member of ADMIN group)', function () {
        cy.loginOpFab('operator6_fr', 'test');
        moveToLoggingScreen();
        cy.checkProcessGroupSelectDoesNotExist();
        cy.checkProcessSelectDoesNotExist();
        cy.checkStateSelectDoesNotExist();
        cy.checkNoProcessStateMessageIsDisplayed();

        cy.checkAdminModeCheckboxDoesNotExist();
        cy.checkAdminModeLinkDoesNotExist();
    });

    it('Check export', function () {
        cy.deleteAllArchivedCards();
        cy.send6TestCards();
        cy.loginOpFab('operator1_fr', 'test');

        moveToLoggingScreen();

        cy.clickOnSearchButton();

        checkNumberOfLineDisplayedIs(6);
        cy.checkNoCardDetailIsDisplayed();
        checkPaginationResultsNumberIs(6);

        clickOnExportButton();
        cy.waitDefaultTime();

        // check download folder contains the export file
        cy.task('list', {dir: './cypress/downloads'}).then((files) => {
            expect(files.length).to.equal(1);
            // check file name
            expect(files[0]).to.match(/^Logging_export_\d*\.xlsx/);
            // check file content
            cy.task('readXlsx', {file: './cypress/downloads/' + files[0], sheet: 'data'}).then((rows) => {
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
                expect(rows[5]['SUMMARY']).to.equal(
                    "Message received : France-England's interconnection is 100% operational / Result of the maintenance is <OK>"
                );
                expect(rows[5]['STATE']).to.equal('Message');
                expect(rows[5]['STATE DESCRIPTION']).to.equal('Message state');
                expect(rows[5]['ACTOR']).to.equal('Control Center FR North');
                expect(rows[5]['REPRESENTATIVE']).to.equal('publisher_test');

                // Delete export file
                cy.task('deleteFile', {filename: './cypress/downloads/' + files[0]});
            });
        });
    });

    it('Check spinner is displayed when request is delayed and that spinner disappears once the request arrived ', function () {
        cy.delayRequestResponse('/cards/archives/*');

        cy.loginOpFab('operator1_fr', 'test');

        moveToLoggingScreen();
        cy.waitDefaultTime();

        cy.clickOnSearchButton();

        cy.checkLoadingSpinnerIsDisplayed();
        cy.checkLoadingSpinnerIsNotDisplayed();
    });

    function moveToLoggingScreen() {
        cy.get('#opfab-navbar-menu-logging').click();
    }

    function checkMultifiltersWhenAllProcessStatesAreDisplayed() {
        // We check we have 4 items in process multi-filter, even without choosing a process group
        cy.clickOnProcessSelect();
        cy.checkNumberOfProcessEntriesIs(4);
        cy.checkProcessSelectContains('Conference and IT incident');
        cy.checkProcessSelectContains('Message or question');
        cy.checkProcessSelectContains('IGCC');
        cy.checkProcessSelectContains('Process example');

        cy.clickOnProcessGroupSelect();
        cy.checkNumberOfProcessGroupEntriesIs(2);
        cy.checkProcessGroupSelectContains('Base Examples');
        cy.checkProcessGroupSelectContains('User card examples');
        cy.selectAllProcessGroups();

        cy.clickOnProcessSelect();
        cy.checkNumberOfProcessEntriesIs(4);
        cy.checkProcessSelectContains('Conference and IT incident');
        cy.checkProcessSelectContains('Message or question');
        cy.checkProcessSelectContains('IGCC');
        cy.checkProcessSelectContains('Process example');
        cy.selectAllProcesses();
        cy.clickOnProcessSelect();

        cy.clickOnStateSelect();
        cy.selectAllStates();
        cy.checkNumberOfStateSelectedIs(19);

        cy.clickOnProcessSelect();
        cy.unselectAllProcesses();
        cy.selectProcess('Process example');
        cy.clickOnProcessSelect();
        cy.clickOnStateSelect();
        cy.checkNumberOfStateEntriesIs(9);
        cy.checkStateSelectContains('Process example');
        cy.checkStateSelectContains('Message');
        cy.checkStateSelectContains('Data quality');
        cy.checkStateSelectContains('Electricity consumption forecast');
        cy.checkStateSelectContains('Action Required');
        cy.checkStateSelectContains('Additional information required');
        cy.checkStateSelectContains('Network Contingencies');
        cy.checkStateSelectContains('Planned outage date response');
    }

    function checkMultifiltersForNotAdminModeForItsupervisor1() {
        // We check we have 4 items in process multi-filter, even without choosing a process group
        cy.clickOnProcessSelect();
        cy.checkNumberOfProcessEntriesIs(4);
        cy.checkProcessSelectContains('Conference and IT incident');
        cy.checkProcessSelectContains('Message or question');
        cy.checkProcessSelectContains('IGCC');
        cy.checkProcessSelectContains('Process example');

        cy.clickOnProcessGroupSelect();
        cy.checkNumberOfProcessGroupEntriesIs(2);
        cy.checkProcessGroupSelectContains('Base Examples');
        cy.checkProcessGroupSelectContains('User card examples');
        cy.selectAllProcessGroups();

        cy.clickOnProcessSelect();
        cy.checkNumberOfProcessEntriesIs(4);
        cy.checkProcessSelectContains('Conference and IT incident');
        cy.checkProcessSelectContains('Message or question');
        cy.checkProcessSelectContains('IGCC');
        cy.checkProcessSelectContains('Process example');
        cy.selectAllProcesses();
        cy.clickOnProcessSelect();

        cy.clickOnStateSelect();
        cy.selectAllStates();
        cy.checkNumberOfStateSelectedIs(12);

        cy.clickOnProcessSelect();
        cy.unselectAllProcesses();
        cy.selectProcess('Process example');
        cy.clickOnProcessSelect();
        cy.clickOnStateSelect();
        cy.checkNumberOfStateEntriesIs(2);
        cy.checkStateSelectContains('Action Required');
    }

    function checkPaginationResultsNumberIs(nb) {
        cy.get('#opfab-logging-results-number').should('have.text', ' Results number  : ' + nb + ' ');
    }

    function checkNumberOfLineDisplayedIs(nb) {
        cy.get('#opfab-logging-cards-list>tr').should('have.length', nb);
    }

    function clickOnExportButton() {
        cy.get('#opfab-logging-btn-exportToExcel').click();
    }
});
