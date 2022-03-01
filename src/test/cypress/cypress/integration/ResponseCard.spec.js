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

        // operator1_fr should see the card in the feed
        cy.get('of-light-card').should('have.length',1);

        // See in the feed the fact that user has not responded (no icon)
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

        // See in the feed the fact that user has responded (icon)
        cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity');

        //check the response has been integrated in the template 
        cy.get('#response_from_ENTITY1_FR').next().should("have.text", ' OK ')
                                           .next().should("have.text", ' NOK ')
                                           .next().should("have.text", ' NOK ');
        cy.get('#response_from_ENTITY2_FR').should('not.exist');
        cy.get('#response_from_ENTITY3_FR').should('not.exist');

        // check entities in card header 
        cy.get('#opfab-card-header-entity-ENTITY1_FR').should('have.css', 'color', 'rgb(0, 128, 0)'); // entity 1 color is green 
        cy.get('#opfab-card-header-entity-ENTITY2_FR').should('have.css', 'color', 'rgb(255, 102, 0)'); // entity 2 color is orange

        // update card 
        cy.sendCard('defaultProcess/question.json');

         // See in the feed the fact that user has not responded (no icon)
         cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity').should('not.exist');

         // Respond  to the new card 
         
         cy.get('#opfab-card-details-btn-response').should('have.text', 'SEND RESPONSE');

         cy.waitDefaultTime(); // to avoid detach dom error, we need to wait the new template has been rendered
         cy.get('#question-choice3').click(); 
         cy.get('#opfab-card-details-btn-response').click();

        cy.get('#response_from_ENTITY1_FR').next().should("have.text", ' NOK ')
                                           .next().should("have.text", ' NOK ')
                                           .next().should("have.text", ' OK ');
        cy.get('#response_from_ENTITY2_FR').should('not.exist');
        cy.get('#response_from_ENTITY3_FR').should('not.exist');
         
        // See in the feed the fact that user has responded (icon)
        cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity');
    });




    it('Check card response for operator2_fr ', function () {

        cy.loginOpFab('operator2_fr','test');

        // operator2_fr should see the card in the feed
        cy.get('of-light-card').should('have.length',1);

        // See in the feed the fact that user has not responded (no icon)
        cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity').should('not.exist');

        // Click on the card
        cy.get('of-light-card').eq(0).click();

        // Check the correct rendering of card 
        cy.get('#question-choice2');

        // Check the response from ENTITY1_FR has been integrated in the template 
        cy.get('#response_from_ENTITY1_FR').next().should("have.text", ' NOK ')
                                           .next().should("have.text", ' NOK ')
                                           .next().should("have.text", ' OK ');
        cy.get('#response_from_ENTITY2_FR').should('not.exist');
        cy.get('#response_from_ENTITY3_FR').should('not.exist');

        // check entities in card header 
        cy.get('#opfab-card-header-entity-ENTITY1_FR').should('have.css', 'color', 'rgb(0, 128, 0)'); // entity 1 color is green 
        cy.get('#opfab-card-header-entity-ENTITY2_FR').should('have.css', 'color', 'rgb(255, 102, 0)'); // entity 2 color is orange

        // Response button is present 
        cy.get('#opfab-card-details-btn-response');
            
        // Respond to the card
        cy.get('#question-choice2').click();
        cy.get('#opfab-card-details-btn-response').click();

        // See in the feed the fact that user has responded (icon)
        cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity');

        // Check the response from current user has been integrated in the template 
        cy.get('#response_from_ENTITY1_FR').next().should("have.text", ' NOK ')
                                           .next().should("have.text", ' NOK ')
                                           .next().should("have.text", ' OK ');
        cy.get('#response_from_ENTITY2_FR').next().should("have.text", ' NOK ')
                                           .next().should("have.text", ' OK ')
                                           .next().should("have.text", ' NOK ');
        cy.get('#response_from_ENTITY3_FR').should('not.exist');

        // check entities in card header 
        cy.get('#opfab-card-header-entity-ENTITY1_FR').should('have.css', 'color', 'rgb(0, 128, 0)'); // entity 1 color is green 
        cy.get('#opfab-card-header-entity-ENTITY2_FR').should('have.css', 'color', 'rgb(0, 128, 0)'); // entity 2 color is green
    })


    // operator4_fr is member of ENTITY1_FR, ENTITY2_FR, ENTITY3_FR and ENTITY4_FR and the question card sent can be responded by
    // ENTITY1_FR, ENTITY2_FR, ENTITY3_FR
    it('Check card response for operator4_fr ', function () {

        cy.loginOpFab('operator4_fr','test');

        // operator4_fr should see the card in the feed
        cy.get('of-light-card').should('have.length',1);

        // See in the feed the fact that someone from ENTITY1_FR has already responded (icon present)
        cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity').should('exist');

        // Click on the card
        cy.get('of-light-card').eq(0).click();

        // Check the correct rendering of card
        cy.get('#question-choice2');

        // Check the response from ENTITY1_FR and ENTITY2_FR have been integrated in the template
        cy.get('#response_from_ENTITY1_FR').next().should("have.text", ' NOK ')
                                           .next().should("have.text", ' NOK ')
                                           .next().should("have.text", ' OK ');
        cy.get('#response_from_ENTITY2_FR').next().should("have.text", ' NOK ')
                                           .next().should("have.text", ' OK ')
                                           .next().should("have.text", ' NOK ');
        cy.get('#response_from_ENTITY3_FR').should('not.exist');

        // check entities in card header
        cy.get('#opfab-card-header-entity-ENTITY1_FR').should('have.css', 'color', 'rgb(0, 128, 0)'); // entity 1 color is green
        cy.get('#opfab-card-header-entity-ENTITY2_FR').should('have.css', 'color', 'rgb(0, 128, 0)'); // entity 2 color is green

        // Response button is present (modify response), we click it
        cy.get('#opfab-card-details-btn-response').click();

        // Respond to the card
        cy.get('#question-choice3').click();
        cy.get('#opfab-card-details-btn-response').click(); // click again to send the response

        // Check the popup for the entity choice is displayed
        cy.get("#opfab-card-details-entity-choice-selector").should('exist');
        cy.get('#opfab-card-details-entity-choice-selector').find('option').should("have.length", 3);
        cy.get('#opfab-card-details-entity-choice-selector').find('option').eq(0).should("have.text", "Control Center FR East");
        cy.get('#opfab-card-details-entity-choice-selector').find('option').eq(1).should("have.text", "Control Center FR North");
        cy.get('#opfab-card-details-entity-choice-selector').find('option').eq(2).should("have.text", "Control Center FR South");

        // We choose ENTITY3_FR (East)
        cy.get("#opfab-card-details-entity-choice-selector").find('select').select('Control Center FR East');
        cy.get('#opfab-card-details-entity-choice-btn-confirm').click();

        // Check the response from ENTITY1_FR, ENTITY2_FR and ENTITY3_FR have been integrated in the template
        cy.get('#response_from_ENTITY1_FR').next().should("have.text", ' NOK ')
                                           .next().should("have.text", ' NOK ')
                                           .next().should("have.text", ' OK ');
        cy.get('#response_from_ENTITY2_FR').next().should("have.text", ' NOK ')
                                           .next().should("have.text", ' OK ')
                                           .next().should("have.text", ' NOK ');
        cy.get('#response_from_ENTITY3_FR').next().should("have.text", ' NOK ')
                                           .next().should("have.text", ' NOK ')
                                           .next().should("have.text", ' OK ');

        // operator4_fr updates the answer of ENTITY1_FR
        cy.get('#opfab-card-details-btn-response').click(); // button "modify response"
        cy.get('#question-choice1').click();
        cy.get('#question-choice3').click(); //to uncheck the box
        cy.get('#opfab-card-details-btn-response').click(); // click again to send the response
        cy.get("#opfab-card-details-entity-choice-selector").find('select').select('Control Center FR North'); // We choose ENTITY1_FR (North)
        cy.get('#opfab-card-details-entity-choice-btn-confirm').click();

        cy.waitDefaultTime();
        // Check the response from ENTITY1_FR has been updated and the other responses are still the same
        cy.get('#response_from_ENTITY1_FR').next().should("have.text", ' OK ')
                                           .next().should("have.text", ' NOK ')
                                           .next().should("have.text", ' NOK ');
        cy.get('#response_from_ENTITY2_FR').next().should("have.text", ' NOK ')
                                           .next().should("have.text", ' OK ')
                                           .next().should("have.text", ' NOK ');
        cy.get('#response_from_ENTITY3_FR').next().should("have.text", ' NOK ')
                                           .next().should("have.text", ' NOK ')
                                           .next().should("have.text", ' OK ');

        // operator4_fr disconnect from ENTITY_1_FR and ENTITY2_FR (the popup for entity choice must not be displayed)
        // because the only one entity allowed to respond for him is now ENTITY3_FR
        cy.get('#opfab-navbar-drop_user_menu').click();
        cy.get('#opfab-navbar-right-menu-activityarea').click();
        cy.get('.opfab-checkbox').contains('Control Center FR North').click();
        cy.get('.opfab-checkbox').contains('Control Center FR South').click();
        cy.get('#opfab-activityarea-btn-confirm').should('exist').click(); // click confirm settings
        cy.get('#opfab-activityarea-btn-yes').should('exist').click(); // and click yes on the confirmation popup
        cy.waitDefaultTime();
        cy.get('#opfab-navbar-menu-feed').click({force: true}); // go back to feed
        cy.get('of-light-card').eq(0).click(); // click the card
        cy.get('#opfab-card-details-btn-response').click(); // button "modify response"
        cy.get('#question-choice2').click(); // to check the box
        cy.get('#opfab-card-details-btn-response').click(); // click again to send the response
        cy.get("#opfab-card-details-entity-choice-selector").should('not.exist'); // entity choice popup must not be displayed
        cy.waitDefaultTime();
        // Check the response from ENTITY3_FR (East) has been updated and the other responses are still the same
        cy.get('#response_from_ENTITY1_FR').next().should("have.text", ' OK ')
                                           .next().should("have.text", ' NOK ')
                                           .next().should("have.text", ' NOK ');
        cy.get('#response_from_ENTITY2_FR').next().should("have.text", ' NOK ')
                                           .next().should("have.text", ' OK ')
                                           .next().should("have.text", ' NOK ');
        cy.get('#response_from_ENTITY3_FR').next().should("have.text", ' NOK ')
                                           .next().should("have.text", ' OK ')
                                           .next().should("have.text", ' NOK ');

        // We reconnect operator4_fr to ENTITY1_FR, ENTITY2_FR
        cy.get('#opfab-navbar-drop_user_menu').click();
        cy.get('#opfab-navbar-right-menu-activityarea').click();
        cy.get('.opfab-checkbox').contains('Control Center FR South').click();
        cy.get('.opfab-checkbox').contains('Control Center FR North').click();
        cy.get('#opfab-activityarea-btn-confirm').should('exist').click(); // click confirm settings
        cy.get('#opfab-activityarea-btn-yes').should('exist').click(); // and click yes on the confirmation popup
    })


    it('Check itsupervisor1 see the card but cannot respond ', function () {

        cy.loginOpFab('itsupervisor1','test');

        // operator1_fr should see the card in their feed
        cy.get('of-light-card').should('have.length',1);

        // See in the feed the fact that user has not responded (no icon)
        cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity').should('not.exist');

        // Click on the card
        cy.get('of-light-card').eq(0).click();

        // Check the correct rendering of card 
        cy.get('#question-choice2');

        // Check the response from ENTITY1_FR and ENTITY2_FR has been integrated in the template 
        cy.get('#response_from_ENTITY1_FR').next().should("have.text", ' OK ')
                                           .next().should("have.text", ' NOK ')
                                           .next().should("have.text", ' NOK ');
        cy.get('#response_from_ENTITY2_FR').next().should("have.text", ' NOK ')
                                           .next().should("have.text", ' OK ')
                                           .next().should("have.text", ' NOK ');
        cy.get('#response_from_ENTITY3_FR').next().should("have.text", ' NOK ')
                                           .next().should("have.text", ' OK ')
                                           .next().should("have.text", ' NOK ');
        
        // check entities in card header 
        cy.get('#opfab-card-header-entity-ENTITY1_FR').should('have.css', 'color', 'rgb(0, 128, 0)'); // entity 1 color is green 
        cy.get('#opfab-card-header-entity-ENTITY2_FR').should('have.css', 'color', 'rgb(0, 128, 0)'); // entity 2 color is green
        
        // Response button is not present 
        cy.get('#opfab-card-details-btn-response').should('not.exist');
        
    })

    it ('Check response for operator1_fr is still present after update of card with keepChildCard=true re-logging',function () {
        cy.sendCard('defaultProcess/questionWithKeepChildCards.json');

        cy.loginOpFab('operator1_fr','test');
        // See in the feed the fact that user has responded (icon)
        cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity');

        // Click on the card
        cy.get('of-light-card').eq(0).click();

        // Check the correct rendering of card
        cy.get('#question-choice2');
 
        // Check the old responses from ENTITY1_FR, ENTITY2_FR and ENTITY3_FR have been integrated in the template
        cy.get('#response_from_ENTITY1_FR').next().should("have.text", ' OK ')
                                           .next().should("have.text", ' NOK ')
                                           .next().should("have.text", ' NOK ');
        cy.get('#response_from_ENTITY2_FR').next().should("have.text", ' NOK ')
                                           .next().should("have.text", ' OK ')
                                           .next().should("have.text", ' NOK ');
        cy.get('#response_from_ENTITY3_FR').next().should("have.text", ' NOK ')
                                           .next().should("have.text", ' OK ')
                                           .next().should("have.text", ' NOK ');

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
 
         // Check the old responses from ENTITY1_FR, ENTITY2_FR and ENTITY3_FR have not been integrated in the template
         cy.get('#response_from_ENTITY1_FR').should('not.exist');
         cy.get('#response_from_ENTITY2_FR').should('not.exist');
         cy.get('#response_from_ENTITY3_FR').should('not.exist');

        // check entities in card header 
        cy.get('#opfab-card-header-entity-ENTITY1_FR').should('have.css', 'color', 'rgb(255, 102, 0)');// entity 1 color is orange 
        cy.get('#opfab-card-header-entity-ENTITY2_FR').should('have.css', 'color', 'rgb(255, 102, 0)');  // entity 2 color is orange
    });
})
