/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
* See AUTHORS.txt
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
* SPDX-License-Identifier: MPL-2.0
* This file is part of the OperatorFabric project.
*/

import {OpfabGeneralCommands} from "../support/opfabGeneralCommands"
import {ActivityAreaCommands} from "../support/activityAreaCommands"
import {ScriptCommands} from "../support/scriptCommands";
import {CardCommands} from "../support/cardCommands";
import {FeedCommands} from "../support/feedCommands";

describe('Entity acknowledgment tests for icon in light-card', function () {

    const opfab = new OpfabGeneralCommands();
    const activityArea = new ActivityAreaCommands();
    const script = new ScriptCommands();
    const card = new CardCommands();
    const feed = new FeedCommands();

    before('Set up configuration', function () {
        script.resetUIConfigurationFiles();
        script.deleteAllSettings();
        script.loadTestConf();
        
    });

    beforeEach('Delete all cards', function () {
        script.deleteAllCards();
    });


    // card "message2" has the state with parameter consideredAcknowledgedForUserWhen set to UserHasAcknowledged
    // card "message4" has the state with parameter consideredAcknowledgedForUserWhen set to AllEntitiesOfUserHaveAcknowledged
    it('operator4_fr acknowledges the 2 cards, we check the icons, then he un-acknowledges the 2 cards ' +
        'and we check again the icons', function () {

        script.sendCard('cypress/entitiesAcks/message2.json');
        script.sendCard('cypress/entitiesAcks/message4.json');
        opfab.loginWithUser('operator4_fr');

        cy.get('of-light-card').should('have.length', 2);
        // Click on card (message2) and acknowledge it
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage2').click();
        card.acknowledge();
        // Card is not anymore in the feed
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage2').should('not.exist');
        // Detail card is not present anymore
        cy.get('of-card-body').should('not.exist');

        cy.get('of-light-card').should('have.length', 1);
        // Click on card (message4) and acknowledge it
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4').click();
        card.acknowledge();
        // Card is not anymore in the feed
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4').should('not.exist');
        // Detail card is not present anymore
        cy.get('of-card-body').should('not.exist');

        cy.get('of-light-card').should('have.length', 0);

        // Set feed filter to see all cards and check the three cards are present now
        feed.toggleFilterByAcknowledgementAck();

        // Operator4_fr should see 2 cards in his feed
        cy.get('of-light-card').should('have.length', 2);

        // operator4_fr un-ack the card "message2", the icon should disappear
        // First, check icon is present
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage2 .fa-check').should('exist');
        // Click on card message
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage2').click();
        card.unacknowledge();
        // Check icon is not present anymore
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage2 .fa-check').should('not.exist');

        // operator4_fr un-ack the card "message4", the icon should not disappear (because entities acks are never removed)
        // First, check icon is present
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4 .fa-check').should('exist');
        // Click on card message
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4').click();

        // Check "Cancel acknowledgment" button is not present
        cy.get("#opfab-card-details-btn-unack").should('not.exist');

    });

    it('1) operator1_fr acknowledges the card "message2", and we check the icon is not present for operator4_fr\n' +
       '2) operator1_fr acknowledges the card "message3", and we check the icon is present for operator4_fr\n' +
       '3) operator1_fr acknowledges the card "message4", and we check the icon is not present for operator4_fr'
        , function () {

        opfab.loginWithUser('operator4_fr');

        // Set feed filter to see all cards
        feed.toggleFilterByAcknowledgementAck();

        script.sendCard('cypress/entitiesAcks/message2.json');
        script.sendCard('cypress/entitiesAcks/message4.json');

        cy.get('of-light-card').should('have.length', 2);
        // All cards should not have ack icon
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage2 .fa-check').should('not.exist');
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4 .fa-check').should('not.exist');

        // operator1_fr acknowledges the card "message2", and we check the icon is not present for operator4_fr
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage2').click();
        cy.get('#cardUid').then(($cardUidElement) => {
            const cardUid = $cardUidElement.text(); // We need the uid of the card to ack it

            script.sendAckForCard("operator1_fr", cardUid, '[\\"ENTITY1_FR\\"]');
            cy.waitDefaultTime();
            cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage2 .fa-check').should('not.exist');
        });

        card.close();

        // operator1_fr acknowledges the card "message4", and we check the icon is not present for operator4_fr
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4').click();
        cy.get('#cardUid').then(($cardUidElement) => {
            const cardUid = $cardUidElement.text(); // We need the uid of the card to ack it

            script.sendAckForCard("operator1_fr", cardUid, '[\\"ENTITY1_FR\\"]');
            cy.waitDefaultTime();
            cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4 .fa-check').should('not.exist');
        });

        // operator4_fr ack the card "message2", and we check the icon is present
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage2').click();
        card.acknowledge();
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage2 .fa-check').should('exist');

        // operator4_fr ack the card "message4", and we check the icon is present
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4').click();
        card.acknowledge();
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4 .fa-check').should('exist');
    });

    it('check entities ack modifying activity area of operator4_fr', function () {


        opfab.loginWithUser('operator4_fr');

        // Set feed filter to see all cards
        feed.toggleFilterByAcknowledgementAck();

        opfab.navigateToActivityArea();

        // We should have 4 checkboxes corresponding to the four entities of the user
        cy.get('.opfab-checkbox').should('have.length', 4);
        // We check all the checkboxes are checked
        cy.get('.opfab-checkbox').eq(0).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(1).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(2).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(3).find('input').should('be.checked');

        // We disconnect from ENTITY3_FR and ENTITY4_FR
        cy.get('.opfab-checkbox').contains('Control Center FR East').click();
        cy.get('.opfab-checkbox').contains('Control Center FR West').click();
        activityArea.save();

        cy.get('#opfab-navbar-menu-feed').click(); // we go back to the feed
        script.sendCard('cypress/entitiesAcks/message4.json');

        cy.get('of-light-card').should('have.length', 1);
        // All cards should not have ack icon
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4 .fa-check').should('not.exist');

        // operator1_fr acknowledges the card "message4", and we check the icon is not present for operator4_fr
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4').click();
        cy.get('#cardUid').then(($cardUidElement) => {
            const cardUid = $cardUidElement.text(); // We need the uid of the card to ack it

            script.sendAckForCard("operator1_fr", cardUid, '[\\"ENTITY1_FR\\"]');
            cy.waitDefaultTime();
            cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4 .fa-check').should('not.exist');

            // operator2_fr acknowledges the card "message4", and we check now the icon is present for operator4_fr
            script.sendAckForCard("operator2_fr", cardUid, '[\\"ENTITY2_FR\\"]');
            cy.waitDefaultTime();
            cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4 .fa-check').should('exist');
        });

        // now we add ENTITY3_FR to the entities of operator4_fr
        opfab.navigateToActivityArea();

        // We connect to ENTITY3_FR
        cy.get('.opfab-checkbox').contains('Control Center FR East').click();
        activityArea.save();

        cy.get('#opfab-navbar-menu-feed').click(); // we go back to the feed

        // ack icon for card "message4" should not be present anymore
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4 .fa-check').should('not.exist');

        // now operator4_fr is only connected to ENTITY3_FR
        opfab.navigateToActivityArea();

        // We disconnect from ENTITY1_FR and ENTITY2_FR
        cy.get('.opfab-checkbox').contains('Control Center FR North').click();
        cy.get('.opfab-checkbox').contains('Control Center FR South').click();
        activityArea.save();

        cy.get('#opfab-navbar-menu-feed').click(); // we go back to the feed

        // ack icon for card "message4" should still not be present
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4 .fa-check').should('not.exist');

        // We reconnect to ENTITY1_FR, ENTITY2_FR and ENTITY4_FR
        opfab.navigateToActivityArea();
        cy.get('.opfab-checkbox').contains('Control Center FR North').click();
        cy.get('.opfab-checkbox').contains('Control Center FR South').click();
        cy.get('.opfab-checkbox').contains('Control Center FR West').click();
        activityArea.save();
    });

    it('check entities ack for cards sent to groups only (no entityRecipients) for operator2_fr', function () {

        opfab.loginWithUser('operator2_fr');

        // Set feed filter to see all cards
        feed.toggleFilterByAcknowledgementAck();

        script.sendCard('cypress/entitiesAcks/message2_groupsOnly.json');
        script.sendCard('cypress/entitiesAcks/message4_groupsOnly.json');

        cy.get('of-light-card').should('have.length', 2);
        // All cards should not have ack icon
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage2_groupsOnly .fa-check').should('not.exist');
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4_groupsOnly .fa-check').should('not.exist');

        // operator4_fr (member of 4 french entities) acknowledges the card "message2_groupsOnly", and we check the icon is not present for operator2_fr
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage2_groupsOnly').click();
        cy.get('#cardUid').then(($cardUidElement) => {
            const cardUid = $cardUidElement.text(); // We need the uid of the card to ack it

            script.sendAckForCard("operator4_fr", cardUid, '[\\"ENTITY1_FR\\",\\"ENTITY2_FR\\",\\"ENTITY3_FR\\",\\"ENTITY4_FR\\"]');
            cy.waitDefaultTime();
            cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage2_groupsOnly .fa-check').should('not.exist');
        });

        card.close();
        // operator4_fr acknowledges the card "message4_groupsOnly", and we check the icon is not present for operator2_fr
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4_groupsOnly').click();
        cy.get('#cardUid').then(($cardUidElement) => {
            const cardUid = $cardUidElement.text(); // We need the uid of the card to ack it

            script.sendAckForCard("operator4_fr", cardUid, '[\\"ENTITY1_FR\\",\\"ENTITY2_FR\\",\\"ENTITY3_FR\\",\\"ENTITY4_FR\\"]');
            cy.waitDefaultTime();
            cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4_groupsOnly .fa-check').should('not.exist');
        });

        // operator2_fr clicks on card (message2_groupsOnly), acknowledges it, and we check the icon is present
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage2_groupsOnly').click();
        card.acknowledge();
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage2_groupsOnly .fa-check').should('exist');

        // operator2_fr clicks on card (message4_groupsOnly), acknowledges it, and we check the icon is present
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4_groupsOnly').click();
        card.acknowledge();
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4_groupsOnly .fa-check').should('exist');
    });

    it('1) operator4_fr, disconnected from ENTITY4_FR, acknowledges the cards "message3" and "message4", and we check\n' +
        'icon is present for the 2 cards\n' +
        '2) operator4_fr reconnects to ENTITY4_FR, and we check the ack icon is still present for "message3" but not \n' +
        'present anymore for "message4"', function () {

        opfab.loginWithUser('operator4_fr');

        // Set feed filter to see all cards
        feed.toggleFilterByAcknowledgementAck();

        opfab.navigateToActivityArea();

        // We should have 4 checkboxes corresponding to the four entities of the user
        cy.get('.opfab-checkbox').should('have.length', 4);
        // We check all the checkboxes are checked
        cy.get('.opfab-checkbox').eq(0).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(1).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(2).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(3).find('input').should('be.checked');

        // We disconnect from ENTITY4_FR
        cy.get('.opfab-checkbox').contains('Control Center FR West').click();
        activityArea.save();

        cy.get('#opfab-navbar-menu-feed').click(); // we go back to the feed

        script.sendCard('cypress/entitiesAcks/message4.json');

        cy.get('of-light-card').should('have.length', 1);

        // operator4_fr ack the card, and we check the icon is present
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4').click();
        card.acknowledge();
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4 .fa-check').should('exist');

        opfab.navigateToActivityArea();

        // We reconnect to ENTITY4_FR
        cy.get('.opfab-checkbox').contains('Control Center FR West').click();
        activityArea.save();
        opfab.navigateToFeed();

        cy.get('#opfab-navbar-menu-feed').click(); // we go back to the feed

        cy.get('of-light-card').should('have.length', 1);
        // "message3" should not have ack icon"
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4 .fa-check').should('not.exist');
    });

    it('check entities ack for a card sent to entities different from entities of the user', function () {

        opfab.loginWithUser('operator1_fr');

        // Set feed filter to see all cards
        feed.toggleFilterByAcknowledgementAck();

        script.sendCard('cypress/entitiesAcks/message4_ItalianEntityRecipients.json');

        cy.get('of-light-card').should('have.length', 1);
        // The card should not have ack icon
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4_ItalianEntityRecipients .fa-check').should('not.exist');
        // The ack button must display 'acknowledge and close'
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4_ItalianEntityRecipients').click();
        cy.get('#opfab-card-details-btn-ack').should('exist').should('have.text', 'ACKNOWLEDGE AND CLOSE');
        card.acknowledge();
        // Now, the ack icon must be present
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4_ItalianEntityRecipients .fa-check').should('exist');
    });

});
