/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



describe ('Resilience tests',function () {

    before('Set up configuration', function () {

        // This can stay in a `before` block rather than `beforeEach` as long as the test does not change configuration
        cy.resetUIConfigurationFiles();

        cy.loadTestConf();

        // Clean up existing cards
        cy.deleteAllCards();

    });



    it('Check card reception after nginx restart ', function () {

        cy.loginOpFab('operator1_fr','test');

        cy.get('of-light-card').should('have.length',0);

        // Stop nginx
        cy.exec('docker stop web-ui');

        cy.wait(15000);

        // Check loading spinner is present 
        cy.get('#opfab-connecting-spinner');

        // Start Nginx
        cy.exec('docker start web-ui');

        // Wait for subscription to be fully restored 
        cy.wait(20000);

        cy.send6TestCards();
        cy.get('of-light-card').should('have.length',6);

        // Check loading spinner is not present anymore 
        cy.get('#opfab-connecting-spinner').should('not.exist');


    });

    it('Check card reception after rabbit restart ', function () {

        cy.loginOpFab('operator1_fr','test');

        cy.delete6TestCards();
        cy.get('of-light-card').should('have.length',0);

        // Restart rabbitMQ
        cy.exec('docker restart rabbit');

        cy.wait(10000); // Wait for rabbitMQ to be fully up 

        cy.send6TestCards();
        cy.get('of-light-card').should('have.length',6);

    });

    // the following test will only be relevant if using docker mode 
    // in dev mode it will execute but the cards-consultation services will not be restart 
    it('Check card reception when cards-consultation is restarted ', function () {

        cy.loginOpFab('operator1_fr', 'test');

        cy.delete6TestCards();
        cy.get('of-light-card').should('have.length', 0);

        // wait for subscription to be fully working
        cy.wait(5000);

        cy.exec('docker stop cards-consultation',{failOnNonZeroExit: false}).then((result) => {
            // only if docker stop works, so it will not be executed in dev mode 
            if (result.code === 0) {

                // Send 6 cards when cards-consultation servcie is down 
                cy.send6TestCards();

                cy.exec('docker start cards-consultation');

                cy.waitForOpfabToStart();

                // wait for subscription to be fully restored 
                cy.wait(20000);

                cy.get('of-light-card').should('have.length', 6);
            }
        })


    });


})
