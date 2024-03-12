/* Copyright (c) 2021-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OpfabGeneralCommands} from '../support/opfabGeneralCommands'
import {ScriptCommands} from "../support/scriptCommands";

describe ('Feed configuration tests',function () {
    
    const opfab = new OpfabGeneralCommands();
    const script = new ScriptCommands();

    before('Set up configuration and cards', function () {
        script.loadTestConf();
        script.deleteAllCards();
        script.send6TestCards(); // The feed needs to have cards so the "Acknowledge all cards" feature can be shown
    });

    beforeEach('Reset UI configuration file ', function () {
        script.resetUIConfigurationFiles();
    })


    it('Buttons and filters visibility - Check default behaviour', function () {

        // Default is "false" (i.e. visible) except for hideAckAllCardsFeature

        // Removing corresponding properties from the web-ui file
        script.removePropertyInConf('feed.card.hideTimeFilter');
        script.removePropertyInConf('feed.card.hideResponseFilter');
        script.removePropertyInConf('feed.defaultAcknowledgmentFilter');
        script.removePropertyInConf('feed.defaultSorting');
        script.removePropertyInConf('feed.card.hideAckAllCardsFeature');

        opfab.loginWithUser('operator1_fr');

        // Open filter menu
        cy.get('#opfab-feed-filter-btn-filter').click();

        // Check elements visibility
        cy.get('#opfab-time-filter-form');
        cy.get('#opfab-ack-filter-form');
        cy.get('#opfab-response-filter-form');

        // Check elements visibility
        cy.get('#opfab-feed-filter-unread');
        cy.get('#opfab-feed-filter-severity');

        cy.get('#opfab-feed-ack-ack-link').should('not.exist');


    })

    it('Buttons and filters visibility - Set property to true', function () {

        // Setting properties to true in file
        script.setPropertyInConf('feed.card.hideTimeFilter',true);
        script.setPropertyInConf('feed.card.hideResponseFilter',true);
        script.setPropertyInConf('feed.card.hideAckAllCardsFeature',true);

        opfab.loginWithUser('operator1_fr');

        // Open filter menu
        cy.get('#opfab-feed-filter-btn-filter').click();

        // Check elements visibility
        cy.get('#opfab-time-filter-form').should('not.exist');
        cy.get('#opfab-response-filter-form').should('not.exist');

        // Check elements visibility
        cy.get('#opfab-feed-ack-all-link').should('not.exist');

    })

    it('Buttons and filters visibility - Set property to false', function () {

        // Setting properties to true in file
        script.setPropertyInConf('feed.card.hideTimeFilter',false);
        script.setPropertyInConf('feed.card.hideResponseFilter',false);
        script.setPropertyInConf('feed.card.hideAckAllCardsFeature',false);

        opfab.loginWithUser('operator1_fr');

        // Open filter menu
        cy.get('#opfab-feed-filter-btn-filter').click();

        // Check elements visibility
        cy.get('#opfab-time-filter-form');
        cy.get('#opfab-response-filter-form');

        // Check elements visibility
        cy.get('#opfab-feed-ack-all-link');

    })


    it('Sorting criteria and acknowledgment filter options - Configure initial value', function () {

        //Set corresponding properties from the web-ui file
        script.setPropertyInConf('feed.defaultAcknowledgmentFilter','\\"ack\\"');
        script.setPropertyInConf('feed.defaultSorting','\\"date\\"');

        opfab.loginWithUser('operator1_fr');

        // Open filter menu
        cy.get('#opfab-feed-filter-btn-filter').click();

        // Check notack option is selected
        cy.get('#opfab-feed-filter-ack-ack').should('be.checked');

        // Check publication date option is selected
        cy.get('#opfab-feed-filter-publication-date').should('be.checked');

    })

    it('Sorting criteria and acknowledgment filter options - Check default behaviour', function () {

        // Removing corresponding properties from the web-ui file
        script.removePropertyInConf('feed.defaultAcknowledgmentFilter');
        script.removePropertyInConf('feed.defaultSorting');

        opfab.loginWithUser('operator1_fr');

        // Open filter menu
        cy.get('#opfab-feed-filter-btn-filter').click();

        // Check notack option is selected
        cy.get('#opfab-feed-filter-ack-ack').should('not.be.checked');

        // Check uread option is selected
        cy.get('#opfab-feed-filter-unread').should('be.checked');

    })


})
