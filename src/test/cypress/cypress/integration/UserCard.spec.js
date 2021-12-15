/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

describe('User Card ', function () {

    before('Set up configuration', function () {

        cy.resetUIConfigurationFiles();
        cy.loadTestConf();
        cy.deleteAllCards();
        cy.deleteAllArchivedCards();       
    });


    describe('Recipients dropdown should not be displayed for some user cards', function () {

      it('Recipients should not be displayed in IT incident user card', ()=>{
  
        cy.loginOpFab('operator1','test');

        cy.get('of-light-card').should('have.length',0);
  
        cy.get('#opfab-navbarContent').find('#opfab-newcard-menu').click();
        cy.get("of-usercard").should('exist'); 
        cy.get("#of-usercard-service-selector").find('select').select('User card examples');
        cy.get("#opfab-state-filter").find('select').select('IT Incident');

        cy.get('#opfab-recipients').should("not.exist");
      })



      it('Recipients dropdown should not be displayed in Tasks user card', ()=>{
  
        cy.loginOpFab('operator1','test');

        cy.get('of-light-card').should('have.length',0);
  
        cy.get('#opfab-navbarContent').find('#opfab-newcard-menu').click();
        cy.get("of-usercard").should('exist'); 
        cy.get("#of-usercard-service-selector").find('select').select('User card examples');
        cy.get("#of-usercard-process-filter").find('select').select('Examples for new cards 3');

        cy.get('#opfab-recipients').should("not.exist");
      })
      
      
  })

    describe('Send user card', function () {

        it('Send User card from operator1', ()=>{
    
          cy.loginOpFab('operator1','test');

          cy.get('of-light-card').should('have.length',0);
    
          cy.get('#opfab-navbarContent').find('#opfab-newcard-menu').click();
          cy.get("of-usercard").should('exist'); 
          cy.get('#message').type('Hello')
          cy.get('#opfab-recipients').click();
          cy.get('#opfab-recipients').find('li').eq(2).click();
          cy.get('#opfab-recipients').click();
          cy.get('#opfab-usercard-btn-prepareCard').click();
          // Validate sending of the card
          cy.get('#opfab-usercard-btn-accept').click();
          // Check that the message indicating successful sending appears
          cy.get('.opfab-info-message').should('have.class','opfab-alert-info').contains("Your card is published");
          cy.get('of-light-card').should('have.length',1);
          cy.get('of-light-card').eq(0).click()
          .find('[id^=opfab-feed-light-card]')
          .invoke('attr', 'data-urlId')
          .then((urlId) => {
              cy.hash().should('eq', '#/feed/cards/'+urlId);
              cy.get('of-card-details').find('of-detail');
              cy.get('#opfab-div-card-template').find('div').eq(0).contains('Hello');
          });
        })


    
        it('Receive User card', ()=>{
    
          cy.loginOpFab('operator2','test');

          cy.get('of-light-card').should('have.length',1);
          cy.get('of-light-card').eq(0).click()
          .find('[id^=opfab-feed-light-card]')
          .invoke('attr', 'data-urlId')
          .then((urlId) => {
              cy.hash().should('eq', '#/feed/cards/'+urlId);
              cy.get('of-card-details').find('of-detail');
              cy.get('#opfab-div-card-template').find('div').eq(0).contains('Hello');
          });
        })
      })


    describe('Edit user card', function () {

      it('Edit User card from operator1', ()=>{
  
        cy.loginOpFab('operator1','test');

        cy.get('of-light-card').should('have.length',1);
          cy.get('of-light-card').eq(0).click()
          .find('[id^=opfab-feed-light-card]')
          .invoke('attr', 'data-urlId')
          .then((urlId) => {
              cy.waitDefaultTime();
              cy.hash().should('eq', '#/feed/cards/'+urlId);
              cy.get('#opfab-card-edit').click();
              cy.get("of-usercard").should('exist');
              cy.get('#message').should('be.visible').type(' World')
              cy.get('#opfab-usercard-btn-prepareCard').click();
              cy.get('#opfab-usercard-btn-accept').click();
              // Check that the message indicating successful sending appears
              cy.get('.opfab-info-message').should('have.class','opfab-alert-info').contains("Your card is published");
              cy.get('#opfab-div-card-template').find('div').eq(0).contains('Hello World');

        });
      })
      
      
      it('Receive modified User card', ()=>{
    
        cy.loginOpFab('operator2','test');

        cy.get('of-light-card').should('have.length',1);
        cy.get('of-light-card').eq(0).click()
        .find('[id^=opfab-feed-light-card]')
        .invoke('attr', 'data-urlId')
        .then((urlId) => {
            cy.hash().should('eq', '#/feed/cards/'+urlId);
            cy.get('of-card-details').find('of-detail');
            cy.get('#opfab-div-card-template').find('div').eq(0).contains('Hello World');
        });
      })
    })


    describe('Delete user card', function () {

      it('Delete User card from operator1', ()=>{
  
        cy.loginOpFab('operator1','test');

        cy.get('of-light-card').should('have.length',1);
          cy.get('of-light-card').eq(0).click()
          .find('[id^=opfab-feed-light-card]')
          .invoke('attr', 'data-urlId')
          .then((urlId) => {
              cy.hash().should('eq', '#/feed/cards/'+urlId);
              cy.get('#opfab-card-delete').click();
              cy.get('#opfab-card-details-delete-btn-confirm').click();
              cy.get('of-light-card').should('have.length',0);
        });
      })
      
      it('User card is deleted for operator2', ()=>{
    
        cy.loginOpFab('operator2','test');
        cy.get('of-light-card').should('have.length',0);
      })
      
    })

    describe('Entities allowed to edit card', function () {

      before('Set up configuration', function () {

        cy.deleteAllCards();
        cy.deleteAllArchivedCards();
        cy.sendCard('cypress/userCard/process.json');

      });

      it('Edit card from allowed entity', ()=>{
        cy.loginOpFab('operator1','test');
        cy.get('of-light-card').eq(0).click()
          .find('[id^=opfab-feed-light-card]')
          .invoke('attr', 'data-urlId')
          .then((urlId) => {
            cy.hash().should('eq', '#/feed/cards/'+urlId);
            cy.get('#opfab-card-edit').click();
            cy.get("of-usercard").should('exist');
            cy.get('#opfab-usercard-btn-prepareCard').click();
            cy.get('#opfab-usercard-btn-accept').click();
            // Check that the message indicating successful sending appears
            cy.get('.opfab-info-message').should('have.class','opfab-alert-info').contains("Your card is published");
        });
      })
      
      it('Cannot edit card from not allowed entity', ()=>{
        cy.loginOpFab('operator2','test');
        cy.get('of-light-card').should('have.length',1);
        cy.get('of-light-card').eq(0).click()
          .find('[id^=opfab-feed-light-card]')
          .invoke('attr', 'data-urlId')
          .then((urlId) => {
              cy.hash().should('eq', '#/feed/cards/'+urlId);
              cy.get('#opfab-card-edit').should('not.exist');
        });
      })


      it('Send User card with entitiesAllowedToEdit = "ALLCONTROLROOMS"', ()=>{
        cy.deleteAllCards();
        cy.loginOpFab('operator1','test');

        cy.get('of-light-card').should('have.length',0);
  
        cy.get('#opfab-navbarContent').find('#opfab-newcard-menu').click();
        cy.get("of-usercard").should('exist'); 
        cy.get('#message').type('Hello')
        cy.get('#opfab-recipients').click();
        cy.get('#opfab-recipients').find('li').eq(2).click();
        cy.get('#opfab-recipients').click();
        cy.get('#opfab-usercard-btn-prepareCard').click();
        // Validate sending of the card
        cy.get('#opfab-usercard-btn-accept').click();
        // Check that the message indicating successful sending appears
        cy.get('.opfab-info-message').should('have.class','opfab-alert-info').contains("Your card is published");
        cy.get('of-light-card').should('have.length',1);
        cy.get('of-light-card').eq(0).click()
        .find('[id^=opfab-feed-light-card]')
        .invoke('attr', 'data-urlId')
        .then((urlId) => {
            cy.hash().should('eq', '#/feed/cards/'+urlId);
            cy.get('of-card-details').find('of-detail');
            cy.get('#opfab-div-card-template').find('div').eq(0).contains('Hello');
        });
      })

      it('Edit user card from allowed entity', ()=>{
        // card.entitiesAllowedToEdit = 'ALLCONTROLROOMS'
        cy.loginOpFab('operator2','test');
        cy.get('of-light-card').eq(0).click()
          .find('[id^=opfab-feed-light-card]')
          .invoke('attr', 'data-urlId')
          .then((urlId) => {
            cy.hash().should('eq', '#/feed/cards/'+urlId);
            cy.get('#opfab-card-edit').click();
            cy.get("of-usercard").should('exist');
            cy.get('#opfab-usercard-btn-prepareCard').click();
            cy.get('#opfab-usercard-btn-accept').click();
            // Check that the message indicating successful sending appears
            cy.get('.opfab-info-message').should('have.class','opfab-alert-info').contains("Your card is published");
        });
      })

    })

})