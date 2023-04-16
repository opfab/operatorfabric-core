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


describe('ActivityAreaPage', () => {

    const opfab = new OpfabGeneralCommands();
    const activityArea = new ActivityAreaCommands();
    const script = new ScriptCommands();

    before('Delete previous cards', function () {
        script.loadTestConf();
        script.deleteAllSettings();
        script.deleteAllCards();
        script.deleteAllArchivedCards();
        script.send6TestCards();
    });


    it('Connection of operator4_fr, disconnection from ENTITY1_FR, ENTITY2_FR and ENTITY3_FR and check of feed and archives pages', () => {
        opfab.loginWithUser('operator4_fr');



        // operator4_fr is connected to all his entities, he should receive 6 cards in the feed
        cy.get('of-light-card').should('have.length', 6);
        cy.get('of-light-card').eq(0).find('.card-title').should('have.text', '⚠️ Network Contingencies ⚠️'.toUpperCase());
        cy.get('of-light-card').eq(1).find('.card-title').should('have.text', 'Electricity consumption forecast'.toUpperCase());
        cy.get('of-light-card').eq(2).find('.card-title').should('have.text', '⚡ Planned Outage'.toUpperCase());
        cy.get('of-light-card').eq(3).find('.card-title').should('have.text', 'Process state (calcul)'.toUpperCase());
        cy.get('of-light-card').eq(4).find('.card-title').should('have.text', 'Data quality'.toUpperCase());
        cy.get('of-light-card').eq(5).find('.card-title').should('have.text', 'Message'.toUpperCase());

        // operator4_fr should see 6 cards in archives page
        cy.get('#opfab-navbar-menu-archives').click();
        cy.get('#opfab-archives-logging-btn-search').click();
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').should('have.length', 6);

        // operator4_fr disconnect from ENTITY1_FR, ENTITY2_FR and ENTITY3_FR
        opfab.navigateToActivityArea();

        // We check the title of the page
        cy.get('.opfab-activityarea-title').should('have.text', ' ACTIVITY AREA\n');

        // check every checkbox to let the time for the ui to set to true before we click
        cy.get('.opfab-checkbox').eq(0).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(1).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(2).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(3).find('input').should('be.checked');
        cy.get('.opfab-checkbox').contains('Control Center FR North').click();
        cy.get('.opfab-checkbox').contains('Control Center FR East').click();
        cy.get('.opfab-checkbox').contains('Control Center FR South').click();
        activityArea.save();

        // now, operator4_fr should see only 4 cards in the feed
        cy.get('#opfab-navbar-menu-feed').click();
        cy.waitDefaultTime();
        cy.get('of-light-card').should('have.length', 4);
        cy.get('of-light-card').eq(0).find('.card-title').should('have.text', '⚡ Planned Outage'.toUpperCase());
        cy.get('of-light-card').eq(1).find('.card-title').should('have.text', 'Process state (calcul)'.toUpperCase());
        cy.get('of-light-card').eq(2).find('.card-title').should('have.text', 'Data quality'.toUpperCase());
        cy.get('of-light-card').eq(3).find('.card-title').should('have.text', 'Message'.toUpperCase());

        // and now operator4_fr should see only 4 cards in archives page
        cy.get('#opfab-navbar-menu-archives').click(); // click confirm settings
        cy.get('#opfab-archives-logging-btn-search').click();
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').should('have.length', 4);
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').as('archives-table');
        cy.get('@archives-table').eq(0).find('td').eq(4).should('have.text', '⚡ Planned Outage'.toUpperCase());
        cy.get('@archives-table').eq(1).find('td').eq(4).should('have.text', 'Process state (calcul)'.toUpperCase());
        cy.get('@archives-table').eq(2).find('td').eq(4).should('have.text', 'Data quality'.toUpperCase());
        cy.get('@archives-table').eq(3).find('td').eq(4).should('have.text', 'Message'.toUpperCase());

        // We reconnect to ENTITY1_FR, ENTITY2_FR and ENTITY3_FR
        opfab.navigateToActivityArea();
        // check every checkbox to let the time for the ui to set to true before we click
        cy.get('.opfab-checkbox').eq(0).find('input').should('not.be.checked');
        cy.get('.opfab-checkbox').eq(1).find('input').should('not.be.checked');
        cy.get('.opfab-checkbox').eq(2).find('input').should('not.be.checked');
        cy.get('.opfab-checkbox').eq(3).find('input').should('be.checked');
        cy.get('.opfab-checkbox').contains('Control Center FR East').click();
        cy.get('.opfab-checkbox').contains('Control Center FR South').click();
        cy.get('.opfab-checkbox').contains('Control Center FR North').click();
        activityArea.save();
    });

    it('Choose activity area on login', function () {
        script.setPropertyInConf('selectActivityAreaOnLogin ', 'web-ui', true);

        cy.visit('');

        //type login
        cy.get('#opfab-login').should('be.visible');
        cy.get('#opfab-login').type('operator4_fr');

        //type password
        cy.get('#opfab-password').should('be.visible');
        cy.get('#opfab-password').type('test');

        //press login button
        cy.get('#opfab-login-btn-submit').click();

        cy.get('of-activityarea').should('exist');

        // We check the title of the page
        cy.get('.opfab-activityarea-title').should('have.text', ' CHOOSE YOUR ACTIVITY AREA\n');

        // We should have only one 'block'
        cy.get('.opfab-activityarea-entitieslist').should('have.length', 1);

        // We should have 4 checkboxes corresponding to the four entities of the user
        cy.get('.opfab-checkbox').should('have.length', 4);
        cy.get('.opfab-checkbox').eq(0).should('have.text', 'Control Center FR East ');
        cy.get('.opfab-checkbox').eq(1).should('have.text', 'Control Center FR North ');
        cy.get('.opfab-checkbox').eq(2).should('have.text', 'Control Center FR South ');
        cy.get('.opfab-checkbox').eq(3).should('have.text', 'Control Center FR West ');

        // We check all the checkboxes are checked
        cy.get('.opfab-checkbox').eq(0).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(1).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(2).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(3).find('input').should('be.checked');

        cy.get('#opfab-activityarea-btn-confirm').click();

        cy.waitDefaultTime();
        cy.get('of-light-card').should('have.length', 6);

        opfab.logout();
        opfab.hackUrlCurrentlyUsedMechanism();
        cy.visit('');

        //type login
        cy.get('#opfab-login').should('be.visible');
        cy.get('#opfab-login').type('operator4_fr');

        //type password
        cy.get('#opfab-password').should('be.visible');
        cy.get('#opfab-password').type('test');

        //press login button
        cy.get('#opfab-login-btn-submit').click();

        cy.get('of-activityarea').should('exist');

        // Disconnect operator4_fr from ENTITY1_FR, ENTITY2_FR and ENTITY3_FR
        cy.get('.opfab-checkbox').eq(0).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(1).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(2).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(3).find('input').should('be.checked');
        cy.get('.opfab-checkbox').contains('Control Center FR North').click();
        cy.get('.opfab-checkbox').contains('Control Center FR East').click();
        cy.get('.opfab-checkbox').contains('Control Center FR South').click();
        cy.get('#opfab-activityarea-btn-confirm').should('exist').click(); // click confirm settings

        // now, operator4_fr should see only 4 cards in the feed
        cy.get('#opfab-navbar-menu-feed').click();
        cy.waitDefaultTime();
        cy.get('of-light-card').should('have.length', 4);

        cy.get('of-light-card').eq(0).find('.card-title').should('have.text', '⚡ Planned Outage'.toUpperCase());
        cy.get('of-light-card').eq(1).find('.card-title').should('have.text', 'Process state (calcul)'.toUpperCase());
        cy.get('of-light-card').eq(2).find('.card-title').should('have.text', 'Data quality'.toUpperCase());
        cy.get('of-light-card').eq(3).find('.card-title').should('have.text', 'Message'.toUpperCase());

        // We reconnect to ENTITY1_FR, ENTITY2_FR and ENTITY3_FR
        opfab.navigateToActivityArea();

        // check every checkbox to let the time for the ui to set to true before we click
        cy.get('.opfab-checkbox').eq(0).find('input').should('not.be.checked');
        cy.get('.opfab-checkbox').eq(1).find('input').should('not.be.checked');
        cy.get('.opfab-checkbox').eq(2).find('input').should('not.be.checked');
        cy.get('.opfab-checkbox').eq(3).find('input').should('be.checked');
        cy.get('.opfab-checkbox').contains('Control Center FR East').click();
        cy.get('.opfab-checkbox').contains('Control Center FR South').click();
        cy.get('.opfab-checkbox').contains('Control Center FR North').click();
        activityArea.save();

        script.setPropertyInConf('selectActivityAreaOnLogin ', 'web-ui', false);
    });

    it('Check spinner is displayed when request is delayed and that spinner disappears once the request arrived', function () {
        cy.delayRequestResponse('/users/users/*');
        opfab.loginWithUser('operator1_fr');
        opfab.navigateToActivityArea();
        cy.waitDefaultTime();
        opfab.checkLoadingSpinnerIsDisplayed();
        opfab.checkLoadingSpinnerIsNotDisplayed();
    });

    it('Check spinner is displayed for saving settings, when request is delayed and that spinner disappears once the request arrived', function () {
        opfab.loginWithUser('operator1_fr');
        opfab.navigateToActivityArea();
        cy.delayRequestResponse('/users/users/**');
        cy.get('#opfab-activityarea-btn-confirm').should('exist').click(); // click confirm settings
        cy.get('#opfab-activityarea-btn-yes').should('exist').click(); // click yes on the confirmation popup
        cy.waitDefaultTime();
        opfab.checkLoadingSpinnerIsDisplayed();
        opfab.checkLoadingSpinnerIsNotDisplayed();
    });
});
