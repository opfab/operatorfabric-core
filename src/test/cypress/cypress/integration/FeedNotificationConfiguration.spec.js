/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

describe ('Feed notification configuration tests',function () {
    const totalCards = 6;
    const cardsToTest =[
        /Message\s*$/,                             // ignore any trailing whitespace
        /Electricity consumption forecast\s*$/     // ignore any trailing whitespace
    ];

    before('Set up configuration', function () {
        cy.loadTestConf();
        cy.deleteAllSettings();
    });

    it('Check feed notification configuration screen for operator1_fr', function () {
        cy.loginOpFab('operator1_fr', 'test');

        // We move to feed notification configuration screen
        cy.get('#opfab-navbar-drop_user_menu').click();
        cy.get('#opfab-menu-icon-notification').click();

        cy.get('.opfab-feedconfiguration-title').should('have.text', ' NOTIFICATION RECEPTION CONFIGURATION\n');
        cy.get('.opfab-feedconfiguration-processlist').should('have.length', 3);


        // First process group
        cy.get('.opfab-feedconfiguration-processlist').first().find('h5').should('have.text', 'Base Examples');

        // We check the number of processes and their titles
        cy.get('.opfab-feedconfiguration-processlist').first().find('p').should('have.length', 2);
        cy.get('.opfab-feedconfiguration-processlist').first().find('p').first().should('have.text', 'IGCC ');
        cy.get('.opfab-feedconfiguration-processlist').first().find('p').last().should('have.text', 'Process example  ');

        // We check the number of states for each process
        cy.get('.opfab-feedconfiguration-processlist').first().find('.opfab-feedconfiguration-process').first().find('.row').should('have.length', 6);
        cy.get('.opfab-feedconfiguration-processlist').first().find('.opfab-feedconfiguration-process').last().find('.row').should('have.length', 7);

        // We check the following state is absent because property 'isOnlyAChildState' is set to true
        cy.get('.opfab-feedconfiguration-processlist').first().find('.opfab-feedconfiguration-process').last().find('.row').contains('Planned outage date response').should('not.exist');


        // Second process group
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('h5').should('have.text', 'User card examples');

        // We check the number of processes and their titles
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').should('have.length', 3);
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').first().should('have.text', 'Conference and IT incident  ');
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').eq(1).should('have.text', 'Message or question ');
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').last().should('have.text', 'Task ');

        // We check the number of states for each process
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('.opfab-feedconfiguration-process').first().find('.row').should('have.length', 2);
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('.opfab-feedconfiguration-process').eq(1).find('.row').should('have.length', 3);
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('.opfab-feedconfiguration-process').last().find('.row').should('have.length', 1);


        // Processes without group
        // We check the number of processes and their titles
        cy.get('.opfab-feedconfiguration-processlist').last().find('p').should('have.length', 1);
        cy.get('.opfab-feedconfiguration-processlist').last().find('p').should('have.text', 'Test process for cypress ');

        // We check the number of states for each process
        cy.get('.opfab-feedconfiguration-processlist').last().find('.opfab-feedconfiguration-process').first().find('.row').should('have.length', 12);

        // We check the following state is absent because property 'isOnlyAChildState' is set to true
        cy.get('.opfab-feedconfiguration-processlist').last().find('.opfab-feedconfiguration-process').first().find('.row').contains('Dummy response state for tests').should('not.exist');
    })

    it('Check feed notification configuration screen for itsupervisor1', function () {
        cy.loginOpFab('itsupervisor1', 'test');

        // We move to feed notification configuration screen
        cy.get('#opfab-navbar-drop_user_menu').click();
        cy.get('#opfab-menu-icon-notification').click();

        cy.get('.opfab-feedconfiguration-title').should('have.text', ' NOTIFICATION RECEPTION CONFIGURATION\n');
        cy.get('.opfab-feedconfiguration-processlist').should('have.length', 2);


        // First process group
        cy.get('.opfab-feedconfiguration-processlist').first().find('h5').should('have.text', 'Base Examples');

        // We check the number of processes and their titles
        cy.get('.opfab-feedconfiguration-processlist').first().find('p').should('have.length', 2);
        cy.get('.opfab-feedconfiguration-processlist').first().find('p').first().should('have.text', 'IGCC ');
        cy.get('.opfab-feedconfiguration-processlist').first().find('p').last().should('have.text', 'Process example  ');

        // We check the number of states for each process
        cy.get('.opfab-feedconfiguration-processlist').first().find('.opfab-feedconfiguration-process').first().find('.row').should('have.length', 6);
        cy.get('.opfab-feedconfiguration-processlist').first().find('.opfab-feedconfiguration-process').last().find('.row').should('have.length', 1);

        // We check the following state is absent because property 'isOnlyAChildState' is set to true
        cy.get('.opfab-feedconfiguration-processlist').first().find('.opfab-feedconfiguration-process').last().find('.row').contains('Action required').should('exist');


        // Second process group
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('h5').should('have.text', 'User card examples');

        // We check the number of processes and their titles
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').should('have.length', 3);
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').first().should('have.text', 'Conference and IT incident  ');
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').eq(1).should('have.text', 'Message or question ');
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').last().should('have.text', 'Task ');

        // We check the number of states for each process
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('.opfab-feedconfiguration-process').first().find('.row').should('have.length', 2);
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('.opfab-feedconfiguration-process').eq(1).find('.row').should('have.length', 3);
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('.opfab-feedconfiguration-process').last().find('.row').should('have.length', 1);
    })

    it('Check feed notification configuration screen for admin', function () {
        cy.loginOpFab('admin', 'test');

        // We move to feed notification configuration screen
        cy.get('#opfab-navbar-drop_user_menu').click();
        cy.get('#opfab-menu-icon-notification').click();

        cy.get('.opfab-feedconfiguration-title').should('have.text', ' NOTIFICATION RECEPTION CONFIGURATION\n');
        cy.get('.opfab-feedconfiguration-processlist').should('have.length', 0);

        cy.get('#opfab-feedconfiguration-no-process-state-available').should('exist');
        cy.get('#opfab-feedconfiguration-no-process-state-available').contains('No process/state available').should('exist');
    })

    it('Check feed notification configuration screen for operator1_fr, with a config without process group', function () {
        cy.loginOpFab('operator1_fr', 'test');

        cy.loadEmptyProcessGroups();
        cy.reload();

        // We move to feed notification configuration screen
        cy.get('#opfab-navbar-drop_user_menu').click();
        cy.get('#opfab-menu-icon-notification').click();

        cy.get('.opfab-feedconfiguration-title').should('have.text', ' NOTIFICATION RECEPTION CONFIGURATION\n');
        cy.get('.opfab-feedconfiguration-processlist').should('have.length', 1);

        // We check we have 6 processes
        cy.get('.opfab-feedconfiguration-processlist').first().find('p').should('have.length', 6);

        // We check the title of each process
        cy.get('.opfab-feedconfiguration-processlist').first().find('p').eq(0).should('have.text', 'Conference and IT incident  ');
        cy.get('.opfab-feedconfiguration-processlist').first().find('p').eq(1).should('have.text', 'IGCC ');
        cy.get('.opfab-feedconfiguration-processlist').first().find('p').eq(2).should('have.text', 'Message or question ');
        cy.get('.opfab-feedconfiguration-processlist').first().find('p').eq(3).should('have.text', 'Process example  ');
        cy.get('.opfab-feedconfiguration-processlist').first().find('p').eq(4).should('have.text', 'Task ');
        cy.get('.opfab-feedconfiguration-processlist').first().find('p').eq(5).should('have.text', 'Test process for cypress ');

        // We check the number of states for each process
        cy.get('.opfab-feedconfiguration-processlist').first().find('.opfab-feedconfiguration-process').eq(0).find('.row').should('have.length', 2);
        cy.get('.opfab-feedconfiguration-processlist').first().find('.opfab-feedconfiguration-process').eq(1).find('.row').should('have.length', 6);
        cy.get('.opfab-feedconfiguration-processlist').first().find('.opfab-feedconfiguration-process').eq(2).find('.row').should('have.length', 3);
        cy.get('.opfab-feedconfiguration-processlist').first().find('.opfab-feedconfiguration-process').eq(3).find('.row').should('have.length', 7);
        cy.get('.opfab-feedconfiguration-processlist').first().find('.opfab-feedconfiguration-process').eq(4).find('.row').should('have.length', 1);
        cy.get('.opfab-feedconfiguration-processlist').first().find('.opfab-feedconfiguration-process').eq(5).find('.row').should('have.length', 12);

        // We check state 'Planned outage date response' from 'Process example' is absent because property 'isOnlyAChildState' is set to true
        cy.get('.opfab-feedconfiguration-processlist').first().find('.opfab-feedconfiguration-process').eq(4).find('.row').contains('Planned outage date response', {matchCase: false}).should('not.exist');

        cy.loadTestConf();
        cy.reload();
    })

    it('Check feature select/unselect all states for a process', function () {
        cy.loginOpFab('operator1_fr', 'test');

        // We move to feed notification configuration screen
        cy.get('#opfab-navbar-drop_user_menu').click();
        cy.get('#opfab-menu-icon-notification').click();

        // First process group (we check all processes are checked)
        cy.get('.opfab-feedconfiguration-processlist').first().find('p').as('firstGroupProcesses');
        cy.get('@firstGroupProcesses').first().find('input').should('be.checked');
        cy.get('@firstGroupProcesses').last().find('input').should('be.checked'); 

        // Second process group (we check all processes are checked)
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').as('secondGroupProcesses');
        cy.get('@secondGroupProcesses').first().find('input').should('be.checked');  
        cy.get('@secondGroupProcesses').eq(1).find('input').should('be.checked');
        cy.get('@secondGroupProcesses').last().find('input').should('be.checked');   

        // Processes without group (we check the process is checked)
        cy.get('.opfab-feedconfiguration-processlist').last().find('p').find('input').should('be.checked');

        // We unselect 'Message or question' process
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').eq(1).find('input').uncheck({force: true});

        // We check 'Message or question' process and all of its states are unchecked
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').eq(1).find('input').should('not.be.checked');
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('.opfab-feedconfiguration-process').eq(1).find('.row').as('ExamplesForNewCards2States');
        cy.get('@ExamplesForNewCards2States').contains('Message').find('input').should('not.be.checked');
        cy.get('@ExamplesForNewCards2States').contains('Question').find('input').should('not.be.checked');

        // We select 'Message or question' process
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').eq(1).find('input').check({force: true});

        // We check 'Message or question' process and all of its states are checked
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').eq(1).find('input').should('be.checked');
        cy.get('@ExamplesForNewCards2States').contains('Message').find('input').should('be.checked');
        cy.get('@ExamplesForNewCards2States').contains('Question').find('input').should('be.checked');
    })


    it('Test remove some notifications after cards are sent', function () {
        // Clean up existing cards
        cy.deleteAllCards();
        cy.send6TestCards();

        cy.loginOpFab('operator1_fr', 'test');

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
        cy.get('#opfab-navbar-right-menu-feedconfiguration').click(); // Click notification reception

        cardsToTest.forEach((c) => {
            cy.get('.opfab-feedconfiguration-process').contains(c).click({force:true}); // Unselect card
        })

        // Save
        cy.get('#opfab-feedconfiguration-btn-confirm').click(); // Save settings
        cy.get('#opfab-feedconfiguration-btn-yes').click(); // and confirm
        cy.get('#opfab-feedconfiguration-btn-yes').should('not.exist'); // wait for dialog to go away


        // Check feed
        cy.get('#opfab-navbar-menu-feed').click(); // Open feed


        // All cards minus the cards to check should be visible
        cy.get('of-light-card').should('have.length',totalCards - cardsToTest.length);       


        // Cards should not be visible anymore in the card feed
        cardsToTest.forEach((c) => {
            cy.get('#opfab-card-list').contains(c).should('not.exist');
        })

        // Cards should not exist on the monitoring page
        cy.get('#opfab-navbarContent #opfab-navbar-menu-monitoring').click();  // Monitoring results table
        cardsToTest.forEach((c) => {
            cy.get('of-monitoring-table').contains(c).should('not.exist'); // wait for dialog to go away
        })

        // Pagination should display ' Results number  : <5 - cardsToTest> '
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : '+parseInt(5 - cardsToTest.length));
    });

    it('When sending new cards, check only monitored cards are shown', function () {
        cy.deleteAllCards();
        cy.send6TestCards();

        cy.loginOpFab('operator1_fr', 'test')

        // Check feed
        cy.get('#opfab-navbar-menu-feed').click(); // Open feed

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
        cy.loginOpFab('operator1_fr', 'test')

        // Monitor all cards again
        cy.get('#opfab-navbar-drop_user_menu').click(); // Click top right dropdown menu
        cy.get('#opfab-navbar-right-menu-feedconfiguration').click({force:true}); // Click notification reception

        cy.get('.opfab-feedconfiguration-processlist').contains("Base Examples").click({force:true}); // Select all

        cy.get('#opfab-feedconfiguration-btn-confirm').click(); // Save settings
        cy.get('#opfab-feedconfiguration-btn-yes').click(); // and confirm
        cy.get('#opfab-feedconfiguration-btn-yes').should('not.exist'); // wait for dialog to go away

        // Check feed
        cy.get('#opfab-navbar-menu-feed').click(); // Open feed

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

        cy.loginOpFab('operator1_fr', 'test')


        
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
})
