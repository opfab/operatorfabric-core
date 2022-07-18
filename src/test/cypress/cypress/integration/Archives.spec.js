/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

describe('Archives screen tests', function () {
    before('Set up configuration', function () {
        cy.loadTestConf();
    });

    it('Check archived cards reception', function () {
        cy.deleteAllArchivedCards();
        cy.send6TestCards();
        cy.loginOpFab('operator1_fr', 'test');
        moveToArchivesScreen();
        cy.waitDefaultTime();
        cy.checkAdminModeCheckboxDoesNotExist();
        cy.checkAdminModeLinkDoesNotExist();
        cy.clickOnSearchButton();
        checkNumberOfLineDisplayedIs(6);
        cy.checkNoCardDetailIsDisplayed();
        checkPaginationResultsNumberIs(6);

        // We delete the test cards, and we check that we still have the corresponding archived cards
        cy.deleteAllCards();
        cy.clickOnSearchButton();
        checkNumberOfLineDisplayedIs(6);
        cy.checkNoCardDetailIsDisplayed();
        checkPaginationResultsNumberIs(6);

        cy.send6TestCards();
        cy.clickOnSearchButton();
        checkNumberOfLineDisplayedIs(10);

        cy.checkNoCardDetailIsDisplayed();
        checkPaginationResultsNumberIs(12);
    });

    it('Check collapsible update', function () {
        cy.deleteAllArchivedCards();
        cy.send6TestCards();
        cy.send6TestCards();

        cy.loginOpFab('operator1_fr', 'test');
        moveToArchivesScreen();

        cy.clickOnSearchButton();
        checkNumberOfLineDisplayedIs(10);
        checkPaginationResultsNumberIs(12);
        checkNoPlusIconIsDisplayed();
        checkNoMinusIconIsDisplayed();

        clickOnCollapsibleUpdates();
        checkNumberOfLineDisplayedIs(6);
        checkNumberOfPlusIconDisplayedIs(6);
        cy.checkNoCardDetailIsDisplayed();
        checkPaginationResultsNumberIs(6);

        clickOnFirstPlusIcon();
        checkNumberOfLineDisplayedIs(7);
        checkNoPlusIsIconDisplayedOnLineNumber(1);
        checkMinusIconIsDiplayedOnFirstLine();
        checkNoPlusIsIconDisplayedOnLineNumber(2);
        checkNoMinusIsIconDisplayedOnLineNumber(2);

        clickOnFirstMinusIcon();
        checkNoMinusIsIconDisplayedOnLineNumber(1);
        checkNumberOfLineDisplayedIs(6);
        checkNumberOfPlusIconDisplayedIs(6);
    });

    it('Check spinner when request take more than one second', function () {
        delayArchiveRequest();
        cy.deleteAllArchivedCards();
        cy.send6TestCards();
        cy.loginOpFab('operator1_fr', 'test');
        moveToArchivesScreen();
        cy.waitDefaultTime();
        cy.clickOnSearchButton();
        cy.checkLoadingSpinnerIsDisplayed();
        cy.checkLoadingSpinnerIsNotDisplayed();
        checkNumberOfLineDisplayedIs(6);
    });

    it('Check composition of multi-filters for process groups/processes/states for operator1_fr', function () {
        cy.loginOpFab('operator1_fr', 'test');
        moveToArchivesScreen();

        checkMultifiltersWhenAllProcessStatesAreDisplayed();

        // We check this state is not present because it is only a child state
        cy.checkStateSelectDoesNotContains('Planned outage date response');
    });

    it('Check composition of multi-filters for process groups/processes/states for itsupervisor1', function () {
        cy.deleteAllArchivedCards();
        cy.send6TestCards();
        cy.loginOpFab('itsupervisor1', 'test');
        moveToArchivesScreen();

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

        openAndCheckArchiveCardContent('Electricity consumption forecast', 'Daily electrical consumption forecast');

        // We deactivate the admin mode
        cy.clickAdminModeCheckbox();
        cy.checkAdminModeCheckboxIsNotChecked();

        checkMultifiltersForNotAdminModeForItsupervisor1();
    });

    it('Check composition of multi-filters for process groups/processes/states for admin', function () {
        cy.loginOpFab('admin', 'test');
        moveToArchivesScreen();
        cy.checkProcessGroupSelectDoesNotExist();
        cy.checkProcessSelectDoesNotExist();
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

        openAndCheckArchiveCardContent('Electricity consumption forecast', 'Daily electrical consumption forecast');

        // We deactivate the admin mode
        cy.clickAdminModeCheckbox();

        cy.checkNoProcessStateMessageIsDisplayed();
        cy.checkAdminModeCheckboxDoesNotExist();
        cy.checkAdminModeLinkIsDisplayed();
    });

    it('Check composition of multi-filters for process groups/processes/states for operator1_fr, with a config without process group', function () {
        cy.loadEmptyProcessGroups();
        cy.loginOpFab('operator1_fr', 'test');
        moveToArchivesScreen();
        cy.checkProcessGroupSelectDoesNotExist();
        cy.checkAdminModeCheckboxDoesNotExist();
        cy.checkAdminModeLinkDoesNotExist();

        cy.clickOnProcessSelect();
        cy.checkNumberOfProcessEntriesIs(6);
        cy.checkProcessSelectContains('Conference and IT incident');
        cy.checkProcessSelectContains('Message or question');
        cy.checkProcessSelectContains('Task');
        cy.checkProcessSelectContains('IGCC');
        cy.checkProcessSelectContains('Process example');
        cy.checkProcessSelectContains('Test process for cypress');
        cy.selectAllProcesses();
        cy.clickOnProcessSelect();

        cy.clickOnStateSelect();
        cy.selectAllStates();
        cy.checkNumberOfStateSelectedIs(31);
        // We check this state is not present because it is only a child state
        cy.checkStateSelectDoesNotContains('Planned outage date response');

        cy.loadTestConf();
    });

    it('Check behaviour of "isOnlyAChildState" attribute (in file config.json of bundles)', function () {
        cy.loginOpFab('operator1_fr', 'test');
        moveToArchivesScreen();

        cy.clickOnProcessGroupSelect();
        cy.selectAllProcessGroups();

        cy.clickOnProcessSelect();
        cy.selectProcess('Process example');
        cy.clickOnProcessSelect();

        cy.clickOnStateSelect();
        cy.checkNumberOfStateEntriesIs(8);
        cy.checkStateSelectContains('Process example');
        cy.checkStateSelectContains('Message');
        cy.checkStateSelectContains('Data quality');
        cy.checkStateSelectContains('Electricity consumption forecast');
        cy.checkStateSelectContains('Action Required');
        cy.checkStateSelectContains('Additional information required');
        cy.checkStateSelectContains('Network Contingencies');
        // 'Planned outage date response' shall not be displayed
        // because 'isOnlyAChildState' attribute is set to true for this state
        cy.checkStateSelectDoesNotContains('Planned outage date response');
    });

    it('Check composition of multi-filters for operator6_fr (no rights on process/state and not member of ADMIN group)', function () {
        cy.loginOpFab('operator6_fr', 'test');
        moveToArchivesScreen();
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
        cy.send6TestCards();
        cy.loginOpFab('operator1_fr', 'test');
        moveToArchivesScreen();
        cy.clickOnSearchButton();

        clickOnCollapsibleUpdates();
        checkNumberOfLineDisplayedIs(6);
        checkNumberOfPlusIconDisplayedIs(6);

        clickOnExportButton();
        cy.waitDefaultTime();

        // check download folder contains the export file
        cy.task('list', {dir: './cypress/downloads'}).then((files) => {
            expect(files.length).to.equal(1);
            // check file name
            expect(files[0]).to.match(/^Archive_export_\d*\.xlsx/);
            // check file content
            cy.task('readXlsx', {file: './cypress/downloads/' + files[0], sheet: 'data'}).then((rows) => {
                expect(rows.length).to.equal(12);

                expect(rows[0]['SEVERITY']).to.equal('Alarm');
                checkPublicationDateForExportRow(rows[0]);
                checkBusinessPeriodForExportRow(rows[0]);
                expect(rows[0]['TITLE']).to.equal('⚠️ Network Contingencies ⚠️');
                expect(rows[0]['SUMMARY']).to.equal('Contingencies report for French network');
                expect(rows[0]['SERVICE']).to.equal('Base Examples');

                expect(rows[1]['SEVERITY']).to.equal('Alarm');
                checkPublicationDateForExportRow(rows[1]);
                checkBusinessPeriodWithNoEndDateForExportRow(rows[1]);
                expect(rows[1]['TITLE']).to.equal('Electricity consumption forecast');
                expect(rows[1]['SUMMARY']).to.equal('Message received');
                expect(rows[1]['SERVICE']).to.equal('Base Examples');

                expect(rows[2]['SEVERITY']).to.equal('Action');
                checkPublicationDateForExportRow(rows[2]);
                checkBusinessPeriodForExportRow(rows[2]);
                expect(rows[2]['TITLE']).to.equal('⚡ Planned Outage');
                expect(rows[2]['SUMMARY']).to.equal('Message received');
                expect(rows[2]['SERVICE']).to.equal('Base Examples');

                expect(rows[3]['SEVERITY']).to.equal('Compliant');
                checkPublicationDateForExportRow(rows[3]);
                checkBusinessPeriodForExportRow(rows[3]);
                expect(rows[3]['TITLE']).to.equal('Process state (calcul)');
                expect(rows[3]['SUMMARY']).to.equal('Message received');
                expect(rows[3]['SERVICE']).to.equal('Base Examples');

                expect(rows[4]['SEVERITY']).to.equal('Information');
                checkPublicationDateForExportRow(rows[4]);
                checkBusinessPeriodForExportRow(rows[4]);
                expect(rows[4]['TITLE']).to.equal('Data quality');
                expect(rows[4]['SUMMARY']).to.equal('Message received');
                expect(rows[4]['SERVICE']).to.equal('Base Examples');

                expect(rows[5]['SEVERITY']).to.equal('Information');
                checkPublicationDateForExportRow(rows[5]);
                checkBusinessPeriodForExportRow(rows[5]);
                expect(rows[5]['TITLE']).to.equal('Message');
                expect(rows[5]['SUMMARY']).to.equal(
                    "Message received : France-England's interconnection is 100% operational / Result of the maintenance is <OK>"
                );
                expect(rows[5]['SERVICE']).to.equal('Base Examples');

                expect(rows[6]['SEVERITY']).to.equal('Alarm');
                checkPublicationDateForExportRow(rows[6]);
                checkBusinessPeriodForExportRow(rows[6]);
                expect(rows[6]['TITLE']).to.equal('⚠️ Network Contingencies ⚠️');
                expect(rows[6]['SUMMARY']).to.equal('Contingencies report for French network');
                expect(rows[6]['SERVICE']).to.equal('Base Examples');

                expect(rows[7]['SEVERITY']).to.equal('Alarm');
                checkPublicationDateForExportRow(rows[7]);
                checkBusinessPeriodWithNoEndDateForExportRow(rows[7]);
                expect(rows[7]['TITLE']).to.equal('Electricity consumption forecast');
                expect(rows[7]['SUMMARY']).to.equal('Message received');
                expect(rows[7]['SERVICE']).to.equal('Base Examples');

                expect(rows[8]['SEVERITY']).to.equal('Action');
                checkPublicationDateForExportRow(rows[8]);
                checkBusinessPeriodForExportRow(rows[8]);
                expect(rows[8]['TITLE']).to.equal('⚡ Planned Outage');
                expect(rows[8]['SUMMARY']).to.equal('Message received');
                expect(rows[8]['SERVICE']).to.equal('Base Examples');

                expect(rows[9]['SEVERITY']).to.equal('Compliant');
                checkPublicationDateForExportRow(rows[9]);
                checkBusinessPeriodForExportRow(rows[9]);
                expect(rows[9]['TITLE']).to.equal('Process state (calcul)');
                expect(rows[9]['SUMMARY']).to.equal('Message received');
                expect(rows[9]['SERVICE']).to.equal('Base Examples');

                expect(rows[10]['SEVERITY']).to.equal('Information');
                checkPublicationDateForExportRow(rows[10]);
                checkBusinessPeriodForExportRow(rows[10]);
                expect(rows[10]['TITLE']).to.equal('Data quality');
                expect(rows[10]['SUMMARY']).to.equal('Message received');
                expect(rows[10]['SERVICE']).to.equal('Base Examples');

                expect(rows[11]['SEVERITY']).to.equal('Information');
                checkPublicationDateForExportRow(rows[11]);
                checkBusinessPeriodForExportRow(rows[11]);
                expect(rows[11]['TITLE']).to.equal('Message');
                expect(rows[11]['SUMMARY']).to.equal(
                    "Message received : France-England's interconnection is 100% operational / Result of the maintenance is <OK>"
                );
                expect(rows[11]['SERVICE']).to.equal('Base Examples');

                // Delete export file
                cy.task('deleteFile', {filename: './cypress/downloads/' + files[0]});
            });
        });
    });

    function moveToArchivesScreen() {
        cy.get('#opfab-navbar-menu-archives').click();
    }

    function clickOnCollapsibleUpdates() {
        cy.get('#opfab-archives-collapsible-updates').click();
    }

    function checkNumberOfLineDisplayedIs(nb) {
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').should('have.length', nb);
    }

    function checkNoPlusIconIsDisplayed() {
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-icon-plus').should('not.exist');
    }

    function checkNumberOfPlusIconDisplayedIs(nb) {
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-icon-plus').should('have.length', 6);
    }

    function clickOnFirstPlusIcon() {
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-icon-plus').first().click();
    }

    function checkNoPlusIsIconDisplayedOnLineNumber(nb) {
        cy.get('#opfab-archives-cards-list')
            .find('.opfab-archives-table-line')
            .eq(nb - 1)
            .find('.opfab-archives-icon-plus')
            .should('not.exist');
    }

    function checkNoMinusIconIsDisplayed() {
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-icon-minus').should('not.exist');
    }

    function checkMinusIconIsDiplayedOnFirstLine() {
        cy.get('#opfab-archives-cards-list')
            .find('.opfab-archives-table-line')
            .first()
            .find('.opfab-archives-icon-minus')
            .should('have.length', 1);
    }
    function clickOnFirstMinusIcon() {
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-icon-minus').first().click();
    }

    function checkNoMinusIsIconDisplayedOnLineNumber(nb) {
        cy.get('#opfab-archives-cards-list')
            .find('.opfab-archives-table-line')
            .eq(nb - 1)
            .find('.opfab-archives-icon-minus')
            .should('not.exist');
    }

    function checkPaginationResultsNumberIs(nb) {
        cy.get('#opfab-archive-results-number').should('have.text', ' Results number  : ' + nb + ' ');
    }

    function delayArchiveRequest() {
        cy.intercept('/cards/archives/*', (req) => {
            req.reply((res) => {
                res.delay = 2000;
            });
        });
    }

    function clickOnExportButton() {
        cy.get('#opfab-archives-btn-exportToExcel').click();
    }

    function checkPublicationDateForExportRow(row) {
        expect(row['PUBLICATION DATE']).to.match(/^\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}$/);
    }

    function checkBusinessPeriodForExportRow(row) {
        expect(row['BUSINESS PERIOD']).to.match(/^\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}-\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}$/);
    }
    function checkBusinessPeriodWithNoEndDateForExportRow(row) {
        expect(row['BUSINESS PERIOD']).to.match(/^\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}-$/);
    }

    function openAndCheckArchiveCardContent(cellContent, cardText) {
        cy.get('#opfab-archives-cards-list').find('td').contains(cellContent).should('exist').click();
        cy.get('#opfab-div-card-template-processed').contains(cardText).should('exist');
        cy.get('#opfab-archives-card-detail-close').click({force: true});
    }

    function checkMultifiltersWhenAllProcessStatesAreDisplayed() {
        // We check we have 6 items in process multi-filter, even without choosing a process group
        cy.clickOnProcessSelect();
        cy.checkNumberOfProcessEntriesIs(6);
        cy.checkProcessSelectContains('Conference and IT incident');
        cy.checkProcessSelectContains('Message or question');
        cy.checkProcessSelectContains('Task');
        cy.checkProcessSelectContains('IGCC');
        cy.checkProcessSelectContains('Process example');
        cy.checkProcessSelectContains('Test process for cypress');

        cy.clickOnProcessGroupSelect();
        cy.checkNumberOfProcessGroupEntriesIs(3);
        cy.checkProcessGroupSelectContains('--');
        cy.checkProcessGroupSelectContains('Base Examples');
        cy.checkProcessGroupSelectContains('User card examples');
        cy.selectAllProcessGroups();

        cy.clickOnProcessSelect();
        cy.checkNumberOfProcessEntriesIs(6);
        cy.checkProcessSelectContains('Conference and IT incident');
        cy.checkProcessSelectContains('Message or question');
        cy.checkProcessSelectContains('Task');
        cy.checkProcessSelectContains('IGCC');
        cy.checkProcessSelectContains('Process example');
        cy.checkProcessSelectContains('Test process for cypress');
        cy.selectAllProcesses();
        cy.clickOnProcessSelect();

        cy.clickOnStateSelect();
        cy.selectAllStates();
        cy.checkNumberOfStateSelectedIs(31);

        cy.clickOnProcessSelect();
        cy.unselectAllProcesses();
        cy.selectProcess('Process example');
        cy.clickOnProcessSelect();
        cy.clickOnStateSelect();
        cy.checkNumberOfStateEntriesIs(8);
        cy.checkStateSelectContains('Process example');
        cy.checkStateSelectContains('Message');
        cy.checkStateSelectContains('Data quality');
        cy.checkStateSelectContains('Electricity consumption forecast');
        cy.checkStateSelectContains('Action Required');
        cy.checkStateSelectContains('Additional information required');
        cy.checkStateSelectContains('Network Contingencies');
    }

    function checkMultifiltersForNotAdminModeForItsupervisor1() {
        // We check we have 5 items in process multi-filter, even without choosing a process group
        cy.clickOnProcessSelect();
        cy.checkNumberOfProcessEntriesIs(5);
        cy.checkProcessSelectContains('Conference and IT incident');
        cy.checkProcessSelectContains('Message or question');
        cy.checkProcessSelectContains('Task');
        cy.checkProcessSelectContains('IGCC');
        cy.checkProcessSelectContains('Process example');

        cy.clickOnProcessGroupSelect();
        cy.checkNumberOfProcessGroupEntriesIs(2);
        cy.checkProcessGroupSelectContains('Base Examples');
        cy.checkProcessGroupSelectContains('User card examples');
        cy.selectAllProcessGroups();

        cy.clickOnProcessSelect();
        cy.checkNumberOfProcessEntriesIs(5);
        cy.checkProcessSelectContains('Conference and IT incident');
        cy.checkProcessSelectContains('Message or question');
        cy.checkProcessSelectContains('Task');
        cy.checkProcessSelectContains('IGCC');
        cy.checkProcessSelectContains('Process example');
        cy.selectAllProcesses();
        cy.clickOnProcessSelect();

        cy.clickOnStateSelect();
        cy.selectAllStates();
        cy.checkNumberOfStateSelectedIs(13);

        cy.clickOnProcessSelect();
        cy.unselectAllProcesses();
        cy.selectProcess('Process example');
        cy.clickOnProcessSelect();
        cy.clickOnStateSelect();
        cy.checkNumberOfStateEntriesIs(2);
        cy.checkStateSelectContains('Action Required');
    }
});
