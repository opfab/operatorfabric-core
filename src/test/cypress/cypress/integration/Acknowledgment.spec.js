/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

describe('Acknowledgment  tests', function () {

    before('Set up configuration', function () {

        // This can stay in a `before` block rather than `beforeEach` as long as the test does not change configuration
        cy.resetUIConfigurationFile();

        cy.loadTestConf();
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

    after('Clean', function () {
        cy.deleteCard('cypress.message1');
        cy.deleteCard('cypress.message2');
        cy.deleteCard('cypress.message3');
        cy.deleteCard('cypress.message4');
        cy.deleteCard('cypress.message5');
        cy.deleteCard('cypress.message6');
    });

    it('Check acknowledgment for operator 1', function () {

        cy.loginOpFab('operator1', 'test');

        // Operator1 should see 6 cards in his feed
        cy.get('of-light-card').should('have.length', 6);

        // Click on card messageNoAck and check is is not acknowledgeable 
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

        // Detail card it not present anymore 
        cy.get('of-detail').should('not.exist');

        // Operator1 should see 5 cards in his feed
        cy.get('of-light-card').should('have.length', 5);

        // Set feed filter to see all card and check message card is present 
        cy.get('#opfab-feed-filter-btn-filter').click();
        cy.get('#opfab-feed-filter-ack-all').click();
        cy.get('#opfab-feed-filter-btn-filter').click();

        // Operator1 should see 6 cards in his feed
        cy.get('of-light-card').should('have.length', 6);

        // Check icon is present
        cy.get('#opfab-feed-light-card-cypress-message1').find('.fa-check');

        // Click on card message
        cy.get('#opfab-feed-light-card-cypress-message1').click();

        // Unack the card 
        cy.get('#opfab-card-details-btn-ack').click();

        // Check icon is not present
        cy.get('#opfab-feed-light-card-cypress-message1').find('.fa-check').should('not.exist');

        // Click on Ack all cards
        cy.get('#opfab-feed-ack-all-link').click();

        // Do not confirm (cancel )
        cy.get('#opfab-ack-all-btn-cancel').click();

        // Check icon is not present
        cy.get('#opfab-feed-light-card-cypress-message1').find('.fa-check').should('not.exist');

        // Click on Ack all cards
        cy.get('#opfab-feed-ack-all-link').click();

        // Confirm 
        cy.get('#opfab-ack-all-btn-confirm').click();
        cy.waitDefaultTime();

        // Check that all cards except one are acknowledged
        cy.get('#opfab-feed-light-card-cypress-message1').find('.fa-check');
        cy.get('#opfab-feed-light-card-cypress-message2').find('.fa-check');
        cy.get('#opfab-feed-light-card-cypress-message3').find('.fa-check').should('not.exist');
        cy.get('#opfab-feed-light-card-cypress-message4').find('.fa-check').should('not.exist');

    });

    it('Check acknowledgment for operator 1 after re-logging  ', function () {

        cy.loginOpFab('operator1', 'test');

        // Set feed filter to see all card
        cy.get('#opfab-feed-filter-btn-filter').click();
        cy.get('#opfab-feed-filter-ack-all').click();
        cy.get('#opfab-feed-filter-btn-filter').click();

        // Check that all cards except one are acknowledged
        cy.get('#opfab-feed-light-card-cypress-message1').find('.fa-check');
        cy.get('#opfab-feed-light-card-cypress-message2').find('.fa-check');
        cy.get('#opfab-feed-light-card-cypress-message3').find('.fa-check').should('not.exist');
        cy.get('#opfab-feed-light-card-cypress-message4').find('.fa-check').should('not.exist');
    });

    it('Check no acknowledgment for operator 2  ', function () {

        cy.loginOpFab('operator2', 'test');

        // Set feed filter to see all card
        cy.get('#opfab-feed-filter-btn-filter').click();
        cy.get('#opfab-feed-filter-ack-all').click();
        cy.get('#opfab-feed-filter-btn-filter').click();

        // Check that all cards are not acknowledged
        cy.get('.fa-check').should('not.exist');

    });


})
