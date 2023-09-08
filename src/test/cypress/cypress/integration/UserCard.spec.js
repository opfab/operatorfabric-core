/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {UserCardCommands} from "../support/userCardCommands"
import {OpfabGeneralCommands} from "../support/opfabGeneralCommands"
import {FeedCommands} from "../support/feedCommands"
import {ActivityAreaCommands} from "../support/activityAreaCommands"
import {CardCommands} from "../support/cardCommands";
import {ScriptCommands} from "../support/scriptCommands";

describe('User Card ', function () {

  const usercard = new UserCardCommands();
  const opfab = new OpfabGeneralCommands();
  const feed = new FeedCommands();
  const activityArea = new ActivityAreaCommands();
  const card = new CardCommands();
  const script = new ScriptCommands();

  before('Set up configuration', function () {

    script.resetUIConfigurationFiles();
    script.loadTestConf();
    script.deleteAllCards();
    script.deleteAllArchivedCards();
    script.deleteAllSettings();
  });

  describe('Check READONLY user cannot send usercard', function () {
    it('Check error message when READONLY user try to create a usercard', () => {
      opfab.loginWithUser('operator1_crisisroom');
      opfab.navigateToUserCard();
      cy.get('of-usercard').find('.alert-info').should('contain','You are not allowed to send card.')
    })
  })

  describe('Check edit, copy and delete buttons visibility', function () {
    it('Check edit button is not present when editCardEnabledOnUserInterface is false', () => {
      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('User card examples');
      usercard.selectProcess('Conference and IT incident');
      usercard.selectState('Conference Call ☏');
      usercard.previewThenSendCard();
      feed.openFirstCard();
      card.checkEditButtonDoesNotExist();
      card.delete();
      feed.checkNumberOfDisplayedCardsIs(0);

    })

    it('Check copy button is not present when copyCardEnabledOnUserInterface is false ', () => {
      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('User card examples');
      usercard.selectProcess('Conference and IT incident');
      usercard.selectState('Conference Call ☏');
      usercard.previewThenSendCard();
      feed.openFirstCard();
      card.checkCopyButtonDoesNotExist();
      card.delete();
      feed.checkNumberOfDisplayedCardsIs(0);
    })

    it('Check delete button is not present when deleteCardEnabledOnUserInterface is false ', () => {
      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('Base Examples');
      usercard.selectProcess('Process example');
      usercard.selectState('Process example');
      usercard.previewThenSendCard();
      feed.openFirstCard();
      card.checkDeleteButtonDoesNotExist();
    })
  })

  describe('Check edition mode', function () {

    it('Label change in edition mode for Question user card', () => {

      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('Base Examples');
      usercard.selectProcess('Process example');
      usercard.selectState('Process example');
      usercard.previewThenSendCard();
      feed.openFirstCard();
      card.checkDeleteButtonDoesNotExist();
    })
  })

  describe('Check edition mode', function () {

    it('Label change in edition mode for Question user card', () => {

      script.deleteAllCards();
      script.deleteAllArchivedCards();
      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('User card examples');
      usercard.selectProcess('Message or question');
      usercard.selectState('Confirmation');
      cy.get('#label').should('have.text',' QUESTION ');
      cy.get('#question').invoke('val', 'First question'); // the cy.type does not work (no explanation found),  using invoke works 
      usercard.selectRecipient('Control Center FR East');
      usercard.previewThenSendCard();
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
      usercard.preview();
      usercard.checkSenderIsTheOnlyOneRecipient();
    })

    it('Recipients should not be displayed in IT incident user card but set via template code', () => {

      script.setPropertyInConf('usercard.displayConnectionCirclesInPreview','web-ui','\\"true\\"');
      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('User card examples');
      usercard.selectProcess('Conference and IT incident');
      usercard.selectState('IT Incident');
      usercard.checkRecipientSelectDoesNotExist();
      usercard.preview();
      usercard.checkEntityRecipientsInPreviewContains("French Control Centers");
      usercard.checkEntityRecipientsInPreviewContains("IT SUPERVISION CENTER");
      // Check circles for connected entities
      cy.get('#opfab-entity-recipients').get('.badge').should('have.length', 2);
      cy.get('#opfab-entity-recipients').get('.bg-success').should('have.length', 1);
      cy.get('#opfab-entity-recipients').get('.bg-danger').should('have.length', 1);
      script.resetUIConfigurationFiles();
    })

    it('Recipients should be the union of user selection and template defined recipients in conference user card', () => {

      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('User card examples');
      usercard.selectProcess('Conference and IT incident');
      usercard.selectState('Conference Call ☏');
      usercard.selectRecipient('Control Center FR East');
      usercard.preview();
      usercard.checkEntityRecipientsInPreviewContains("IT SUPERVISION CENTER");
      usercard.checkEntityRecipientsInPreviewContains("Control Center FR East");
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
      usercard.checkSeverityChoiceExists();
      usercard.selectState('Question');
      usercard.checkSeverityChoiceDoesNotExist();
      usercard.checkEmitterSelectDoesNotExist();
    })

    it('No date choice displayed in IT Incident user card', () => {

      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('User card examples');
      usercard.selectProcess('Conference and IT incident');
      usercard.selectState('IT Incident');
      usercard.checkStartDateChoiceDoesNotExist();
      usercard.checkEndDateChoiceDoesNotExist();
      usercard.checkLttdChoiceDoesNotExist();
      usercard.checkEmitterSelectDoesNotExist();
    })

    it('All  dates choices should be displayed in Question user card', () => {

      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('User card examples');
      usercard.selectProcess('Message or question');;
      usercard.selectState('Question');
      usercard.checkStartDateChoiceExists();
      usercard.checkEndDateChoiceExists();
      usercard.checkLttdChoiceExists();
      usercard.checkEmitterSelectDoesNotExist();
    })

    it('Only start dates choices should be displayed in Message user card (Process example)', () => {

      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('Base Examples');
      usercard.selectProcess('Process example');
      usercard.selectState('Message');
      usercard.checkStartDateChoiceExists();
      usercard.checkEndDateChoiceDoesNotExist();
      usercard.checkLttdChoiceDoesNotExist();
      usercard.checkEmitterSelectDoesNotExist();
    })

    it('Process select should be displayed even if there is only one process', () => {

      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('Base Examples');
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
      cy.get('opfab-info-message').should('not.exist'); // no error message
      usercard.cancelCardSending();

      // a report name without report link : an error should be displayed
      cy.get('#report_title').invoke('val', 'report name'); // using invoke instead of cy.type to avoid flaky cypress test 
      cy.get('#opfab-usercard-btn-prepareCard').click();
      cy.get('.opfab-info-message').contains('You must provide a report name and link, or none of them.');
      cy.get('.opfab-alert-close').click();

      // a report link without report name : an error should be displayed
      cy.get('#report_link').type('report link');
      cy.get('#report_title').clear();
      cy.get('#opfab-usercard-btn-prepareCard').click();
      cy.get('.opfab-info-message').contains('You must provide a report name and link, or none of them.');
      cy.get('.opfab-alert-close').click();

      // a report name and a report link : no error
      cy.get('#report_title').type("report name");
      cy.get('#opfab-usercard-btn-prepareCard').click();
      cy.get('#div-detail-msg').should('not.exist'); // no error message
      usercard.cancelCardSending();
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
      script.deleteAllCards();
      script.deleteAllArchivedCards();
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

      usercard.preview();

      // No responses shown 
      cy.get("#childs-div").should('be.empty');
      usercard.cancelCardSending();

      // Select also one of user entities as recipent
      usercard.selectRecipient('Control Center FR North');
      usercard.preview();

      // Feed preview show response from current entity
      cy.get('#opfab-feed-lightcard-hasChildCardFromCurrentUserEntity').should('exist');
      // Card preview show responses list
      cy.get("#childs-div").should('not.be.empty');
      // Response table has 1 header and 1 row 
      cy.get("#childs-div").find('tr').should('have.length', 2);
      usercard.sendCard();
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
      script.deleteAllCards();
      script.deleteAllArchivedCards();
    });

    it('Send User card from operator1_fr', () => {

      opfab.loginWithUser('operator1_fr');
      feed.checkNumberOfDisplayedCardsIs(0);
      opfab.navigateToUserCard();
      usercard.checkEmitterSelectDoesNotExist();
      cy.get('#message').type('Hello, that\'s a test message / Result is <OK> & work done is 100%');
      cy.setFormDateTime('startDate','2020','Jan',20,8,0);
      usercard.selectRecipient('Control Center FR South');
      usercard.previewThenSendCard();
      feed.openFirstCard();
      feed.checkSelectedCardHasTitle("Message");
      feed.checkSelectedCardHasSummary("Message received :   Hello, that's a test message / Result is <OK> & work done is 100%");
      cy.get('#opfab-div-card-template-processed').find('div').eq(0).should('have.text', "\n  Hello, that's a test message / Result is <OK> & work done is 100%\n");

    })



    it('Receive User card ', () => {

      opfab.loginWithUser('operator2_fr');
      feed.checkNumberOfDisplayedCardsIs(1);
      cy.get('#opfab-lightcard-dates').contains('(08:00 20/01/2020 - )');
      feed.openFirstCard();
      feed.checkSelectedCardHasTitle("Message");
      feed.checkSelectedCardHasSummary("Message received :   Hello, that's a test message / Result is <OK> & work done is 100%");
      cy.get('#opfab-div-card-template-processed').find('div').eq(0).should('have.text', "\n  Hello, that's a test message / Result is <OK> & work done is 100%\n");
    })
  })


  describe('Edit user card', function () {

    it('Edit User card from operator1_fr', () => {

      opfab.loginWithUser('operator1_fr');
      feed.openFirstCard();
      feed.editCurrentCard();
      usercard.checkEmitterSelectDoesNotExist();
      cy.get('#message').should('be.visible');
      cy.waitDefaultTime();
      cy.get('#message').type(' (updated)');
      usercard.previewThenSendCard();
    })


    it('Receive modified User card', () => {

      opfab.loginWithUser('operator2_fr');
      feed.openFirstCard();
      cy.get('#opfab-div-card-template-processed').find('div').eq(0).should('have.text', "\n   Hello, that's a test message / Result is <OK> & work done is 100%  (updated)\n");
      feed.checkSelectedCardHasTitle("Message");
      feed.checkSelectedCardHasSummary("Message received :    Hello, that's a test message / Result is <OK> & work done is 100%  (updated)");

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

      script.sendCard('cypress/userCard/message.json');
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
      script.deleteAllCards();
      script.sendCard('cypress/userCard/process.json');
    });

    it('Edit card from allowed entity', () => {
      opfab.loginWithUser('operator1_fr');
      feed.openFirstCard();
      feed.editCurrentCard();
      // check this to be sure template has been loaded
      cy.get('#state-select');
      usercard.previewThenSendCard();
    })

    it('Cannot edit card from not allowed entity', () => {
      script.sendCard('cypress/userCard/process.json');
      opfab.loginWithUser('operator2_fr');
      feed.openFirstCard();
      cy.get('#opfab-card-edit').should('not.exist');
    })


    it('Send User card with entitiesAllowedToEdit = "ENTITY_FR"', () => {
      script.deleteAllCards();
      opfab.loginWithUser('operator1_fr');
      feed.checkNumberOfDisplayedCardsIs(0);

      opfab.navigateToUserCard();
      cy.get("of-usercard").should('exist');
      cy.get('#message').type('Hello')
      usercard.selectRecipient('Control Center FR South');
      usercard.previewThenSendCard();
      feed.openFirstCard(); 
      cy.get('#opfab-div-card-template-processed').find('div').eq(0).should('have.text', '\n  Hello\n')
      feed.checkSelectedCardHasTitle("Message");
      feed.checkSelectedCardHasSummary("Message received :   Hello");

    })

    it('Edit user card from allowed entity', () => {

      opfab.loginWithUser('operator2_fr');
      feed.openFirstCard();
      feed.editCurrentCard();
      // check this to be sure template has been loaded
      cy.get("#hidden_sender").should("have.value", "ENTITY2_FR");
      usercard.previewThenSendCard();
        
    })

  })

  describe('Entities allowed to edit card sent by third party ', function () {

      before('Set up configuration', function () {

        script.deleteAllCards();
        script.sendCard('cypress/userCard/processSendByExternal.json');

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
        usercard.previewThenSendCard();

      })

  })


  describe('Show responses in card preview when keepChildCards=true ', function () {

    it('Send User card with keepChildCards=true', () => {
      
      script.deleteAllCards();
      opfab.loginWithUser('operator1_fr');
      feed.checkNumberOfDisplayedCardsIs(0);

      opfab.navigateToUserCard();
      usercard.selectService('User card examples');
      usercard.selectProcess('Conference and IT incident');
      usercard.selectState('IT Incident');

      // check this to be sure template has been loaded
      cy.get('#service-select');

      usercard.previewThenSendCard();
      feed.checkNumberOfDisplayedCardsIs(1);
    })

    it('Respond as operator2_fr', () => {
      
      opfab.loginWithUser('operator2_fr');
      feed.openFirstCard();
      // template is ready
      cy.get("#services").should('exist');
      // Respond to the card 
      card.sendResponse();
      
    })

    it('Edit card and check card preview show the response', ()=>{

      opfab.loginWithUser('operator1_fr');
      feed.openFirstCard();
      feed.editCurrentCard();
      usercard.preview();
      // Card preview show responses list
      cy.get("#childs-div").should('not.be.empty');
      // Response table has 1 header and 1 row 
      cy.get("#childs-div").find('tr').should('have.length', 2);

    })
  })

  describe('Send user card with operator4_fr, member of several entities', function () {

    before('Delete previous cards', function () {
        script.deleteAllCards();
        script.deleteAllArchivedCards();
    });

    it('Send User card from operator4_fr', () => {
      
      opfab.loginWithUser('operator4_fr');
      feed.checkNumberOfDisplayedCardsIs(0);
      opfab.navigateToUserCard();

      // check template rendering done
      cy.get('#message').should('be.visible');

      usercard.checkEmitterSelectExists();
      cy.get('#of-usercard-card-emitter-selector').find('label').first().should("have.text", "EMITTER");
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').should("have.length", 4);
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(0).should("contain.text", "Control Center FR East");
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(1).should("contain.text", "Control Center FR North");
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(2).should("contain.text", "Control Center FR South");
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(3).should("contain.text", "Control Center FR West");

      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(2).click({force: true});
      cy.get('#message').type('Hello, that\'s a test message / Result is <OK> & work done is 100%');
      cy.setFormDateTime('startDate', '2020', 'Jan', 20, 8, 0);
      usercard.selectRecipient('Control Center FR South');
      usercard.previewThenSendCard();
      feed.checkNumberOfDisplayedCardsIs(1);
      feed.openFirstCard();
      cy.get('#opfab-div-card-template-processed').find('div').eq(0).should('have.text', "\n  Hello, that's a test message / Result is <OK> & work done is 100%\n");
      feed.checkSelectedCardHasTitle("Message");
      feed.checkSelectedCardHasSummary("Message received :   Hello, that's a test message / Result is <OK> & work done is 100%");
      cy.get('#opfab-form-entity').should('have.text', 'from\u00a0:\u00a0Control Center FR South');

    })

    it('Edit User card and change card emitter', () => {

        opfab.loginWithUser('operator4_fr');
        feed.openFirstCard();
        feed.editCurrentCard();

        // check template rendering done
        cy.get('#message').should('be.visible');

        // Check that card emitter is set to Control Center FR South
        usercard.checkEmitterSelectExists();
        cy.get('#of-usercard-card-emitter-selector').find('.vscomp-value').should('have.text', 'Control Center FR South');

        // Now we choose Control Center FR North as card emitter
        cy.get("#of-usercard-card-emitter-selector").find('.vscomp-option-text').eq(1).click({force: true});

        cy.get('#message').should('be.visible').type(' (updated)')
        usercard.previewThenSendCard();

        cy.waitDefaultTime();

        // Check that the new card emitter 'Control Center FR North' is taken into account
        cy.get('#opfab-div-card-template-processed').find('div').eq(0).should('have.text', "\n   Hello, that's a test message / Result is <OK> & work done is 100%  (updated)\n");
        feed.checkSelectedCardHasTitle("Message");
        feed.checkSelectedCardHasSummary("Message received :    Hello, that's a test message / Result is <OK> & work done is 100%  (updated)");
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
      usercard.checkEmitterSelectExists();
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-value').should('have.text', 'Control Center FR East');

      // Check that we have now only 3 entities available (instead of 4 because disconnected from ENTITY1_FR)
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').should("have.length", 3);
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(0).should("contain.text", "Control Center FR East");
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(1).should("contain.text", "Control Center FR South");
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(2).should("contain.text", "Control Center FR West");


    })


    it('Send User card from operator4_fr with restricted list of emitters for a state', () => {

      opfab.loginWithUser('operator4_fr');
      feed.checkNumberOfDisplayedCardsIs(1);

      // operator4_fr reconnect to Control Center FR North (ENTITY1_FR)
      opfab.navigateToActivityArea();

      // Check every checkbox to let the time for the ui to set to true before we click
      cy.get('.opfab-checkbox').eq(0).find('input').should('be.checked');
      cy.get('.opfab-checkbox').eq(1).find('input').should('not.be.checked');
      cy.get('.opfab-checkbox').eq(2).find('input').should('be.checked');
      cy.get('.opfab-checkbox').eq(3).find('input').should('be.checked');

      activityArea.clickOnCheckbox('Control Center FR North');

      // Check every checkbox to let the time for the ui to set to true before we click
      cy.get('.opfab-checkbox').eq(0).find('input').should('be.checked');
      cy.get('.opfab-checkbox').eq(1).find('input').should('be.checked');
      cy.get('.opfab-checkbox').eq(2).find('input').should('be.checked');
      cy.get('.opfab-checkbox').eq(3).find('input').should('be.checked');

      activityArea.save();

      opfab.navigateToUserCard();

      // check template rendering done
      cy.get('#message').should('be.visible');

      usercard.selectState('Process example');

      usercard.checkEmitterSelectExists();
      cy.get('#of-usercard-card-emitter-selector').find('label').first().should("have.text", "EMITTER");
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').should("have.length", 2);
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(0).should("contain.text", "Control Center FR East");
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(1).should("contain.text", "Control Center FR North");

      usercard.selectState('Message');

      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').should("have.length",4);
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(0).should("contain.text", "Control Center FR East");
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(1).should("contain.text", "Control Center FR North");
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(2).should("contain.text", "Control Center FR South");
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(3).should("contain.text", "Control Center FR West");

      usercard.selectState('Process example');

      usercard.checkEmitterSelectExists();
      cy.get('#of-usercard-card-emitter-selector').find('label').first().should("have.text", "EMITTER");
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').should("have.length", 2);
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(0).should("contain.text", "Control Center FR East");
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(1).should("contain.text", "Control Center FR North");

       // Now we choose Control Center FR North as card emitter
       cy.get("#of-usercard-card-emitter-selector").find('.vscomp-option-text').eq(1).click({force: true});
      usercard.previewThenSendCard();

      opfab.navigateToFeed();
      feed.checkNumberOfDisplayedCardsIs(2);

    })


    it('Edit User card from operator4_fr with restricted list of emitters for a state', () => {

      opfab.loginWithUser('operator4_fr');
      feed.checkNumberOfDisplayedCardsIs(2);

      feed.openFirstCard();

      cy.get('#opfab-div-card-template-processed').contains('Process is in state');

      feed.editCurrentCard();

      usercard.checkEmitterSelectExists();

      cy.get('#of-usercard-card-emitter-selector').find('label').first().should("have.text", "EMITTER");
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').should("have.length", 2);
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(0).should("contain.text", "Control Center FR East");
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(1).should("contain.text", "Control Center FR North");

      usercard.selectState('Message');

      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').should("have.length",4);
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(0).should("contain.text", "Control Center FR East");
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(1).should("contain.text", "Control Center FR North");
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(2).should("contain.text", "Control Center FR South");
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(3).should("contain.text", "Control Center FR West");

      usercard.selectState('Process example');

      usercard.checkEmitterSelectExists();
      cy.get('#of-usercard-card-emitter-selector').find('label').first().should("have.text", "EMITTER");
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').should("have.length", 2);
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(0).should("contain.text", "Control Center FR East");
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(1).should("contain.text", "Control Center FR North");


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
      usercard.previewThenSendCard();
      cy.get("#opfab-card-list").contains("IT INCIDENT"); // to be sure card is in the feed (avoid flaky test with github CI)
      feed.openFirstCard();
      feed.editCurrentCard();
      cy.get("#hidden_process").should("exist");
      cy.get("#hidden_process").should("have.value", "conferenceAndITIncidentExample");

      cy.get("#hidden_state").should("exist");
      cy.get("#hidden_state").should("have.value", "incidentInProgressState");
    })
  })


  describe('Loading start date, end date and lttd from template', function () {

    it('Check dates are loaded from template for confirmation user card', () => {

      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('User card examples');
      usercard.selectProcess('Message or question');
      usercard.selectState('Confirmation');

      const startDate = new Date();
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
      usercard.checkEmitterSelectExists();
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-value').should('contain.text', 'Control Center FR East');


      cy.get("#hidden_sender").should("exist");
      cy.get("#hidden_sender").should("have.value", "ENTITY3_FR");

      // Now we choose Control Center FR South as card emitter
      cy.get("#of-usercard-card-emitter-selector").find('.vscomp-option-text').eq(2).click({force: true});
      cy.get('#of-usercard-card-emitter-selector').find('.vscomp-value').should('contain.text', 'Control Center FR South');
      cy.get("#hidden_sender").should("have.value", "ENTITY2_FR");

      // Test on editing existing card, opened from the feed
      usercard.previewThenSendCard();
      
      cy.waitDefaultTime();

      feed.openFirstCard();
      feed.editCurrentCard();

      cy.get("#hidden_sender").should("exist");
      cy.get("#hidden_sender").should("have.value", "ENTITY2_FR");

    });
  })

  describe('Set timeSpans from template', function () {

    it('Set timeSpans from template', () => {
      script.deleteAllCards();
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
      usercard.previewThenSendCard();
      
      cy.waitDefaultTime();
      cy.get('#opfab-timeline-link-period-7D').click();
      cy.get('ellipse').should('have.length', 7);

    })
  })

  describe('Set initial severity from template', function () {

    it('Set initial severity from template', () => {
      script.deleteAllCards();
      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();

      // Check default severity level value is 'Alarm'
      usercard.checkSelectedSeverityIs('ALARM');

      // Check initial severity level for task  value is set to 'Action'
      usercard.selectService('User card examples');
      usercard.selectProcess('Task');
      usercard.checkSelectedSeverityIs('ACTION');

      // Change severity, send card, edit it and check severity is not modified on edition
      cy.get('#opfab-sev-information').check();
      usercard.checkSelectedSeverityIs('INFORMATION');
      cy.get('#time').type('12:00'); // We fix the field "time" for recurrence, otherwise the request will return 400 (bad request) because of the CI which runs very fast
      usercard.previewThenSendCard();
      feed.openFirstCard();
      feed.editCurrentCard();
      usercard.checkSelectedSeverityIs('INFORMATION');
      
    })
  })
  
  describe('Get selected recipient entities from template', function () {

    it('Get selected entities and add recipient from template', () => {
      script.deleteAllCards();
      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();

      usercard.selectProcess('Process example');
      usercard.selectState('Process example');

      usercard.selectRecipient('Control Center FR North');
      usercard.preview();
      usercard.checkEntityRecipientsInPreviewContains("Control Center FR North");
      usercard.checkEntityRecipientsInPreviewContains("North Europe Control Center");

      usercard.cancelCardSending();

      usercard.selectRecipient('Control Center FR South');
      usercard.preview();
      usercard.checkEntityRecipientsInPreviewContains("Control Center FR South");
      usercard.checkEntityRecipientsInPreviewContains("South Europe Control Center");
      usercard.cancelCardSending();
    })
  })

  describe('Check search feature in dropdown select and if businessdata were correctly imported', function () {
    
    it('Search feature should be enabled on services dropdown for "IT incident" user card', () => {
      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('User card examples');
      usercard.selectProcess('Conference and IT incident');
      usercard.selectState('IT Incident');
      // check search is enabled for service select
      usercard.checkServiceSelectExists();
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
      cy.get('#service-select').find('.vscomp-option-text').should('have.length', 3);
      cy.get('#service-select').find('.vscomp-option-text').eq(0).contains("D");
      cy.get('#service-select').find('.vscomp-option-text').eq(1).contains("Group 2");
      cy.get('#service-select').find('.vscomp-option-text').eq(2).contains("Service D");
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



  describe('Expiration Date', function () {

    before('Delete previous cards', function () {
      script.deleteAllCards();
      script.deleteAllArchivedCards();
    });

    it('Check expiration date icon is present when expirationDate is set', () => {
      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('Base Examples');
      usercard.selectProcess('Process example');
      usercard.selectState('Process example');
      cy.setFormDateTime('startDate','2020','Jan',20,8,0);
      cy.setFormDateTime('endDate','2029','Jun',25,11,10);
      cy.setFormDateTime('expirationDate','2029','Jun',25,11,10);
      usercard.previewThenSendCard();
      feed.openFirstCard();
      card.checkExpirationDateIconDoesExist();
    });
  });

  describe('Check service, process and state select', function () {
    it('Check process select when no process group is defined', () => {
      script.loadEmptyProcessGroups();
      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.checkServiceSelectDoesNotExist();
      usercard.checkSelectedProcessIs('Conference and IT incident ');
      usercard.checkSelectedStateIs('Conference Call ☏');
    })

    it('Check process select when no process is in no group', () => {
      script.loadProcessGroupsNotTotallyConfigured();
      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.checkSelectedServiceIs('--');
      usercard.checkSelectedProcessIs('Task');
      usercard.checkStateSelectDoesNotExist();
    })
  })

  describe('Check entityRecipientsForInformation field', function () {

    it('Choose an entity recipient for information not included in entity recipients', () => {
      script.deleteAllCards();
      script.loadProcessGroups();
      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();

      usercard.selectProcess('Process example');
      usercard.selectState('Process example');
      usercard.checkRecipientForInformationSelectDoesNotExist();

      usercard.selectState('Message');
      // We check all entities are proposed in the dropdown list
      cy.get('#opfab-recipients-for-information').find('.vscomp-option-text').should("have.length", 15);

      usercard.selectRecipient('Control Center FR North');
      usercard.selectRecipientForInformation('Control Center FR West');
      usercard.selectRecipientForInformation('Control Center FR East');
      usercard.preview();

      cy.get("#opfab-entity-recipients").find('span').should('have.length', 2);
      usercard.checkEntityRecipientsInPreviewContains("Control Center FR North");

      cy.get("#opfab-entity-recipients-for-information").find('span').should('have.length', 3);
      usercard.checkEntityRecipientsForInformationInPreviewContains("Control Center FR West");
      usercard.checkEntityRecipientsForInformationInPreviewContains("Control Center FR East");

      usercard.sendCard();
      feed.openFirstCard();

      // We check only Control Center FR North is in the ack footer
      cy.get('#opfab-card-acknowledged-footer').should('exist');
      cy.get('#opfab-card-acknowledged-footer').find('span').should("have.length", 2); // 1 entity + 1 for 'Acknowledged :' label
      cy.get('#opfab-card-acknowledged-footer').find('span').eq(1).should("have.text", "\u00a0 Control Center FR North \u00a0")
          .and('have.css', 'color', 'rgb(255, 102, 0)');

      // We check operator3_fr has received the card (member of Control Center FR East)
      opfab.logout();
      opfab.loginWithUser('operator3_fr');
      cy.get('of-light-card').should('have.length', 1);

      // We check operator4_fr has received the card (member of Control Center FR West)
      opfab.logout();
      opfab.loginWithUser('operator4_fr');
      cy.get('of-light-card').should('have.length', 1);
    })

    it('Choose an entity recipient for information also present in entity recipients', () => {
      script.deleteAllCards();
      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();

      usercard.selectState('Message');

      usercard.selectRecipient('Control Center FR North');
      usercard.selectRecipient('Control Center FR East');
      usercard.selectRecipientForInformation('Control Center FR West');
      usercard.selectRecipientForInformation('Control Center FR East');
      usercard.preview();

      // We check Control Center FR East is displayed in 'Recipients' section and not in 'Recipients for information'
      cy.get("#opfab-entity-recipients").find('span').should('have.length', 3);
      usercard.checkEntityRecipientsInPreviewContains("Control Center FR North");
      usercard.checkEntityRecipientsInPreviewContains("Control Center FR East");

      cy.get("#opfab-entity-recipients-for-information").find('span').should('have.length', 2);
      usercard.checkEntityRecipientsForInformationInPreviewContains("Control Center FR West");

      usercard.sendCard();
      feed.openFirstCard();

      // We check Control Center FR North and Control Center FR East is in the ack footer
      cy.get('#opfab-card-acknowledged-footer').should('exist');
      cy.get('#opfab-card-acknowledged-footer').find('span').should("have.length", 3); // 2 entities + 1 for 'Acknowledged :' label
      cy.get('#opfab-card-acknowledged-footer').find('span').eq(1).should("have.text", "\u00a0 Control Center FR East \u00a0")
          .and('have.css', 'color', 'rgb(255, 102, 0)');
      cy.get('#opfab-card-acknowledged-footer').find('span').eq(2).should("have.text", "\u00a0 Control Center FR North \u00a0")
          .and('have.css', 'color', 'rgb(255, 102, 0)');

      // We check operator3_fr has received the card (member of Control Center FR East)
      opfab.logout();
      opfab.loginWithUser('operator3_fr');
      cy.get('of-light-card').should('have.length', 1);

      // We check operator4_fr has received the card (member of Control Center FR West)
      opfab.logout();
      opfab.loginWithUser('operator4_fr');
      cy.get('of-light-card').should('have.length', 1);
    })

    it('Check restricted list of entity recipients for information and values selected by default', () => {
      script.deleteAllCards();
      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();

      usercard.selectService('User card examples');
      usercard.selectProcess('Message or question');
      usercard.selectState('Message');

      // We check the list of entities is restricted in the dropdown list
      cy.get('#opfab-recipients-for-information').find('.vscomp-option-text').should('have.length', 6);
      cy.get('#opfab-recipients-for-information').find('.vscomp-option-text').eq(0).contains("Control Center FR East");
      cy.get('#opfab-recipients-for-information').find('.vscomp-option-text').eq(1).contains("Control Center FR North");
      cy.get('#opfab-recipients-for-information').find('.vscomp-option-text').eq(2).contains("Control Center FR South");
      cy.get('#opfab-recipients-for-information').find('.vscomp-option-text').eq(3).contains("Control Center FR West");
      cy.get('#opfab-recipients-for-information').find('.vscomp-option-text').eq(4).contains("French Control Centers");
      cy.get('#opfab-recipients-for-information').find('.vscomp-option-text').eq(5).contains("IT SUPERVISION CENTER");

      cy.get('#opfab-recipients-for-information').find('.vscomp-value').contains("Control Center FR East").should('not.exist');
      cy.get('#opfab-recipients-for-information').find('.vscomp-value').contains("Control Center FR North").should('not.exist');
      cy.get('#opfab-recipients-for-information').find('.vscomp-value').contains("Control Center FR South").should('not.exist');
      cy.get('#opfab-recipients-for-information').find('.vscomp-value').contains("Control Center FR West");
      cy.get('#opfab-recipients-for-information').find('.vscomp-value').contains("French Control Centers").should('not.exist');
      cy.get('#opfab-recipients-for-information').find('.vscomp-value').contains("IT SUPERVISION CENTER").should('not.exist');
      
      // We check we can add an entity to the default selected value
      usercard.selectRecipientForInformation('IT SUPERVISION CENTER');
      cy.get('#usercard_message_input').type('Hello');
      usercard.preview();

      cy.get("#opfab-entity-recipients").find('span').should('have.length', 4);
      usercard.checkEntityRecipientsInPreviewContains("Control Center FR North");
      usercard.checkEntityRecipientsInPreviewContains("Control Center FR South");
      usercard.checkEntityRecipientsInPreviewContains("Control Center FR East");

      cy.get("#opfab-entity-recipients-for-information").find('span').should('have.length', 3);
      usercard.checkEntityRecipientsForInformationInPreviewContains("Control Center FR West");
      usercard.checkEntityRecipientsForInformationInPreviewContains("IT SUPERVISION CENTER");

      usercard.sendCard();
      feed.openFirstCard();

      // We check only Control Center FR North, East and South is in the ack footer
      cy.get('#opfab-card-acknowledged-footer').should('exist');
      cy.get('#opfab-card-acknowledged-footer').find('span').should("have.length", 4); // 3 entities + 1 for 'Acknowledged :' label
      cy.get('#opfab-card-acknowledged-footer').find('span').eq(1).should("have.text", "\u00a0 Control Center FR East \u00a0")
          .and('have.css', 'color', 'rgb(255, 102, 0)');
      cy.get('#opfab-card-acknowledged-footer').find('span').eq(2).should("have.text", "\u00a0 Control Center FR North \u00a0")
          .and('have.css', 'color', 'rgb(255, 102, 0)');
      cy.get('#opfab-card-acknowledged-footer').find('span').eq(3).should("have.text", "\u00a0 Control Center FR South \u00a0")
          .and('have.css', 'color', 'rgb(255, 102, 0)');

      // We check operator4_fr has received the card (member of Control Center FR West)
      opfab.logout();
      opfab.loginWithUser('operator4_fr');
      cy.get('of-light-card').should('have.length', 1);

      // We check itsupervisor1 has received the card (member of IT SUPERVISION CENTER)
      opfab.logout();
      opfab.loginWithUser('itsupervisor1');
      cy.get('of-light-card').should('have.length', 1);
    })
  })

  describe('Check "create a copy" feature', function () {
    
    it('Check "create a copy" button is present only when it should', () => {
      script.deleteAllCards();
      script.send6TestCards();
      opfab.loginWithUser('operator1_fr');
      feed.sortByReceptionDate();
      feed.checkNumberOfDisplayedCardsIs(6);

      feed.openNthCard(0);
      card.checkEditButtonDoesNotExist();

      feed.openNthCard(1);
      card.checkEditButtonDoesNotExist();

      feed.openNthCard(2);
      card.checkEditButtonDoesNotExist();

      feed.openNthCard(3);
      card.checkCopyButtonDoesExist();

      feed.openNthCard(4);
      card.checkEditButtonDoesNotExist();

      feed.openNthCard(5);
      card.checkCopyButtonDoesExist();
    })

    
    it('Check fields service/process/state/severity/data/recipients/recipients for information are copied from the original ' +
        'card and emitter field is not copied', () => {
      script.deleteAllCards();
      opfab.loginWithUser('operator4_fr');
      opfab.navigateToUserCard();
      usercard.selectService('User card examples');
      usercard.selectProcess('Message or question');
      usercard.selectState('Message');

      cy.waitDefaultTime();
      cy.get('#opfab-sev-information').check(); // we set severity different from default value
      cy.get('#usercard_message_input').type('Test for copy card feature');

      usercard.selectEmitter('Control Center FR West');

      usercard.clearSelectedRecipients();
      usercard.selectRecipient('Control Center FR South');

      usercard.clearSelectedRecipientsForInformation();
      usercard.selectRecipientForInformation('Control Center FR East');

      usercard.previewThenSendCard();
      feed.openFirstCard();
      feed.copyCurrentCard();

      //we check the fields have been copied in the usercard form
      usercard.checkSelectedServiceIs('User card examples');
      usercard.checkSelectedProcessIs('Message or question');
      usercard.checkSelectedStateIs('Message');
      usercard.checkSelectedSeverityIs('INFORMATION');
      cy.get('#usercard_message_input').should('contain.text', 'Test for copy card feature');
      usercard.checkNumberOfRecipientsIs(1);
      usercard.checkRecipientsContain('Control Center FR South');
      usercard.checkNumberOfRecipientsForInformationIs(1);
      usercard.checkRecipientsForInformationContain('Control Center FR East');

      //we check the emitter is not copied (emitter value should be set to the default value)
      usercard.checkEmitterIs('Control Center FR East');
    })
  })
})
