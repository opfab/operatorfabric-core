/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

describe ('Response card tests',function () {

    before('Set up configuration and clean cards', function () {

        // This can stay in a `before` block rather than `beforeEach` as long as the test does not change configuration
        cy.resetUIConfigurationFiles();

        cy.loadTestConf();
        // Clean up existing cards
        cy.deleteAllCards();

        cy.sendCard('defaultProcess/question.json');
    });


    it('Check card response for operator1_fr ', function () {

        cy.loginOpFab('operator1_fr','test');

        // operator1_fr should see the card in their feed
        cy.get('of-light-card').should('have.length',1);

        // See in the feed the fact that user has not respond (no icon)
        cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity').should('not.exist');

        // Click on the card
        cy.get('of-light-card').eq(0).click();
        
        // Check the correct rendering of card 
        cy.get('#question-choice1');

        // check entities in card header 
        cy.get('#opfab-card-header-entity-ENTITY1_FR').should('have.css', 'color', 'rgb(255, 102, 0)');// entity 1 color is orange 
        cy.get('#opfab-card-header-entity-ENTITY2_FR').should('have.css', 'color', 'rgb(255, 102, 0)');  // entity 2 color is orange

        // Response button is present 
        cy.get('#opfab-card-details-btn-response');
        cy.get('#opfab-card-details-btn-response').should('have.text', 'SEND RESPONSE');
            
        // Respond to the card 
        cy.get('#question-choice1').click();
        cy.get('#opfab-card-details-btn-response').click();

        // The label of the validate button must be "MODIFY RESPONSE" now
        cy.get('#opfab-card-details-btn-response').should('have.text', 'MODIFY RESPONSE');

        // See in the feed the fact that user has respond (icon)
        cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity');

        //check the response has been integrated in the template 
        cy.get('#response_from_ENTITY1_FR');

        // check entities in card header 
        cy.get('#opfab-card-header-entity-ENTITY1_FR').should('have.css', 'color', 'rgb(0, 128, 0)'); // entity 1 color is green 
        cy.get('#opfab-card-header-entity-ENTITY2_FR').should('have.css', 'color', 'rgb(255, 102, 0)'); // entity 2 color is orange

        // update card 
        cy.sendCard('defaultProcess/question.json');

         // See in the feed the fact that user has not respond (no icon)
         cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity').should('not.exist');

         // Respond  to the new card 
         
         cy.get('#opfab-card-details-btn-response').should('have.text', 'SEND RESPONSE');
         cy.get('#question-choice3').click(); // to avoid detach dom error , check before send response and click after 
         cy.get('#opfab-card-details-btn-response').click();
         
        // See in the feed the fact that user has respond (icon)
        cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity');
    });




    it('Check card response for operator2_fr ', function () {

        cy.loginOpFab('operator2_fr','test');

        // operator1_fr should see the card in their feed
        cy.get('of-light-card').should('have.length',1);

        // See in the feed the fact that user has not respond (no icon)
        cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity').should('not.exist');

        // Click on the card
        cy.get('of-light-card').eq(0).click();

        // Check the correct rendering of card 
        cy.get('#question-choice2');

        // Check the response from ENTITY1_FR has been integrated in the template 
        cy.get('#response_from_ENTITY1_FR');
        
        // check entities in card header 
        cy.get('#opfab-card-header-entity-ENTITY1_FR').should('have.css', 'color', 'rgb(0, 128, 0)'); // entity 1 color is green 
        cy.get('#opfab-card-header-entity-ENTITY2_FR').should('have.css', 'color', 'rgb(255, 102, 0)'); // entity 2 color is orange

        // Response button is present 
        cy.get('#opfab-card-details-btn-response');
            
        // Respond to the card
        cy.get('#question-choice2').click();
        cy.get('#opfab-card-details-btn-response').click();

        // See in the feed the fact that user has respond (icon)
        cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity');

        // Check the response from current user has been integrated in the template 
        cy.get('#response_from_ENTITY2_FR');


        // check entities in card header 
        cy.get('#opfab-card-header-entity-ENTITY1_FR').should('have.css', 'color', 'rgb(0, 128, 0)'); // entity 1 color is green 
        cy.get('#opfab-card-header-entity-ENTITY2_FR').should('have.css', 'color', 'rgb(0, 128, 0)'); // entity 2 color is green
    })


    it('Check itsupervisor1 see the card but cannot respond ', function () {

        cy.loginOpFab('itsupervisor1','test');

        // operator1_fr should see the card in their feed
        cy.get('of-light-card').should('have.length',1);

        // See in the feed the fact that user has not respond (no icon)
        cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity').should('not.exist');

        // Click on the card
        cy.get('of-light-card').eq(0).click();

        // Check the correct rendering of card 
        cy.get('#question-choice2');

        // Check the response from ENTITY1_FR and ENTITY2_FR has been integrated in the template 
        cy.get('#response_from_ENTITY1_FR');
        cy.get('#response_from_ENTITY2_FR');
        
        // check entities in card header 
        cy.get('#opfab-card-header-entity-ENTITY1_FR').should('have.css', 'color', 'rgb(0, 128, 0)'); // entity 1 color is green 
        cy.get('#opfab-card-header-entity-ENTITY2_FR').should('have.css', 'color', 'rgb(0, 128, 0)'); // entity 2 color is green
        
        // Response button is not present 
        cy.get('#opfab-card-details-btn-response').should('not.exist');
        
    })

    it ('Check response for  operator1_fr  is still present after update of card with keepChildCard=true re-logging',function () {
        cy.sendCard('defaultProcess/questionWithKeepChildCards.json');

        cy.loginOpFab('operator1_fr','test');
        // See in the feed the fact that user has respond (icon)
        cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity');

         // Click on the card
         cy.get('of-light-card').eq(0).click();

         // Check the correct rendering of card 
         cy.get('#question-choice2');
 
         // Check the old response from ENTITY1_FR has been integrated in the template 
         cy.get('#response_from_ENTITY1_FR');

        // check entities in card header 
        cy.get('#opfab-card-header-entity-ENTITY1_FR').should('have.css', 'color', 'rgb(0, 128, 0)'); // entity 1 color is green 
        cy.get('#opfab-card-header-entity-ENTITY2_FR').should('have.css', 'color', 'rgb(0, 128, 0)'); // entity 2 color is green
    });

    it ('Check response for  operator1_fr  is not present after update of card with keepChildCard= false re-logging',function () {
        cy.sendCard('defaultProcess/question.json');

        cy.loginOpFab('operator1_fr','test');
       
        // Click on the card
        cy.get('of-light-card').eq(0).click(); 

        // Should not have an icon of response
        cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity').should('not.exist');

         // Check the correct rendering of card 
         cy.get('#question-choice2');
 
         // Check the old response from ENTITY1_FR has not been integrated in the template 
         cy.get('#response_from_ENTITY1_FR').should('not.exist');

        // check entities in card header 
        cy.get('#opfab-card-header-entity-ENTITY1_FR').should('have.css', 'color', 'rgb(255, 102, 0)');// entity 1 color is orange 
        cy.get('#opfab-card-header-entity-ENTITY2_FR').should('have.css', 'color', 'rgb(255, 102, 0)');  // entity 2 color is orange
    });
})
