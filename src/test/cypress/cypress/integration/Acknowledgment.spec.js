/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

describe('Acknowledgment tests', function () {

    before('Set up configuration', function () {

        // This can stay in a `before` block rather than `beforeEach` as long as the test does not change configuration
        cy.resetUIConfigurationFiles();

        cy.loadTestConf();

        // Clean up existing cards
        cy.deleteAllCards();

        // Send a card with ack config set to Always
        // ack is possible
        cy.sendCard('cypress/ack/message1.json');

        // Send a card with ack config set to OnlyWhenResponseDisabledForUser and user cannot respond
        // ack is possible
        cy.sendCard('cypress/ack/message2.json');

        // Send a card with ack config set to OnlyWhenResponseDisabledForUser and user can respond
        // ack is not possible
        cy.sendCard('cypress/ack/message3.json');

        // Send a card with ack config set to Never
        // ack is not possible
        cy.sendCard('cypress/ack/message4.json');

        // Send a card with ack config set to OnlyWhenResponseDisabledForUser and user can respond and lttd is expired
        // ack is possible when lttd is expired
        cy.sendCard('cypress/ack/message5.json');

        // Send a card with ack config set to OnlyWhenResponseDisabledForUser and user can respond and lttd is not expired
        // ack is not possible before lttd is expired
        cy.sendCard('cypress/ack/message6.json');
    });

    it('Check acknowledgment for operator 1', function () {

        cy.loginOpFab('operator1_fr', 'test');

        // Wait for all cards to be loaded (check the last one is present)
        cy.get('#opfab-feed-light-card-cypress-message6');

        // Operator1 should see 6 cards in his feed
        cy.get('of-light-card').should('have.length', 6);

        // Click on card messageNoAck and check it is not acknowledgeable
        cy.get('#opfab-feed-light-card-cypress-message4').click();
        cy.get('#opfab-card-details-btn-ack').should('not.exist');

        // Click on card message3 and check it is not acknowledgeable
        cy.get('#opfab-feed-light-card-cypress-message3').click();
        cy.get('#opfab-card-details-btn-ack').should('not.exist');


        // Click on card message5 and check it is acknowledgeable
        cy.get('#opfab-feed-light-card-cypress-message5').click();
        cy.get('#opfab-card-details-btn-ack').should('exist');

        // Click on card message6 and check it is not acknowledgeable
        cy.get('#opfab-feed-light-card-cypress-message6').click();
        cy.get('#opfab-card-details-btn-ack').should('not.exist');

        // Click on card message
        cy.get('#opfab-feed-light-card-cypress-message1').click();

        // Click ack button
        cy.get('#opfab-card-details-btn-ack').click();

        // Card is not anymore in the feed
        cy.get('#opfab-feed-light-card-cypress-message1').should('not.exist');

        // Detail card is not present anymore
        cy.get('of-detail').should('not.exist');

        // Operator1 should see 5 cards in his feed
        cy.get('of-light-card').should('have.length', 5);

        // Set feed filter to see all cards and check message card is present
        cy.get('#opfab-feed-filter-btn-filter').click();
        cy.get('#opfab-feed-filter-ack-all').click();
        cy.waitDefaultTime(); // let time before closing popup to avoid flaky error on CI/CD
        cy.get('#opfab-feed-filter-btn-filter').click();

        // Operator1 should see 6 cards in his feed
        cy.get('of-light-card').should('have.length', 6);

        // Check icon is present
        cy.get('#opfab-feed-light-card-cypress-message1 .fa-check');

        // Click on card message
        cy.get('#opfab-feed-light-card-cypress-message1').click();

        // Unack the card
        cy.get('#opfab-card-details-btn-ack').click();

        // Check icon is not present
        cy.get('#opfab-feed-light-card-cypress-message1 .fa-check').should('not.exist');

        // Click on Ack all cards
        cy.get('#opfab-feed-ack-all-link').click();

        // Do not confirm (cancel )
        cy.get('#opfab-ack-all-btn-cancel').click();

        // Check icon is not present
        cy.get('#opfab-feed-light-card-cypress-message1 .fa-check').should('not.exist');

        // Click on Ack all cards
        cy.get('#opfab-feed-ack-all-link').click();

        // Confirm
        cy.get('#opfab-ack-all-btn-confirm').click();

        // Check that all cards except one are acknowledged
        cy.get('#opfab-feed-light-card-cypress-message1 .fa-check');
        cy.get('#opfab-feed-light-card-cypress-message2 .fa-check');
        cy.get('#opfab-feed-light-card-cypress-message3 .fa-check').should('not.exist');
        cy.get('#opfab-feed-light-card-cypress-message4 .fa-check').should('not.exist');

    });

    it('Check acknowledgment for operator 1 after re-logging  ', function () {

        cy.loginOpFab('operator1_fr', 'test');

        // Set feed filter to see all card
        cy.get('#opfab-feed-filter-btn-filter').click();
        cy.get('#opfab-feed-filter-ack-all').click();
        cy.get('#opfab-feed-filter-btn-filter').click();

        // Check that all cards except one are acknowledged
        cy.get('#opfab-feed-light-card-cypress-message1 .fa-check')
        cy.get('#opfab-feed-light-card-cypress-message2 .fa-check')
        cy.get('#opfab-feed-light-card-cypress-message3 .fa-check').should('not.exist');
        cy.get('#opfab-feed-light-card-cypress-message4 .fa-check').should('not.exist');
    });

    it('Check no acknowledgment for operator 2  ', function () {

        cy.loginOpFab('operator2_fr', 'test');

        // Set feed filter to see all card
        cy.get('#opfab-feed-filter-btn-filter').click();
        cy.get('#opfab-feed-filter-ack-all').click();
        cy.get('#opfab-feed-filter-btn-filter').click();

        // Check that all cards are not acknowledged
        cy.get('.fa-check').should('not.exist');

    });

    it('Check entities acknowledgments for a usercard created by operator1_fr', function () {

        // Clean up existing cards
        cy.deleteAllCards();
        cy.send6TestCards();
        cy.loginOpFab('operator1_fr', 'test');

        cy.get('of-light-card').should('have.length', 6);

        // We check a card not published by an entity does not display any entity ack
        cy.get('of-light-card').find('.card-title').contains("Electricity consumption forecast ").click();
        cy.get('#opfab-card-title').should("have.text", "Electricity consumption forecast");
        cy.get('#opfab-card-acknowledged-footer').should('not.exist');

        // We check a card published by an entity of the user but with no entityRecipients does not display any entity ack
        cy.get('of-light-card').find('.card-title').contains("Message ").click();
        cy.get('#opfab-selected-card-summary').should('have.text', "Message received : France-England\'s interconnection is 100% operational / Result of the maintenance is <OK>");
        cy.get('#opfab-card-acknowledged-footer').should('not.exist');

        // We create a usercard sent to several entities
        cy.get('#opfab-navbarContent').find('#opfab-newcard-menu').click();
        cy.get("of-usercard").should('exist');
        cy.usercardSelectService('Base Examples');
        cy.usercardSelectProcess('Process example');
        cy.usercardSelectState('Message');
        cy.get('#message').type('Test message for entities acks');
        cy.get('#opfab-recipients').click();
        cy.get('#opfab-recipients').contains('Select All').click();
        cy.get('#opfab-recipients').click();

        cy.usercardPrepareAndSendCard();
        cy.waitDefaultTime();

        // We display the created card
        // And we check there are 13 entities names displayed in acknowledgements footer, and we check all the entities have orange color
        cy.get('of-light-card').eq(0).click();
        cy.get('#opfab-selected-card-summary').should('have.text', "Message received :   Test message for entities acks");
        cy.get('#opfab-card-acknowledged-footer').should('exist');
        cy.get('#opfab-card-acknowledged-footer').find('span').should("have.length", 11); // 10 single entities (no group entities) + 1 for 'Acknowledged :' label
        cy.get('#opfab-card-acknowledged-footer').find('span').eq(1).should("have.text", "\u00a0 Control Center FR East \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(2).should("have.text", "\u00a0 Control Center FR North \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(3).should("have.text", "\u00a0 Control Center FR South \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(4).should("have.text", "\u00a0 Control Center FR West \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(5).should("have.text", "\u00a0 Control Center IT Center \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(6).should("have.text", "\u00a0 Control Center IT North \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(7).should("have.text", "\u00a0 Control Center IT South \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(8).should("have.text", "\u00a0 Control Center NL North \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(9).should("have.text", "\u00a0 Control Center NL South \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(10).should("have.text", "\u00a0 IT SUPERVISION CENTER \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');

    });

    it('operator4_fr (member of 4 FR entities) acknowledges the previous card created by operator1_fr ', function () {

        cy.loginOpFab('operator4_fr', 'test');

        cy.get('of-light-card').should('have.length', 6);

        // We check acknowledgements footer is displayed for operator4_fr (because he's member of ENTITY1_FR)
        cy.get('of-light-card').eq(0).click();
        cy.get('#opfab-selected-card-summary').should('have.text', "Message received :   Test message for entities acks");
        cy.get('#opfab-card-acknowledged-footer').should('exist');
        cy.get('#opfab-card-acknowledged-footer').find('span').should("have.length", 11); // 10 single entities (no group entities) + 1 for 'Acknowledged :' label
        cy.get('#opfab-card-acknowledged-footer').find('span').eq(1).should("have.text", "\u00a0 Control Center FR East \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(2).should("have.text", "\u00a0 Control Center FR North \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(3).should("have.text", "\u00a0 Control Center FR South \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(4).should("have.text", "\u00a0 Control Center FR West \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(5).should("have.text", "\u00a0 Control Center IT Center \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(6).should("have.text", "\u00a0 Control Center IT North \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(7).should("have.text", "\u00a0 Control Center IT South \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(8).should("have.text", "\u00a0 Control Center NL North \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(9).should("have.text", "\u00a0 Control Center NL South \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(10).should("have.text", "\u00a0 IT SUPERVISION CENTER \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');

        // Set feed filter to see all card
        cy.get('#opfab-feed-filter-btn-filter').click();
        cy.get('#opfab-feed-filter-ack-all').click();
        cy.get('#opfab-feed-filter-btn-filter').click();

        // Click ack button
        cy.get('#opfab-card-details-btn-ack').click();

        // We click again the card to display it
        cy.get('of-light-card').eq(0).click();
        cy.get('#opfab-selected-card-summary').should('have.text', "Message received :   Test message for entities acks");
        cy.get('#opfab-card-acknowledged-footer').should('exist');

        // We check we have ENTITY1_FR, ENTITY2_FR, ENTITY3_FR and ENTITY4_FR now displayed in green, all other entities in orange
        cy.get('#opfab-card-acknowledged-footer').find('span').should("have.length", 11); // 10 single entities (no group entities) + 1 for 'Acknowledged :' label
        cy.get('#opfab-card-acknowledged-footer').find('span').eq(1).should("have.text", "\u00a0 Control Center FR East \u00a0")
            .and('have.css', 'color', 'rgb(0, 128, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(2).should("have.text", "\u00a0 Control Center FR North \u00a0")
            .and('have.css', 'color', 'rgb(0, 128, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(3).should("have.text", "\u00a0 Control Center FR South \u00a0")
            .and('have.css', 'color', 'rgb(0, 128, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(4).should("have.text", "\u00a0 Control Center FR West \u00a0")
            .and('have.css', 'color', 'rgb(0, 128, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(5).should("have.text", "\u00a0 Control Center IT Center \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(6).should("have.text", "\u00a0 Control Center IT North \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(7).should("have.text", "\u00a0 Control Center IT South \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(8).should("have.text", "\u00a0 Control Center NL North \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(9).should("have.text", "\u00a0 Control Center NL South \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(10).should("have.text", "\u00a0 IT SUPERVISION CENTER \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');

        // operator4_fr goes to activity area screen and disconnect from ENTITY1_FR
        cy.get('#opfab-navbar-drop-user-menu').click();
        cy.get('#opfab-navbar-right-menu-activityarea').click();

        // Check every checkbox to let the time for the ui to set to true before we click
        cy.get('.opfab-checkbox').eq(0).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(1).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(2).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(3).find('input').should('be.checked');
        cy.get('.opfab-checkbox').contains('Control Center FR North').click(); // we disconnect
        cy.get('#opfab-activityarea-btn-confirm').should('exist').click(); // click confirm settings
        cy.get('#opfab-activityarea-btn-yes').should('exist').click(); // and click yes on the confirmation popup

        // We display again the card to check entities acknowledgements footer is not displayed anymore
        cy.get('#opfab-navbar-menu-feed').click(); // we go back to the feed
        cy.waitDefaultTime();
        cy.get('of-light-card').should('have.length', 6);
        cy.get('of-light-card').eq(5).click();
        cy.get('#opfab-selected-card-summary').should('have.text', "Message received :   Test message for entities acks");
        cy.get('#opfab-card-acknowledged-footer').should('not.exist');

        // We reconnect operator4_fr to ENTITY1_FR
        cy.get('#opfab-navbar-drop-user-menu').click();
        cy.get('#opfab-navbar-right-menu-activityarea').click();
        cy.get('.opfab-checkbox').contains('Control Center FR North').click(); // we reconnect
        cy.get('#opfab-activityarea-btn-confirm').should('exist').click(); // click confirm settings
        cy.get('#opfab-activityarea-btn-yes').should('exist').click(); // and click yes on the confirmation popup
    });

    it('Check operator1_fr see the entities acknowledgments done by operator4_fr for the previous card', function () {

        cy.loginOpFab('operator1_fr', 'test');

        cy.get('of-light-card').should('have.length', 7);
        // We display the previous card (acknowledged by operator4_fr)
        // And we check there are 13 entities names displayed in acknowledgements footer, 4 entities with green color and 9 with orange color
        cy.get('of-light-card').eq(4).click();
        cy.get('#opfab-selected-card-summary').should('have.text', "Message received :   Test message for entities acks");
        cy.get('#opfab-card-acknowledged-footer').should('exist');
        cy.get('#opfab-card-acknowledged-footer').find('span').should("have.length", 11); // 10 single entities (no group entities) + 1 for 'Acknowledged :' label
        cy.get('#opfab-card-acknowledged-footer').find('span').eq(1).should("have.text", "\u00a0 Control Center FR East \u00a0")
            .and('have.css', 'color', 'rgb(0, 128, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(2).should("have.text", "\u00a0 Control Center FR North \u00a0")
            .and('have.css', 'color', 'rgb(0, 128, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(3).should("have.text", "\u00a0 Control Center FR South \u00a0")
            .and('have.css', 'color', 'rgb(0, 128, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(4).should("have.text", "\u00a0 Control Center FR West \u00a0")
            .and('have.css', 'color', 'rgb(0, 128, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(5).should("have.text", "\u00a0 Control Center IT Center \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(6).should("have.text", "\u00a0 Control Center IT North \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(7).should("have.text", "\u00a0 Control Center IT South \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(8).should("have.text", "\u00a0 Control Center NL North \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(9).should("have.text", "\u00a0 Control Center NL South \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(10).should("have.text", "\u00a0 IT SUPERVISION CENTER \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');
    });

    it('Check acknowledgements are received also in real-time', function () {
        cy.sendCard('cypress/entitiesAcks/message1.json');

        cy.loginOpFab('operator4_fr', 'test');

        cy.get('of-light-card').should('have.length', 6);
        cy.get('of-light-card').eq(0).click();
        cy.get('#opfab-selected-card-summary').should('have.text', "State to test template rendering features");
        cy.get('#opfab-card-acknowledged-footer').should('exist');
        cy.get('#opfab-card-acknowledged-footer').find('span').should("have.length", 3); // 2 entities + 1 for 'Acknowledged :' label
        cy.get('#opfab-card-acknowledged-footer').find('span').eq(1).should("have.text", "\u00a0 Control Center FR North \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');

        cy.get('#opfab-card-acknowledged-footer').find('span').eq(2).should("have.text", "\u00a0 Control Center FR South \u00a0")
            .and('have.css', 'color', 'rgb(255, 102, 0)');

        cy.get('#cardUid').then(($cardUidElement) => {
            const cardUid = $cardUidElement.text(); // We need the uid of the card to ack it

            // operator1_fr acknowledges the card, and then we check ENTITY1_FR is displayed green and ENTITY2_FR still orange
            cy.sendAckForCard("operator1_fr", cardUid, '[\\"ENTITY1_FR\\"]');

            cy.get('#opfab-card-acknowledged-footer').find('span').should("have.length", 3); // 2 entities + 1 for 'Acknowledged :' label
            cy.get('#opfab-card-acknowledged-footer').find('span').eq(1).should("have.text", "\u00a0 Control Center FR North \u00a0")
                .and('have.css', 'color', 'rgb(0, 128, 0)');

            cy.get('#opfab-card-acknowledged-footer').find('span').eq(2).should("have.text", "\u00a0 Control Center FR South \u00a0")
                .and('have.css', 'color', 'rgb(255, 102, 0)');

            // operator2_fr acknowledges the card (for ENTITY2_FR)
            // and then we check ENTITY1_FR is still displayed green and ENTITY2_FR is now green also
            cy.sendAckForCard("operator2_fr", cardUid, '[\\"ENTITY2_FR\\"]');

            cy.get('#opfab-card-acknowledged-footer').find('span').should("have.length", 3); // 2 entities + 1 for 'Acknowledged :' label
            cy.get('#opfab-card-acknowledged-footer').find('span').eq(1).should("have.text", "\u00a0 Control Center FR North \u00a0")
                .and('have.css', 'color', 'rgb(0, 128, 0)');

            cy.get('#opfab-card-acknowledged-footer').find('span').eq(2).should("have.text", "\u00a0 Control Center FR South \u00a0")
                .and('have.css', 'color', 'rgb(0, 128, 0)');
        })
    });

    it('Check pinned card', function () {

        cy.deleteAllCards();
        // Send card with automaticPinWhenAcknowledged = true
        cy.sendCard('defaultProcess/contingencies.json');

        cy.loginOpFab('operator1_fr', 'test');

        //There are no pinned cards
        cy.get('#of-pinned-cards').find('.opfab-pinned-card').should('have.length', 0);

        cy.get('of-light-card').eq(0).click()
        .find('[id^=opfab-feed-light-card]')
        .invoke('attr', 'data-urlId')
        .then((urlId) => {
            cy.waitDefaultTime();
            cy.hash().should('eq', '#/feed/cards/' + urlId);
            //Acknowledge card
            cy.get('#opfab-card-details-btn-ack').click();
             //The card is pinned
            cy.get('#of-pinned-cards').find('.opfab-pinned-card').should('have.length', 1);
            // Detail card is not present anymore
            cy.get('of-detail').should('not.exist');
        });

        
        // Click on pinned card to open card detail
        cy.get('#of-pinned-cards').find('.opfab-pinned-card').eq(0).click();
        // Detail card is present  
        cy.get('of-detail').should('exist');
        // Unack the card 
        cy.get('#opfab-card-details-btn-ack').click();
        //There are no pinned cards
        cy.get('#of-pinned-cards').find('.opfab-pinned-card').should('have.length', 0);

        // Ack the card
        cy.get('#opfab-card-details-btn-ack').click();
        //Card is pinned
        cy.get('#of-pinned-cards').find('.opfab-pinned-card').should('have.length', 1);

        //Update the card by resending
        cy.sendCard('defaultProcess/contingencies.json');

        //There are no pinned cards
        cy.get('#of-pinned-cards').find('.opfab-pinned-card').should('have.length', 0);

        cy.waitDefaultTime();

        // Open and ack the new card
        cy.get('of-light-card').eq(0).click()
        .find('[id^=opfab-feed-light-card]')
        .invoke('attr', 'data-urlId')
        .then((urlId) => {
            cy.waitDefaultTime();
            cy.hash().should('eq', '#/feed/cards/' + urlId);
            //Acknowledge card
            cy.get('#opfab-card-details-btn-ack').click();
             //The card is pinned
            cy.get('#of-pinned-cards').find('.opfab-pinned-card').should('have.length', 1);
            // Detail card is not present anymore
            cy.get('of-detail').should('not.exist');
        });


         //Delete the card
         cy.deleteCard('defaultProcess.process6');

         //There are no pinned cards
        cy.get('#of-pinned-cards').find('.opfab-pinned-card').should('have.length', 0);
    });

    it('Check pinned card is removed after end date', function () {

        const SECONDS = 1000;
        const MINUTES = 60000;
        const HOURS = 3600000;

        const currentDate =  new Date(2022, 3, 22, 16, 10);

        cy.loginWithClock(currentDate);
       
        // Send card with automaticPinWhenAcknowledged = true
        cy.sendCard('cypress/feed/customEvent.json', currentDate.getTime() - (2 * HOURS ), currentDate.getTime() + 5 * MINUTES);

        cy.waitDefaultTime();

        cy.tick(1 * SECONDS);

        //There are no pinned cards
        cy.get('#of-pinned-cards').find('.opfab-pinned-card').should('have.length', 0);

        cy.get('of-light-card').eq(0).click()
        .find('[id^=opfab-feed-light-card]')
        .invoke('attr', 'data-urlId')
        .then((urlId) => {
            cy.hash().should('eq', '#/feed/cards/' + urlId);

            //Acknowledge card
            cy.get('#opfab-card-details-btn-ack').click();

            cy.waitDefaultTime();

            cy.tick(1 * SECONDS);

            //The card is pinned
            cy.get('#of-pinned-cards').find('.opfab-pinned-card').should('have.length', 1);
            // Detail card is not present anymore
            cy.get('of-detail').should('not.exist');
        });

        cy.tick(5 * MINUTES);
        // Check card is still pinned before endDate
        cy.get('#of-pinned-cards').find('.opfab-pinned-card').should('have.length', 1);

        cy.tick(1 * MINUTES);

        //There is no more pinned card after end date is passed
        cy.get('#of-pinned-cards').find('.opfab-pinned-card').should('have.length', 0);
    });

    it('Check when many pinned cards', function () {

        cy.deleteAllCards();
        // Send 6 card with automaticPinWhenAcknowledged = true
        cy.sendCard('cypress/ack/pinned.json');
        cy.sendCard('cypress/ack/pinned.json');
        cy.sendCard('cypress/ack/pinned.json');
        cy.sendCard('cypress/ack/pinned.json');
        cy.sendCard('cypress/ack/pinned.json');
        cy.sendCard('cypress/ack/pinned.json');


        cy.loginOpFab('operator1_fr', 'test');

        cy.get('#of-pinned-cards').find('.opfab-pinned-card').should('have.length', 0);

        // Click on Ack all cards
        cy.get('of-light-card').should('have.length', 6);
        cy.get('#opfab-feed-ack-all-link').click();

        // Confirm
        cy.get('#opfab-ack-all-btn-confirm').click();
        //There are 6 pinned cards
        cy.get('#of-pinned-cards').find('.opfab-pinned-card').should('have.length', 6);

        cy.sendCard('cypress/ack/pinned.json');

        // Open and ack the new card
        cy.get('of-light-card').eq(0).click()
        .find('[id^=opfab-feed-light-card]')
        .invoke('attr', 'data-urlId')
        .then((urlId) => {
            cy.waitDefaultTime();
            cy.hash().should('eq', '#/feed/cards/' + urlId);
            //Acknowledge card
            cy.get('#opfab-card-details-btn-ack').click();
            //The are still 6 pinned cards visible plus "..." popover
            cy.get('#of-pinned-cards').find('.opfab-pinned-card').should('have.length', 6);

            cy.get('#of-pinned-cards-popover').should('exist');
            cy.get('#of-pinned-cards-popover').trigger('mouseenter');
            cy.get('.opfab-hidden-pinned-card').should('have.length', 1);
            
            // Click on pinned card to open card detail
            cy.get('.opfab-hidden-pinned-card').eq(0).click();
            // Detail card is present  
            cy.get('of-detail').should('exist');
            // Unack the card 
            cy.get('#opfab-card-details-btn-ack').click();
            //There are 6 pinned cards with no popover "..."
            cy.get('#of-pinned-cards').find('.opfab-pinned-card').should('have.length', 6);
            cy.get('#of-pinned-cards-popover').should('not.exist');

        });


    });
})