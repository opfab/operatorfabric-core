/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

/* This test file focuses on some state-type specific behaviour in card details header. As the Cypress test suite grows,
it might make sense to merge it with other tests.
* */
describe('State type tests', function () {

    const orange = 'rgb(255, 165, 0)';
    const green = 'rgb(0, 128, 0)';
    const red = 'rgb(255, 0, 0)';

    const process = "cypress";

    const testDataStateNoLttd = [
        {type: "INPROGRESS", color: orange, en_label: "IN PROGRESS", test_card: "state_type1"},
        {type: "FINISHED", color: green, en_label: "FINISHED", test_card: "state_type2"},
        {type: "CANCELED", color: red, en_label: "CANCELED",test_card: "state_type3"}
        ];

    const testDataNoStateNoLttd = [
        {type: null, test_card: "state_type4"},
        {type: "absent", test_card: "state_type5"},
    ];

    before('Set up configuration', function () {

        // This can stay in a `before` block rather than `beforeEach` as long as the test does not change configuration
        cy.resetUIConfigurationFiles();
        cy.loadTestConf();
        cy.deleteAllCards();
        cy.deleteAllArchivedCards();

        // Tests with state present and no lttd
        cy.sendCard('cypress/state_types/state_type1.json');
        cy.sendCard('cypress/state_types/state_type2.json');
        cy.sendCard('cypress/state_types/state_type3.json');


        // Tests with no state (null or absent) and no lttd
        cy.sendCard('cypress/state_types/state_type4.json');
        cy.sendCard('cypress/state_types/state_type5.json');

        // Test with state and lttd present
        cy.sendCard('cypress/state_types/state_type6.json');

        // Test with no state but lttd present
        cy.sendCard('cypress/state_types/state_type7.json');

    });


    describe('Check card detail header', function () {

        testDataStateNoLttd.forEach((test_data) => {
            it(`State type ${test_data.type} with no lttd`, function () {

                cy.loginOpFab('operator1', 'test');

                // Click on the card with the state under test to display its details
                cy.get(`#opfab-feed-light-card-${process}-${test_data.test_card}`).click();

                // Check card details header: it should contain the static text, the correct state type with the
                // appropriate color, but no pipe or countdown element as there is no lttd
                cy.get('#opfab-card-response-header-left').find('#opfab-card-response-header-status')
                    .contains('Process Status')
                cy.get('#opfab-card-response-header-left').find('[class^="opfab-typeOfState-"]')
                    .should('have.text',`${test_data.en_label}`)
                    .should('have.css','color',`${test_data.color}`);
                cy.get('#opfab-card-response-header-left').contains('|').should('not.exist');
                cy.get('#opfab-card-response-header-left').find('of-countdown').should('not.exist');

            });
        })

        testDataNoStateNoLttd.forEach((test_data) => {
            it(`State type ${test_data.type} with no lttd`, function () {

                cy.loginOpFab('operator1', 'test');

                // Click on the card with the state under test to display its details
                cy.get(`#opfab-feed-light-card-${process}-${test_data.test_card}`).click();

                // Check card details header: it should contain nothing on the left
                cy.get('#opfab-card-response-header-left').should('be.empty');

            });
        })

        it(`State (type FINISHED) with lttd`, function () {

            cy.loginOpFab('operator1', 'test');

            // Click on the card with the state under test to display its details
            cy.get(`#opfab-feed-light-card-${process}-state_type6`).click();

            // Check card details header: it should contain the static text, the correct state type with the
            // appropriate color, then pipe and countdown
            cy.get('#opfab-card-response-header-left').find('#opfab-card-response-header-status')
                .contains('Process Status')
            cy.get('#opfab-card-response-header-left').find('[class^="opfab-typeOfState-"]')
                .should('have.text',"FINISHED")
                .should('have.css','color',green);
            cy.get('#opfab-card-response-header-left').contains('|');
            cy.get('#opfab-card-response-header-left').find('.lttd-icon, .lttd-timeleft');

        });

        it(`No state (type null) with lttd`, function () {

            cy.loginOpFab('operator1', 'test');

            // Click on the card with the state under test to display its details
            cy.get(`#opfab-feed-light-card-${process}-state_type7`).click();

            // Check card details header: it should contain only the time left before lttd and the clock
            cy.get('#opfab-card-response-header-left').contains('|').should('not.exist');
                        cy.get('#opfab-card-response-header-left').find('.lttd-icon');
            cy.get('#opfab-card-response-header-left').find('.lttd-text');

        });

    });

})
