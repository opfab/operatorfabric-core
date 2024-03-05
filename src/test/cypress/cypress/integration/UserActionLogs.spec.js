/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
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

describe('User action logs page', () => {
    const opfab = new OpfabGeneralCommands();
    const script = new ScriptCommands();
    const usercard = new UserCardCommands();
    const card = new CardCommands();
    const feed = new FeedCommands();

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
        checkNumberOfResultsIs(12);
        checkNumberOfLinesInTableIs(10);
        checkTableLineContains(0, 'OPEN_SUBSCRIPTION', 'admin');
        checkTableLineContains(1, 'CLOSE_SUBSCRIPTION', 'operator2_fr');
        checkTableLineContains(2, 'UNACK_CARD', 'operator2_fr');
        checkTableLineContains(3, 'SEND_RESPONSE', 'operator2_fr');
        checkTableLineContains(4, 'READ_CARD', 'operator2_fr');
        checkTableLineContains(5, 'ACK_CARD', 'operator2_fr');
        checkTableLineContains(6, 'READ_CARD', 'operator2_fr');
        checkTableLineContains(7, 'OPEN_SUBSCRIPTION', 'operator2_fr');
        checkTableLineContains(8, 'CLOSE_SUBSCRIPTION', 'operator1_fr');
        checkTableLineContains(9, 'SEND_CARD', 'operator1_fr');

        cy.get('ngb-pagination').find('.page-link').eq(2).click();
        checkNumberOfLinesInTableIs(2);
        checkTableLineContains(0, 'SEND_CARD', 'operator1_fr');
        checkTableLineContains(1, 'OPEN_SUBSCRIPTION', 'operator1_fr');

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
        checkNumberOfResultsIs(14);
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
                expect(rows.length).to.equal(14);

                checkExportLineContains(rows[0], 'OPEN_SUBSCRIPTION', 'admin');
                checkExportLineContains(rows[1], 'CLOSE_SUBSCRIPTION', 'admin');
                checkExportLineContains(rows[2], 'OPEN_SUBSCRIPTION', 'admin');
                checkExportLineContains(rows[3], 'CLOSE_SUBSCRIPTION', 'operator2_fr');
                checkExportLineContains(rows[4], 'UNACK_CARD', 'operator2_fr');
                checkExportLineContains(rows[5], 'SEND_RESPONSE', 'operator2_fr');
                checkExportLineContains(rows[6], 'READ_CARD', 'operator2_fr');
                checkExportLineContains(rows[7], 'ACK_CARD', 'operator2_fr');
                checkExportLineContains(rows[8], 'READ_CARD', 'operator2_fr');
                checkExportLineContains(rows[9], 'OPEN_SUBSCRIPTION', 'operator2_fr');
                checkExportLineContains(rows[10], 'CLOSE_SUBSCRIPTION', 'operator1_fr');
                checkExportLineContains(rows[11], 'SEND_CARD', 'operator1_fr');
                checkExportLineContains(rows[12], 'SEND_CARD', 'operator1_fr');
                checkExportLineContains(rows[13], 'OPEN_SUBSCRIPTION', 'operator1_fr');
            });
        });
    });

    it('Check card details is accessible', () => {
        opfab.loginWithUser('admin');
        opfab.navigateToUserActionLogs();
        clickOnSearchButton();
        checkNumberOfResultsIs(16);
        clickOnLineNumber(0);
        cy.get('of-simplified-card-view').should('not.exist');
        clickOnLineNumber(6);
        cy.get('of-simplified-card-view').should('exist');
        closeCardDetail();
        clickOnLineNumber(7);
        cy.get('of-simplified-card-view').should('exist');

        // Check the response has been integrated in the template
        cy.get('#template_responses').find('tr').should('have.length', 2);
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

    function clickOnSearchButton() {
        cy.get('#opfab-useractionlogs-btn-search').click();
    }

    function checkNumberOfResultsIs(resultNumber) {
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : ' + resultNumber);
    }

    function checkNumberOfLinesInTableIs(numberOfLines) {
        cy.get('.opfab-useractionlogs-table-line').should('have.length', numberOfLines);
    }

    function checkTableLineContains(index, action, user) {
        cy.get('.opfab-useractionlogs-table-line').eq(index).find('td').eq(1).should('have.text', action);
        cy.get('.opfab-useractionlogs-table-line').eq(index).find('td').eq(2).should('have.text', user);
    }

    function checkExportLineContains(row, action, user) {
        expect(row['Action']).to.equal(action);
        expect(row['Username']).to.equal(user);
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
