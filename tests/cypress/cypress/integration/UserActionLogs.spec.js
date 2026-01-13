/* Copyright (c) 2022-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OpfabGeneralCommands} from '../support/opfabGeneralCommands';
import {ScriptCommands} from '../support/scriptCommands';
import {UserCardCommands} from '../support/userCardCommands';
import {CardCommands} from '../support/cardCommands';
import {FeedCommands} from '../support/feedCommands';
import {AgGridCommands} from '../support/agGridCommands';

describe('User action logs page', () => {
    const opfab = new OpfabGeneralCommands();
    const script = new ScriptCommands();
    const usercard = new UserCardCommands();
    const card = new CardCommands();
    const feed = new FeedCommands();
    const agGrid = new AgGridCommands();

    before('Set up configuration', function () {
        script.loadTestConf();
        script.deleteAllUserActionLogs();
        script.deleteAllCards();
        script.deleteAllSettings();
        opfab.loginWithUser('operator1_fr');
        doSomeActionToBeTracedInUserActionLogs();
    });

    after('Clean export directory', function () {
        script.cleanDownloadsDir();
    });

    it('Check logs not available for none admin user', () => {
        cy.get('#opfab-navbar-drop-user-menu').click();
        cy.get('#opfab-navbar-right-menu-logs').should('not.exist');
    });

    it('Check user actions logs content ', () => {
        opfab.loginWithUser('admin');
        opfab.navigateToUserActionLogs();
        clickOnSearchButton();
        checkNumberOfResultsIs(18);
        checkNumberOfLinesInTableIs(10);
        checkTableLineContains(0, 'OPEN_SUBSCRIPTION', 'admin');
        checkTableLineContains(1, 'CLOSE_SUBSCRIPTION', 'admin');
        checkTableLineContains(2, 'USER', 'admin', 'Delete user atestuser');
        checkTableLineContains(3, 'USER', 'admin', 'Update user atestuser');
        checkTableLineContains(4, 'USER', 'admin', 'Create user atestuser');
        checkTableLineContains(5, 'OPEN_SUBSCRIPTION', 'admin');
        checkTableLineContains(6, 'CLOSE_SUBSCRIPTION', 'operator2_fr');
        checkTableLineContains(7, 'NOTIFICATION_CONFIG', 'operator2_fr');
        checkTableLineContains(8, 'UNACK_CARD', 'operator2_fr');
        checkTableLineContains(9, 'SEND_RESPONSE', 'operator2_fr');

        cy.get('ngb-pagination').find('.page-link').eq(2).click();
        checkNumberOfLinesInTableIs(8);
        checkTableLineContains(0, 'READ_CARD', 'operator2_fr');
        checkTableLineContains(1, 'ACK_CARD', 'operator2_fr');
        checkTableLineContains(2, 'READ_CARD', 'operator2_fr');
        checkTableLineContains(3, 'OPEN_SUBSCRIPTION', 'operator2_fr');
        checkTableLineContains(4, 'CLOSE_SUBSCRIPTION', 'operator1_fr');
        checkTableLineContains(5, 'SEND_CARD', 'operator1_fr');
        checkTableLineContains(6, 'SEND_CARD', 'operator1_fr');
        checkTableLineContains(7, 'OPEN_SUBSCRIPTION', 'operator1_fr');

        selectUsername(['operator1_fr', 'operator2_fr']);
        selectAction(['SEND_CARD', 'READ_CARD']);
        clickOnSearchButton();
        checkNumberOfLinesInTableIs(4);
        checkTableLineContains(0, 'READ_CARD', 'operator2_fr');

        cy.get('#opfab-useractionlogs-btn-reset').click();
        cy.get('#opfab-useractionlogs-table-grid').should('not.exist');

        selectUsername(['operator3_fr']);
        clickOnSearchButton();
        cy.get('#opfab-useractionlogs-noResult').contains('Your search did not match any result.');
    });

    it('Check export', function () {
        opfab.loginWithUser('admin');
        opfab.navigateToUserActionLogs();
        clickOnSearchButton();
        checkNumberOfResultsIs(20);
        checkNumberOfLinesInTableIs(10);

        clickOnExportButton();
        cy.waitDefaultTime();

        // check download folder contains the export file
        cy.task('list', {dir: './cypress/downloads'}).then((files) => {
            expect(files.length).to.equal(1);

            // check file name
            expect(files[0]).to.match(/^UserActionLogs_export_\d*\.xlsx/);
            // check file content
            cy.task('readXlsx', {file: './cypress/downloads/' + files[0], sheet: 'data'}).then((rows) => {
                expect(rows.length).to.equal(20);

                checkExportLineContains(rows[0], 'OPEN_SUBSCRIPTION', 'admin');
                checkExportLineContains(rows[1], 'CLOSE_SUBSCRIPTION', 'admin');
                checkExportLineContains(rows[2], 'OPEN_SUBSCRIPTION', 'admin');
                checkExportLineContains(rows[3], 'CLOSE_SUBSCRIPTION', 'admin');

                checkExportLineContains(rows[4], 'USER', 'admin', 'Delete user atestuser');
                checkExportLineContains(rows[5], 'USER', 'admin', 'Update user atestuser');
                checkExportLineContains(rows[6], 'USER', 'admin', 'Create user atestuser');
                checkExportLineContains(rows[7], 'OPEN_SUBSCRIPTION', 'admin');
                checkExportLineContains(rows[8], 'CLOSE_SUBSCRIPTION', 'operator2_fr');

                checkExportLineContains(rows[9], 'NOTIFICATION_CONFIG', 'operator2_fr');
                checkExportLineContains(rows[10], 'UNACK_CARD', 'operator2_fr');
                checkExportLineContains(rows[11], 'SEND_RESPONSE', 'operator2_fr');
                checkExportLineContains(rows[12], 'READ_CARD', 'operator2_fr');
                checkExportLineContains(rows[13], 'ACK_CARD', 'operator2_fr');
                checkExportLineContains(rows[14], 'READ_CARD', 'operator2_fr');
                checkExportLineContains(rows[15], 'OPEN_SUBSCRIPTION', 'operator2_fr');
                checkExportLineContains(rows[16], 'CLOSE_SUBSCRIPTION', 'operator1_fr');
                checkExportLineContains(rows[17], 'SEND_CARD', 'operator1_fr');
                checkExportLineContains(rows[18], 'SEND_CARD', 'operator1_fr');
                checkExportLineContains(rows[19], 'OPEN_SUBSCRIPTION', 'operator1_fr');
            });
        });
    });

    it('Check card details is accessible', () => {
        opfab.loginWithUser('admin');
        opfab.navigateToUserActionLogs();
        clickOnSearchButton();
        checkNumberOfResultsIs(22);
        clickOnLineNumber(0);
        cy.get('of-simplified-card-view').should('not.exist');
        cy.get('ngb-pagination').find('.page-link').eq(2).click();
        clickOnLineNumber(2);
        cy.get('of-simplified-card-view').should('exist');
        closeCardDetail();
        clickOnLineNumber(3);
        cy.get('of-simplified-card-view').should('exist');

        // Check the response has been integrated in the template
        cy.get('#template_responses').find('tr').should('have.length', 3);
    });

    function clickOnExportButton() {
        cy.get('#opfab-useractionlogs-btn-exportToExcel').click();
    }

    function doSomeActionToBeTracedInUserActionLogs() {
        sendQuestionCard();
        sendMessageCard();
        opfab.logout();
        cy.waitDefaultTime();
        opfab.loginWithUser('operator2_fr');
        feed.checkNumberOfDisplayedCardsIs(2);
        feed.openFirstCard();
        card.acknowledge();
        cy.waitDefaultTime();
        feed.checkNumberOfDisplayedCardsIs(1);
        feed.openFirstCard();
        cy.get('#template_response_input').type('Response');
        card.sendResponse();
        cy.waitDefaultTime();
        feed.toggleFilterByAcknowledgementNotAck();
        feed.toggleFilterByAcknowledgementAck();
        feed.checkNumberOfDisplayedCardsIs(1);
        feed.openFirstCard();
        card.unacknowledge();
        changeNotificationConfiguration();
        opfab.logout();
        opfab.loginWithUser('admin');
        addUser();
        updateUser();
        deleteUser();
    }

    function addUser() {
        opfab.navigateToAdministration();
        cy.get('#add-item').click();
        cy.get('#opfab-login').type('atestuser');
        cy.get('#opfab-firstName').type('name');
        cy.get('#opfab-lastName').type('surname');
        cy.get('#opfab-comment').type('comment');
        cy.get('#opfab-groups').click();
        cy.get('#opfab-groups').find('.vscomp-option-text').eq(1).click({force: true});
        cy.get('#opfab-groups').click();
        cy.get('#opfab-entities').click();
        cy.get('#opfab-entities').find('.vscomp-option-text').eq(1).click({force: true});
        cy.get('#opfab-entities').click();
        cy.get('#opfab-admin-user-btn-add').click();
    }

    function updateUser() {
        // Create an alias to shorten the code
        cy.get('ag-grid-angular').find('.ag-header-container').find('.ag-header-row-column').as('users-table-headers');

        // Sorting login column by ascending order
        cy.get('@users-table-headers').find('.ag-header-cell').eq(0).click();
        cy.wait(500);

        // Edit previously created user
        agGrid.clickCell('ag-grid-angular', 1, 5, 'of-action-cell-renderer');

        cy.get('of-edit-user-modal').should('exist');
        cy.get('.modal-title').should('contain.text', 'atestuser');

        cy.get('#opfab-firstName').type(' updated');

        cy.get('#opfab-groups').click();
        // Deselect old group
        cy.get('#opfab-groups').find('.vscomp-option-text').eq(1).click({force: true});
        // Select new group
        cy.get('#opfab-groups').find('.vscomp-option-text').eq(3).click({force: true});
        cy.get('#opfab-groups').click();

        cy.get('#opfab-entities').click();
        // Deselect old entity
        cy.get('#opfab-entities').find('.vscomp-option-text').eq(1).click({force: true});
        // Select new entity
        cy.get('#opfab-entities').find('.vscomp-option-text').eq(2).click({force: true});
        cy.get('#opfab-entities').click();

        cy.get('#opfab-admin-user-btn-save').click();
    }

    function deleteUser() {
        agGrid.clickCell('ag-grid-angular', 1, 7, 'of-action-cell-renderer');
        cy.get('#opfab-btn-ok').click();
    }

    function sendQuestionCard() {
        opfab.navigateToUserCard();
        usercard.selectService('User card examples');
        usercard.selectProcess('Message or question');
        usercard.selectState('Question', 1);
        cy.get('#opfab-question-label').should('have.text', 'QUESTION');
        usercard.selectRecipient('Control Center FR South');
        cy.get('#usercard_question_input').type('First question');
        usercard.previewThenSendCard();
        cy.waitDefaultTime();
    }

    function sendMessageCard() {
        opfab.navigateToUserCard();
        // Send base example message
        cy.get('#message').find('div').eq(0).should('be.visible').type('test message');
        usercard.selectRecipient('Control Center FR South');
        usercard.previewThenSendCard();
        cy.waitDefaultTime();
    }

    function changeNotificationConfiguration() {
        opfab.navigateToNotificationConfiguration();
        cy.get('.opfab-notificationconfiguration-processlist')
            .eq(0)
            .find('p')
            .eq(1)
            .find('input')
            .uncheck({force: true});
        cy.get('#opfab-notificationconfiguration-btn-confirm').click(); // Save settings
        cy.get('#opfab-btn-ok').click(); // and confirm
        cy.get('#opfab-btn-ok').should('not.exist'); // wait for dialog to go away
    }

    function clickOnSearchButton() {
        cy.get('#opfab-useractionlogs-btn-search').click();
    }

    function checkNumberOfResultsIs(resultNumber) {
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : ' + resultNumber);
    }

    function checkNumberOfLinesInTableIs(numberOfLines) {
        cy.get('.opfab-useractionlogs-table-line').should('have.length', numberOfLines);
    }

    function checkTableLineContains(index, action, user, comment = null) {
        cy.get('.opfab-useractionlogs-table-line').eq(index).find('td').eq(1).should('have.text', action);
        cy.get('.opfab-useractionlogs-table-line').eq(index).find('td').eq(2).should('have.text', user);
        if (comment !== null) {
            cy.get('.opfab-useractionlogs-table-line').eq(index).find('td').eq(5).should('have.text', comment);
        }
    }

    function checkExportLineContains(row, action, user, comment = null) {
        expect(row['Action']).to.equal(action);
        expect(row['Username']).to.equal(user);
        if (comment !== null) {
            expect(row['Comment']).to.equal(comment);
        }
    }

    function selectUsername(logins) {
        cy.get('#opfab-login-filter').click();
        logins.forEach((login) => {
            cy.get('#opfab-login-filter').find('.vscomp-option-text').contains(login).eq(0).click({force: true});
        });
    }

    function selectAction(actions) {
        cy.get('#opfab-action-filter').click();
        actions.forEach((action) => {
            cy.get('#opfab-action-filter').find('.vscomp-option-text').contains(action).eq(0).click({force: true});
        });
    }

    function clickOnLineNumber(lineNumber) {
        cy.get('.opfab-useractionlogs-table-line').eq(lineNumber).find('td').eq(0).click();
    }

    function closeCardDetail() {
        cy.get('#opfab-archives-card-detail-close').click({force: true});
        cy.get('of-archived-card-detail').should('not.exist');
    }
});
