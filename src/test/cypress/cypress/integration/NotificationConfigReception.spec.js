/* Copyright (c) 2021, Alliander (http://www.alliander.com)
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

describe ('Notification Configuration Reception tests',function () {

    const totalCards = 6;
    const cardsToTest =[
        /Message\s*$/,                             // ignore any trailing whitespace
        /Electricity consumption forecast\s*$/     // ignore any trailing whitespace
    ];

    before('Set up configuration', function () {
        cy.resetUIConfigurationFiles();
        cy.loadTestConf();

        // Clean up existing cards
        cy.deleteAllCards();
        cy.send6TestCards();
    });

    it('Test remove some notifications after cards are sent', function () {
        cy.loginOpFab('operator1', 'test');

        // All cards should be present
        cy.get('of-light-card').should('have.length',totalCards);

        // All cards should exist in the card feed
        cardsToTest.forEach((c) =>{
            cy.get('#opfab-card-list').contains(c).should('exist');
        })

        // Cards should exist on the monitoring page
        cy.get('#opfab-navbarContent #opfab-navbar-menu-monitoring').click();
        cardsToTest.forEach((c) => {
            cy.get('of-monitoring-table').contains(c).should('exist');
        })

        // Unselect some notifications
        cy.get('#opfab-navbar-drop_user_menu').click(); // Click top right dropdown menu
        cy.get('#opfab-navbar-right-menu-feedconfiguration').click({force:true}); // Click notification reception

        cardsToTest.forEach((c) => {
            cy.get('.opfab-feedconfiguration-process').contains(c).click(); // Unselect card
        })

        // Save
        cy.get('#opfab-feedconfiguration-btn-confirm').click(); // Save settings
        cy.get('#opfab-feedconfiguration-btn-yes').click(); // and confirm

        // Check feed
        cy.get('#opfab-navbar-menu-feed').click({force: true}); // Open feed

        // Cards should not be visible anymore in the card feed
        cardsToTest.forEach((c) => {
            cy.get('#opfab-card-list').contains(c).should('not.exist');
        })

        // All cards minus the cards to check should be visible
        cy.get('of-light-card').should('have.length',totalCards - cardsToTest.length);

        // Cards should not exist on the monitoring page
        cy.get('#opfab-navbarContent #opfab-navbar-menu-monitoring').click();  // Monitoring results table
        cardsToTest.forEach((c) => {
            cy.get('of-monitoring-table').contains(c).should('not.exist');
        })

        // Pagination should display ' Results number  : <5 - cardsToTest> '
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : '+parseInt(5 - cardsToTest.length));
    });

    it('When sending new cards, check only monitored cards are shown', function () {
        cy.deleteAllCards();
        cy.send6TestCards();

        cy.loginOpFab('operator1', 'test')

        // Check feed
        cy.get('#opfab-navbar-menu-feed').click({force: true}); // Open feed

        // Cards should not be visible anymore in the card feed
        cardsToTest.forEach((c) => {
            cy.get('of-light-card').contains(c).should('not.exist');
        })

        // All cards minus the cards to check should be visible
        cy.get('of-light-card').should('have.length', totalCards - cardsToTest.length);

        // Cards should not exist on the monitoring page
        cy.get('#opfab-navbarContent #opfab-navbar-menu-monitoring').click();

        // Monitoring results table
        cardsToTest.forEach((c) => {
            cy.get('of-monitoring-table').contains(c).should('not.exist');
        })
    });

    it ('Test monitoring all cards', function () {
        cy.loginOpFab('operator1', 'test')

        // Monitor all cards again
        cy.get('#opfab-navbar-drop_user_menu').click(); // Click top right dropdown menu
        cy.get('#opfab-navbar-right-menu-feedconfiguration').click({force:true}); // Click notification reception

        cy.get('.opfab-feedconfiguration-processlist').contains("Base Examples").click(); // Select all

        cy.get('#opfab-feedconfiguration-btn-confirm').click(); // Save settings
        cy.get('#opfab-feedconfiguration-btn-yes').click(); // and confirm

        // Check feed
        cy.get('#opfab-navbar-menu-feed').click({force: true}); // Open feed

        // Cards should be visible in the card feed
        cardsToTest.forEach((c) => {
            cy.get('#opfab-card-list').contains(c).should('exist');
        })

        // All cards cards should be present
        cy.get('of-light-card').should('have.length', totalCards);

        // Cards should exist on the monitoring page
        cy.get('#opfab-navbarContent #opfab-navbar-menu-monitoring').click();

        // Monitoring results table
        cardsToTest.forEach((c) => {
            cy.get('of-monitoring-table').contains(c).should('exist');
        })

        // Pagination should display ' Results number  : 5 '
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 5')
    });

    it ('Send new cards and verify all are visible', function () {
        cy.deleteAllCards();
        cy.send6TestCards();

        cy.loginOpFab('operator1', 'test')

        // All cards should be present
        cy.get('of-light-card').should('have.length',totalCards);

        // Cards should exist in the card feed
        cardsToTest.forEach((c) => {
            cy.get('#opfab-card-list').contains(c).should('exist');
        })

        // Cards should exist on the monitoring page
        cy.get('#opfab-navbarContent #opfab-navbar-menu-monitoring').click();
        cardsToTest.forEach((c) => {
            cy.get('of-monitoring-table').contains(c).should('exist');
        })
    })
});
