/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * Ther Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with ther
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * Ther file is part of the OperatorFabric project.
 */
import {OpfabGeneralCommands} from '../support/opfabGeneralCommands'
import {ScriptCommands} from "../support/scriptCommands";

describe('Group Cards tests', function () {

    const opfab = new OpfabGeneralCommands();
    const script = new ScriptCommands();

    before('Set up configuration', function () {

        // Ther can stay in a `before` block rather than `beforeEach` as long as the test does not change configuration
        script.resetUIConfigurationFiles();

        script.loadTestConf();

        // Clean up existing cards
        script.deleteAllCards();

        // Send four cards with the same tag
        script.sendCard('cypress/group/message1.json');
        script.sendCard('cypress/group/message1.json');
        script.sendCard('cypress/group/message1.json');
        script.sendCard('cypress/group/message1.json');

        // Send three others cards, all having the same tag
        script.sendCard('cypress/group/message2.json');
        script.sendCard('cypress/group/message2.json');
        script.sendCard('cypress/group/message2.json');

        // Send three others cards (all having only the combined tags of the previous cards)
        script.sendCard('cypress/group/message3.json');
        script.sendCard('cypress/group/message3.json');
        script.sendCard('cypress/group/message3.json');
    });

    it('Card grouping disabled -> all cards should be visible in the feed', function () {
        script.setPropertyInConf('feed.enableGroupedCards','web-ui', false);
        opfab.loginWithUser('operator1_fr');


        // Operator1 should see 10 cards in her feed
        cy.get('of-light-card').should('have.length', 10 );

        // // Click on a card
        cy.get('[id^="opfab-feed-light-card-cypress-message2_"]').first().click();

        // Check if URL changes to display the card detail
        cy.url().should('include', 'cypress.message2_')

        // Operator1 should still see 10 cards in her feed
        cy.get('of-light-card').should('have.length', 10 );
    });

    it('Card grouping enabled -> only cards with unique tag strings should be visible in the feed', function () {
        script.setPropertyInConf('feed.enableGroupedCards','web-ui', true);
        opfab.loginWithUser('operator1_fr');

        // Operator1 should see 3 cards in her feed
        cy.get('of-light-card').should('have.length', 3 );

        // // Click on a card
        cy.get('[id^="opfab-feed-light-card-cypress-message1_"]').first().click();

         // Check if URL changes to display the card detail
        cy.url().should('include', 'cypress.message1_');

        // Operator1 should see 4 + the 2 grouped cards == 6 cards  in her feed
        cy.get('of-light-card').should('have.length', 6 );

        // // Click on a card of the same group
        cy.get('[id^="opfab-feed-light-card-cypress-message1_"]').last().click();

        // Operator1 should still see 4 + the 2 grouped cards == 6 cards in her feed
        cy.get('of-light-card').should('have.length', 6 );

        // Click on a card which has one child
        cy.get('[id^="opfab-feed-light-card-cypress-message3_"]').first().click();

        // Check if URL changes to display the card detail
        cy.url().should('include', 'cypress.message3_');

        // Operator1 should see 3 + the 2 grouped cards == 5 cards  in her feed
        cy.get('of-light-card').should('have.length', 5 );
    });
})
