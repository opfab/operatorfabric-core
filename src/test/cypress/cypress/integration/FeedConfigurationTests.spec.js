/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

describe ('Feed configuration tests',function () {

    before('Set up configuration', function () {
        cy.loadTestConf();
        cy.deleteTestCards();
        cy.sendTestCards(); // The feed needs to have cards so the "Acknowledge all cards" feature can be shown
    });

    beforeEach('Reset UI configuration file ', function () {
        cy.resetUIConfigurationFile();
    })

    it('Buttons and filters visibility - Check default behaviour', function () {

        // Default is "false" (i.e. visible) except for hideAckAllCardsFeature

        // Removing corresponding properties from the web-ui file
        cy.removePropertyInConf('feed.card.hideTimeFilter','web-ui');
        cy.removePropertyInConf('feed.card.hideAckFilter','web-ui');
        cy.removePropertyInConf('feed.card.hideResponseFilter','web-ui');
        cy.removePropertyInConf('feed.card.hideReadSort','web-ui');
        cy.removePropertyInConf('feed.card.hideSeveritySort','web-ui');
        cy.removePropertyInConf('feed.card.hideAckAllCardsFeature','web-ui');

        cy.loginOpFab('operator1','test');

        // Open filter menu
        cy.get('#opfab-feed-filter-btn-filter').click();

        // Check elements visibility
        cy.get('#opfab-time-filter-form');
        cy.get('#opfab-ack-filter-form');
        cy.get('#opfab-response-filter-form');

        // Open sort menu
        cy.get('#opfab-feed-filter-btn-sort').click();

        // Check elements visibility
        cy.get('#opfab-feed-filter-unread');
        cy.get('#opfab-feed-filter-severity');

        cy.get('#opfab-feed-ack-all-link').should('not.exist');


    })

    it('Buttons and filters visibility - Set property to true', function () {

        // Setting properties to true in file
        cy.setPropertyInConf('feed.card.hideTimeFilter','web-ui',true);
        cy.setPropertyInConf('feed.card.hideAckFilter','web-ui',true);
        cy.setPropertyInConf('feed.card.hideResponseFilter','web-ui',true);
        cy.setPropertyInConf('feed.card.hideReadSort','web-ui',true);
        cy.setPropertyInConf('feed.card.hideSeveritySort','web-ui',true);
        cy.setPropertyInConf('feed.card.hideAckAllCardsFeature','web-ui',true);

        cy.loginOpFab('operator1','test');

        // Open filter menu
        cy.get('#opfab-feed-filter-btn-filter').click();

        // Check elements visibility
        cy.get('#opfab-time-filter-form').should('not.exist');
        cy.get('#opfab-ack-filter-form').should('not.exist');
        cy.get('#opfab-response-filter-form').should('not.exist');

        // Open sort menu
        cy.get('#opfab-feed-filter-btn-sort').click();

        // Check elements visibility
        cy.get('#opfab-feed-filter-unread').should('not.exist');
        cy.get('#opfab-feed-filter-severity').should('not.exist');

        cy.get('#opfab-feed-ack-all-link').should('not.exist');

    })

    it('Buttons and filters visibility - Set property to false', function () {

        // Setting properties to true in file
        cy.setPropertyInConf('feed.card.hideTimeFilter','web-ui',false);
        cy.setPropertyInConf('feed.card.hideAckFilter','web-ui',false);
        cy.setPropertyInConf('feed.card.hideResponseFilter','web-ui',false);
        cy.setPropertyInConf('feed.card.hideReadSort','web-ui',false);
        cy.setPropertyInConf('feed.card.hideSeveritySort','web-ui',false);
        cy.setPropertyInConf('feed.card.hideAckAllCardsFeature','web-ui',false);

        cy.loginOpFab('operator1','test');

        // Open filter menu
        cy.get('#opfab-feed-filter-btn-filter').click();

        // Check elements visibility
        cy.get('#opfab-time-filter-form');
        cy.get('#opfab-ack-filter-form');
        cy.get('#opfab-response-filter-form');

        // Open sort menu
        cy.get('#opfab-feed-filter-btn-sort').click();

        // Check elements visibility
        cy.get('#opfab-feed-filter-unread');
        cy.get('#opfab-feed-filter-severity');

        cy.get('#opfab-feed-ack-all-link');

    })
})
