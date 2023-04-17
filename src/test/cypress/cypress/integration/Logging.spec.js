/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OpfabGeneralCommands} from "../support/opfabGeneralCommands"
import {ArchivesAndLoggingCommands} from "../support/archivesAndLoggingCommands"
import {ScriptCommands} from "../support/scriptCommands";
import {AgGridCommands} from "../support/agGridCommands";

describe('Logging screen tests', function () {

    const opfab = new OpfabGeneralCommands();
    const archivesAndLogging = new ArchivesAndLoggingCommands();
    const agGrid = new AgGridCommands();
    const script = new ScriptCommands();

    before('Set up configuration', function () {
        script.loadTestConf();
        script.cleanDownloadsDir();
    });

    after('Delete export file', function () {
        script.cleanDownloadsDir();
    });

    it('Check composition of multi-filters for process groups/processes/states for operator1_fr', function () {
        opfab.loginWithUser('operator1_fr');

        moveToLoggingScreen();
        archivesAndLogging.checkAdminModeCheckboxDoesNotExist();
        archivesAndLogging.checkAdminModeLinkDoesNotExist();

        // We check we have 4 items in process multi-filter, even without choosing a process group
        archivesAndLogging.clickOnProcessSelect();
        archivesAndLogging.checkNumberOfProcessEntriesIs(4);
        archivesAndLogging.checkProcessSelectContains('Conference and IT incident');
        archivesAndLogging.checkProcessSelectContains('Message or question');
        archivesAndLogging.checkProcessSelectContains('IGCC');
        archivesAndLogging.checkProcessSelectContains('Process example');

        // We check we have 2 items in process groups multi-filter
        archivesAndLogging.clickOnProcessGroupSelect();
        archivesAndLogging.checkNumberOfProcessGroupEntriesIs(2);
        archivesAndLogging.checkProcessGroupSelectContains('Base Examples');
        archivesAndLogging.checkProcessGroupSelectContains('User card examples');
        archivesAndLogging.selectAllProcessGroups();

        // We check we have 4 items in process multi-filter
        archivesAndLogging.clickOnProcessSelect();
        archivesAndLogging.checkNumberOfProcessEntriesIs(4);
        archivesAndLogging.checkProcessSelectContains('Conference and IT incident');
        archivesAndLogging.checkProcessSelectContains('Message or question');
        archivesAndLogging.checkProcessSelectContains('IGCC');
        archivesAndLogging.checkProcessSelectContains('Process example');
        archivesAndLogging.selectAllProcesses();
        archivesAndLogging.clickOnProcessSelect();

        // We check we have 19 states
        archivesAndLogging.clickOnStateSelect();
        archivesAndLogging.selectAllStates();
        archivesAndLogging.checkNumberOfStateSelectedIs(19);

        // We unselect all processes then we select 'Process example' process, and we check there are 8 states for this process
        archivesAndLogging.clickOnProcessSelect();
        archivesAndLogging.unselectAllProcesses();
        cy.selectProcess('Process example');
        archivesAndLogging.clickOnProcessSelect();
        archivesAndLogging.clickOnStateSelect();
        archivesAndLogging.checkNumberOfStateEntriesIs(9);
        archivesAndLogging.checkStateSelectContains('Planned outage date response');
    });

    it('Check composition of multi-filters for process groups/processes/states for itsupervisor1', function () {
        script.deleteAllArchivedCards();
        script.send6TestCards();
        opfab.loginWithUser('itsupervisor1');

        moveToLoggingScreen();
        archivesAndLogging.checkAdminModeLinkDoesNotExist();
        archivesAndLogging.checkAdminModeCheckboxIsDisplayed();
        archivesAndLogging.checkAdminModeCheckboxIsNotChecked();

        checkMultifiltersForNotAdminModeForItsupervisor1();

        archivesAndLogging.clickOnSearchButton();
        checkNumberOfLineDisplayedIs(1);

        // We activate the admin mode
        archivesAndLogging.clickAdminModeCheckbox();
        archivesAndLogging.checkAdminModeCheckboxIsChecked();

        checkMultifiltersWhenAllProcessStatesAreDisplayed();

        archivesAndLogging.clickOnSearchButton();
        checkNumberOfLineDisplayedIs(6);

        // We deactivate the admin mode
        archivesAndLogging.clickAdminModeCheckbox();
        archivesAndLogging.checkAdminModeCheckboxIsNotChecked();

        checkMultifiltersForNotAdminModeForItsupervisor1();
    });

    it('Check composition of multi-filters for process groups/processes/states for admin', function () {
        script.deleteAllArchivedCards();
        script.send6TestCards();
        opfab.loginWithUser('admin');

        moveToLoggingScreen();

        archivesAndLogging.checkProcessGroupSelectDoesNotExist();
        archivesAndLogging.checkProcessSelectDoesNotExist();
        archivesAndLogging.checkStateSelectDoesNotExist();
        archivesAndLogging.checkNoProcessStateMessageIsDisplayed();

        archivesAndLogging.checkAdminModeCheckboxDoesNotExist();
        archivesAndLogging.checkAdminModeLinkIsDisplayed();

        // We activate the admin mode
        archivesAndLogging.clickAdminModeLink();

        archivesAndLogging.checkAdminModeCheckboxIsDisplayed();
        archivesAndLogging.checkAdminModeCheckboxIsChecked();

        checkMultifiltersWhenAllProcessStatesAreDisplayed();

        archivesAndLogging.clickOnSearchButton();
        checkNumberOfLineDisplayedIs(6);

        // We deactivate the admin mode
        archivesAndLogging.clickAdminModeCheckbox();

        archivesAndLogging.checkNoProcessStateMessageIsDisplayed();
        archivesAndLogging.checkAdminModeCheckboxDoesNotExist();
        archivesAndLogging.checkAdminModeLinkIsDisplayed();
    });

    it('Check composition of multi-filters for process groups/processes/states for operator1_fr, with a config without process group', function () {
        opfab.loginWithUser('operator1_fr');

        script.loadEmptyProcessGroups();
        cy.reload();

        moveToLoggingScreen();
        archivesAndLogging.checkAdminModeCheckboxDoesNotExist();
        archivesAndLogging.checkAdminModeLinkDoesNotExist();

        archivesAndLogging.checkProcessGroupSelectDoesNotExist();

        // We check we have 4 items in process multi-filter
        archivesAndLogging.clickOnProcessSelect();
        archivesAndLogging.checkNumberOfProcessEntriesIs(4);
        archivesAndLogging.checkProcessSelectContains('Conference and IT incident');
        archivesAndLogging.checkProcessSelectContains('Message or question');
        archivesAndLogging.checkProcessSelectContains('IGCC');
        archivesAndLogging.checkProcessSelectContains('Process example');
        archivesAndLogging.selectAllProcesses();
        archivesAndLogging.clickOnProcessSelect();

        // We check we have 19 states (and 4 items for their process)
        archivesAndLogging.clickOnStateSelect();
        archivesAndLogging.selectAllStates();
        archivesAndLogging.checkNumberOfStateSelectedIs(19);

        archivesAndLogging.clickOnProcessSelect();
        archivesAndLogging.unselectAllProcesses();
        cy.selectProcess('Process example');
        archivesAndLogging.clickOnProcessSelect();
        archivesAndLogging.clickOnStateSelect();
        archivesAndLogging.checkNumberOfStateEntriesIs(9);
        archivesAndLogging.checkStateSelectContains('Planned outage date response');

        script.loadTestConf();
        cy.reload();
    });

    it('Check composition of multi-filters for operator6_fr (no rights on process/state and not member of ADMIN group)', function () {
        opfab.loginWithUser('operator6_fr');
        moveToLoggingScreen();
        archivesAndLogging.checkProcessGroupSelectDoesNotExist();
        archivesAndLogging.checkProcessSelectDoesNotExist();
        archivesAndLogging.checkStateSelectDoesNotExist();
        archivesAndLogging.checkNoProcessStateMessageIsDisplayed();

        archivesAndLogging.checkAdminModeCheckboxDoesNotExist();
        archivesAndLogging.checkAdminModeLinkDoesNotExist();
    });

    it('Check export', function () {
        script.deleteAllArchivedCards();
        script.send6TestCards();
        opfab.loginWithUser('operator1_fr');

        moveToLoggingScreen();

        archivesAndLogging.clickOnSearchButton();

        checkNumberOfLineDisplayedIs(6);
        archivesAndLogging.checkNoCardDetailIsDisplayed();
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
            });
        });
    });

    it('Check spinner is displayed when request is delayed and that spinner disappears once the request arrived ', function () {
        cy.delayRequestResponse('/cards/archives');
        opfab.loginWithUser('operator1_fr');
        moveToLoggingScreen();
        cy.waitDefaultTime();
        archivesAndLogging.clickOnSearchButton();
        opfab.checkLoadingSpinnerIsDisplayed();
        opfab.checkLoadingSpinnerIsNotDisplayed();
    });

    function moveToLoggingScreen() {
        cy.get('#opfab-navbar-menu-logging').click();
    }

    function checkMultifiltersWhenAllProcessStatesAreDisplayed() {
        // We check we have 4 items in process multi-filter, even without choosing a process group
        archivesAndLogging.clickOnProcessSelect();
        archivesAndLogging.checkNumberOfProcessEntriesIs(4);
        archivesAndLogging.checkProcessSelectContains('Conference and IT incident');
        archivesAndLogging.checkProcessSelectContains('Message or question');
        archivesAndLogging.checkProcessSelectContains('IGCC');
        archivesAndLogging.checkProcessSelectContains('Process example');

        archivesAndLogging.clickOnProcessGroupSelect();
        archivesAndLogging.checkNumberOfProcessGroupEntriesIs(2);
        archivesAndLogging.checkProcessGroupSelectContains('Base Examples');
        archivesAndLogging.checkProcessGroupSelectContains('User card examples');
        archivesAndLogging.selectAllProcessGroups();

        archivesAndLogging.clickOnProcessSelect();
        archivesAndLogging.checkNumberOfProcessEntriesIs(4);
        archivesAndLogging.checkProcessSelectContains('Conference and IT incident');
        archivesAndLogging.checkProcessSelectContains('Message or question');
        archivesAndLogging.checkProcessSelectContains('IGCC');
        archivesAndLogging.checkProcessSelectContains('Process example');
        archivesAndLogging.selectAllProcesses();
        archivesAndLogging.clickOnProcessSelect();

        archivesAndLogging.clickOnStateSelect();
        archivesAndLogging.selectAllStates();
        archivesAndLogging.checkNumberOfStateSelectedIs(19);

        archivesAndLogging.clickOnProcessSelect();
        archivesAndLogging.unselectAllProcesses();
        cy.selectProcess('Process example');
        archivesAndLogging.clickOnProcessSelect();
        archivesAndLogging.clickOnStateSelect();
        archivesAndLogging.checkNumberOfStateEntriesIs(9);
        archivesAndLogging.checkStateSelectContains('Process example');
        archivesAndLogging.checkStateSelectContains('Message');
        archivesAndLogging.checkStateSelectContains('Data quality');
        archivesAndLogging.checkStateSelectContains('Electricity consumption forecast');
        archivesAndLogging.checkStateSelectContains('Action Required');
        archivesAndLogging.checkStateSelectContains('Additional information required');
        archivesAndLogging.checkStateSelectContains('Network Contingencies');
        archivesAndLogging.checkStateSelectContains('Planned outage date response');
    }

    function checkMultifiltersForNotAdminModeForItsupervisor1() {
        // We check we have 4 items in process multi-filter, even without choosing a process group
        archivesAndLogging.clickOnProcessSelect();
        archivesAndLogging.checkNumberOfProcessEntriesIs(4);
        archivesAndLogging.checkProcessSelectContains('Conference and IT incident');
        archivesAndLogging.checkProcessSelectContains('Message or question');
        archivesAndLogging.checkProcessSelectContains('IGCC');
        archivesAndLogging.checkProcessSelectContains('Process example');

        archivesAndLogging.clickOnProcessGroupSelect();
        archivesAndLogging.checkNumberOfProcessGroupEntriesIs(2);
        archivesAndLogging.checkProcessGroupSelectContains('Base Examples');
        archivesAndLogging.checkProcessGroupSelectContains('User card examples');
        archivesAndLogging.selectAllProcessGroups();

        archivesAndLogging.clickOnProcessSelect();
        archivesAndLogging.checkNumberOfProcessEntriesIs(4);
        archivesAndLogging.checkProcessSelectContains('Conference and IT incident');
        archivesAndLogging.checkProcessSelectContains('Message or question');
        archivesAndLogging.checkProcessSelectContains('IGCC');
        archivesAndLogging.checkProcessSelectContains('Process example');
        archivesAndLogging.selectAllProcesses();
        archivesAndLogging.clickOnProcessSelect();

        archivesAndLogging.clickOnStateSelect();
        archivesAndLogging.selectAllStates();
        archivesAndLogging.checkNumberOfStateSelectedIs(12);

        archivesAndLogging.clickOnProcessSelect();
        archivesAndLogging.unselectAllProcesses();
        cy.selectProcess('Process example');
        archivesAndLogging.clickOnProcessSelect();
        archivesAndLogging.clickOnStateSelect();
        archivesAndLogging.checkNumberOfStateEntriesIs(2);
        archivesAndLogging.checkStateSelectContains('Action Required');
    }

    function checkPaginationResultsNumberIs(nb) {
        cy.get('#opfab-logging-results-number').should('have.text', ' Results number  : ' + nb + ' ');
    }

    function checkNumberOfLineDisplayedIs(nb) {
        agGrid.countTableRows('#opfab-monitoring-table-grid', nb);
    }

    function clickOnExportButton() {
        cy.get('#opfab-logging-btn-exportToExcel').click();
    }
});
