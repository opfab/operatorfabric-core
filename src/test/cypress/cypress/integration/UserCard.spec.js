/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
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

    it('Recipients should not be displayed in IT incident user card', () => {

      cy.loginOpFab('operator1_fr', 'test');
      cy.get('#opfab-navbarContent').find('#opfab-newcard-menu').click();
      cy.get("of-usercard").should('exist');
      cy.get("#of-usercard-service-selector").find('select').select('User card examples');
      cy.get("#opfab-state-filter").find('select').select('IT Incident');
      cy.get('#opfab-recipients').should("not.exist");
    })



    it('Recipients dropdown should not be displayed in Tasks user card', () => {

      cy.loginOpFab('operator1_fr', 'test');
      cy.get('#opfab-navbarContent').find('#opfab-newcard-menu').click();
      cy.get("of-usercard").should('exist');
      cy.get("#of-usercard-service-selector").find('select').select('User card examples');
      cy.get("#of-usercard-process-filter").find('select').select('Examples for new cards 3');
      cy.get('#opfab-recipients').should("not.exist");
    })


  })

  describe('Fields visiblity', function () {

    it('Severity  choice should not be displayed in Question user card', () => {

      cy.loginOpFab('operator1_fr', 'test');
      cy.get('#opfab-navbarContent').find('#opfab-newcard-menu').click();
      cy.get("of-usercard").should('exist');
      cy.get("#of-usercard-service-selector").find('select').select('User card examples');
      cy.get("#of-usercard-process-filter").find('select').select('Examples for new cards 2');
      cy.get("#opfab-state-filter").find('select').select('Message');
      cy.get('#opfab-usercard-severity-choice').should("exist");
      cy.get("#opfab-state-filter").find('select').select('Question');
      cy.get('#opfab-usercard-severity-choice').should("not.exist");
    })

    it('No date choice displayed in IT Incident user card', () => {

      cy.loginOpFab('operator1_fr', 'test');
      cy.get('#opfab-navbarContent').find('#opfab-newcard-menu').click();
      cy.get("of-usercard").should('exist');
      cy.get("#of-usercard-service-selector").find('select').select('User card examples');
      cy.get("#opfab-state-filter").find('select').select('IT Incident');
      cy.get('#opfab-usercard-startdate-choice').should("not.exist");
      cy.get('#opfab-usercard-enddate-choice').should("not.exist");
      cy.get('#opfab-usercard-lttd-choice').should("not.exist");
    })

    it('All  dates choices should be displayed in Question user card', () => {

      cy.loginOpFab('operator1_fr', 'test');
      cy.get('#opfab-navbarContent').find('#opfab-newcard-menu').click();
      cy.get("of-usercard").should('exist');
      cy.get("#of-usercard-service-selector").find('select').select('User card examples');
      cy.get("#of-usercard-process-filter").find('select').select('Examples for new cards 2');;
      cy.get("#opfab-state-filter").find('select').select('Question');
      cy.get('#opfab-usercard-startdate-choice').should("exist");
      cy.get('#opfab-usercard-enddate-choice').should("exist");
      cy.get('#opfab-usercard-lttd-choice').should("exist");
    })

    it('Only start dates choices should be displayed in Message user card', () => {

      cy.loginOpFab('operator1_fr', 'test');
      cy.get('#opfab-navbarContent').find('#opfab-newcard-menu').click();
      cy.get("of-usercard").should('exist');
      cy.get("#of-usercard-service-selector").find('select').select('User card examples');
      cy.get("#of-usercard-process-filter").find('select').select('Examples for new cards 2');;
      cy.get("#opfab-state-filter").find('select').select('Message');
      cy.get('#opfab-usercard-startdate-choice').should("exist");
      cy.get('#opfab-usercard-enddate-choice').should("not.exist");
      cy.get('#opfab-usercard-lttd-choice').should("not.exist");
    })
  })

  describe('Show automated response in preview for some user cards', function () {

    it('Show automated response in preview for Confirmation user card if user enabled to respond', () => {

      cy.loginOpFab('operator1_fr', 'test');
      cy.get('#opfab-navbarContent').find('#opfab-newcard-menu').click();
      cy.get("of-usercard").should('exist');
      cy.get("#of-usercard-service-selector").find('select').select('User card examples');
      cy.get("#of-usercard-process-filter").find('select').select('Examples for new cards 2');
      cy.get("#opfab-state-filter").find('select').select('Confirmation');
      cy.get('#opfab-recipients').click();
      // Select recipent entity not in user entities
      cy.get('#opfab-recipients').find('li').eq(0).click();
      
      cy.get('#opfab-recipients').click();
      cy.get('#question').type('Confirm YES or NO');

      cy.get('#opfab-usercard-btn-prepareCard').click();
      cy.get("of-card-detail").should('exist');

      // No responses shown 
      cy.get("#childs-div").should('be.empty');
      // Cancel sending
      cy.get('#opfab-usercard-btn-refuse').click();

      cy.get('#opfab-recipients').click();
      // Select also one of user entities as recipent
      cy.get('#opfab-recipients').find('li').eq(1).click();
      cy.get('#opfab-recipients').click();

      cy.get('#opfab-usercard-btn-prepareCard').click();
      cy.get("of-card-detail").should('exist');

      // Feed preview show response from current entity
      cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity').should('exist');
      // Card preview show responses list
      cy.get("#childs-div").should('not.be.empty');
      // Response table has 1 header and 1 row 
      cy.get("#childs-div").find('tr').should('have.length', 2);
      // Send the card 
      cy.get('#opfab-usercard-btn-accept').click();
      // Check that the message indicating successful sending appears
      cy.get('.opfab-info-message').should('have.class', 'opfab-alert-info').contains("Your card is published");
      cy.get('of-light-card').should('have.length', 1);
      // Feed light card show response from current entity
      cy.get('of-light-card').eq(0).find('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity').should('exist');
      cy.get('of-light-card').eq(0).click()
        .find('[id^=opfab-feed-light-card]')
        .invoke('attr', 'data-urlId')
        .then((urlId) => {
          cy.hash().should('eq', '#/feed/cards/' + urlId);
          cy.get('of-card-details').find('of-detail');
          cy.get("#childs-div").should('not.be.empty');
          // Response table has 1 header and 1 row 
          cy.get("#childs-div").find('tr').should('have.length', 2);
        });

    })


  })

  describe('Send user card', function () {

    before('Delete previous cards', function () {
      cy.deleteAllCards();
      cy.deleteAllArchivedCards();
    });

    it('Send User card from operator1_fr', () => {

      cy.loginOpFab('operator1_fr', 'test');

      cy.get('of-light-card').should('have.length', 0);

      cy.get('#opfab-navbarContent').find('#opfab-newcard-menu').click();
      cy.get("of-usercard").should('exist');
      cy.get('#message').type('Hello');
      cy.setFormDateTime('startDate','2020','Jan',20,8,0);
      cy.setFormDateTime('endDate','2029','Jun',25,11,10);
      cy.get('#opfab-recipients').click();
      cy.get('#opfab-recipients').find('li').eq(2).click();
      cy.get('#opfab-recipients').click();
      cy.get('#opfab-usercard-btn-prepareCard').click();
      // Validate sending of the card
      cy.get('#opfab-usercard-btn-accept').click();
      // Check that the message indicating successful sending appears
      cy.get('.opfab-info-message').should('have.class', 'opfab-alert-info').contains("Your card is published");
      cy.get('of-light-card').should('have.length', 1);
      cy.get('of-light-card').eq(0).click()
        .find('[id^=opfab-feed-light-card]')
        .invoke('attr', 'data-urlId')
        .then((urlId) => {
          cy.hash().should('eq', '#/feed/cards/' + urlId);
          cy.get('of-card-details').find('of-detail');
          cy.get('#opfab-div-card-template').find('div').eq(0).contains('Hello');
        });
    })



    it('Receive User card', () => {

      cy.loginOpFab('operator2_fr', 'test');

      cy.get('of-light-card').should('have.length', 1);
      cy.get('#opfab-lightcard-dates').contains('(08:00 20/01/2020 - 11:10 25/06/2029)');
      cy.get('of-light-card').eq(0).click()
        .find('[id^=opfab-feed-light-card]')
        .invoke('attr', 'data-urlId')
        .then((urlId) => {
          cy.hash().should('eq', '#/feed/cards/' + urlId);
          cy.get('of-card-details').find('of-detail');
          cy.get('#opfab-div-card-template').find('div').eq(0).contains('Hello');
        });
    })
  })


  describe('Edit user card', function () {

    it('Edit User card from operator1_fr', () => {

      cy.loginOpFab('operator1_fr', 'test');

      cy.get('of-light-card').should('have.length', 1);
      cy.get('of-light-card').eq(0).click()
        .find('[id^=opfab-feed-light-card]')
        .invoke('attr', 'data-urlId')
        .then((urlId) => {
          cy.waitDefaultTime();
          cy.hash().should('eq', '#/feed/cards/' + urlId);
          cy.get('#opfab-card-edit').click();
          cy.get("of-usercard").should('exist');
          cy.get('#message').should('be.visible').type(' World')
          cy.get('#opfab-usercard-btn-prepareCard').click();
          cy.get('#opfab-usercard-btn-accept').click();
          // Check that the message indicating successful sending appears
          cy.get('.opfab-info-message').should('have.class', 'opfab-alert-info').contains("Your card is published");
        });
    })


    it('Receive modified User card', () => {

      cy.loginOpFab('operator2_fr', 'test');

      cy.get('of-light-card').should('have.length', 1);
      cy.get('of-light-card').eq(0).click()
        .find('[id^=opfab-feed-light-card]')
        .invoke('attr', 'data-urlId')
        .then((urlId) => {
          cy.hash().should('eq', '#/feed/cards/' + urlId);
          cy.get('of-card-details').find('of-detail');
          cy.get('#opfab-div-card-template').find('div').eq(0).contains('Hello World');
        });
    })
  })


  describe('Delete user card', function () {

    it('Delete User card from operator1_fr', () => {

      cy.loginOpFab('operator1_fr', 'test');

      cy.get('of-light-card').should('have.length', 1);
      cy.get('of-light-card').eq(0).click()
        .find('[id^=opfab-feed-light-card]')
        .invoke('attr', 'data-urlId')
        .then((urlId) => {
          cy.hash().should('eq', '#/feed/cards/' + urlId);
          cy.get('#opfab-card-delete').click();
          cy.get('#opfab-card-details-delete-btn-confirm').click();
          cy.get('of-light-card').should('have.length', 0);
        });
    })

    it('User card is deleted for operator2_fr', () => {

      cy.loginOpFab('operator2_fr', 'test');
      cy.get('of-light-card').should('have.length', 0);
    })

  })

  describe('Entities allowed to edit card sent by user', function () {

    before('Set up configuration', function () {

      cy.deleteAllCards();
      cy.sendCard('cypress/userCard/process.json');

    });

    it('Edit card from allowed entity', () => {
      cy.loginOpFab('operator1_fr', 'test');
      cy.get('of-light-card').eq(0).click()
        .find('[id^=opfab-feed-light-card]')
        .invoke('attr', 'data-urlId')
        .then((urlId) => {
          cy.hash().should('eq', '#/feed/cards/' + urlId);
          cy.get('#opfab-card-edit').click();
          cy.get("of-usercard").should('exist');
          cy.get('#opfab-usercard-btn-prepareCard').click();
          cy.get('#opfab-usercard-btn-accept').click();
          // Check that the message indicating successful sending appears
          cy.get('.opfab-info-message').should('have.class', 'opfab-alert-info').contains("Your card is published");
        });
    })

    it('Cannot edit card from not allowed entity', () => {
      cy.loginOpFab('operator2_fr', 'test');
      cy.get('of-light-card').should('have.length', 1);
      cy.get('of-light-card').eq(0).click()
        .find('[id^=opfab-feed-light-card]')
        .invoke('attr', 'data-urlId')
        .then((urlId) => {
          cy.hash().should('eq', '#/feed/cards/' + urlId);
          cy.get('#opfab-card-edit').should('not.exist');
        });
    })


    it('Send User card with entitiesAllowedToEdit = "ENTITY_FR"', () => {
      cy.deleteAllCards();
      cy.loginOpFab('operator1_fr', 'test');

      cy.get('of-light-card').should('have.length', 0);

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
      cy.get('.opfab-info-message').should('have.class', 'opfab-alert-info').contains("Your card is published");
      cy.get('of-light-card').should('have.length', 1);
      cy.get('of-light-card').eq(0).click()
        .find('[id^=opfab-feed-light-card]')
        .invoke('attr', 'data-urlId')
        .then((urlId) => {
          cy.hash().should('eq', '#/feed/cards/' + urlId);
          cy.get('of-card-details').find('of-detail');
          cy.get('#opfab-div-card-template').find('div').eq(0).contains('Hello');
        });
    })

    it('Edit user card from allowed entity', () => {
      // card.entitiesAllowedToEdit = 'ENTITY_FR'
      cy.loginOpFab('operator2_fr', 'test');
      cy.get('of-light-card').eq(0).click()
        .find('[id^=opfab-feed-light-card]')
        .invoke('attr', 'data-urlId')
        .then((urlId) => {
          cy.hash().should('eq', '#/feed/cards/' + urlId);
          cy.get('#opfab-card-edit').click();
          cy.get("of-usercard").should('exist');
          cy.get('#opfab-usercard-btn-prepareCard').click();
          cy.get('#opfab-usercard-btn-accept').click();
          // Check that the message indicating successful sending appears
          cy.get('.opfab-info-message').should('have.class', 'opfab-alert-info').contains("Your card is published");
        });
    })

  })

  describe('Entities allowed to edit card sent by third party ', function () {

      before('Set up configuration', function () {

        cy.deleteAllCards();
        cy.sendCard('cypress/userCard/processSendByExternal.json');

      });

      it('Cannot edit card from not allowed entity', ()=>{
        cy.loginOpFab('operator2_fr','test');
        cy.get('of-light-card').should('have.length',1);
        cy.get('of-light-card').eq(0).click()
          .find('[id^=opfab-feed-light-card]')
          .invoke('attr', 'data-urlId')
          .then((urlId) => {
              cy.hash().should('eq', '#/feed/cards/'+urlId);
              cy.get('#opfab-card-edit').should('not.exist');
        });
      })

      it('Edit card from allowed entity', ()=>{
        cy.loginOpFab('operator1_fr','test');
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