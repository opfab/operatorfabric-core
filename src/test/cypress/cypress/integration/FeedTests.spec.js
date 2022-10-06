/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OpfabGeneralCommands} from '../support/opfabGeneralCommands'
import {FeedCommands} from '../support/feedCommands'
import {CardCommands} from '../support/cardCommands'
import {ScriptCommands} from "../support/scriptCommands";

describe('FeedScreen tests', function () {

    const opfab = new OpfabGeneralCommands();
    const feed = new FeedCommands();
    const card = new CardCommands();
    const script = new ScriptCommands();

    function tryToLoadNonExistingCard() {
        cy.visit('#/feed/cards/thisCardDoesNotExist');
        cy.get('#opfab-feed-card-not-found').should('exist');
    }

    before('Set up configuration', function () {
        script.resetUIConfigurationFiles();
        script.loadTestConf();
    });

    beforeEach('Delete all cards', function () {
        script.deleteAllCards();
    });

    it('Check card reception and read behaviour', function () {
        opfab.loginWithUser('operator1_fr');
        script.send6TestCards();
        // Set feed sort to "Date" so the cards don't move down the feed once they're read
        cy.get('#opfab-feed-filter-btn-sort').click();
        cy.get('#opfab-sort-form').find('input[value=date]').parent().click();
        cy.get('#opfab-feed-filter-btn-sort').click();

        feed.checkNumberOfDisplayedCardsIs(6);

        // No card detail is displayed
        cy.get('of-card-details').should('not.exist');

        // Title and subtitle should be unread (bold) for all 6 cards
        cy.get('of-light-card').find('.card-title, .card-title')
            .each((item, index) => {
                cy.wrap(item)
                    .should('have.css', 'font-weight')
                    .and('match', /700|bold/); // Some browsers (Chrome for example) render "bold" as "700"
            });

        // No summary should be displayed
        cy.get('[id^=opfab-feed-light-card]').each((item, index) => {
            cy.wrap(item).find('#opfab-selected-card-summary').should('not.exist');
        });

        // Click on the first card:
        // - it should move to the side
        // - its summary should be displayed
        // - browser should navigate to url of corresponding card
        // - a card detail should be displayed
        cy.get('of-light-card').eq(0).click()
            .find('[id^=opfab-feed-light-card]')
            .should('have.class', 'light-card-detail-selected')
            .should('have.css', 'margin-left', '20px')
            .invoke('attr', 'data-urlId')
            .as('firstCardUrlId')
            .then((urlId) => {
                cy.hash().should('eq', '#/feed/cards/' + urlId);
                cy.get('of-card-details').find('of-detail');
            });
        cy.get('#opfab-feed-card-not-found').should('not.exist');

        tryToLoadNonExistingCard();

        // Click on the second card (taken from first card's siblings to avoid clicking the same card twice):
        // - it should move to the side
        // - browser should navigate to url of corresponding card
        // - a card detail should be displayed
        cy.get('@firstCardUrlId').then((firstCardUrlId) => {
            cy.get(`[data-urlId="${firstCardUrlId}"]`).parent().parent().parent().siblings().eq(0).click()
                .find('[id^=opfab-feed-light-card]')
                .should('have.class', 'light-card-detail-selected')
                .should('have.css', 'margin-left', '20px')
                .invoke('attr', 'data-urlId')
                .then((urlId) => {
                    cy.hash().should('eq', '#/feed/cards/' + urlId);
                    cy.get('of-card-details').find('of-detail');
                });
        });
        cy.get('#opfab-feed-card-not-found').should('not.exist');

        // Temporary fix for the `cy...failed because the element has been detached from the DOM` error (see OC-1669)
        cy.waitDefaultTime();

        // First card should no longer be bold and to the side
        cy.get('@firstCardUrlId').then((firstCardUrlId) => {
            cy.get(`[data-urlId="${firstCardUrlId}"]`)
                .should('not.have.class', 'light-card-detail-selected')
                .should('not.have.css', 'margin-left', '20px')
                .find('.card-title, .card-title')
                .should('have.css', 'font-weight')
                .and('match', /400|normal/);
        });

    });

    it('Check card delete ', function () {
        opfab.loginWithUser('operator1_fr');
        script.send6TestCards();
        feed.checkNumberOfDisplayedCardsIs(6);
        cy.get('of-card-details').should('not.exist');
        script.delete6TestCards();
        feed.checkNumberOfDisplayedCardsIs(0);
        cy.get('of-card-details').should('not.exist');
    });

    it('Check card visibility by publish date when business period is after selected time range', function () {
        script.sendCard('cypress/feed/futureEvent.json');
        opfab.loginWithUser('operator1_fr');
        feed.checkNumberOfDisplayedCardsIs(1);
    });

    it('Check sorting', function () {
        script.sendCard('defaultProcess/chartLine.json');
        script.sendCard('defaultProcess/question.json');
        script.sendCard('defaultProcess/process.json');
        script.sendCard('defaultProcess/message.json');

        opfab.loginWithUser('operator1_fr');
        feed.checkNumberOfDisplayedCardsIs(4);

        feed.sortByUnread();

        feed.checkLigthCardAtIndexHasTitle(0, 'Message');
        feed.checkLigthCardAtIndexHasTitle(1, 'Process state (calcul)');
        feed.checkLigthCardAtIndexHasTitle(2, '⚡ Planned Outage');
        feed.checkLigthCardAtIndexHasTitle(3, 'Electricity consumption forecast');


        // Read first card
        feed.openFirstCard();
        card.close();

        cy.waitDefaultTime();

        // Check read card is the last one
        feed.checkLigthCardAtIndexHasTitle(0, 'Process state (calcul)');
        feed.checkLigthCardAtIndexHasTitle(1, '⚡ Planned Outage');
        feed.checkLigthCardAtIndexHasTitle(2, 'Electricity consumption forecast');
        feed.checkLigthCardAtIndexHasTitle(3, 'Message');


        feed.sortByReceptionDate();

        cy.waitDefaultTime();
    
        feed.checkLigthCardAtIndexHasTitle(0, 'Message');
        feed.checkLigthCardAtIndexHasTitle(1, 'Process state (calcul)');
        feed.checkLigthCardAtIndexHasTitle(2, '⚡ Planned Outage');
        feed.checkLigthCardAtIndexHasTitle(3, 'Electricity consumption forecast');

        feed.sortBySeverity();

        cy.waitDefaultTime();

        feed.checkLigthCardAtIndexHasTitle(0, 'Electricity consumption forecast');
        feed.checkLigthCardAtIndexHasTitle(1, '⚡ Planned Outage');
        feed.checkLigthCardAtIndexHasTitle(2, 'Process state (calcul)');
        feed.checkLigthCardAtIndexHasTitle(3, 'Message');

        feed.sortByStartDate();

        cy.waitDefaultTime();

        feed.checkLigthCardAtIndexHasTitle(0, '⚡ Planned Outage');
        feed.checkLigthCardAtIndexHasTitle(1, 'Electricity consumption forecast');
        feed.checkLigthCardAtIndexHasTitle(2, 'Message');
        feed.checkLigthCardAtIndexHasTitle(3, 'Process state (calcul)');

        feed.sortByEndDate();

        cy.waitDefaultTime();

        feed.checkLigthCardAtIndexHasTitle(0, 'Electricity consumption forecast');
        feed.checkLigthCardAtIndexHasTitle(1, '⚡ Planned Outage');
        feed.checkLigthCardAtIndexHasTitle(2, 'Message');
        feed.checkLigthCardAtIndexHasTitle(3, 'Process state (calcul)');
    });
});
