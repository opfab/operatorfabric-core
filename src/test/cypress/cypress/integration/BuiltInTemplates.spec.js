/* Copyright (c) 2023, RTE (http://www.rte-france.com)
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
import {ScriptCommands} from "../support/scriptCommands";

describe('User Card ', function () {

  const usercard = new UserCardCommands();
  const opfab = new OpfabGeneralCommands();
  const feed = new FeedCommands();
  const script = new ScriptCommands();

  before('Set up configuration', function () {

    script.resetUIConfigurationFiles();
    script.loadTestConf();
    script.deleteAllCards();
    script.deleteAllArchivedCards();
    script.deleteAllSettings();
  });

  describe('Send user card with question and answer it', function () {

    before('Delete previous cards', function () {
      script.deleteAllCards();
      script.deleteAllArchivedCards();
    });

    it('Send User card with question from operator1_fr', () => {

      opfab.loginWithUser('operator1_fr');
      feed.checkNumberOfDisplayedCardsIs(0);
      opfab.navigateToUserCard();
      opfab.selectOptionsFromMultiselect('#of-usercard-service-selector', ['User card examples']);
      opfab.selectOptionsFromMultiselect('#of-usercard-process-filter', ['Message or question'], false)
      opfab.selectOptionsFromMultiselect('#of-state-filter', ['Message or question list']);
      cy.get('#message-select').click();
      cy.get('#message-select').find('.vscomp-search-input').type('Confirmation the issues have been fixed');
      cy.get('#message-select').find('.vscomp-option-text').eq(0).click();
      usercard.previewThenSendCard();    
    })

    it('Receive User card and answer it', () => {

      opfab.loginWithUser('operator2_fr');
      feed.checkNumberOfDisplayedCardsIs(1);
      feed.openFirstCard();
      cy.get("#message").contains("Please confirm the issues in your area have been fixed");
      cy.get("#comment").type("My answer")
      cy.get("#opfab-card-details-btn-response").click();
      cy.get("#childs-div").contains("My answer");
    })
  })

  describe('Send user card with question and answer it', function () {
    before('Delete previous cards', function () {
      script.deleteAllCards();
      script.deleteAllArchivedCards();
    });
    it('Check task advanced card appears on the timeline and calendar', function () {
        
      opfab.loginWithUser('operator1_fr');

      setTimeLineDomain('7D');
      checkHaveCircle(0);

      // Sends 7 cards over the coming week
      opfab.navigateToUserCard();
      usercard.checkEmitterSelectDoesNotExist();
      opfab.selectOptionsFromMultiselect('#of-usercard-service-selector', ['User card examples'], false)
      opfab.selectOptionsFromMultiselect('#of-usercard-process-filter', ['Task Advanced'], false)
      cy.waitDefaultTime();
      cy.get('#time').type('00:00');
      usercard.previewThenSendCard();    

      // Check first week has 7 cards 
      checkHaveCircle(7);

      cy.get('#opfab-navbarContent').find('#opfab-calendar-menu').click();

      // Check 7 cards are on the calendar screen with the default month view
      cy.get('.opfab-calendar-event').should('have.length', 7);

      // Delete the recurrent cards
      opfab.navigateToFeed();
      feed.openFirstCard();
      feed.deleteCurrentCard();   
  });

  function setTimeLineDomain(domain) {
    cy.get('#opfab-timeline-link-period-' + domain).click();
  }

  function checkHaveCircle(nb) {
      cy.get("of-custom-timeline-chart").find("ellipse").should('have.length', nb);
  }
})
})
