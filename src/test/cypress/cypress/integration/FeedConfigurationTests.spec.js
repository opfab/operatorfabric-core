/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {getOpfabGeneralCommands} from '../support/opfabGeneralCommands'

describe ('Feed configuration tests',function () {
    
    const opfab = getOpfabGeneralCommands();

    before('Set up configuration and cards', function () {
        cy.loadTestConf();
        cy.deleteAllCards();
        cy.send6TestCards(); // The feed needs to have cards so the "Acknowledge all cards" feature can be shown
    });

    beforeEach('Reset UI configuration file ', function () {
        cy.resetUIConfigurationFiles();
    })


    it('Buttons and filters visibility - Check default behaviour', function () {

        // Default is "false" (i.e. visible) except for hideAckAllCardsFeature

        // Removing corresponding properties from the web-ui file
        cy.removePropertyInConf('feed.card.hideTimeFilter','web-ui');
        cy.removePropertyInConf('feed.card.hideResponseFilter','web-ui');
        cy.removePropertyInConf('feed.defaultAcknowledgmentFilter','web-ui');
        cy.removePropertyInConf('feed.defaultSorting','web-ui');
        cy.removePropertyInConf('feed.card.hideAckAllCardsFeature','web-ui');

        opfab.loginWithUser('operator1_fr');

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
        cy.setPropertyInConf('feed.card.hideResponseFilter','web-ui',true);
        cy.setPropertyInConf('feed.card.hideAckAllCardsFeature','web-ui',true);

        opfab.loginWithUser('operator1_fr');

        // Open filter menu
        cy.get('#opfab-feed-filter-btn-filter').click();

        // Check elements visibility
        cy.get('#opfab-time-filter-form').should('not.exist');
        cy.get('#opfab-response-filter-form').should('not.exist');

        // Open sort menu
        cy.get('#opfab-feed-filter-btn-sort').click();

        // Check elements visibility
        cy.get('#opfab-feed-ack-all-link').should('not.exist');

    })

    it('Buttons and filters visibility - Set property to false', function () {

        // Setting properties to true in file
        cy.setPropertyInConf('feed.card.hideTimeFilter','web-ui',false);
        cy.setPropertyInConf('feed.card.hideResponseFilter','web-ui',false);
        cy.setPropertyInConf('feed.card.hideAckAllCardsFeature','web-ui',false);

        opfab.loginWithUser('operator1_fr');

        // Open filter menu
        cy.get('#opfab-feed-filter-btn-filter').click();

        // Check elements visibility
        cy.get('#opfab-time-filter-form');
        cy.get('#opfab-response-filter-form');

        // Open sort menu
        cy.get('#opfab-feed-filter-btn-sort').click();

        // Check elements visibility
        cy.get('#opfab-feed-ack-all-link');

    })


    it('Sorting criteria and acknowledgment filter options - Configure initial value', function () {

        //Set corresponding properties from the web-ui file
        cy.setPropertyInConf('feed.defaultAcknowledgmentFilter','web-ui','\\"ack\\"');
        cy.setPropertyInConf('feed.defaultSorting','web-ui','\\"date\\"');

        opfab.loginWithUser('operator1_fr');

        // Open filter menu
        cy.get('#opfab-feed-filter-btn-filter').click();

        // Check notack option is selected
        cy.get('#opfab-feed-filter-ack-ack').should('be.checked');

        // Open sort menu
        cy.get('#opfab-feed-filter-btn-sort').click();

        // Check publication date option is selected
        cy.get('#opfab-feed-filter-publication-date').should('be.checked');

    })

    it('Sorting criteria and acknowledgment filter options - Check default behaviour', function () {

        // Removing corresponding properties from the web-ui file
        cy.removePropertyInConf('feed.defaultAcknowledgmentFilter','web-ui');
        cy.removePropertyInConf('feed.defaultSorting','web-ui');

        opfab.loginWithUser('operator1_fr');

        // Open filter menu
        cy.get('#opfab-feed-filter-btn-filter').click();

        // Check notack option is selected
        cy.get('#opfab-feed-filter-ack-notack').should('be.checked');

        // Open sort menu
        cy.get('#opfab-feed-filter-btn-sort').click();

        // Check uread option is selected
        cy.get('#opfab-feed-filter-unread').should('be.checked');

    })


})
