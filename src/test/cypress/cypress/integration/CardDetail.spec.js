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
describe('Card detail', function () {


    const process = "cypress";


    before('Set up configuration', function () {

        // This can stay in a `before` block rather than `beforeEach` as long as the test does not change configuration
        cy.resetUIConfigurationFiles();
        cy.loadTestConf();
        cy.deleteAllCards();
        cy.deleteAllArchivedCards();
        cy.sendCard('cypress/cardDetail/cardDetail.json');
       
    });

    describe('Check card detail', function () {

        it(`Check card detail`, function () {
            
            cy.loginOpFab('operator1', 'test');

            // Click on the card
            cy.get('of-light-card').eq(0).click();

            // Check  user context values 
            cy.get("#userContext-login").contains(/^operator1$/); // use ^ and $ to have a contains exactly 
            cy.get("#userContext-token").contains('eyJhb');
            cy.get("#userContext-firstName").contains(/^John$/);
            cy.get("#userContext-lastName").contains(/^Doe$/);
            cy.get("#userContext-groups").contains(/^ReadOnly,REALTIME_USERS,Dispatcher$/);
            cy.get("#userContext-entities").contains(/^ALLCONTROLROOMS,ENTITY1$/);

            // Check templateGateway calls
            cy.get("#templateGateway-getEntityName").contains("Control Room 1");
            cy.get("#templateGateway-getEntityName-unknownEntity").contains("unknownEntity");
            cy.get("#templateGateway-isUserAllowedToRespond").contains("true");
            cy.get("#templateGateway-isUserMemberOfAnEntityRequiredToRespond").contains("true");
            cy.get("#templateGateway-getEntityUsedForUserResponse").contains(/^ENTITY1$/);
            cy.get("#templateGateway-getDisplayContext").contains(/^realtime$/);
            
            
        
            cy.get("#screenSize").contains("md");
            // see card in full screen 
            cy.get("#opfab-card-detail-fullscreen-button").click();
            cy.get("#screenSize").contains("lg");
            // go back in standard screen
            cy.get("#opfab-card-detail-fullscreen-button").click();
            cy.get("#screenSize").contains("md");


            // handlebars templating 
            cy.get("#handlebars-simpleData").contains(/^test$/);
            cy.get("#handlebars-if").contains(/^ok$/);
            cy.get("#handlebars-each").contains(/^123$/);

        });

        it(`Check card detail in archives`, function () {
            
            cy.loginOpFab('operator1', 'test');

            // We move to archives screen
            cy.get('#opfab-navbar-menu-archives').click();

            // We click the search button
            cy.get('#opfab-archives-btn-search').click();

            // Click on the card
            cy.waitDefaultTime();
            cy.get('#opfab-archives-cards-list').find('.opfab-archive-sev-information').first().click();
         

            // Check  user context values 
            cy.get("#userContext-login").contains(/^operator1$/); // use ^ and $ to have a contains exactly 
            cy.get("#userContext-token").contains('eyJhb');
            cy.get("#userContext-firstName").contains(/^John$/);
            cy.get("#userContext-lastName").contains(/^Doe$/);
            cy.get("#userContext-groups").contains(/^ReadOnly,REALTIME_USERS,Dispatcher$/);
            cy.get("#userContext-entities").contains(/^ALLCONTROLROOMS,ENTITY1$/);

            // Check templateGateway calls
            cy.get("#templateGateway-getEntityName").contains("Control Room 1");
            cy.get("#templateGateway-getEntityName-unknownEntity").contains("unknownEntity");

            // in archives is isUserAllowedToRespond always return false 
            cy.get("#templateGateway-isUserAllowedToRespond").contains("false");
            // in archives is isUserMemberOfAnEntityRequiredToRespond always return false 
            cy.get("#templateGateway-isUserMemberOfAnEntityRequiredToRespond").contains("false");
            cy.get("#templateGateway-getDisplayContext").contains(/^archive$/);
            cy.get("#screenSize").contains("lg");

            // handlebars templating 
            cy.get("#handlebars-simpleData").contains(/^test$/);
            cy.get("#handlebars-if").contains(/^ok$/);
            cy.get("#handlebars-each").contains(/^123$/);
           
            
        });

        it(`Check card detail where response not required `, function () {
            cy.sendCard('cypress/cardDetail/cardDetailResponseNotRequired.json');
            cy.loginOpFab('operator1', 'test');

            // Click on the card
            cy.get('of-light-card').eq(0).click();

            cy.get("#templateGateway-isUserAllowedToRespond").contains("true");
            cy.get("#templateGateway-isUserMemberOfAnEntityRequiredToRespond").contains("false");

        });

        it(`Check card detail where response is not possible `, function () {
            cy.sendCard('cypress/cardDetail/cardDetailResponseNotPossible.json');
            cy.loginOpFab('operator1', 'test');

            // Click on the card
            cy.get('of-light-card').eq(0).click();
            
            cy.get("#templateGateway-isUserAllowedToRespond").contains("false");
            cy.get("#templateGateway-isUserMemberOfAnEntityRequiredToRespond").contains("false");

        });


    });

})
