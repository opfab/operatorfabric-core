/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

describe('User Card ', function () {

  function selectService(serviceName) {
    cy.get("of-usercard").should('exist');
    cy.get("#of-usercard-service-selector").find('select').select(serviceName);
    cy.get("#of-usercard-service-selector").find("option:selected").should("have.text", serviceName);
  }

  function selectProcess(processName) {
    cy.get("#of-usercard-process-filter").find('select').select(processName);
  }

  function selectState(stateName) {
    cy.get("#opfab-state-filter").find('select').select(stateName);
  }

  function prepareAndSendCard() {
    cy.get('#opfab-usercard-btn-prepareCard').click();
    cy.get("of-card-detail").should('exist');

    cy.get('#opfab-usercard-btn-accept').click();
  }

  before('Set up configuration', function () {

    cy.resetUIConfigurationFiles();
    cy.loadTestConf();
    cy.deleteAllCards();
    cy.deleteAllArchivedCards();
    cy.deleteAllSettings();
  });



  describe('Check edition mode', function () {

    it('Label change in edition mode for Question user card', () => {

      cy.loginOpFab('operator1_fr', 'test');
      cy.get('#opfab-navbarContent').find('#opfab-newcard-menu').click();
      selectService('User card examples');
      selectProcess('Examples for new cards 2');
      selectState('Question');
      cy.get('#label').should('not.have.text', 'QUESTION (New)');

      cy.get('#question').type('First question');

      prepareAndSendCard();

      // Check that the message indicating successful sending appears
      cy.get('.opfab-info-message').should('have.class', 'opfab-alert-info').contains("Your card is published");
      
    })

    it('Label change in edition mode for Question user card', () => {

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
          cy.get('#label').contains('QUESTION (New)');
        });
      
    })

  })

  describe('Recipients dropdown should not be displayed or restricted for some user cards', function () {

    it('Recipients dropdown should not be displayed in Tasks user card and only current user shall receive the card ', () => {

      cy.loginOpFab('operator1_fr', 'test');
      cy.get('#opfab-navbarContent').find('#opfab-newcard-menu').click();
      selectService('User card examples');
      selectProcess('Examples for new cards 3');
      cy.get('#opfab-recipients').should("not.exist");
      cy.get('#opfab-usercard-btn-prepareCard').click();
      cy.get('#opfab-entity-recipients').contains("You are the only recipient of this card");
    })

    it('Recipients should not be displayed in IT incident user card but set via template code', () => {

      cy.loginOpFab('operator1_fr', 'test');
      cy.get('#opfab-navbarContent').find('#opfab-newcard-menu').click();
      selectService('User card examples');
      selectState('IT Incident');
      cy.get('#opfab-recipients').should("not.exist");
      cy.get('#opfab-usercard-btn-prepareCard').click();
      cy.get('#opfab-entity-recipients').contains("French Control Centers");
      cy.get('#opfab-entity-recipients').contains("IT SUPERVISION CENTER");
    })

    it('Recipients dropdown should be restricted in message user card  - Deprecated method using state config ', () => {
      cy.loginOpFab('operator1_fr', 'test');
      cy.get('#opfab-navbarContent').find('#opfab-newcard-menu').click();
      selectProcess('Process example');
      selectState('Process example');
      cy.get('#opfab-recipients').should("exist");
      cy.get('#opfab-recipients').click();
      cy.get('#opfab-recipients').find('li').should('have.length', 6);
      cy.get('#opfab-recipients').find('li').eq(0).find('label').contains("Control Center FR East");
      cy.get('#opfab-recipients').find('li').eq(1).find('label').contains("Control Center FR North");
      cy.get('#opfab-recipients').find('li').eq(2).find('label').contains("Control Center FR South");
      cy.get('#opfab-recipients').find('li').eq(3).find('label').contains("Control Center FR West");
      cy.get('#opfab-recipients').find('li').eq(4).find('label').contains("French Control Centers");
      cy.get('#opfab-recipients').find('li').eq(5).find('label').contains("IT SUPERVISION CENTER");
    })


    it('Recipients dropdown should be restricted in message user card', () => {

      cy.loginOpFab('operator1_fr', 'test');
      cy.get('#opfab-navbarContent').find('#opfab-newcard-menu').click();
      selectService('User card examples');
      selectProcess('Examples for new cards 2');
      selectState('Message');
      cy.get('#opfab-recipients').should("exist");
      cy.get('#opfab-recipients').click();
      cy.get('#opfab-recipients').find('li').should('have.length', 7);
      cy.get('#opfab-recipients').find('li').eq(0).find('label').contains("Control Center FR East");
      cy.get('#opfab-recipients').find('li').eq(1).find('label').contains("Control Center FR North");
      cy.get('#opfab-recipients').find('li').eq(2).find('label').contains("Control Center FR South");
      cy.get('#opfab-recipients').find('li').eq(3).find('label').contains("Control Center FR West");
      cy.get('#opfab-recipients').find('li').eq(4).find('label').contains("French Control Centers");
      cy.get('#opfab-recipients').find('li').eq(5).find('label').contains("IT SUPERVISION CENTER");
      cy.get('#opfab-recipients').find('li').eq(6).find('label').contains("Italian Control Centers");
    })

  })

  describe('Fields visibility', function () {

    it('Severity choice should not be displayed in Question user card', () => {

      cy.loginOpFab('operator1_fr', 'test');
      cy.get('#opfab-navbarContent').find('#opfab-newcard-menu').click();
      selectService('User card examples');
      selectProcess('Examples for new cards 2');
      selectState('Message');
      cy.get('#opfab-usercard-severity-choice').should("exist");
      selectState('Question');
      cy.get('#opfab-usercard-severity-choice').should("not.exist");
      cy.get('#of-usercard-card-emitter-selector').should("not.exist");
    })

    it('No date choice displayed in IT Incident user card', () => {

      cy.loginOpFab('operator1_fr', 'test');
      cy.get('#opfab-navbarContent').find('#opfab-newcard-menu').click();
      selectService('User card examples');
      selectState('IT Incident');
      cy.get('#opfab-usercard-startdate-choice').should("not.exist");
      cy.get('#opfab-usercard-enddate-choice').should("not.exist");
      cy.get('#opfab-usercard-lttd-choice').should("not.exist");
      cy.get('#of-usercard-card-emitter-selector').should("not.exist");
    })

    it('All  dates choices should be displayed in Question user card', () => {

      cy.loginOpFab('operator1_fr', 'test');
      cy.get('#opfab-navbarContent').find('#opfab-newcard-menu').click();
      selectService('User card examples');
      selectProcess('Examples for new cards 2');;
      selectState('Question');
      cy.get('#opfab-usercard-startdate-choice').should("exist");
      cy.get('#opfab-usercard-enddate-choice').should("exist");
      cy.get('#opfab-usercard-lttd-choice').should("exist");
      cy.get('#of-usercard-card-emitter-selector').should("not.exist");
    })

    it('Only start dates choices should be displayed in Message user card', () => {

      cy.loginOpFab('operator1_fr', 'test');
      cy.get('#opfab-navbarContent').find('#opfab-newcard-menu').click();
      selectService('User card examples');
      selectProcess('Examples for new cards 2');;
      selectState('Message');
      cy.get('#opfab-usercard-startdate-choice').should("exist");
      cy.get('#opfab-usercard-enddate-choice').should("not.exist");
      cy.get('#opfab-usercard-lttd-choice').should("not.exist");
      cy.get('#of-usercard-card-emitter-selector').should("not.exist");
    })

    it('Process select should be displayed even if there is only one process', () => {

        cy.loginOpFab('operator1_fr', 'test');
        cy.get('#opfab-navbarContent').find('#opfab-newcard-menu').click();
        selectService('Base Examples');
        cy.get('#of-usercard-process-filter').should("exist");
        cy.get('#of-usercard-process-filter').find('option').should("have.length", 1);
        cy.get('#of-usercard-process-filter').find('option').eq(0).should("have.text", "Process example ");
    })
  })

  describe('Show automated response in preview for some user cards', function () {

    before('Delete previous cards', function () {
      cy.deleteAllCards();
      cy.deleteAllArchivedCards();
    });

    it('Show automated response in preview for Confirmation user card if user enabled to respond', () => {

      cy.loginOpFab('operator1_fr', 'test');
      cy.get('#opfab-navbarContent').find('#opfab-newcard-menu').click();
      selectService('User card examples');
      selectProcess('Examples for new cards 2');
      selectState('Confirmation');
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
      cy.waitDefaultTime(); // avoid detach dom error
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

      //Modify response and check it is taken into account when editing the card
      cy.get("#opfab-card-details-btn-response").click();
      cy.get("#resp_confirm").select('NO');
      cy.get("#resp_message").type('modified');
      cy.get("#opfab-card-details-btn-response").click();
      cy.get('#opfab-card-edit').click();
      cy.get("of-usercard").should('exist');
      cy.get('select#confirm option:selected').should('have.text', 'NO');
      cy.get("#message").should('have.value', 'modified');
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
      cy.get('#of-usercard-card-emitter-selector').should("not.exist");
      cy.get('#message').type('Hello, that\'s a test message / Result is <OK> & work done is 100%');
      cy.setFormDateTime('startDate','2020','Jan',20,8,0);
      cy.setFormDateTime('endDate','2029','Jun',25,11,10);
      cy.get('#opfab-recipients').click();
      cy.get('#opfab-recipients').find('li').eq(2).click();
      cy.get('#opfab-recipients').click();

      prepareAndSendCard();

      // Check that the message indicating successful sending appears
      cy.get('.opfab-info-message').should('have.class', 'opfab-alert-info').contains("Your card is published");
      cy.get('of-light-card').should('have.length', 1);
      cy.get('of-light-card').eq(0).click()
        .find('[id^=opfab-feed-light-card]')
        .invoke('attr', 'data-urlId')
        .then((urlId) => {
          cy.hash().should('eq', '#/feed/cards/' + urlId);
          cy.get('of-card-details').find('of-detail');
          cy.get('#opfab-div-card-template').find('div').eq(0).should('have.text', "\n  Hello, that's a test message / Result is <OK> & work done is 100%\n");
          cy.get('#opfab-card-title').should('have.text', "Message");
          cy.get('#opfab-selected-card-summary').should('have.text', "Message received :   Hello, that's a test message / Result is <OK> & work done is 100%");
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
          cy.get('#opfab-div-card-template').find('div').eq(0).should('have.text', "\n  Hello, that's a test message / Result is <OK> & work done is 100%\n");
          cy.get('#opfab-card-title').should('have.text', "Message");
          cy.get('#opfab-selected-card-summary').should('have.text', "Message received :   Hello, that's a test message / Result is <OK> & work done is 100%");
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
          cy.get('#of-usercard-card-emitter-selector').should("not.exist");
          cy.get('#message').should('be.visible').type(' (updated)')
          prepareAndSendCard();
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
          cy.get('#opfab-div-card-template').find('div').eq(0).should('have.text', "\n   Hello, that's a test message / Result is <OK> & work done is 100%  (updated)\n");
          cy.get('#opfab-card-title').should('have.text', "Message");
          cy.get('#opfab-selected-card-summary').should('have.text', "Message received :    Hello, that's a test message / Result is <OK> & work done is 100%  (updated)");
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
          prepareAndSendCard();
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
      prepareAndSendCard();
      // Check that the message indicating successful sending appears
      cy.get('.opfab-info-message').should('have.class', 'opfab-alert-info').contains("Your card is published");
      cy.get('of-light-card').should('have.length', 1);
      cy.get('of-light-card').eq(0).click()
        .find('[id^=opfab-feed-light-card]')
        .invoke('attr', 'data-urlId')
        .then((urlId) => {
          cy.hash().should('eq', '#/feed/cards/' + urlId);
          cy.get('of-card-details').find('of-detail');
          cy.get('#opfab-div-card-template').find('div').eq(0).should('have.text', '\n  Hello\n')
          cy.get('#opfab-card-title').should('have.text', 'Message')
          cy.get('#opfab-selected-card-summary').should('have.text', "Message received :   Hello");
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
          prepareAndSendCard();
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
            prepareAndSendCard();
            // Check that the message indicating successful sending appears
            cy.get('.opfab-info-message').should('have.class','opfab-alert-info').contains("Your card is published");
        });
      })

  })


  describe('Show responses in card preview when keepChildCards=true ', function () {

    it('Send User card with keepChildCards=true', () => {
      cy.deleteAllCards();
      cy.loginOpFab('operator1_fr', 'test');

      cy.get('of-light-card').should('have.length', 0);

      cy.get('#opfab-navbarContent').find('#opfab-newcard-menu').click();
      selectService('User card examples');
      selectState('IT Incident');
      prepareAndSendCard();
      // Check that the message indicating successful sending appears
      cy.get('.opfab-info-message').should('have.class', 'opfab-alert-info').contains("Your card is published");
      cy.get('of-light-card').should('have.length', 1);
    })

    it('Respond as operator2_fr', () => {
      cy.loginOpFab('operator2_fr', 'test');

      cy.get('of-light-card').should('have.length', 1);

      // Click on the card
      cy.get('of-light-card').eq(0).click();

      // template is ready
      cy.get("#services").should('exist');
      // Respond to the card 
      cy.get('#opfab-card-details-btn-response').click();
    })

    it('Edit card and check card preview show the response', ()=>{
      cy.loginOpFab('operator1_fr','test');
      cy.get('of-light-card').eq(0).click()
        .find('[id^=opfab-feed-light-card]')
        .invoke('attr', 'data-urlId')
        .then((urlId) => {
          cy.hash().should('eq', '#/feed/cards/'+urlId);
          cy.get('#opfab-card-edit').click();
          cy.get("of-usercard").should('exist');
          cy.get('#opfab-usercard-btn-prepareCard').click();
          // Card preview show responses list
          cy.get("#childs-div").should('not.be.empty');
          // Response table has 1 header and 1 row 
          cy.get("#childs-div").find('tr').should('have.length', 2);

      });
    })
  })

  describe('Send user card with operator4_fr, member of several entities', function () {

    before('Delete previous cards', function () {
        cy.deleteAllCards();
        cy.deleteAllArchivedCards();
    });

    it('Send User card from operator4_fr', () => {
      cy.loginOpFab('operator4_fr', 'test');

      cy.get('of-light-card').should('have.length', 0);

      cy.get('#opfab-navbarContent').find('#opfab-newcard-menu').click();
      cy.get("of-usercard").should('exist');

      cy.get('#of-usercard-card-emitter-selector').should("exist");
      cy.get('#of-usercard-card-emitter-selector').find('label').should("have.text", "EMITTER");
      cy.get('#of-usercard-card-emitter-selector').find('option').should("have.length", 4);
      cy.get('#of-usercard-card-emitter-selector').find('option').eq(0).should("have.text", "Control Center FR East");
      cy.get('#of-usercard-card-emitter-selector').find('option').eq(1).should("have.text", "Control Center FR North");
      cy.get('#of-usercard-card-emitter-selector').find('option').eq(2).should("have.text", "Control Center FR South");
      cy.get('#of-usercard-card-emitter-selector').find('option').eq(3).should("have.text", "Control Center FR West");

      cy.get("#of-usercard-card-emitter-selector").find('select').select('Control Center FR South');
      cy.get('#message').type('Hello, that\'s a test message / Result is <OK> & work done is 100%');
      cy.setFormDateTime('startDate', '2020', 'Jan', 20, 8, 0);
      cy.setFormDateTime('endDate', '2029', 'Jun', 25, 11, 10);
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
            cy.get('#opfab-div-card-template').find('div').eq(0).should('have.text', "\n  Hello, that's a test message / Result is <OK> & work done is 100%\n");
            cy.get('#opfab-card-title').should('have.text', "Message");
            cy.get('#opfab-selected-card-summary').should('have.text', "Message received :   Hello, that's a test message / Result is <OK> & work done is 100%");
            cy.get('#opfab-form-entity').should('have.text', 'from\u00a0:\u00a0Control Center FR South');
        });
    })

    it('Edit User card and change card emitter', () => {

        cy.loginOpFab('operator4_fr', 'test');

        cy.get('of-light-card').should('have.length', 1);
        cy.get('of-light-card').eq(0).click()
            .find('[id^=opfab-feed-light-card]')
            .invoke('attr', 'data-urlId')
            .then((urlId) => {
                cy.waitDefaultTime();
                cy.hash().should('eq', '#/feed/cards/' + urlId);
                cy.get('#opfab-card-edit').click();
                cy.get("of-usercard").should('exist');

                // Check that card emitter is set to Control Center FR South
                cy.get('#of-usercard-card-emitter-selector').should("exist");
                cy.get('#of-usercard-card-emitter-selector').find('option:selected').should('have.text', 'Control Center FR South');

                // Now we choose Control Center FR North as card emitter
                cy.get("#of-usercard-card-emitter-selector").find('select').select('Control Center FR North');

                cy.get('#message').should('be.visible').type(' (updated)')
                cy.get('#opfab-usercard-btn-prepareCard').click();
                cy.get('#opfab-usercard-btn-accept').click();
                // Check that the message indicating successful sending appears
                cy.get('.opfab-info-message').should('have.class', 'opfab-alert-info').contains("Your card is published");
            });

        cy.waitDefaultTime();
        // Check that the new card emitter 'Control Center FR North' is taken into account
        cy.get('of-light-card').should('have.length', 1);
        cy.get('of-light-card').eq(0).click()
            .find('[id^=opfab-feed-light-card]')
            .invoke('attr', 'data-urlId')
            .then((urlId) => {
                cy.hash().should('eq', '#/feed/cards/' + urlId);
                cy.get('of-card-details').find('of-detail');
                cy.get('#opfab-div-card-template').find('div').eq(0).should('have.text', "\n   Hello, that's a test message / Result is <OK> & work done is 100%  (updated)\n");
                cy.get('#opfab-card-title').should('have.text', "Message");
                cy.get('#opfab-selected-card-summary').should('have.text', "Message received :    Hello, that's a test message / Result is <OK> & work done is 100%  (updated)");
                cy.get('#opfab-form-entity').should('have.text', 'from\u00a0:\u00a0Control Center FR North');
            });
    })

    it('Disconnect operator4_fr from Control Center FR North and check card emitter when editing previous user card', () => {
      cy.loginOpFab('operator4_fr', 'test');

      cy.get('of-light-card').should('have.length', 1);

      // operator4_fr disconnect from Control Center FR North (ENTITY1_FR)
      cy.get('#opfab-navbar-drop_user_menu').click();
      cy.get('#opfab-navbar-right-menu-activityarea').click();
      cy.get('.opfab-checkbox').contains('Control Center FR North').click();
      cy.get('#opfab-activityarea-btn-confirm').should('exist').click(); //click confirm settings
      cy.get('#opfab-activityarea-btn-yes').should('exist').click(); // and click yes on the confirmation popup

      // We go back to the feed
      cy.get('#opfab-navbar-menu-feed').click();
      cy.waitDefaultTime();
      cy.get('of-light-card').should('have.length', 1);
      cy.get('of-light-card').eq(0).click()
        .find('[id^=opfab-feed-light-card]')
        .invoke('attr', 'data-urlId')
        .then((urlId) => {
            cy.hash().should('eq', '#/feed/cards/' + urlId);
            cy.get('#opfab-card-edit').click();
            cy.get("of-usercard").should('exist');

            // Check that card emitter is set to Control Center FR East (default value)
            cy.get('#of-usercard-card-emitter-selector').should("exist");
            cy.get('#of-usercard-card-emitter-selector').find('option:selected').should('have.text', 'Control Center FR East');

            // Check that we have now only 3 entities available (instead of 4 because disconnected from ENTITY1_FR)
            cy.get('#of-usercard-card-emitter-selector').find('option').should("have.length", 3);
            cy.get('#of-usercard-card-emitter-selector').find('option').eq(0).should("have.text", "Control Center FR East");
            cy.get('#of-usercard-card-emitter-selector').find('option').eq(1).should("have.text", "Control Center FR South");
            cy.get('#of-usercard-card-emitter-selector').find('option').eq(2).should("have.text", "Control Center FR West");
            cy.get('#opfab-usercard-btn-cancel').click();
        });

      // We reconnect to Control Center FR North (ENTITY1_FR)
      cy.get('#opfab-navbar-drop_user_menu').click();
      cy.get('#opfab-navbar-right-menu-activityarea').click();
      cy.get('.opfab-checkbox').contains('Control Center FR North').click();
    })
  })

  describe("Should load state and process from gateway", function() {

    it('Check state and process', () => {

      cy.loginOpFab('operator1_fr', 'test');
      cy.get('#opfab-navbarContent').find('#opfab-newcard-menu').click();


      // Test on Message card
      cy.get("#hidden_process").should("exist");
      cy.get("#hidden_process").should("have.value", "defaultProcess");

      cy.get("#hidden_state").should("exist");
      cy.get("#hidden_state").should("have.value", "messageState");


      // Test on Conference call
      selectService('User card examples');
      cy.get("#hidden_process").should("exist");
      cy.get("#hidden_process").should("have.value", "userCardExamples");

      cy.get("#hidden_state").should("exist");
      cy.get("#hidden_state").should("have.value", "conferenceState");


      // Test on IT incident
      selectState("IT Incident");
      cy.get("#hidden_process").should("exist");
      cy.get("#hidden_process").should("have.value", "userCardExamples");

      cy.get("#hidden_state").should("exist");
      cy.get("#hidden_state").should("have.value", "incidentInProgressState");


      // Test on existing card, opened from the feed
      prepareAndSendCard();
      cy.get('of-light-card').should('have.length', 1);
      cy.get('of-light-card').eq(0).click()
      .find('[id^=opfab-feed-light-card]')
      .invoke('attr', 'data-urlId')
      .then((urlId) => {
        cy.waitDefaultTime();
        cy.hash().should('eq', '#/feed/cards/' + urlId);
        cy.get('#opfab-card-edit').click();
        cy.get("#hidden_process").should("exist");
        cy.get("#hidden_process").should("have.value", "userCardExamples");

        cy.get("#hidden_state").should("exist");
        cy.get("#hidden_state").should("have.value", "incidentInProgressState");
      });

    })

  })


  describe('Loading start date, end date and lttd from template', function () {

    it('Check dates are loaded from template for Question user card', () => {

      cy.loginOpFab('operator1_fr', 'test');

      cy.get('#opfab-navbarContent').find('#opfab-newcard-menu').click();
      selectService('User card examples');
      selectProcess('Examples for new cards 2');
      selectState('Question');

      var startDate = new Date();
      startDate.setTime(startDate.getTime()+ 3600000);
      startDate.setMinutes(0);
      startDate.setSeconds(0);
      const expectedStartDate = startDate.toISOString().split('T')[0];

      const endDate = new Date(startDate.getTime() + 8 * 3600000);
      const expectedEndDate = endDate.toISOString().split('T')[0];
      
      const lttdDate = new Date(startDate.getTime() + 4 * 3600000);
      const expectedLttdDate = lttdDate.toISOString().split('T')[0];

      cy.waitDefaultTime();

      cy.get('#opfab-datepicker-startDate').invoke('val').then((text) => {
        expect(expectedStartDate).to.equal(text);
      });

      const startHour = startDate.getHours() < 10 ? '0' + startDate.getHours() : '' + startDate.getHours();
      cy.get('#opfab-timepicker-startDate').find('[aria-label="Hours"]').invoke('val').then((text) => {
        expect(startHour).to.equal(text);
      });
      cy.get('#opfab-timepicker-startDate').find('[aria-label="Minutes"]').invoke('val').then((text) => {
        expect('00').to.equal(text);
      });

      cy.get('#opfab-datepicker-endDate').invoke('val').then((text) => {
        expect(expectedEndDate).to.equal(text);
      });

      const endHour = endDate.getHours() < 10 ? '0' + endDate.getHours() : '' + endDate.getHours();

      cy.get('#opfab-timepicker-endDate').find('[aria-label="Hours"]').invoke('val').then((text) => {
        expect(endHour).to.equal(text);
      });
      cy.get('#opfab-timepicker-endDate').find('[aria-label="Minutes"]').invoke('val').then((text) => {
        expect('00').to.equal(text);
      });

      cy.get('#opfab-datepicker-lttd').invoke('val').then((text) => {
        expect(expectedLttdDate).to.equal(text);
      });

      const lttdHour = lttdDate.getHours() < 10 ? '0' + lttdDate.getHours() : '' + lttdDate.getHours();

      cy.get('#opfab-timepicker-lttd').find('[aria-label="Hours"]').invoke('val').then((text) => {
        expect(lttdHour).to.equal(text);
      });
      cy.get('#opfab-timepicker-lttd').find('[aria-label="Minutes"]').invoke('val').then((text) => {
        expect('00').to.equal(text);
      });

    })


  })

  describe("Should receive card emitter from gateway", function() {

    it('Check card emitter for operator1_fr', () => {

      cy.loginOpFab('operator1_fr', 'test');
      cy.get('#opfab-navbarContent').find('#opfab-newcard-menu').click();


      // Test on Message card
      cy.get("#hidden_sender").should("exist");
      cy.get("#hidden_sender").should("have.value", "ENTITY1_FR");



    });

    it('Should receive card emitter changes for operator4_fr', () => {

      cy.loginOpFab('operator4_fr', 'test');
      cy.get('#opfab-navbarContent').find('#opfab-newcard-menu').click();

      // Test on Message card

      // Check that card emitter is set to Control Center FR East
      cy.get('#of-usercard-card-emitter-selector').should("exist");
      cy.get('#of-usercard-card-emitter-selector').find('option:selected').should('have.text', 'Control Center FR East');


      cy.get("#hidden_sender").should("exist");
      cy.get("#hidden_sender").should("have.value", "ENTITY3_FR");

      // Now we choose Control Center FR North as card emitter
      cy.get("#of-usercard-card-emitter-selector").find('select').select('Control Center FR South');
      cy.get("#hidden_sender").should("have.value", "ENTITY2_FR");

      // Test on editing existing card, opened from the feed
      prepareAndSendCard();
      
      cy.waitDefaultTime();

      cy.get('of-light-card').eq(0).click()
      .find('[id^=opfab-feed-light-card]')
      .invoke('attr', 'data-urlId')
      .then((urlId) => {
        cy.waitDefaultTime();
        cy.hash().should('eq', '#/feed/cards/' + urlId);
        cy.get('#opfab-card-edit').click();

        cy.get("#hidden_sender").should("exist");
        cy.get("#hidden_sender").should("have.value", "ENTITY2_FR");
      })

    });
  })
})