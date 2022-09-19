/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {getOpfabGeneralCommands} from '../support/opfabGeneralCommands'
import {getFeedCommands} from '../support/feedCommands'

describe('FeedScreen tests', function () {

    const opfab = getOpfabGeneralCommands();
    const feed = getFeedCommands();

    function tryToLoadNonExistingCard() {
        cy.visit('#/feed/cards/thisCardDoesNotExist');
        cy.get('#opfab-feed-card-not-found').should('exist');
    }

    before('Set up configuration', function () {
        cy.resetUIConfigurationFiles();
        cy.loadTestConf();
    });

    beforeEach('Delete all cards', function () {
        cy.deleteAllCards();
    });

    it('Check card reception and read behaviour', function () {
        opfab.loginWithUser('operator1_fr');
        cy.send6TestCards();
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
        cy.send6TestCards();
        feed.checkNumberOfDisplayedCardsIs(6);
        cy.get('of-card-details').should('not.exist');
        cy.delete6TestCards();
        feed.checkNumberOfDisplayedCardsIs(0);
        cy.get('of-card-details').should('not.exist');
    });

    it('Check card visibility by publish date when business period is after selected time range', function () {
        cy.sendCard('cypress/feed/futureEvent.json');
        opfab.loginWithUser('operator1_fr');
        cy.get('of-light-card').should('have.length', 1);
    });
});
