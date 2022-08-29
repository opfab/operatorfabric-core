/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

/** Test for the OpFab activity area page */

describe('ActivityAreaPage', () => {
    before('Delete previous cards', function () {
        cy.loadTestConf();
        cy.deleteAllCards();
        cy.deleteAllArchivedCards();
        cy.send6TestCards();
    });

    it('Connection of operator4_fr, which is connected to ENTITY1_FR, ENTITY2_FR, ENTITY3_FR, ENTITY4_FR and check of the activity area page', () => {
        cy.loginOpFab('operator4_fr', 'test');

        cy.openActivityArea();

        // We check the title of the page
        cy.get('.opfab-activityarea-title').should('have.text', ' ACTIVITY AREA\n');

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

        // We disconnect from ENTITY1_FR
        cy.get('.opfab-checkbox').contains('Control Center FR North').click();
        cy.saveActivityAreaModifications();

        // We navigate to another page (archives for example)
        cy.get('#opfab-navbar-menu-archives').click();

        // We go back to activity area page, we check ENTITY1_FR is unchecked and all other checkboxes are checked
        cy.openActivityArea();
        cy.get('.opfab-checkbox').eq(0).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(1).find('input').should('not.be.checked');
        cy.get('.opfab-checkbox').eq(2).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(3).find('input').should('be.checked');

        // We reconnect to ENTITY1_FR
        cy.get('.opfab-checkbox').contains('Control Center FR North').click();
        cy.saveActivityAreaModifications();
    });

    it('Connection of operator4_fr, disconnection from ENTITY1_FR, ENTITY2_FR and ENTITY3_FR and check of feed and archives pages', () => {
        cy.loginOpFab('operator4_fr', 'test');

        // operator4_fr is connected to all his entities, he should receive 6 cards in the feed
        cy.get('of-light-card').should('have.length', 6);
        cy.get('of-light-card').eq(0).find('.card-title').should('have.text', '⚠️ Network Contingencies ⚠️ ');
        cy.get('of-light-card').eq(1).find('.card-title').should('have.text', 'Electricity consumption forecast ');
        cy.get('of-light-card').eq(2).find('.card-title').should('have.text', '⚡ Planned Outage ');
        cy.get('of-light-card').eq(3).find('.card-title').should('have.text', 'Process state (calcul) ');
        cy.get('of-light-card').eq(4).find('.card-title').should('have.text', 'Data quality ');
        cy.get('of-light-card').eq(5).find('.card-title').should('have.text', 'Message ');

        // operator4_fr should see 6 cards in archives page
        cy.get('#opfab-navbar-menu-archives').click();
        cy.get('#opfab-archives-logging-btn-search').click();
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').should('have.length', 6);

        // operator4_fr disconnect from ENTITY1_FR, ENTITY2_FR and ENTITY3_FR
        cy.openActivityArea();

        // check every checkbox to let the time for the ui to set to true before we click
        cy.get('.opfab-checkbox').eq(0).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(1).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(2).find('input').should('be.checked');
        cy.get('.opfab-checkbox').eq(3).find('input').should('be.checked');
        cy.get('.opfab-checkbox').contains('Control Center FR North').click();
        cy.get('.opfab-checkbox').contains('Control Center FR East').click();
        cy.get('.opfab-checkbox').contains('Control Center FR South').click();
        cy.saveActivityAreaModifications();

        // now, operator4_fr should see only 4 cards in the feed
        cy.get('#opfab-navbar-menu-feed').click();
        cy.waitDefaultTime();
        cy.get('of-light-card').should('have.length', 4);
        cy.get('of-light-card').eq(0).find('.card-title').should('have.text', '⚡ Planned Outage ');
        cy.get('of-light-card').eq(1).find('.card-title').should('have.text', 'Process state (calcul) ');
        cy.get('of-light-card').eq(2).find('.card-title').should('have.text', 'Data quality ');
        cy.get('of-light-card').eq(3).find('.card-title').should('have.text', 'Message ');

        // and now operator4_fr should see only 4 cards in archives page
        cy.get('#opfab-navbar-menu-archives').click(); // click confirm settings
        cy.get('#opfab-archives-logging-btn-search').click();
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').should('have.length', 4);
        cy.get('#opfab-archives-cards-list').find('.opfab-archives-table-line').as('archives-table');
        cy.get('@archives-table').eq(0).find('td').eq(4).should('have.text', '⚡ Planned Outage');
        cy.get('@archives-table').eq(1).find('td').eq(4).should('have.text', 'Process state (calcul)');
        cy.get('@archives-table').eq(2).find('td').eq(4).should('have.text', 'Data quality');
        cy.get('@archives-table').eq(3).find('td').eq(4).should('have.text', 'Message');

        // We reconnect to ENTITY1_FR, ENTITY2_FR and ENTITY3_FR
        cy.openActivityArea();
        // check every checkbox to let the time for the ui to set to true before we click
        cy.get('.opfab-checkbox').eq(0).find('input').should('not.be.checked');
        cy.get('.opfab-checkbox').eq(1).find('input').should('not.be.checked');
        cy.get('.opfab-checkbox').eq(2).find('input').should('not.be.checked');
        cy.get('.opfab-checkbox').eq(3).find('input').should('be.checked');
        cy.get('.opfab-checkbox').contains('Control Center FR East').click();
        cy.get('.opfab-checkbox').contains('Control Center FR South').click();
        cy.get('.opfab-checkbox').contains('Control Center FR North').click();
        cy.saveActivityAreaModifications();
    });

    it('Choose activity area on login', function () {
        cy.setPropertyInConf('selectActivityAreaOnLogin ', 'web-ui', true);

        cy.visit('');

        //type login
        cy.get('#opfab-login').should('be.visible');
        cy.get('#opfab-login').type('operator4_fr');

        //type password
        cy.get('#opfab-password').should('be.visible');
        cy.get('#opfab-password').type('test');

        //press login button
        cy.get('#opfab-login-btn-submit').click();
        cy.get('#opfab-login-btn-submit').should('be.visible');

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

        cy.logoutOpFab();

        cy.hackUrlCurrentlyUsedMechanism();
        cy.visit('');

        //type login
        cy.get('#opfab-login').should('be.visible');
        cy.get('#opfab-login').type('operator4_fr');

        //type password
        cy.get('#opfab-password').should('be.visible');
        cy.get('#opfab-password').type('test');

        //press login button
        cy.get('#opfab-login-btn-submit').click();
        cy.get('#opfab-login-btn-submit').should('be.visible');

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

        cy.get('of-light-card').eq(0).find('.card-title').should('have.text', '⚡ Planned Outage ');
        cy.get('of-light-card').eq(1).find('.card-title').should('have.text', 'Process state (calcul) ');
        cy.get('of-light-card').eq(2).find('.card-title').should('have.text', 'Data quality ');
        cy.get('of-light-card').eq(3).find('.card-title').should('have.text', 'Message ');

        // We reconnect to ENTITY1_FR, ENTITY2_FR and ENTITY3_FR
        cy.openActivityArea();

        // check every checkbox to let the time for the ui to set to true before we click
        cy.get('.opfab-checkbox').eq(0).find('input').should('not.be.checked');
        cy.get('.opfab-checkbox').eq(1).find('input').should('not.be.checked');
        cy.get('.opfab-checkbox').eq(2).find('input').should('not.be.checked');
        cy.get('.opfab-checkbox').eq(3).find('input').should('be.checked');
        cy.get('.opfab-checkbox').contains('Control Center FR East').click();
        cy.get('.opfab-checkbox').contains('Control Center FR South').click();
        cy.get('.opfab-checkbox').contains('Control Center FR North').click();
        cy.saveActivityAreaModifications();

        cy.setPropertyInConf('selectActivityAreaOnLogin ', 'web-ui', false);
    });

    it('Check spinner is displayed when request is delayed and that spinner disappears once the request arrived', function () {
        cy.delayRequestResponse('/users/users/*');

        cy.loginOpFab('operator1_fr', 'test');

        cy.openActivityArea();
        cy.waitDefaultTime();

        cy.checkLoadingSpinnerIsDisplayed();
        cy.checkLoadingSpinnerIsNotDisplayed();
    });

    it('Check spinner is displayed for saving settings, when request is delayed and that spinner disappears once the request arrived', function () {
        cy.loginOpFab('operator1_fr', 'test');

        cy.openActivityArea();

        cy.delayRequestResponse('/users/users/**');
        cy.get('#opfab-activityarea-btn-confirm').should('exist').click(); // click confirm settings
        cy.get('#opfab-activityarea-btn-yes').should('exist').click(); // click yes on the confirmation popup
        cy.waitDefaultTime();

        cy.checkLoadingSpinnerIsDisplayed();
        cy.checkLoadingSpinnerIsNotDisplayed();
    });
});