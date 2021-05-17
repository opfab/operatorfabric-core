
describe ('Response card tests',function () {

    before('Set up configuration', function () {
        cy.loadTestConf();
        cy.deleteTestCards();
        cy.sendCard('defaultProcess/question.json');
    });

    after('Clean', function () {
        cy.deleteTestCards();
    });


    it('Check card response for operator 1 ', function () {

        cy.loginOpFab('operator1','test');

        // operator1 should see the card in their feed
        cy.get('of-light-card').should('have.length',1);

        // See in the feed the fact that user has not respond (no icon)
        cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity').should('not.exist');

        // Click on the card
        cy.get('of-light-card').eq(0).click();
        
        // Check the correct rendering of card 
        cy.get('#question-choice1');
        // Response button is present 
        cy.get('#opfab-card-details-btn-response');
            
        // Respond to the card 
        cy.get('#question-choice1').click();
        cy.get('#opfab-card-details-btn-response').click();

        // See in the feed the fact that user has respond (icon)
        cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity');

        //check the response has been integrated in the template 
        cy.get('#response_from_ENTITY1');

        // update card 
        cy.sendCard('defaultProcess/question.json');

         // See in the feed the fact that user has not respond (no icon)
         cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity').should('not.exist');

         // Respond  to the new card 
         cy.get('#question-choice3').click();
         cy.get('#opfab-card-details-btn-response').click();
         
        // See in the feed the fact that user has respond (icon)
        cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity');
    })

    it('Check card response for operator 2 ', function () {

        cy.loginOpFab('operator2','test');

        // operator1 should see the card in their feed
        cy.get('of-light-card').should('have.length',1);

        // See in the feed the fact that user has not respond (no icon)
        cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity').should('not.exist');

        // Click on the card
        cy.get('of-light-card').eq(0).click();

        // Check the correct rendering of card 
        cy.get('#question-choice2');

        // Check the response from ENTITY1 has been integrated in the template 
        cy.get('#response_from_ENTITY1');
        
        // Response button is present 
        cy.get('#opfab-card-details-btn-response');
            
        // Respond to the card
        cy.get('#question-choice2').click();
        cy.get('#opfab-card-details-btn-response').click();

        // See in the feed the fact that user has respond (icon)
        cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity');

        // Check the response from current user has been integrated in the template 
        cy.get('#response_from_ENTITY2');
    })


    it('Check operator 4 see the card but cannot respond ', function () {

        cy.loginOpFab('operator4','test');

        // operator1 should see the card in their feed
        cy.get('of-light-card').should('have.length',1);

        // See in the feed the fact that user has not respond (no icon)
        cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity').should('not.exist');

        // Click on the card
        cy.get('of-light-card').eq(0).click();

        // Check the correct rendering of card 
        cy.get('#question-choice2');

        // Check the response from ENTITY1 and ENTITY2 has been integrated in the template 
        cy.get('#response_from_ENTITY1');
        cy.get('#response_from_ENTITY2');
        
        // Response button is not present 
        cy.get('#opfab-card-details-btn-response').should('not.exist');
        
    })
})
