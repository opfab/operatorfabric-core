/* Copyright (c) 2022, RTE (http://www.rte-france.com)
* See AUTHORS.txt
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
* SPDX-License-Identifier: MPL-2.0
* This file is part of the OperatorFabric project.
*/

describe('Entity acknowledgment tests for icon in light-card', function () {

    before('Set up configuration', function () {
        // This can stay in a `before` block rather than `beforeEach` as long as the test does not change configuration
        cy.resetUIConfigurationFiles();
        cy.loadTestConf();
        // Clean up existing cards
        cy.deleteAllCards();
    });

    // card "message2" has the state with parameter consideredAcknowledgedForUserWhen set to UserHasAcknowledged
    // card "message3" has the state with parameter consideredAcknowledgedForUserWhen set to OneEntityOfUserHasAcknowledged
    // card "message4" has the state with parameter consideredAcknowledgedForUserWhen set to AllEntitiesOfUserHaveAcknowledged
    it('operator4_fr acknowledges the three 3 cards, we check the icons, then he un-acknowledges the three cards ' +
        'and we check again the icons', function () {

        cy.sendCard('cypress/entitiesAcks/message2.json');
        cy.sendCard('cypress/entitiesAcks/message3.json');
        cy.sendCard('cypress/entitiesAcks/message4.json');

        cy.loginOpFab('operator4_fr', 'test');

        // Set feed filter to see only un-acknowledged cards
        cy.get('#opfab-feed-filter-btn-filter').click();
        cy.get('#opfab-feed-filter-ack-notack').click();
        cy.waitDefaultTime(); // let time before closing popup to avoid flaky error on CI/CD
        cy.get('#opfab-feed-filter-btn-filter').click();

        cy.get('of-light-card').should('have.length', 3);
        // Click on card (message2) and acknowledge it
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage2').click();
        cy.get('#opfab-card-details-btn-ack').should('exist');
        // Click ack button
        cy.get('#opfab-card-details-btn-ack').click();
        // Card is not anymore in the feed
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage2').should('not.exist');
        // Detail card is not present anymore
        cy.get('of-detail').should('not.exist');

        cy.get('of-light-card').should('have.length', 2);
        // Click on card (message3) and acknowledge it
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage3').click();
        cy.get('#opfab-card-details-btn-ack').should('exist');
        // Click ack button
        cy.get('#opfab-card-details-btn-ack').click();
        // Card is not anymore in the feed
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage3').should('not.exist');
        // Detail card is not present anymore
        cy.get('of-detail').should('not.exist');

        cy.get('of-light-card').should('have.length', 1);
        // Click on card (message4) and acknowledge it
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4').click();
        cy.get('#opfab-card-details-btn-ack').should('exist');
        // Click ack button
        cy.get('#opfab-card-details-btn-ack').click();
        // Card is not anymore in the feed
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4').should('not.exist');
        // Detail card is not present anymore
        cy.get('of-detail').should('not.exist');

        cy.get('of-light-card').should('have.length', 0);

        // Set feed filter to see all cards and check the three cards are present now
        cy.get('#opfab-feed-filter-btn-filter').click();
        cy.get('#opfab-feed-filter-ack-all').click();
        cy.waitDefaultTime(); // let time before closing popup to avoid flaky error on CI/CD
        cy.get('#opfab-feed-filter-btn-filter').click();

        // Operator4_fr should see 3 cards in his feed
        cy.get('of-light-card').should('have.length', 3);

        // operator4_fr un-ack the card "message2", the icon should disappear
        // First, check icon is present
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage2 .fa-check').should('exist');
        // Click on card message
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage2').click();
        // Unack the card
        cy.get('#opfab-card-details-btn-ack').click();
        // Check icon is not present anymore
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage2 .fa-check').should('not.exist');

        // operator4_fr un-ack the card "message3", the icon should not disappear (because entities acks are never removed)
        // First, check icon is present
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage3 .fa-check').should('exist');
        // Click on card message
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage3').click();
        // Unack the card
        cy.get('#opfab-card-details-btn-ack').click();
        // Check icon is still present
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage3 .fa-check').should('exist');

        // operator4_fr un-ack the card "message4", the icon should not disappear (because entities acks are never removed)
        // First, check icon is present
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4 .fa-check').should('exist');
        // Click on card message
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4').click();
        // Unack the card
        cy.get('#opfab-card-details-btn-ack').click();
        // Check icon is still present
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4 .fa-check').should('exist');
    });

    it('1) operator1_fr acknowledges the card "message2", and we check the icon is not present for operator4_fr\n' +
       '2) operator1_fr acknowledges the card "message3", and we check the icon is present for operator4_fr\n' +
       '3) operator1_fr acknowledges the card "message4", and we check the icon is not present for operator4_fr'
        , function () {

        // Clean up existing cards
        cy.deleteAllCards();

        cy.loginOpFab('operator4_fr', 'test');

        // Set feed filter to see all cards
        cy.get('#opfab-feed-filter-btn-filter').click();
        cy.get('#opfab-feed-filter-ack-all').click();
        cy.waitDefaultTime(); // let time before closing popup to avoid flaky error on CI/CD
        cy.get('#opfab-feed-filter-btn-filter').click();

        cy.sendCard('cypress/entitiesAcks/message2.json');
        cy.sendCard('cypress/entitiesAcks/message3.json');
        cy.sendCard('cypress/entitiesAcks/message4.json');

        cy.get('of-light-card').should('have.length', 3);
        // All cards should not have ack icon
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage2 .fa-check').should('not.exist');
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage3 .fa-check').should('not.exist');
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4 .fa-check').should('not.exist');

        // operator1_fr acknowledges the card "message2", and we check the icon is not present for operator4_fr
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage2').click();
        cy.get('#cardUid').then(($cardUidElement) => {
            const cardUid = $cardUidElement.text(); // We need the uid of the card to ack it

            cy.sendAckForCard("operator1_fr", cardUid, '[\\"ENTITY1_FR\\"]');
            cy.waitDefaultTime();
            cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage2 .fa-check').should('not.exist');
        });

        // operator1_fr acknowledges the card "message3", and we check the icon is present for operator4_fr
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage3').click();
        cy.get('#cardUid').then(($cardUidElement) => {
            const cardUid = $cardUidElement.text(); // We need the uid of the card to ack it

            cy.sendAckForCard("operator1_fr", cardUid, '[\\"ENTITY1_FR\\"]');
            cy.waitDefaultTime();
            cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage3 .fa-check').should('exist');
        });

        // operator1_fr acknowledges the card "message4", and we check the icon is not present for operator4_fr
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4').click();
        cy.get('#cardUid').then(($cardUidElement) => {
            const cardUid = $cardUidElement.text(); // We need the uid of the card to ack it

            cy.sendAckForCard("operator1_fr", cardUid, '[\\"ENTITY1_FR\\"]');
            cy.waitDefaultTime();
            cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4 .fa-check').should('not.exist');
        });

        // operator4_fr ack the card "message2", and we check the icon is present
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage2').click();
        cy.get('#opfab-card-details-btn-ack').should('exist');
        // Click ack button
        cy.get('#opfab-card-details-btn-ack').click();
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage2 .fa-check').should('exist');

        // operator4_fr ack the card "message4", and we check the icon is present
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4').click();
        cy.get('#opfab-card-details-btn-ack').should('exist');
        // Click ack button
        cy.get('#opfab-card-details-btn-ack').click();
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4 .fa-check').should('exist');
    });

    it('check entities ack modifying activity area of operator4_fr', function () {

        // Clean up existing cards
        cy.deleteAllCards();

        cy.loginOpFab('operator4_fr', 'test');

        // Set feed filter to see all cards
        cy.get('#opfab-feed-filter-btn-filter').click();
        cy.get('#opfab-feed-filter-ack-all').click();
        cy.waitDefaultTime(); // let time before closing popup to avoid flaky error on CI/CD
        cy.get('#opfab-feed-filter-btn-filter').click();

        //click on user menu (top right of the screen)
        cy.get('#opfab-navbar-drop-user-menu').click();

        // click on "Activity area"
        cy.get('#opfab-navbar-right-menu-activityarea').click();
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
        cy.get('#opfab-activityarea-btn-confirm').should('exist').click(); // click confirm settings
        cy.get('#opfab-activityarea-btn-yes').should('exist').click(); // and click yes on the confirmation popup

        cy.get('#opfab-navbar-menu-feed').click(); // we go back to the feed
        cy.sendCard('cypress/entitiesAcks/message3.json');
        cy.sendCard('cypress/entitiesAcks/message4.json');

        cy.get('of-light-card').should('have.length', 2);
        // All cards should not have ack icon
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage3 .fa-check').should('not.exist');
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4 .fa-check').should('not.exist');

        // operator1_fr acknowledges the card "message3", and we check the icon is present for operator4_fr
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage3').click();
        cy.get('#cardUid').then(($cardUidElement) => {
            const cardUid = $cardUidElement.text(); // We need the uid of the card to ack it

            cy.sendAckForCard("operator1_fr", cardUid, '[\\"ENTITY1_FR\\"]');
            cy.waitDefaultTime();
            cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage3 .fa-check').should('exist');
        });

        // operator1_fr acknowledges the card "message4", and we check the icon is not present for operator4_fr
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4').click();
        cy.get('#cardUid').then(($cardUidElement) => {
            const cardUid = $cardUidElement.text(); // We need the uid of the card to ack it

            cy.sendAckForCard("operator1_fr", cardUid, '[\\"ENTITY1_FR\\"]');
            cy.waitDefaultTime();
            cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4 .fa-check').should('not.exist');

            // operator2_fr acknowledges the card "message4", and we check now the icon is present for operator4_fr
            cy.sendAckForCard("operator2_fr", cardUid, '[\\"ENTITY2_FR\\"]');
            cy.waitDefaultTime();
            cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4 .fa-check').should('exist');
        });

        // now we add ENTITY3_FR to the entities of operator4_fr
        cy.get('#opfab-navbar-drop-user-menu').click();

        // click on "Activity area"
        cy.get('#opfab-navbar-right-menu-activityarea').click();
        // We connect to ENTITY3_FR
        cy.get('.opfab-checkbox').contains('Control Center FR East').click();
        cy.get('#opfab-activityarea-btn-confirm').should('exist').click(); // click confirm settings
        cy.get('#opfab-activityarea-btn-yes').should('exist').click(); // and click yes on the confirmation popup

        cy.get('#opfab-navbar-menu-feed').click(); // we go back to the feed

        // ack icon for card "message3" should still be present
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage3 .fa-check').should('exist');

        // ack icon for card "message4" should not be present anymore
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4 .fa-check').should('not.exist');

        // now operator4_fr is only connected to ENTITY3_FR
        cy.get('#opfab-navbar-drop-user-menu').click();

        // click on "Activity area"
        cy.get('#opfab-navbar-right-menu-activityarea').click();
        // We disconnect from ENTITY1_FR and ENTITY2_FR
        cy.get('.opfab-checkbox').contains('Control Center FR North').click();
        cy.get('.opfab-checkbox').contains('Control Center FR South').click();
        cy.get('#opfab-activityarea-btn-confirm').should('exist').click(); // click confirm settings
        cy.get('#opfab-activityarea-btn-yes').should('exist').click(); // and click yes on the confirmation popup

        cy.get('#opfab-navbar-menu-feed').click(); // we go back to the feed

        // ack icon for card "message3" should not be present anymore
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage3 .fa-check').should('not.exist');

        // ack icon for card "message4" should still not be present
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4 .fa-check').should('not.exist');

        // We reconnect to ENTITY1_FR, ENTITY2_FR and ENTITY4_FR
        cy.get('#opfab-navbar-drop-user-menu').click();
        cy.get('#opfab-navbar-right-menu-activityarea').click();
        cy.get('.opfab-checkbox').contains('Control Center FR North').click();
        cy.get('.opfab-checkbox').contains('Control Center FR South').click();
        cy.get('.opfab-checkbox').contains('Control Center FR West').click();
        cy.get('#opfab-activityarea-btn-confirm').should('exist').click(); // click confirm settings
        cy.get('#opfab-activityarea-btn-yes').should('exist').click(); // and click yes on the confirmation popup
    });

    it('check entities ack for cards sent to groups only (no entityRecipients) for operator2_fr', function () {

        // Clean up existing cards
        cy.deleteAllCards();

        cy.loginOpFab('operator2_fr', 'test');

        // Set feed filter to see all cards
        cy.get('#opfab-feed-filter-btn-filter').click();
        cy.get('#opfab-feed-filter-ack-all').click();
        cy.waitDefaultTime(); // let time before closing popup to avoid flaky error on CI/CD
        cy.get('#opfab-feed-filter-btn-filter').click();

        cy.sendCard('cypress/entitiesAcks/message2_groupsOnly.json');
        cy.sendCard('cypress/entitiesAcks/message3_groupsOnly.json');
        cy.sendCard('cypress/entitiesAcks/message4_groupsOnly.json');

        cy.get('of-light-card').should('have.length', 3);
        // All cards should not have ack icon
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage2_groupsOnly .fa-check').should('not.exist');
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage3_groupsOnly .fa-check').should('not.exist');
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4_groupsOnly .fa-check').should('not.exist');

        // operator4_fr (member of 4 french entities) acknowledges the card "message2_groupsOnly", and we check the icon is not present for operator2_fr
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage2_groupsOnly').click();
        cy.get('#cardUid').then(($cardUidElement) => {
            const cardUid = $cardUidElement.text(); // We need the uid of the card to ack it

            cy.sendAckForCard("operator4_fr", cardUid, '[\\"ENTITY1_FR\\",\\"ENTITY2_FR\\",\\"ENTITY3_FR\\",\\"ENTITY4_FR\\"]');
            cy.waitDefaultTime();
            cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage2_groupsOnly .fa-check').should('not.exist');
        });

        // operator4_fr acknowledges the card "message3_groupsOnly", and we check the icon is not present for operator2_fr
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage3_groupsOnly').click();
        cy.get('#cardUid').then(($cardUidElement) => {
            const cardUid = $cardUidElement.text(); // We need the uid of the card to ack it

            cy.sendAckForCard("operator4_fr", cardUid, '[\\"ENTITY1_FR\\",\\"ENTITY2_FR\\",\\"ENTITY3_FR\\",\\"ENTITY4_FR\\"]');
            cy.waitDefaultTime();
            cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage3_groupsOnly .fa-check').should('not.exist');
        });

        // operator4_fr acknowledges the card "message4_groupsOnly", and we check the icon is not present for operator2_fr
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4_groupsOnly').click();
        cy.get('#cardUid').then(($cardUidElement) => {
            const cardUid = $cardUidElement.text(); // We need the uid of the card to ack it

            cy.sendAckForCard("operator4_fr", cardUid, '[\\"ENTITY1_FR\\",\\"ENTITY2_FR\\",\\"ENTITY3_FR\\",\\"ENTITY4_FR\\"]');
            cy.waitDefaultTime();
            cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4_groupsOnly .fa-check').should('not.exist');
        });

        // operator2_fr clicks on card (message2_groupsOnly), acknowledges it, and we check the icon is present
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage2_groupsOnly').click();
        cy.get('#opfab-card-details-btn-ack').should('exist');
        // Click ack button
        cy.get('#opfab-card-details-btn-ack').click();
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage2_groupsOnly .fa-check').should('exist');

        // operator2_fr clicks on card (message3_groupsOnly), acknowledges it, and we check the icon is present
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage3_groupsOnly').click();
        cy.get('#opfab-card-details-btn-ack').should('exist');
        // Click ack button
        cy.get('#opfab-card-details-btn-ack').click();
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage3_groupsOnly .fa-check').should('exist');

        // operator2_fr clicks on card (message4_groupsOnly), acknowledges it, and we check the icon is present
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4_groupsOnly').click();
        cy.get('#opfab-card-details-btn-ack').should('exist');
        // Click ack button
        cy.get('#opfab-card-details-btn-ack').click();
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4_groupsOnly .fa-check').should('exist');
    });

    it('1) operator4_fr, disconnected from ENTITY4_FR, acknowledges the cards "message3" and "message4", and we check\n' +
        'icon is present for the 2 cards\n' +
        '2) operator4_fr reconnects to ENTITY4_FR, and we check the ack icon is still present for "message3" but not \n' +
        'present anymore for "message4"', function () {

        // Clean up existing cards
        cy.deleteAllCards();

        cy.loginOpFab('operator4_fr', 'test');

        // Set feed filter to see all cards
        cy.get('#opfab-feed-filter-btn-filter').click();
        cy.get('#opfab-feed-filter-ack-all').click();
        cy.waitDefaultTime(); // let time before closing popup to avoid flaky error on CI/CD
        cy.get('#opfab-feed-filter-btn-filter').click();

        // We go to activity area screen
        cy.get('#opfab-navbar-drop-user-menu').click();
        cy.get('#opfab-navbar-right-menu-activityarea').click();

        // We should have 4 checkboxes corresponding to the four entities of the user
        cy.get('.opfab-checkbox').should('have.length', 4);
        // We check all the checkboxes are checked
        cy.get('.opfab-checkbox').eq(0).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(1).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(2).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(3).find('input').should('be.checked');

        // We disconnect from ENTITY4_FR
        cy.get('.opfab-checkbox').contains('Control Center FR West').click();
        cy.get('#opfab-activityarea-btn-confirm').should('exist').click(); // click confirm settings
        cy.get('#opfab-activityarea-btn-yes').should('exist').click(); // and click yes on the confirmation popup

        cy.get('#opfab-navbar-menu-feed').click(); // we go back to the feed

        cy.sendCard('cypress/entitiesAcks/message3.json');
        cy.sendCard('cypress/entitiesAcks/message4.json');

        cy.get('of-light-card').should('have.length', 2);

        // operator4_fr ack the 2 cards, and we check the icon is present for the 2 cards
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage3').click();
        cy.get('#opfab-card-details-btn-ack').should('exist');
        // Click ack button
        cy.get('#opfab-card-details-btn-ack').click();
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage3 .fa-check').should('exist');
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4').click();
        cy.get('#opfab-card-details-btn-ack').should('exist');
        // Click ack button
        cy.get('#opfab-card-details-btn-ack').click();
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4 .fa-check').should('exist');

        // We go to activity area screen
        cy.get('#opfab-navbar-drop-user-menu').click();
        cy.get('#opfab-navbar-right-menu-activityarea').click();

        // We reconnect to ENTITY4_FR
        cy.get('.opfab-checkbox').contains('Control Center FR West').click();
        cy.get('#opfab-activityarea-btn-confirm').should('exist').click(); // click confirm settings
        cy.get('#opfab-activityarea-btn-yes').should('exist').click(); // and click yes on the confirmation popup

        cy.get('#opfab-navbar-menu-feed').click(); // we go back to the feed

        cy.get('of-light-card').should('have.length', 2);
        // "message3" should still have ack icon but not "message4"
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage3 .fa-check').should('exist');
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4 .fa-check').should('not.exist');
    });

    it('check entities ack for a card sent to entities different from entities of the user', function () {

        // Clean up existing cards
        cy.deleteAllCards();

        cy.loginOpFab('operator1_fr', 'test');

        // Set feed filter to see all cards
        cy.get('#opfab-feed-filter-btn-filter').click();
        cy.get('#opfab-feed-filter-ack-all').click();
        cy.waitDefaultTime(); // let time before closing popup to avoid flaky error on CI/CD
        cy.get('#opfab-feed-filter-btn-filter').click();

        cy.sendCard('cypress/entitiesAcks/message4_ItalianEntityRecipients.json');

        cy.get('of-light-card').should('have.length', 1);
        // The card should not have ack icon
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4_ItalianEntityRecipients .fa-check').should('not.exist');
        // The ack button must display 'acknowledge and close'
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4_ItalianEntityRecipients').click();
        cy.get('#opfab-card-details-btn-ack').should('exist').should('have.text', 'ACKNOWLEDGE AND CLOSE');
        // Click ack button
        cy.get('#opfab-card-details-btn-ack').click();
        // Now, the ack icon must be present
        cy.get('#opfab-feed-light-card-cypress-entitiesAcksMessage4_ItalianEntityRecipients .fa-check').should('exist');
    });

});
