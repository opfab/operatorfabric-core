/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

describe ('Feed notification configuration tests',function () {

    before('Set up configuration', function () {
        cy.loadTestConf();
    });

    it('Check feed notification configuration screen', function () {
        cy.loginOpFab('operator1', 'test');

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
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').first().should('have.text', 'Examples for new cards  ');
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').eq(1).should('have.text', 'Examples for new cards 2 ');
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').last().should('have.text', 'Examples for new cards 3 ');

        // We check the number of states for each process
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('.opfab-feedconfiguration-process').first().find('.row').should('have.length', 2);
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('.opfab-feedconfiguration-process').eq(1).find('.row').should('have.length', 2);
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('.opfab-feedconfiguration-process').last().find('.row').should('have.length', 1);


        // Processes without group
        // We check the number of processes and their titles
        cy.get('.opfab-feedconfiguration-processlist').last().find('p').should('have.length', 1);
        cy.get('.opfab-feedconfiguration-processlist').last().find('p').should('have.text', 'Test process for cypress ');

        // We check the number of states for each process
        cy.get('.opfab-feedconfiguration-processlist').last().find('.opfab-feedconfiguration-process').first().find('.row').should('have.length', 9);

        // We check the following state is absent because property 'isOnlyAChildState' is set to true
        cy.get('.opfab-feedconfiguration-processlist').last().find('.opfab-feedconfiguration-process').first().find('.row').contains('Dummy response state for tests').should('not.exist');
    })


    it('Check feature select/unselect all states for a process', function () {
        cy.loginOpFab('operator1', 'test');

        // We move to feed notification configuration screen
        cy.get('#opfab-navbar-drop_user_menu').click();
        cy.get('#opfab-menu-icon-notification').click();

        // First process group (we check all processes are checked)
        cy.get('.opfab-feedconfiguration-processlist').first().find('p').as('firstGroupProcesses');
        cy.get('@firstGroupProcesses').first().find('input').should('be.checked');//IGCC
        cy.get('@firstGroupProcesses').last().find('input').should('be.checked'); //Process example

        // Second process group (we check all processes are checked)
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').as('secondGroupProcesses');
        cy.get('@secondGroupProcesses').first().find('input').should('be.checked');  //Examples for new cards
        cy.get('@secondGroupProcesses').eq(1).find('input').should('be.checked');//Examples for new cards 2
        cy.get('@secondGroupProcesses').last().find('input').should('be.checked');   //Examples for new cards 3

        // Processes without group (we check the process is checked)
        cy.get('.opfab-feedconfiguration-processlist').last().find('p').find('input').should('be.checked'); //Test process for cypress

        // We unselect 'Examples for new cards 2' process
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').eq(1).find('input').uncheck({force: true});

        // We check 'Examples for new cards 2' process and all of its states are unchecked
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').eq(1).find('input').should('not.be.checked');
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('.opfab-feedconfiguration-process').eq(1).find('.row').as('ExamplesForNewCards2States');
        cy.get('@ExamplesForNewCards2States').contains('Message').find('input').should('not.be.checked');
        cy.get('@ExamplesForNewCards2States').contains('Question').find('input').should('not.be.checked');

        // We select 'Examples for new cards 2' process
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').eq(1).find('input').check({force: true});

        // We check 'Examples for new cards 2' process and all of its states are checked
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').eq(1).find('input').should('be.checked');
        cy.get('@ExamplesForNewCards2States').contains('Message').find('input').should('be.checked');
        cy.get('@ExamplesForNewCards2States').contains('Question').find('input').should('be.checked');
    })
})