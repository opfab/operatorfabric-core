/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {OpfabGeneralCommands} from "../support/opfabGeneralCommands"
import {AgGridCommands} from "../support/agGridCommands";
import {ScriptCommands} from "../support/scriptCommands";

describe ('Feed notification configuration tests',function () {

    const opfab = new OpfabGeneralCommands();
    const agGrid = new AgGridCommands();
    const script = new ScriptCommands();

    const totalCards = 6;
    const cardsToTest =[
        'Message',
        'Electricity consumption forecast'
    ]

    const cardsToTestRegex = cardsToTest.map (x =>  new RegExp(x+'\\s*$'));  // Convert to regex, ignore any trailing whitespace
    const cardsToTestString = cardsToTest.map (x => x.toUpperCase());

    before('Set up configuration', function () {
        script.loadTestConf();
        script.deleteAllSettings();
    });

    it('Check feed notification configuration screen for operator1_fr', function () {
        opfab.loginWithUser('operator1_fr');

        // We move to feed notification configuration screen
        cy.get('#opfab-navbar-drop-user-menu').click();
        cy.get('#opfab-menu-icon-notification').click();

        cy.get('.opfab-feedconfiguration-title').should('have.text', ' NOTIFICATION CONFIGURATION\n');
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

        // We check 'Process example/Network Contingencies' is disabled and checked (because 'filteringNotificationAllowed' is false for the corresponding perimeter)
        cy.get('.opfab-feedconfiguration-processlist').first().find('.opfab-feedconfiguration-process').last()
            .contains('⚠️ Network Contingencies ⚠️ ').find('input').should('be.disabled').should('be.checked');

        // We check the following state is absent because property 'isOnlyAChildState' is set to true
        cy.get('.opfab-feedconfiguration-processlist').first().find('.opfab-feedconfiguration-process').last().find('.row').contains('Planned outage date response').should('not.exist');


        // Second process group
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('h5').should('have.text', 'User card examples');

        // We check the number of processes and their titles
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').should('have.length', 4);
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').first().should('have.text', 'Conference and IT incident  ');
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').eq(1).should('have.text', 'Message or question ');
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').eq(2).should('have.text', 'Task ');
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').last().should('have.text', 'Task Advanced ');

        // We check the number of states for each process
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('.opfab-feedconfiguration-process').first().find('.row').should('have.length', 2);
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('.opfab-feedconfiguration-process').eq(1).find('.row').should('have.length', 3);
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('.opfab-feedconfiguration-process').eq(2).find('.row').should('have.length', 1);
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('.opfab-feedconfiguration-process').last().find('.row').should('have.length', 1);


        // Processes without group
        // We check the number of processes and their titles
        cy.get('.opfab-feedconfiguration-processlist').last().find('p').should('have.length', 2);
        cy.get('.opfab-feedconfiguration-processlist').last().find('p').eq(0).should('have.text', 'External recipient ');
        cy.get('.opfab-feedconfiguration-processlist').last().find('p').eq(1).should('have.text', 'Test process for cypress ');

        // We check the number of states for each process
        cy.get('.opfab-feedconfiguration-processlist').last().find('.opfab-feedconfiguration-process').eq(0).find('.row').should('have.length', 1);
        cy.get('.opfab-feedconfiguration-processlist').last().find('.opfab-feedconfiguration-process').eq(1).find('.row').should('have.length', 12);

        // We check the following state is absent because property 'isOnlyAChildState' is set to true
        cy.get('.opfab-feedconfiguration-processlist').last().find('.opfab-feedconfiguration-process').first().find('.row').contains('Dummy response state for tests').should('not.exist');
    })

    it('Check feed notification configuration screen for itsupervisor1', function () {
        opfab.loginWithUser('itsupervisor1');

        // We move to feed notification configuration screen
        cy.get('#opfab-navbar-drop-user-menu').click();
        cy.get('#opfab-menu-icon-notification').click();

        cy.get('.opfab-feedconfiguration-title').should('have.text', ' NOTIFICATION CONFIGURATION\n');
        cy.get('.opfab-feedconfiguration-processlist').should('have.length', 3);


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
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').should('have.length', 4);
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').first().should('have.text', 'Conference and IT incident  ');
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').eq(1).should('have.text', 'Message or question ');
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').eq(2).should('have.text', 'Task ');
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').last().should('have.text', 'Task Advanced ');

        // We check the number of states for each process
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('.opfab-feedconfiguration-process').first().find('.row').should('have.length', 2);
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('.opfab-feedconfiguration-process').eq(1).find('.row').should('have.length', 3);
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('.opfab-feedconfiguration-process').eq(2).find('.row').should('have.length', 1);
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('.opfab-feedconfiguration-process').last().find('.row').should('have.length', 1);
    
        // Processes without group
        // We check the number of processes and their titles
        cy.get('.opfab-feedconfiguration-processlist').last().find('p').should('have.length', 1);
        cy.get('.opfab-feedconfiguration-processlist').last().find('p').eq(0).should('have.text', 'Test process for cypress ');

        // We check the number of states for each process
        cy.get('.opfab-feedconfiguration-processlist').last().find('.opfab-feedconfiguration-process').eq(0).find('.row').should('have.length', 12);

    
    })

    it('Check feed notification configuration screen for admin', function () {
        opfab.loginWithUser('admin');

        // We move to feed notification configuration screen
        cy.get('#opfab-navbar-drop-user-menu').click();
        cy.get('#opfab-menu-icon-notification').click();

        cy.get('.opfab-feedconfiguration-title').should('have.text', ' NOTIFICATION CONFIGURATION\n');
        cy.get('.opfab-feedconfiguration-processlist').should('have.length', 0);

        cy.get('#opfab-feedconfiguration-no-process-state-available').should('exist');
        cy.get('#opfab-feedconfiguration-no-process-state-available').contains('No process/state available').should('exist');
    })

    it('Check feed notification configuration screen for operator1_fr, with a config without process group', function () {
        opfab.loginWithUser('operator1_fr');

        script.loadEmptyProcessGroups();
        cy.reload();

        // We move to feed notification configuration screen
        cy.get('#opfab-navbar-drop-user-menu').click();
        cy.get('#opfab-menu-icon-notification').click();

        cy.get('.opfab-feedconfiguration-title').should('have.text', ' NOTIFICATION CONFIGURATION\n');
        cy.get('.opfab-feedconfiguration-processlist').should('have.length', 1);

        // We check we have 6 processes
        cy.get('.opfab-feedconfiguration-processlist').first().find('p').should('have.length', 8);

        // We check the title of each process
        cy.get('.opfab-feedconfiguration-processlist').first().find('p').eq(0).should('have.text', 'Conference and IT incident  ');
        cy.get('.opfab-feedconfiguration-processlist').first().find('p').eq(1).should('have.text', 'External recipient ');
        cy.get('.opfab-feedconfiguration-processlist').first().find('p').eq(2).should('have.text', 'IGCC ');
        cy.get('.opfab-feedconfiguration-processlist').first().find('p').eq(3).should('have.text', 'Message or question ');
        cy.get('.opfab-feedconfiguration-processlist').first().find('p').eq(4).should('have.text', 'Process example  ');
        cy.get('.opfab-feedconfiguration-processlist').first().find('p').eq(5).should('have.text', 'Task ');
        cy.get('.opfab-feedconfiguration-processlist').first().find('p').eq(6).should('have.text', 'Task Advanced ');
        cy.get('.opfab-feedconfiguration-processlist').first().find('p').eq(7).should('have.text', 'Test process for cypress ');

        // We check the number of states for each process
        cy.get('.opfab-feedconfiguration-processlist').first().find('.opfab-feedconfiguration-process').eq(0).find('.row').should('have.length', 2);
        cy.get('.opfab-feedconfiguration-processlist').first().find('.opfab-feedconfiguration-process').eq(1).find('.row').should('have.length', 1);
        cy.get('.opfab-feedconfiguration-processlist').first().find('.opfab-feedconfiguration-process').eq(2).find('.row').should('have.length', 6);
        cy.get('.opfab-feedconfiguration-processlist').first().find('.opfab-feedconfiguration-process').eq(3).find('.row').should('have.length', 3);
        cy.get('.opfab-feedconfiguration-processlist').first().find('.opfab-feedconfiguration-process').eq(4).find('.row').should('have.length', 7);
        cy.get('.opfab-feedconfiguration-processlist').first().find('.opfab-feedconfiguration-process').eq(5).find('.row').should('have.length', 1);
        cy.get('.opfab-feedconfiguration-processlist').first().find('.opfab-feedconfiguration-process').eq(6).find('.row').should('have.length', 1);
        cy.get('.opfab-feedconfiguration-processlist').first().find('.opfab-feedconfiguration-process').eq(7).find('.row').should('have.length', 12);

        // We check 'Process example/Network Contingencies' is disabled (because 'filteringNotificationAllowed' is false for the corresponding perimeter)
        cy.get('.opfab-feedconfiguration-processlist').first().find('.opfab-feedconfiguration-process').eq(4)
            .contains('⚠️ Network Contingencies ⚠️ ').find('input').should('be.disabled').should('be.checked');

        // We check state 'Planned outage date response' from 'Process example' is absent because property 'isOnlyAChildState' is set to true
        cy.get('.opfab-feedconfiguration-processlist').first().find('.opfab-feedconfiguration-process').eq(5).find('.row').contains('Planned outage date response', {matchCase: false}).should('not.exist');

        script.loadTestConf();
        cy.reload();
    })

    it('Check feature select/unselect all states for a process', function () {
        opfab.loginWithUser('operator1_fr');

        // We move to feed notification configuration screen
        cy.get('#opfab-navbar-drop-user-menu').click();
        cy.get('#opfab-menu-icon-notification').click();

        // First process group (we check all processes are checked)
        cy.get('.opfab-feedconfiguration-processlist').first().find('p').as('firstGroupProcesses');
        cy.get('@firstGroupProcesses').first().find('input').should('be.checked');
        cy.get('@firstGroupProcesses').last().find('input').should('be.checked'); 

        // Second process group (we check all processes are checked)
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').as('secondGroupProcesses');
        cy.get('@secondGroupProcesses').first().find('input').should('be.checked');  
        cy.get('@secondGroupProcesses').eq(1).find('input').should('be.checked');
        cy.get('@secondGroupProcesses').eq(2).find('input').should('be.checked');
        cy.get('@secondGroupProcesses').last().find('input').should('be.checked');   

        // Processes without group (we check the process is checked)
        cy.get('.opfab-feedconfiguration-processlist').last().find('p').find('input').should('be.checked');

        // We unselect 'Message or question' process
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').eq(1).find('input').uncheck({force: true});

        // We check 'Message or question' process and all of its states are unchecked
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').eq(1).find('input').should('not.be.checked');
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('.opfab-feedconfiguration-process').eq(1).find('.row').as('MessageOrQuestionStates');
        cy.get('@MessageOrQuestionStates').contains('Message').find('input').should('not.be.checked');
        cy.get('@MessageOrQuestionStates').contains('Question').find('input').should('not.be.checked');

        // We select 'Message or question' process
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').eq(1).find('input').check({force: true});

        // We check 'Message or question' process and all of its states are checked
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').eq(1).find('input').should('be.checked');
        cy.get('@MessageOrQuestionStates').contains('Message').find('input').should('be.checked');
        cy.get('@MessageOrQuestionStates').contains('Question').find('input').should('be.checked');

        // We unselect 'Process example' process (to test the state 'Network Contingencies' is still checked (because filtering notification on this state is not allowed))
        cy.get('.opfab-feedconfiguration-processlist').eq(0).find('p').eq(1).find('input').uncheck({force: true});

        // We check 'Process example' process and all of its states are unchecked except 'Network Contingencies'
        cy.get('.opfab-feedconfiguration-processlist').eq(0).find('p').eq(1).find('input').should('not.be.checked');
        cy.get('.opfab-feedconfiguration-processlist').eq(0).find('.opfab-feedconfiguration-process').eq(1).find('.row').as('ProcessExampleStates');
        cy.get('@ProcessExampleStates').contains('Action required').find('input').should('not.be.checked');
        cy.get('@ProcessExampleStates').contains('Additional information required').find('input').should('not.be.checked');
        cy.get('@ProcessExampleStates').contains('Data quality').find('input').should('not.be.checked');
        cy.get('@ProcessExampleStates').contains('Electricity consumption forecast').find('input').should('not.be.checked');
        cy.get('@ProcessExampleStates').contains('Message').find('input').should('not.be.checked');
        cy.get('@ProcessExampleStates').contains('Process example').find('input').should('not.be.checked');
        cy.get('@ProcessExampleStates').contains('⚠️ Network Contingencies ⚠').find('input').should('be.disabled').should('be.checked');

        // We select 'Process example' process
        cy.get('.opfab-feedconfiguration-processlist').eq(0).find('p').eq(1).find('input').check({force: true});

        // We check 'Process example' process and all of its states are checked
        cy.get('.opfab-feedconfiguration-processlist').eq(0).find('p').eq(1).find('input').should('be.checked');
        cy.get('@ProcessExampleStates').contains('Action required').find('input').should('be.checked');
        cy.get('@ProcessExampleStates').contains('Additional information required').find('input').should('be.checked');
        cy.get('@ProcessExampleStates').contains('Data quality').find('input').should('be.checked');
        cy.get('@ProcessExampleStates').contains('Electricity consumption forecast').find('input').should('be.checked');
        cy.get('@ProcessExampleStates').contains('Message').find('input').should('be.checked');
        cy.get('@ProcessExampleStates').contains('Process example').find('input').should('be.checked');
        cy.get('@ProcessExampleStates').contains('⚠️ Network Contingencies ⚠').find('input').should('be.disabled').should('be.checked');
    })

    it('In case of a state unsubscribed and then filtering notif on this state is prohibited : ' +
        'test a popup is displayed and then the subscription to this state is forced', function () {

        opfab.loginWithUser('operator1_fr');

        // We move to feed notification configuration screen
        cy.get('#opfab-navbar-drop-user-menu').click();
        cy.get('#opfab-menu-icon-notification').click();

        cy.get('.opfab-feedconfiguration-processlist').eq(0).contains('Data quality')
            .find('input').as('DataQualityState');
        cy.get('@DataQualityState').should('be.checked');
        cy.get('@DataQualityState').click({force:true}); // Unselect state

        // Save
        cy.get('#opfab-feedconfiguration-btn-confirm').click(); // Save settings
        cy.get('#opfab-feedconfiguration-btn-yes').click(); // and confirm
        cy.get('#opfab-feedconfiguration-btn-yes').should('not.exist'); // wait for dialog to go away

        opfab.logout();
        opfab.loginWithUser('admin');

        // Click on user menu (top right of the screen)
        cy.get('#opfab-navbar-drop-user-menu').click();
        // Click on "Administration"
        cy.get('#opfab-navbar-right-menu-admin').click();

        // Click on "Perimeters Management"
        cy.get('#opfab-admin-perimeters-tab').click();
        // Edit perimeter defaultProcess
        agGrid.clickCell('ag-grid-angular', 2, 3, 'of-action-cell-renderer');
        cy.get('of-edit-perimeter-modal').should('exist');
        cy.get('.modal-title').should('contain.text', 'defaultProcess');
        cy.get('#state2').should('contain.text', 'Data quality');
        cy.get('#opfab-admin-perimeter-filtering-notification-allowed2').should('be.checked').click({force: true});
        cy.get('#opfab-admin-perimeter-btn-save').click();

        opfab.logout();
        opfab.loginWithUser('operator1_fr');

        // We move to feed notification configuration screen
        cy.get('#opfab-navbar-drop-user-menu').click();
        cy.get('#opfab-menu-icon-notification').click();

        // We check the text displayed in the popup
        cy.get('#opfab-feedconfiguration-states-unsubscribed-popup').should('contain.text',
            'You are unsubscribed from one or more notifications for which unsubscribing is now prohibited.\n\n');
        cy.get('#opfab-feedconfiguration-states-unsubscribed-popup').should('contain.text',
            'Notification(s) concerned :\n\n');
        cy.get('#opfab-feedconfiguration-states-unsubscribed-popup').should('contain.text',
            'Process example  / Data quality\n\n');
        cy.get('#opfab-feedconfiguration-states-unsubscribed-popup').should('contain.text',
            'By clicking OK, you will be subscribed to these notifications again.');
        cy.get('#opfab-feedconfiguration-states-unsubscribed-popup-btn-ok').should('exist').click(); // Click OK

        // Check the state 'Data quality' is checked and disabled
        cy.get('.opfab-feedconfiguration-processlist').eq(0).contains('Data quality')
            .find('input').as('DataQualityState');
        cy.get('@DataQualityState').should('be.checked');
        cy.get('@DataQualityState').should('be.disabled');
    });


    it('Test remove some notifications after cards are sent', function () {
        // Clean up existing cards
        script.deleteAllCards();
        script.send6TestCards();
        opfab.loginWithUser('operator1_fr');

        // All cards should be present
        cy.get('of-light-card').should('have.length',totalCards);

        // All cards should exist in the card feed
        cardsToTestString.forEach((c) =>{
            cy.get('#opfab-card-list').contains(c).should('exist');
        })

        // Cards should exist on the monitoring page
        cy.get('#opfab-navbarContent #opfab-navbar-menu-monitoring').click();
        cardsToTestRegex.forEach((c) => {
            cy.get('of-monitoring-table').contains(c).should('exist');
        })

        // Unselect some notifications
        cy.get('#opfab-navbar-drop-user-menu').click(); // Click top right dropdown menu
        cy.get('#opfab-navbar-right-menu-feedconfiguration').click(); // Click notification reception

        cardsToTestRegex.forEach((c) => {
            cy.get('.opfab-feedconfiguration-process').contains(c).click({force:true}); // Unselect card
        })

        // Save
        cy.get('#opfab-feedconfiguration-btn-confirm').click(); // Save settings
        cy.get('#opfab-feedconfiguration-btn-yes').click(); // and confirm
        cy.get('#opfab-feedconfiguration-btn-yes').should('not.exist'); // wait for dialog to go away


        // Check feed
        cy.get('#opfab-navbar-menu-feed').click(); // Open feed


        // All cards minus the cards to check should be visible
        cy.get('of-light-card').should('have.length',totalCards - cardsToTestRegex.length);


        // Cards should not be visible anymore in the card feed
        cardsToTestRegex.forEach((c) => {
            cy.get('#opfab-card-list').contains(c).should('not.exist');
        })

        // Cards should not exist on the monitoring page
        cy.get('#opfab-navbarContent #opfab-navbar-menu-monitoring').click();  // Monitoring results table
        cardsToTestRegex.forEach((c) => {
            cy.get('of-monitoring-table').contains(c).should('not.exist'); // wait for dialog to go away
        })

        // Pagination should display ' Results number  : <5 - cardsToTest> '
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : '+parseInt(5 - cardsToTestRegex.length));
    });

    it('When sending new cards, check only monitored cards are shown', function () {
        script.deleteAllCards();
        script.send6TestCards();
        opfab.loginWithUser('operator1_fr');

        // Check feed
        cy.get('#opfab-navbar-menu-feed').click(); // Open feed

        // Cards should not be visible anymore in the card feed
        cardsToTestRegex.forEach((c) => {
            cy.get('of-light-card').contains(c).should('not.exist');
        })

        // All cards minus the cards to check should be visible
        cy.get('of-light-card').should('have.length', totalCards - cardsToTestRegex.length);

        // Cards should not exist on the monitoring page
        cy.get('#opfab-navbarContent #opfab-navbar-menu-monitoring').click();

        // Monitoring results table
        cardsToTestRegex.forEach((c) => {
            cy.get('of-monitoring-table').contains(c).should('not.exist');
        })
    });


    it ('Test monitoring all cards', function () {
        opfab.loginWithUser('operator1_fr');

        // Monitor all cards again
        cy.get('#opfab-navbar-drop-user-menu').click(); // Click top right dropdown menu
        cy.get('#opfab-navbar-right-menu-feedconfiguration').click({force:true}); // Click notification reception

        cy.get('.opfab-feedconfiguration-processlist').contains("Base Examples").click({force:true}); // Select all

        cy.get('#opfab-feedconfiguration-btn-confirm').click(); // Save settings
        cy.get('#opfab-feedconfiguration-btn-yes').click(); // and confirm
        cy.get('#opfab-feedconfiguration-btn-yes').should('not.exist'); // wait for dialog to go away

        // Check feed
        cy.get('#opfab-navbar-menu-feed').click(); // Open feed

        // Cards should be visible in the card feed
        cardsToTestString.forEach((c) => {
            cy.get('#opfab-card-list').contains(c).should('exist');
        })

        // All cards cards should be present
        cy.get('of-light-card').should('have.length', totalCards);

        // Cards should exist on the monitoring page
        cy.get('#opfab-navbarContent #opfab-navbar-menu-monitoring').click();

        // Monitoring results table
        cardsToTestRegex.forEach((c) => {
            cy.get('of-monitoring-table').contains(c).should('exist');
        })

        // Pagination should display ' Results number  : 5 '
        cy.get('.opfab-pagination').should('contain.text', ' Results number  : 5')
    });


    it ('Send new cards and verify all are visible', function () {
        script.deleteAllCards();
        script.send6TestCards();
        opfab.loginWithUser('operator1_fr');
  
        // All cards should be present
        cy.get('of-light-card').should('have.length',totalCards);

        // Cards should exist in the card feed
        cardsToTestString.forEach((c) => {
            cy.get('#opfab-card-list').contains(c).should('exist');
        })

        // Cards should exist on the monitoring page
        cy.get('#opfab-navbarContent #opfab-navbar-menu-monitoring').click();
        cardsToTestRegex.forEach((c) => {
            cy.get('of-monitoring-table').contains(c).should('exist');
        })
    })
})
