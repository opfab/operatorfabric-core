/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {getUserCardCommands} from "../support/userCardCommands"
import {getOpfabGeneralCommands} from "../support/opfabGeneralCommands"
import {getFeedCommands} from "../support/feedCommands"
import {getActivityAreaCommands} from "../support/activityAreaCommands"

describe('User Card ', function () {

  const usercard = getUserCardCommands();
  const opfab = getOpfabGeneralCommands();
  const feed = getFeedCommands();
  const activityArea = getActivityAreaCommands();

  before('Set up configuration', function () {

    cy.resetUIConfigurationFiles();
    cy.loadTestConf();
    cy.deleteAllCards();
    cy.deleteAllArchivedCards();
    cy.deleteAllSettings();
  });

  describe('Check edit and delete buttons visibility', function () {
    it('Check edit button is not present when editCardEnabledOnUserInterface is false', () => {
      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('User card examples');
      usercard.selectProcess('Conference and IT incident');
      usercard.selectState('Conference Call ☏');
      usercard.prepareAndSendCard();
      usercard.checkCardHasBeenSend();
      feed.openFirstCard();
      cy.get('#opfab-div-card-template-processed').should('exist');
      cy.get('#opfab-card-edit').should('not.exist');
      cy.get('#opfab-card-delete').click();
      cy.get('#opfab-card-details-delete-btn-confirm').click();
      feed.checkNumberOfDisplayedCardsIs(0);

    })

    it('Check delete button is not present when deleteCardEnabledOnUserInterface is false ', () => {
      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('Base Examples');
      usercard.selectProcess('Process example');
      usercard.selectState('Process example');
      usercard.prepareAndSendCard();
      usercard.checkCardHasBeenSend();
      feed.openFirstCard();
      cy.get('#opfab-div-card-template-processed').should('exist');
      cy.get('#opfab-card-delete').should('not.exist');
    })
  })

  describe('Check edition mode', function () {

    it('Label change in edition mode for Question user card', () => {

      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('Base Examples');
      usercard.selectProcess('Process example');
      usercard.selectState('Process example');
      usercard.prepareAndSendCard();
      usercard.checkCardHasBeenSend();
      feed.openFirstCard();
      cy.get('#opfab-div-card-template-processed').should('exist');
      cy.get('#opfab-card-delete').should('not.exist');
    })
  })

  describe('Check edition mode', function () {

    it('Label change in edition mode for Question user card', () => {

      cy.deleteAllCards();
      cy.deleteAllArchivedCards();
      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('User card examples');
      usercard.selectProcess('Message or question');
      usercard.selectState('Question');
      cy.get('#label').should('have.text',' QUESTION ');
      cy.get('#question').type('First question');
      usercard.selectRecipient('Control Center FR East');
      usercard.prepareAndSendCard();
      usercard.checkCardHasBeenSend();
      feed.openFirstCard();
      feed.editCurrentCard();
      cy.get('#label').contains('QUESTION (New)');
      
    })

  })
 
  describe('Recipients dropdown should not be displayed or restricted for some user cards', function () {

    it('Recipients dropdown should not be displayed in Tasks user card and only current user shall receive the card ', () => {

      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('User card examples');
      usercard.selectProcess('Task');
      usercard.checkRecipientSelectDoesNotExist();
      usercard.seeBeforeSending();
      cy.get('#opfab-entity-recipients').contains("You are the only recipient of this card");
    })

    it('Recipients should not be displayed in IT incident user card but set via template code', () => {

      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('User card examples');
      usercard.selectProcess('Conference and IT incident');
      usercard.selectState('IT Incident');
      usercard.checkRecipientSelectDoesNotExist();
      usercard.seeBeforeSending();
      cy.get('#opfab-entity-recipients').contains("French Control Centers");
      cy.get('#opfab-entity-recipients').contains("IT SUPERVISION CENTER");
    })

    it('Recipients should be the union of user selection and template defined recipients in conference user card', () => {

      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('User card examples');
      usercard.selectProcess('Conference and IT incident');
      usercard.selectState('Conference Call ☏');
      usercard.selectRecipient('Control Center FR East');
      usercard.seeBeforeSending();
      cy.get('#opfab-entity-recipients').contains("IT SUPERVISION CENTER");
      cy.get('#opfab-entity-recipients').contains("Control Center FR East");
    })

    it('Recipients dropdown should be restricted in message user card  - Deprecated method using state config ', () => {

      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectProcess('Process example');
      usercard.selectState('Process example');
      cy.get('#opfab-recipients').click();
      cy.get('#opfab-recipients').find('.vscomp-option-text').should('have.length', 6);
      cy.get('#opfab-recipients').find('.vscomp-option-text').eq(0).contains("Control Center FR East");
      cy.get('#opfab-recipients').find('.vscomp-option-text').eq(1).contains("Control Center FR North");
      cy.get('#opfab-recipients').find('.vscomp-option-text').eq(2).contains("Control Center FR South");
      cy.get('#opfab-recipients').find('.vscomp-option-text').eq(3).contains("Control Center FR West");
      cy.get('#opfab-recipients').find('.vscomp-option-text').eq(4).contains("French Control Centers");
      cy.get('#opfab-recipients').find('.vscomp-option-text').eq(5).contains("IT SUPERVISION CENTER");
    })

    it('Recipients dropdown should be restricted and initial recipients preselected in message user card', () => {

      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('User card examples');
      usercard.selectProcess('Message or question');
      usercard.selectState('Message');
      cy.get('#opfab-recipients').click();
      cy.get('#opfab-recipients').find('.vscomp-option-text').should('have.length', 7);
      cy.get('#opfab-recipients').find('.vscomp-option-text').eq(0).contains("Control Center FR East");
      cy.get('#opfab-recipients').find('.vscomp-option-text').eq(1).contains("Control Center FR North");
      cy.get('#opfab-recipients').find('.vscomp-option-text').eq(2).contains("Control Center FR South");
      cy.get('#opfab-recipients').find('.vscomp-option-text').eq(3).contains("Control Center FR West");
      cy.get('#opfab-recipients').find('.vscomp-option-text').eq(4).contains("French Control Centers");
      cy.get('#opfab-recipients').find('.vscomp-option-text').eq(5).contains("IT SUPERVISION CENTER");
      cy.get('#opfab-recipients').find('.vscomp-option-text').eq(6).contains("Italian Control Centers");

      cy.get('#opfab-recipients').find('.vscomp-value').contains("Control Center FR East");
      cy.get('#opfab-recipients').find('.vscomp-value').contains("Control Center FR North");
      cy.get('#opfab-recipients').find('.vscomp-value').contains("Control Center FR South");
      cy.get('#opfab-recipients').find('.vscomp-value').contains("Control Center FR West").should('not.exist');
      cy.get('#opfab-recipients').find('.vscomp-value').contains("French Control Centers").should('not.exist');
      cy.get('#opfab-recipients').find('.vscomp-value').contains("IT SUPERVISION CENTER").should('not.exist');
      cy.get('#opfab-recipients').find('.vscomp-value').contains("Italian Control Centers").should('not.exist');

    })

  })

  describe('Fields visibility', function () {

    it('Severity choice should not be displayed in Question user card', () => {

      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('User card examples');
      usercard.selectProcess('Message or question');
      usercard.selectState('Message');
      cy.get('#opfab-usercard-severity-choice').should("exist");
      usercard.selectState('Question');
      cy.get('#opfab-usercard-severity-choice').should("not.exist");
      cy.get('#of-usercard-card-emitter-selector').should("not.exist");
    })

    it('No date choice displayed in IT Incident user card', () => {

      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('User card examples');
      usercard.selectProcess('Conference and IT incident');
      usercard.selectState('IT Incident');
      cy.get('#opfab-usercard-startdate-choice').should("not.exist");
      cy.get('#opfab-usercard-enddate-choice').should("not.exist");
      cy.get('#opfab-usercard-lttd-choice').should("not.exist");
      cy.get('#of-usercard-card-emitter-selector').should("not.exist");
    })

    it('All  dates choices should be displayed in Question user card', () => {

      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('User card examples');
      usercard.selectProcess('Message or question');;
      usercard.selectState('Question');
      cy.get('#opfab-usercard-startdate-choice').should("exist");
      cy.get('#opfab-usercard-enddate-choice').should("exist");
      cy.get('#opfab-usercard-lttd-choice').should("exist");
      cy.get('#of-usercard-card-emitter-selector').should("not.exist");
    })

    it('Only start dates choices should be displayed in Message user card', () => {

      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('User card examples');
      usercard.selectProcess('Message or question');
      usercard.selectState('Message');
      cy.get('#opfab-usercard-startdate-choice').should("exist");
      cy.get('#opfab-usercard-enddate-choice').should("not.exist");
      cy.get('#opfab-usercard-lttd-choice').should("not.exist");
      cy.get('#of-usercard-card-emitter-selector').should("not.exist");
    })

    it('Process select should be displayed even if there is only one process', () => {

      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('Base Examples');
      cy.get('#of-usercard-process-filter').should("exist");
      cy.get("#of-usercard-process-filter").find('.vscomp-option-text').should("have.length", 1);
      cy.get("#of-usercard-process-filter").find('.vscomp-option-text').eq(0).should("contain", "Process example ");
    })

    it('Users should not be able to send cards if it does not belong to any entity', () => {

        opfab.loginWithUser('operator1_fr');
        opfab.navigateToUserCard();
        cy.get('#opfab-usercard-creation').should('exist');
        cy.get('#opfab-usercard-close').click();

        // The user should not be able to send a card if it does not belong to any entity
        opfab.navigateToActivityArea();
        cy.get('.opfab-activityarea-table').find('.opfab-checkbox').click();
        activityArea.save();

        opfab.navigateToUserCard();
        cy.get('of-usercard').find('#opfab-usercard-creation').should('not.exist');
        cy.get('of-usercard').should('have.text', 'You are not a member of any entity that can send cards.');
        cy.get('#opfab-usercard-close').click();

        // The user should be able to send a card if an entity is added
        cy.get('.opfab-activityarea-table').find('.opfab-checkbox').click();
        activityArea.save();

        opfab.navigateToUserCard();
        cy.get('of-usercard').find('#opfab-usercard-creation').should('exist');
    });
  })

  describe('Fields controls for conference call usercard', function () {

    it('Check it\'s impossible to have a report name without report link and vice versa', () => {

      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('User card examples');
      usercard.selectProcess('Conference and IT incident');
      usercard.selectState('Conference Call ☏');

      // no report name and no report link : no error
      cy.get('#opfab-usercard-btn-prepareCard').click();
      cy.get('#div-detail-msg').should('not.exist'); // no error message
      cy.get('#opfab-usercard-btn-refuse').click(); // we cancel the sending of the card

      // a report name without report link : an error should be displayed
      cy.get('#report_title').type('report name');
      cy.get('#opfab-usercard-btn-prepareCard').click();
      cy.get('.opfab-info-message').should('have.class', 'opfab-alert-error')
          .contains('You must provide a report name and link, or none of them.');
      cy.get('.opfab-alert-close').click();

      // a report link without report name : an error should be displayed
      cy.get('#report_link').type('report link');
      cy.get('#report_title').clear();
      cy.get('#opfab-usercard-btn-prepareCard').click();
      cy.get('.opfab-info-message').should('have.class', 'opfab-alert-error')
          .contains('You must provide a report name and link, or none of them.');
      cy.get('.opfab-alert-close').click();

      // a report name and a report link : no error
      cy.get('#report_title').type("report name");
      cy.get('#opfab-usercard-btn-prepareCard').click();
      cy.get('#div-detail-msg').should('not.exist'); // no error message
      cy.get('#opfab-usercard-btn-refuse').click(); // we cancel the sending of the card
    });
  })


  describe('Test spinners', function () {
    it('Check spinner appears when card template is loading', () => {

      cy.delayRequestResponse('/businessconfig/**');
      cy.delayRequestResponse('/cardspub/**');

      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      opfab.checkLoadingSpinnerIsDisplayed();
      opfab.checkLoadingSpinnerIsNotDisplayed();

      usercard.selectService('User card examples');
      opfab.checkLoadingSpinnerIsDisplayed();
      opfab.checkLoadingSpinnerIsNotDisplayed();

      usercard.selectState('IT Incident');
      opfab.checkLoadingSpinnerIsDisplayed();
      opfab.checkLoadingSpinnerIsNotDisplayed();

      cy.get('#opfab-usercard-btn-prepareCard').click();
      // Checks the spinner when the translations are loading
      opfab.checkLoadingSpinnerIsDisplayed();
      opfab.checkLoadingSpinnerIsNotDisplayed();

      // Checks the spinner when the card preview is loading
      opfab.checkLoadingSpinnerIsDisplayed();
      opfab.checkLoadingSpinnerIsNotDisplayed();
    })

  })

  describe('Show automated response in preview for some user cards', function () {

    before('Delete previous cards', function () {
      cy.deleteAllCards();
      cy.deleteAllArchivedCards();
    });

    it('Show automated response in preview for Confirmation user card if user enabled to respond', () => {

      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('User card examples');
      usercard.selectProcess('Message or question');
      usercard.selectState('Confirmation');
      // Select recipent entity not in user entities
      usercard.selectRecipient('Control Center FR East');

      cy.get('#question').type('Confirm YES or NO');

      usercard.seeBeforeSending();

      // No responses shown 
      cy.get("#childs-div").should('be.empty');
      // Cancel sending
      cy.get('#opfab-usercard-btn-refuse').click();

      // Select also one of user entities as recipent
      usercard.selectRecipient('Control Center FR North');

      usercard.seeBeforeSending();

      // Feed preview show response from current entity
      cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity').should('exist');
      // Card preview show responses list
      cy.get("#childs-div").should('not.be.empty');
      // Response table has 1 header and 1 row 
      cy.get("#childs-div").find('tr').should('have.length', 2);
      // Send the card 
      cy.get('#opfab-usercard-btn-accept').click();

      usercard.checkCardHasBeenSend();
      feed.checkNumberOfDisplayedCardsIs(1);
      // Feed light card show response from current entity
      cy.get('of-light-card').eq(0).find('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity').should('exist');
      cy.get('of-light-card').eq(0).click();
      cy.get("#childs-div").should('not.be.empty');
      // Response table has 1 header and 1 row 
      cy.get("#childs-div").find('tr').should('have.length', 2);


      //Modify response and check it is taken into account when editing the card
      cy.get("#opfab-card-details-btn-response").click();
      cy.get("#resp_confirm").select('NO');
      cy.get("#resp_message").type('modified');
      cy.get("#opfab-card-details-btn-response").click();
      feed.editCurrentCard();
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

      opfab.loginWithUser('operator1_fr');
      feed.checkNumberOfDisplayedCardsIs(0);
      opfab.navigateToUserCard();
      cy.get('#of-usercard-card-emitter-selector').should("not.exist");
      cy.get('#message').type('Hello, that\'s a test message / Result is <OK> & work done is 100%');
      cy.setFormDateTime('startDate','2020','Jan',20,8,0);
      cy.setFormDateTime('endDate','2029','Jun',25,11,10);
      usercard.selectRecipient('Control Center FR South');
      usercard.prepareAndSendCard();
      usercard.checkCardHasBeenSend();
      feed.openFirstCard();
      cy.get('#opfab-div-card-template-processed').find('div').eq(0).should('have.text', "\n  Hello, that's a test message / Result is <OK> & work done is 100%\n");
      cy.get('#opfab-card-title').should('have.text', "Message");
      cy.get('#opfab-selected-card-summary').should('have.text', "Message received :   Hello, that's a test message / Result is <OK> & work done is 100%");
    })



    it('Receive User card', () => {

      opfab.loginWithUser('operator2_fr');
      feed.checkNumberOfDisplayedCardsIs(1);
      cy.get('#opfab-lightcard-dates').contains('(08:00 20/01/2020 - 11:10 25/06/2029)');
      feed.openFirstCard();
      cy.get('#opfab-div-card-template-processed').find('div').eq(0).should('have.text', "\n  Hello, that's a test message / Result is <OK> & work done is 100%\n");
      cy.get('#opfab-card-title').should('have.text', "Message");
      cy.get('#opfab-selected-card-summary').should('have.text', "Message received :   Hello, that's a test message / Result is <OK> & work done is 100%");
    })
  })


  describe('Edit user card', function () {

    it('Edit User card from operator1_fr', () => {

      opfab.loginWithUser('operator1_fr');
      feed.openFirstCard();
      feed.editCurrentCard();
      cy.get('#of-usercard-card-emitter-selector').should("not.exist");
      cy.get('#message').should('be.visible');
      cy.waitDefaultTime();
      cy.get('#message').type(' (updated)');
      usercard.prepareAndSendCard();
      usercard.checkCardHasBeenSend();
    })


    it('Receive modified User card', () => {

      opfab.loginWithUser('operator2_fr');
      feed.openFirstCard();
      cy.get('#opfab-div-card-template-processed').find('div').eq(0).should('have.text', "\n   Hello, that's a test message / Result is <OK> & work done is 100%  (updated)\n");
      cy.get('#opfab-card-title').should('have.text', "Message");
      cy.get('#opfab-selected-card-summary').should('have.text', "Message received :    Hello, that's a test message / Result is <OK> & work done is 100%  (updated)");

    })
  })


  describe('Delete user card', function () {

    it('Delete User card from operator1_fr', () => {

      opfab.loginWithUser('operator1_fr');
      feed.openFirstCard();
      feed.deleteCurrentCard();
      feed.checkNumberOfDisplayedCardsIs(0);
      opfab.logout();
      opfab.loginWithUser('operator2_fr');
      feed.checkNumberOfDisplayedCardsIs(0);
    });


    it('Check spinner is displayed when delete request is delayed and that spinner disappears once the request arrived', () => {

      cy.sendCard('cypress/userCard/message.json');
      opfab.loginWithUser('operator1_fr');

      feed.openFirstCard();
      cy.intercept('DELETE', '/cardspub/cards/userCard/*', {delay: 2000, statusCode: 502});

      feed.deleteCurrentCard();
      opfab.checkLoadingSpinnerIsDisplayed();
      opfab.checkLoadingSpinnerIsNotDisplayed();
    });
  })
  
  describe('Entities allowed to edit card sent by user', function () {

    before('Set up configuration', function () {
      cy.deleteAllCards();
      cy.sendCard('cypress/userCard/process.json');
    });

    it('Edit card from allowed entity', () => {
      opfab.loginWithUser('operator1_fr');
      feed.openFirstCard();
      feed.editCurrentCard();
      // check this to be sure template has been loaded
      cy.get('#state-select');
      usercard.prepareAndSendCard();
      usercard.checkCardHasBeenSend();
    })

    it('Cannot edit card from not allowed entity', () => {
      cy.sendCard('cypress/userCard/process.json');
      opfab.loginWithUser('operator2_fr');
      feed.openFirstCard();
      cy.get('#opfab-card-edit').should('not.exist');
    })


    it('Send User card with entitiesAllowedToEdit = "ENTITY_FR"', () => {
      cy.deleteAllCards();
      opfab.loginWithUser('operator1_fr');
      feed.checkNumberOfDisplayedCardsIs(0);

      opfab.navigateToUserCard();
      cy.get("of-usercard").should('exist');
      cy.get('#message').type('Hello')
      usercard.selectRecipient('Control Center FR South');
      usercard.prepareAndSendCard();
      usercard.checkCardHasBeenSend();
      feed.openFirstCard(); 
      cy.get('#opfab-div-card-template-processed').find('div').eq(0).should('have.text', '\n  Hello\n')
      cy.get('#opfab-card-title').should('have.text', 'Message')
      cy.get('#opfab-selected-card-summary').should('have.text', "Message received :   Hello");

    })

    it('Edit user card from allowed entity', () => {

      opfab.loginWithUser('operator2_fr');
      feed.openFirstCard();
      feed.editCurrentCard();
      // check this to be sure template has been loaded
      cy.get("#hidden_sender").should("have.value", "ENTITY2_FR");
      usercard.prepareAndSendCard();
      usercard.checkCardHasBeenSend();
        
    })

  })

  describe('Entities allowed to edit card sent by third party ', function () {

      before('Set up configuration', function () {

        cy.deleteAllCards();
        cy.sendCard('cypress/userCard/processSendByExternal.json');

      });

      it('Cannot edit card from not allowed entity', ()=>{
        opfab.loginWithUser('operator2_fr');
        feed.openFirstCard();
        cy.get('#opfab-card-edit').should('not.exist');
      })

      it('Edit card from allowed entity', ()=>{
        opfab.loginWithUser('operator1_fr');
        feed.openFirstCard();
        feed.editCurrentCard();
        // check this to be sure template has been loaded
        cy.get('#state-select');
        usercard.prepareAndSendCard();
        usercard.checkCardHasBeenSend();

      })

  })


  describe('Show responses in card preview when keepChildCards=true ', function () {

    it('Send User card with keepChildCards=true', () => {
      
      cy.deleteAllCards();
      opfab.loginWithUser('operator1_fr');
      feed.checkNumberOfDisplayedCardsIs(0);

      opfab.navigateToUserCard();
      usercard.selectService('User card examples');
      usercard.selectProcess('Conference and IT incident');
      usercard.selectState('IT Incident');

      // check this to be sure template has been loaded
      cy.get('#service-select');

      usercard.prepareAndSendCard();
      usercard.checkCardHasBeenSend();
      feed.checkNumberOfDisplayedCardsIs(1);
    })

    it('Respond as operator2_fr', () => {
      
      opfab.loginWithUser('operator2_fr');
      feed.openFirstCard();
      // template is ready
      cy.get("#services").should('exist');
      // Respond to the card 
      cy.get('#opfab-card-details-btn-response').click();
    })

    it('Edit card and check card preview show the response', ()=>{

      opfab.loginWithUser('operator1_fr');
      feed.openFirstCard();
      feed.editCurrentCard();
      usercard.seeBeforeSending();
      // Card preview show responses list
      cy.get("#childs-div").should('not.be.empty');
      // Response table has 1 header and 1 row 
      cy.get("#childs-div").find('tr').should('have.length', 2);

    })
  })

  describe('Send user card with operator4_fr, member of several entities', function () {

    before('Delete previous cards', function () {
        cy.deleteAllCards();
        cy.deleteAllArchivedCards();
    });

    it('Send User card from operator4_fr', () => {
      
      opfab.loginWithUser('operator4_fr');
      feed.checkNumberOfDisplayedCardsIs(0);
      opfab.navigateToUserCard();

      // check template rendering done
      cy.get('#message').should('be.visible');

      cy.get('#of-usercard-card-emitter-selector').should("exist");
      cy.get('#of-usercard-card-emitter-selector').find('label').should("have.text", "EMITTER");
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').should("have.length", 4);
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(0).should("contain.text", "Control Center FR East");
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(1).should("contain.text", "Control Center FR North");
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(2).should("contain.text", "Control Center FR South");
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(3).should("contain.text", "Control Center FR West");

      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(2).click({force: true});
      cy.get('#message').type('Hello, that\'s a test message / Result is <OK> & work done is 100%');
      cy.setFormDateTime('startDate', '2020', 'Jan', 20, 8, 0);
      cy.setFormDateTime('endDate', '2029', 'Jun', 25, 11, 10);
      usercard.selectRecipient('Control Center FR South');
      usercard.prepareAndSendCard();
      usercard.checkCardHasBeenSend();
      feed.checkNumberOfDisplayedCardsIs(1);
      feed.openFirstCard();
      cy.get('#opfab-div-card-template-processed').find('div').eq(0).should('have.text', "\n  Hello, that's a test message / Result is <OK> & work done is 100%\n");
      cy.get('#opfab-card-title').should('have.text', "Message");
      cy.get('#opfab-selected-card-summary').should('have.text', "Message received :   Hello, that's a test message / Result is <OK> & work done is 100%");
      cy.get('#opfab-form-entity').should('have.text', 'from\u00a0:\u00a0Control Center FR South');

    })

    it('Edit User card and change card emitter', () => {

        opfab.loginWithUser('operator4_fr');
        feed.openFirstCard();
        feed.editCurrentCard();

        // check template rendering done
        cy.get('#message').should('be.visible');

        // Check that card emitter is set to Control Center FR South
        cy.get('#of-usercard-card-emitter-selector').should("exist");
        cy.get('#of-usercard-card-emitter-selector').find('.vscomp-value').should('have.text', 'Control Center FR South');

        // Now we choose Control Center FR North as card emitter
        cy.get("#of-usercard-card-emitter-selector").find('.vscomp-option-text').eq(1).click({force: true});

        cy.get('#message').should('be.visible').type(' (updated)')
        usercard.prepareAndSendCard();
        usercard.checkCardHasBeenSend();

        cy.waitDefaultTime();

        // Check that the new card emitter 'Control Center FR North' is taken into account
        cy.get('#opfab-div-card-template-processed').find('div').eq(0).should('have.text', "\n   Hello, that's a test message / Result is <OK> & work done is 100%  (updated)\n");
        cy.get('#opfab-card-title').should('have.text', "Message");
        cy.get('#opfab-selected-card-summary').should('have.text', "Message received :    Hello, that's a test message / Result is <OK> & work done is 100%  (updated)");
        cy.get('#opfab-form-entity').should('have.text', 'from\u00a0:\u00a0Control Center FR North');
    })

    it('Disconnect operator4_fr from Control Center FR North and check card emitter when editing previous user card', () => {
      
      opfab.loginWithUser('operator4_fr');
      feed.checkNumberOfDisplayedCardsIs(1);
      // operator4_fr disconnect from Control Center FR North (ENTITY1_FR)
      opfab.navigateToActivityArea();

      // Check every checkbox to let the time for the ui to set to true before we click
      cy.get('.opfab-checkbox').eq(0).find('input').should('be.checked');
      cy.get('.opfab-checkbox').eq(1).find('input').should('be.checked');
      cy.get('.opfab-checkbox').eq(2).find('input').should('be.checked');
      cy.get('.opfab-checkbox').eq(3).find('input').should('be.checked');

      activityArea.clickOnCheckbox('Control Center FR North');
      activityArea.save();

      opfab.navigateToFeed();
      cy.waitDefaultTime();
      feed.checkNumberOfDisplayedCardsIs(1);
      feed.openFirstCard();
      feed.editCurrentCard();

      // check template rendering done
      cy.get('#message').should('be.visible');

      // Check that card emitter is set to Control Center FR East (default value)
      cy.get('#of-usercard-card-emitter-selector').should("exist");
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-value').should('have.text', 'Control Center FR East');

      // Check that we have now only 3 entities available (instead of 4 because disconnected from ENTITY1_FR)
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').should("have.length", 3);
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(0).should("contain.text", "Control Center FR East");
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(1).should("contain.text", "Control Center FR South");
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(2).should("contain.text", "Control Center FR West");
    })
  })

  describe("Should load state and process from gateway", function() {

    it('Check state and process', () => {

      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();


      // Test on Message card
      cy.get("#hidden_process").should("exist");
      cy.get("#hidden_process").should("have.value", "defaultProcess");

      cy.get("#hidden_state").should("exist");
      cy.get("#hidden_state").should("have.value", "messageState");


      // Test on Conference call
      usercard.selectService('User card examples');
      usercard.selectProcess('Conference and IT incident');
      cy.get("#hidden_process").should("exist");
      cy.get("#hidden_process").should("have.value", "conferenceAndITIncidentExample");

      cy.get("#hidden_state").should("exist");
      cy.get("#hidden_state").should("have.value", "conferenceState");


      // Test on IT incident

      usercard.selectState("IT Incident");
      cy.get("#hidden_process").should("exist");
      cy.get("#hidden_process").should("have.value", "conferenceAndITIncidentExample");

      cy.get("#hidden_state").should("exist");
      cy.get("#hidden_state").should("have.value", "incidentInProgressState");


      // Test on existing card, opened from the feed
      usercard.prepareAndSendCard();
      feed.openFirstCard();
      feed.editCurrentCard();
      cy.get("#hidden_process").should("exist");
      cy.get("#hidden_process").should("have.value", "conferenceAndITIncidentExample");

      cy.get("#hidden_state").should("exist");
      cy.get("#hidden_state").should("have.value", "incidentInProgressState");
    })
  })


  describe('Loading start date, end date and lttd from template', function () {

    it('Check dates are loaded from template for Question user card', () => {

      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('User card examples');
      usercard.selectProcess('Message or question');
      usercard.selectState('Question');

      var startDate = new Date();
      startDate.setTime(startDate.getTime()+ 3600000);
      startDate.setMinutes(0);
      startDate.setSeconds(0);
      const expectedStartDate = startDate.getFullYear() + '-' + (startDate.getMonth()+1).toString().padStart(2, '0') + '-' + startDate.getDate().toString().padStart(2, '0');

      const endDate = new Date(startDate.getTime() + 8 * 3600000);
      const expectedEndDate = endDate.getFullYear() + '-' + (endDate.getMonth()+1).toString().padStart(2, '0') + '-' + endDate.getDate().toString().padStart(2, '0');
      
      const lttdDate = new Date(startDate.getTime() + 4 * 3600000);
      const expectedLttdDate = lttdDate.getFullYear() + '-' + (lttdDate.getMonth()+1).toString().padStart(2, '0') + '-' + lttdDate.getDate().toString().padStart(2, '0');

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

      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();

      // Test on Message card
      cy.get("#hidden_sender").should("exist");
      cy.get("#hidden_sender").should("have.value", "ENTITY1_FR");



    });

    it('Should receive card emitter changes for operator4_fr', () => {

      opfab.loginWithUser('operator4_fr');
      opfab.navigateToUserCard();

      // Test on Message card

      // Check that card emitter is set to Control Center FR East
      cy.get('#of-usercard-card-emitter-selector').should("exist");
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-value').should('contain.text', 'Control Center FR East');


      cy.get("#hidden_sender").should("exist");
      cy.get("#hidden_sender").should("have.value", "ENTITY3_FR");

      // Now we choose Control Center FR South as card emitter
      cy.get("#of-usercard-card-emitter-selector").find('.vscomp-option-text').eq(1).click({force: true});
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-value').should('contain.text', 'Control Center FR South');
      cy.get("#hidden_sender").should("have.value", "ENTITY2_FR");

      // Test on editing existing card, opened from the feed
      usercard.prepareAndSendCard();
      
      cy.waitDefaultTime();

      feed.openFirstCard();
      feed.editCurrentCard();

      cy.get("#hidden_sender").should("exist");
      cy.get("#hidden_sender").should("have.value", "ENTITY2_FR");

    });
  })

  describe('Set timeSpans from template', function () {

    it('Set timeSpans from template', () => {
      cy.deleteAllCards();
      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('User card examples');
      usercard.selectProcess('Task');
      cy.waitDefaultTime();
      cy.get('#Monday').check({force: true});
      cy.get('#Tuesday').check({force: true});
      cy.get('#Wednesday').check({force: true});
      cy.get('#Thursday').check({force: true});
      cy.get('#Friday').check({force: true});
      cy.get('#Saturday').check({force: true});
      cy.get('#Sunday').check({force: true});
      cy.get('#time').type('08:00');
      usercard.prepareAndSendCard();
      
      cy.waitDefaultTime();
      cy.get('#opfab-timeline-link-period-7D').click();
      cy.get('ellipse').should('have.length', 7);

    })
  })

  describe('Set initial severity from template', function () {

    it('Set initial severity from template', () => {
      cy.deleteAllCards();
      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      // Check default severity level value is 'Alarm'
      cy.get('#opfab-sev-alarm').should('be.checked');

      usercard.selectService('User card examples');
      usercard.selectProcess('Task');
      // Check initial severity level value is set to 'Action'
      cy.get('#opfab-sev-action').should('be.checked');

      // Change severity, send card, edit it and check severity is not modified on edition
      cy.get('#opfab-sev-information').check();
      cy.get('#opfab-sev-information').should('be.checked');
      usercard.prepareAndSendCard();
      feed.openFirstCard();
      feed.editCurrentCard();
      cy.get('#opfab-sev-information').should('be.checked');

    })
  })
  
  describe('Check search feature in dropdown select', function () {
    
    it('Search feature should be enabled on services dropdown for "IT incident" user card', () => {
      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('User card examples');
      usercard.selectProcess('Conference and IT incident');
      usercard.selectState('IT Incident');
      // check search is enabled for service select
      cy.get('#service-select').should("exist");
      cy.get('#service-select').click();
      cy.get('#service-select').find('.vscomp-search-input').should("exist");
      cy.get('#service-select').find('.vscomp-search-input').eq(0).invoke('attr', 'placeholder').should('eq', 'Search...');
      cy.get('#service-select').find('.vscomp-option-text').should('have.length', 8);
      cy.get('#service-select').find('.vscomp-option-text').eq(0).contains("Group 1");
      cy.get('#service-select').find('.vscomp-option-text').eq(1).contains("Service A");
      cy.get('#service-select').find('.vscomp-option-text').eq(2).contains("Service B");
      cy.get('#service-select').find('.vscomp-option-text').eq(3).contains("Service C");
      cy.get('#service-select').find('.vscomp-option-text').eq(4).contains("Group 2");
      cy.get('#service-select').find('.vscomp-option-text').eq(5).contains("Service D");
      cy.get('#service-select').find('.vscomp-option-text').eq(6).contains("Service E");
      cy.get('#service-select').find('.vscomp-option-text').eq(7).contains("Service F");
      cy.get('#service-select').find('.vscomp-search-input').eq(0).type('D');
      cy.get('#service-select').find('.vscomp-option-text').should('have.length', 2);
      cy.get('#service-select').find('.vscomp-option-text').eq(0).contains("Group 2");
      cy.get('#service-select').find('.vscomp-option-text').eq(1).contains("Service D");
    })
    
    
    it('Search feature should be enabled on states dropdown for "Process example" user card', () => {
      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectProcess('Process example');
      usercard.selectState('Process example');

      // check search is enabled for state select
      cy.get('#state-select').should("exist");
      cy.get('#state-select').click();
      cy.get('#state-select').find('.vscomp-search-input').should("exist");
      cy.get('#state-select').find('.vscomp-search-input').eq(0).invoke('attr', 'placeholder').should('eq', 'Search...');
      cy.get('#state-select').find('.vscomp-option-text').should('have.length', 4);
      cy.get('#state-select').find('.vscomp-option-text').eq(0).contains("Start");
      cy.get('#state-select').find('.vscomp-option-text').eq(1).contains("Calculation 1 done");
      cy.get('#state-select').find('.vscomp-option-text').eq(2).contains("Calculation 2 done");
      cy.get('#state-select').find('.vscomp-option-text').eq(3).contains("Calculation 3 done");
      cy.get('#state-select').find('.vscomp-search-input').eq(0).type('sta');
      cy.get('#state-select').find('.vscomp-option-text').should('have.length', 1);
      cy.get('#state-select').find('.vscomp-option-text').eq(0).contains("Start");

      // check search is not enabled for status select
      cy.get('#status-select').should("exist");
      cy.get('#status-select').click();
      cy.get('#status-select').find('.vscomp-search-input').should("not.exist");
    })
  })

  describe('Check service, process and state select', function () {
    it('Check process select when no process group is defined', () => {
      cy.loadEmptyProcessGroups();
      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.checkProcessGroupSelectDoesNotExist();
      usercard.checkSelectedProcessIs('Conference and IT incident ');
      usercard.checkSelectedStateIs('Conference Call ☏');
    })

    it('Check process select when no process is in no group', () => {
      cy.loadProcessGroupsNotTotallyConfigured();
      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.checkSelectedServiceIs('--');
      usercard.checkSelectedProcessIs('Task');
      usercard.checkStateSelectIsHidden();
    })
  })

  
})