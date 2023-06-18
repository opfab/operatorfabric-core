/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
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
        feed.sortByReceptionDate();

        feed.checkNumberOfDisplayedCardsIs(6);

        // No card detail is displayed
        cy.get('of-card').should('not.exist');

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
                cy.get('of-card').find('of-card-body');
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
                    cy.get('of-card').find('of-card-body');
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
        cy.get('of-card').should('not.exist');
        script.delete6TestCards();
        feed.checkNumberOfDisplayedCardsIs(0);
        cy.get('of-card').should('not.exist');
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
    


    it('Check filter by priority', function () {
        opfab.loginWithUser('operator1_fr');
        script.send6TestCards();
        
        feed.checkFilterIsNotActive();
        feed.checkNumberOfDisplayedCardsIs(6);
        feed.toggleFilterByPriority(['alarm']);
        feed.checkFilterIsActive();
        cy.waitDefaultTime();
        feed.checkNumberOfDisplayedCardsIs(4);
        feed.checkLigthCardAtIndexHasTitle(0, '⚡ Planned Outage');
        feed.checkLigthCardAtIndexHasTitle(1, 'Process state (calcul)');
        feed.checkLigthCardAtIndexHasTitle(2, 'Data quality');
        feed.checkLigthCardAtIndexHasTitle(3, 'Message');

        feed.toggleFilterByPriority(['compliant']);
        feed.checkFilterIsActive();
        cy.waitDefaultTime();
        feed.checkNumberOfDisplayedCardsIs(3);
        feed.checkLigthCardAtIndexHasTitle(0, '⚡ Planned Outage');
        feed.checkLigthCardAtIndexHasTitle(1, 'Data quality');
        feed.checkLigthCardAtIndexHasTitle(2, 'Message');

        feed.toggleFilterByPriority(['alarm', 'compliant']);
        feed.checkFilterIsNotActive();
        feed.checkNumberOfDisplayedCardsIs(6);
    });
        
    it('Check filter by acknowledgement', function () {
        opfab.loginWithUser('operator1_fr');
        script.sendCard('defaultProcess/message.json');
        script.sendCard('defaultProcess/chart.json');

        feed.checkFilterIsNotActive();
        feed.checkNumberOfDisplayedCardsIs(2);
        cy.get('#opfab-feed-light-card-defaultProcess-process1').should('exist');
        cy.get('#opfab-feed-light-card-defaultProcess-process2').should('exist');

        acknowledgeCard('#opfab-feed-light-card-defaultProcess-process2');

        feed.checkNumberOfDisplayedCardsIs(1);
        // Acknowledged card is not anymore in the feed
        cy.get('#opfab-feed-light-card-defaultProcess-process1').should('exist');
        cy.get('#opfab-feed-light-card-defaultProcess-process2').should('not.exist');

        feed.toggleFilterByAcknowledgementAck();
        feed.checkFilterIsNotActive();
        cy.waitDefaultTime();
        feed.checkNumberOfDisplayedCardsIs(2);
        // All cards are visible
        cy.get('#opfab-feed-light-card-defaultProcess-process1').should('exist');
        cy.get('#opfab-feed-light-card-defaultProcess-process2').should('exist');

        feed.toggleFilterByAcknowledgementNotAck();
        feed.checkFilterIsActive();
        cy.waitDefaultTime();
        feed.checkNumberOfDisplayedCardsIs(1);
        // Only acknowledged card is visible
        cy.get('#opfab-feed-light-card-defaultProcess-process1').should('not.exist');
        cy.get('#opfab-feed-light-card-defaultProcess-process2').should('exist');

        feed.toggleFilterByAcknowledgementNotAck();
        feed.toggleFilterByAcknowledgementAck();
        cy.waitDefaultTime();
        feed.checkFilterIsNotActive();
        
        feed.checkNumberOfDisplayedCardsIs(1);
        // Only not acknowledged card is visible
        cy.get('#opfab-feed-light-card-defaultProcess-process1').should('exist');
        cy.get('#opfab-feed-light-card-defaultProcess-process2').should('not.exist');

        feed.toggleFilterByAcknowledgementNotAck();
        cy.waitDefaultTime();
        feed.checkFilterIsActive();
        // No cards visible
        feed.checkNumberOfDisplayedCardsIs(0);

    });
    

    it('Check filter by response from user entity', function () {
        opfab.loginWithUser('operator1_fr');
        script.sendCard('defaultProcess/message.json');
        script.sendCard('defaultProcess/question.json');

        feed.checkFilterIsNotActive();
        feed.checkNumberOfDisplayedCardsIs(2);
        cy.get('#opfab-feed-light-card-defaultProcess-process1').should('exist');
        cy.get('#opfab-feed-light-card-defaultProcess-process4').should('exist');

        respondToCard('#opfab-feed-light-card-defaultProcess-process4');

        // See in the feed the fact that user has responded (icon)
        cy.get('#opfab-feed-light-card-defaultProcess-process4').find('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity');

        feed.toggleFilterByResponse();
        feed.checkFilterIsActive();
        cy.waitDefaultTime();
        feed.checkNumberOfDisplayedCardsIs(1);
        // Card with response is not visible
        cy.get('#opfab-feed-light-card-defaultProcess-process4').should('not.exist');

        feed.toggleFilterByResponse();
        feed.checkFilterIsNotActive();
        cy.waitDefaultTime();
        feed.checkNumberOfDisplayedCardsIs(2);
        // Card with response is visible
        cy.get('#opfab-feed-light-card-defaultProcess-process4').should('exist');

    });

    it('Check apply filters to timeline', function () {
        opfab.loginWithUser('operator1_fr');
        script.sendCard('defaultProcess/chart.json');

        script.sendCard('defaultProcess/question.json');

        feed.checkFilterIsNotActive();
        feed.checkNumberOfDisplayedCardsIs(2);
        checkTimelineCircles(2);

        feed.toggleFilterByPriority(['action']);
        feed.checkFilterIsActive();
        cy.waitDefaultTime();
        feed.checkNumberOfDisplayedCardsIs(1);
        // Filter is applied to timeline
        checkTimelineCircles(1);

        // Uncheck apply filters to timeliine 
        feed.toggleApplyFilterToTimeline();
        cy.waitDefaultTime();
        feed.checkNumberOfDisplayedCardsIs(1);
        // Filter is not applied to timeline
        checkTimelineCircles(2);

    });


    it('Check reset all filters', function () {
        opfab.loginWithUser('operator1_fr');
        script.send6TestCards();

        feed.checkFilterIsNotActive();
        feed.checkNumberOfDisplayedCardsIs(6);

        feed.toggleFilterByPriority(['alarm']);
        feed.checkFilterIsActive();
        cy.waitDefaultTime();
        feed.checkNumberOfDisplayedCardsIs(4);

        acknowledgeCard('#opfab-feed-light-card-defaultProcess-process2');
        cy.waitDefaultTime();
        feed.checkNumberOfDisplayedCardsIs(3);

        feed.toggleFilterByAcknowledgementAck();
        cy.waitDefaultTime();
        feed.checkNumberOfDisplayedCardsIs(4);

        respondToCard('#opfab-feed-light-card-defaultProcess-process4');
        // See in the feed the fact that user has responded (icon)
        cy.get('#opfab-feed-light-card-defaultProcess-process4').find('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity');

        feed.toggleFilterByResponse();
        cy.waitDefaultTime();
        feed.checkNumberOfDisplayedCardsIs(3);

        feed.resetAllFilters();
        cy.waitDefaultTime();

        // Check there are 5 cards in the feed (acknowledged card is not visible)
        feed.checkNumberOfDisplayedCardsIs(5);
        feed.checkFilterIsOpenAndNotActive();
        checkResetAllFiltersLinkDoesNotExists();
    });



    function respondToCard(cardId) {
        // Click on the card
        cy.get(cardId).click();

        // Check the correct rendering of card 
        cy.get('#question-choice1');

        // Respond to the card 
        cy.get('#question-choice1').click();
        card.sendResponse();
    }

    function acknowledgeCard(cardId) {
        // Click on the card
        cy.get(cardId).click();
        card.acknowledge();
    }

    function checkResetAllFiltersLinkDoesNotExists() {
        // Open filter popover and check that "reset all" link does not exist
        cy.get('#opfab-feed-filter-btn-filter').click();
        cy.get('#opfab-feed-filter-reset').should('not.exist');
        cy.get('#opfab-feed-filter-btn-filter').click();
    }

    function checkTimelineCircles(nb) {
        cy.get("of-custom-timeline-chart").find("ellipse").should('have.length', nb);
    }
});
