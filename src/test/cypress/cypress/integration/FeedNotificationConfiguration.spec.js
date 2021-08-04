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
        cy.get('.opfab-feedconfiguration-processlist').first().find('p').first().should('have.text', 'IGCC');
        cy.get('.opfab-feedconfiguration-processlist').first().find('p').last().should('have.text', 'Process example ');

        // We check the number of states for each process
        cy.get('.opfab-feedconfiguration-processlist').first().find('.col-md').first().find('.row').should('have.length', 6);
        cy.get('.opfab-feedconfiguration-processlist').first().find('.col-md').last().find('.row').should('have.length', 7);

        // We check the following state is absent because property 'isOnlyAChildState' is set to true
        cy.get('.opfab-feedconfiguration-processlist').first().find('.col-md').last().find('.row').contains('Planned outage date response').should('not.exist');


        // Second process group
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('h5').should('have.text', 'User card examples');

        // We check the number of processes and their titles
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').should('have.length', 3);
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').first().should('have.text', 'Examples for new cards ');
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').eq(1).should('have.text', 'Examples for new cards 2');
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('p').last().should('have.text', 'Examples for new cards 3');

        // We check the number of states for each process
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('.col-md').first().find('.row').should('have.length', 2);
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('.col-md').eq(1).find('.row').should('have.length', 2);
        cy.get('.opfab-feedconfiguration-processlist').eq(1).find('.col-md').last().find('.row').should('have.length', 1);


        // Processes without group
        // We check the number of processes and their titles
        cy.get('.opfab-feedconfiguration-processlist').last().find('p').should('have.length', 1);
        cy.get('.opfab-feedconfiguration-processlist').last().find('p').should('have.text', 'Test process for cypress');

        // We check the number of states for each process
        cy.get('.opfab-feedconfiguration-processlist').last().find('.col-md').first().find('.row').should('have.length', 8);

        // We check the following state is absent because property 'isOnlyAChildState' is set to true
        cy.get('.opfab-feedconfiguration-processlist').last().find('.col-md').first().find('.row').contains('Dummy response state for tests').should('not.exist');
    })
})