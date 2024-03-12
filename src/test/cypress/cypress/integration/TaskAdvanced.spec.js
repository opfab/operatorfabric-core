/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
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

describe('Task Advanced', function () {

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

    it('Check task advanced card appears on the timeline and calendar', function () {

      opfab.loginWithUser('operator1_fr');

      setTimeLineDomain('7D');
      checkHaveCircle(0);

      // Sends 7 cards over the coming week
      opfab.navigateToUserCard();
      usercard.checkEmitterSelectDoesNotExist();
      usercard.selectService('User card examples')
      usercard.selectProcess('Task Advanced');
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
  });

  describe('Send Task advanced user card, open the card and edit it', function () {


    beforeEach(() => {
      script.deleteAllCards();
      script.deleteAllArchivedCards();
    });

    it('Send Task advanced user card for daily frequency from operator1_fr', () => {

      opfab.loginWithUser('operator1_fr');
      feed.checkNumberOfDisplayedCardsIs(0);
      opfab.navigateToUserCard();
      usercard.selectService('User card examples');
      usercard.selectProcess('Task Advanced');
      cy.get('#taskTitle').invoke('val', 'Task title');
      cy.get('#taskDescription').invoke('val', 'Test task for daily frequency');

      // we unselect Tuesday, Thursday, Saturday, Sunday
      cy.get('.opfab-checkbox').contains('Tuesday').click();
      cy.get('.opfab-checkbox').contains('Thursday').click();
      cy.get('.opfab-checkbox').contains('Saturday').click();
      cy.get('.opfab-checkbox').contains('Sunday').click();

      // we unselect January, March, April, June, July, September, October
      cy.get('.opfab-checkbox').contains('January').click();
      cy.get('.opfab-checkbox').contains('March').click();
      cy.get('.opfab-checkbox').contains('April').click();
      cy.get('.opfab-checkbox').contains('June').click();
      cy.get('.opfab-checkbox').contains('July').click();
      cy.get('.opfab-checkbox').contains('September').click();
      cy.get('.opfab-checkbox').contains('October').click();

      cy.get('#time').type('20:00');
      cy.get('#durationInMinutes').clear();
      cy.get('#durationInMinutes').type('20');
      cy.get('#minutesForReminder').clear();
      cy.get('#minutesForReminder').type('10');
      usercard.previewThenSendCard();

      // We check the content of the card
      feed.openFirstCard();
      feed.checkSelectedCardHasTitle("Task Advanced - Task title");
      feed.checkSelectedCardHasSummary("There is something to do");
      cy.get('#opfab-div-card-template-processed').should('contain.text', "Test task for daily frequency");
      cy.get('#opfab-div-card-template-processed').should('contain.text', "Duration: 20 minutes");
      cy.get('#opfab-div-card-template-processed').should('contain.text', "At 20:00\n        on Monday Wednesday Friday");
      cy.get('#opfab-div-card-template-processed').should('contain.text', "in February May August November December");

      // We check all fields are correctly filled
      feed.editCurrentCard();
      cy.get("#taskDescription").should('have.value', 'Test task for daily frequency');
      cy.get('#Monday').should('be.checked');
      cy.get('#Tuesday').should('not.be.checked');
      cy.get('#Wednesday').should('be.checked');
      cy.get('#Thursday').should('not.be.checked');
      cy.get('#Friday').should('be.checked');
      cy.get('#Saturday').should('not.be.checked');
      cy.get('#Sunday').should('not.be.checked');

      cy.get('#JanuaryDaily').should('not.be.checked');
      cy.get('#FebruaryDaily').should('be.checked');
      cy.get('#MarchDaily').should('not.be.checked');
      cy.get('#AprilDaily').should('not.be.checked');
      cy.get('#MayDaily').should('be.checked');
      cy.get('#JuneDaily').should('not.be.checked');
      cy.get('#JulyDaily').should('not.be.checked');
      cy.get('#AugustDaily').should('be.checked');
      cy.get('#SeptemberDaily').should('not.be.checked');
      cy.get('#OctoberDaily').should('not.be.checked');
      cy.get('#NovemberDaily').should('be.checked');
      cy.get('#DecemberDaily').should('be.checked');

      cy.get('#time').should('have.value', '20:00');
      cy.get('#durationInMinutes').should('have.value', '20');
      cy.get('#minutesForReminder').should('have.value', '10');
    });

    it('Send Task advanced user card for monthly frequency (Nth day) from operator1_fr', () => {

      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('User card examples');
      usercard.selectProcess('Task Advanced');
      cy.get('#radioButtonMonthlyFreq').click();
      cy.get('#taskTitle').invoke('val', 'Task title');
      cy.get('#taskDescription').invoke('val', 'Test task for monthly frequency (Nth day)');

      // by default, all months are selected, so we unselect all months
      cy.get('#selectAllMonths').parent().find('.opfab-checkbox-checkmark').click();
      // then we select the months we want
      cy.get('#monthsCheckboxesForMonthlyFreq').find('.opfab-checkbox').contains('July').click();
      cy.get('#monthsCheckboxesForMonthlyFreq').find('.opfab-checkbox').contains('August').click();
      cy.get('#monthsCheckboxesForMonthlyFreq').find('.opfab-checkbox').contains('November').click();
      cy.get('#monthsCheckboxesForMonthlyFreq').find('.opfab-checkbox').contains('December').click();

      cy.get('.opfab-checkbox').contains('First day').click();
      cy.get('.opfab-checkbox').contains('Last day').click();
      cy.get('#nthDay').type('15');

      cy.get('#time').type('21:00');
      cy.get('#durationInMinutes').clear();
      cy.get('#durationInMinutes').type('5');
      cy.get('#minutesForReminder').clear();
      cy.get('#minutesForReminder').type('2');
      usercard.previewThenSendCard();

      // We check the content of the card
      feed.openFirstCard();
      feed.checkSelectedCardHasTitle("Task Advanced - Task title");
      feed.checkSelectedCardHasSummary("There is something to do");
      cy.get('#opfab-div-card-template-processed').should('contain.text', "Test task for monthly frequency (Nth day)");
      cy.get('#opfab-div-card-template-processed').should('contain.text', "Duration: 5 minutes");
      cy.get('#opfab-div-card-template-processed').should('contain.text', "At 21:00");
      cy.get('#opfab-div-card-template-processed').should('contain.text', "The first day of the month, The last day of the month, The 15th day of the month");
      cy.get('#opfab-div-card-template-processed').should('contain.text', "in July August November December");

      // We check all fields are correctly filled
      feed.editCurrentCard();
      cy.get("#taskDescription").should('have.value', 'Test task for monthly frequency (Nth day)');

      cy.get('#radioButtonMonthlyFreq').should('be.checked');

      cy.get('#JanuaryMonthly').should('not.be.checked');
      cy.get('#FebruaryMonthly').should('not.be.checked');
      cy.get('#MarchMonthly').should('not.be.checked');
      cy.get('#AprilMonthly').should('not.be.checked');
      cy.get('#MayMonthly').should('not.be.checked');
      cy.get('#JuneMonthly').should('not.be.checked');
      cy.get('#JulyMonthly').should('be.checked');
      cy.get('#AugustMonthly').should('be.checked');
      cy.get('#SeptemberMonthly').should('not.be.checked');
      cy.get('#OctoberMonthly').should('not.be.checked');
      cy.get('#NovemberMonthly').should('be.checked');
      cy.get('#DecemberMonthly').should('be.checked');

      cy.get('#radioButtonNthDay').should('be.checked');

      cy.get('#firstDay').should('be.checked');
      cy.get('#lastDay').should('be.checked');
      cy.get('#nthDay').should('have.value', '15');

      cy.get('#time').should('have.value', '21:00');
      cy.get('#durationInMinutes').should('have.value', '5');
      cy.get('#minutesForReminder').should('have.value', '2');
    });

    it('Send Task advanced user card for monthly frequency (Nth weekday) from operator1_fr', () => {

      opfab.loginWithUser('operator1_fr');
      opfab.navigateToUserCard();
      usercard.selectService('User card examples');
      usercard.selectProcess('Task Advanced');
      cy.get('#radioButtonMonthlyFreq').click();
      cy.get('#taskTitle').invoke('val', 'Task title');
      cy.get('#taskDescription').invoke('val', 'Test task for monthly frequency (Nth weekday)');

      // by default, all months are selected, so we unselect all months
      cy.get('#selectAllMonths').parent().find('.opfab-checkbox-checkmark').click();
      // then we select the months we want
      cy.get('#monthsCheckboxesForMonthlyFreq').find('.opfab-checkbox').contains('September').click();
      cy.get('#monthsCheckboxesForMonthlyFreq').find('.opfab-checkbox').contains('December').click();

      cy.get('#radioButtonNthWeekday').click();

      opfab.selectOptionsFromMultiselect('#occurrence-number-select', 'first');
      opfab.selectOptionsFromMultiselect('#weekday-select', 'Wednesday');

      cy.get('#time').type('19:00');
      cy.get('#durationInMinutes').clear();
      cy.get('#durationInMinutes').type('7');
      cy.get('#minutesForReminder').clear();
      cy.get('#minutesForReminder').type('3');
      usercard.previewThenSendCard();

      // We check the content of the card
      feed.openFirstCard();
      feed.checkSelectedCardHasTitle("Task Advanced - Task title");
      feed.checkSelectedCardHasSummary("There is something to do");
      cy.get('#opfab-div-card-template-processed').should('contain.text', "Test task for monthly frequency (Nth weekday)");
      cy.get('#opfab-div-card-template-processed').should('contain.text', "Duration: 7 minutes");
      cy.get('#opfab-div-card-template-processed').should('contain.text', "19:00\n        The first  Wednesday");
      cy.get('#opfab-div-card-template-processed').should('contain.text', "in September December");

      // We check all fields are correctly filled
      feed.editCurrentCard();
      cy.get("#taskDescription").should('have.value', 'Test task for monthly frequency (Nth weekday)');

      cy.get('#radioButtonMonthlyFreq').should('be.checked');

      cy.get('#JanuaryMonthly').should('not.be.checked');
      cy.get('#FebruaryMonthly').should('not.be.checked');
      cy.get('#MarchMonthly').should('not.be.checked');
      cy.get('#AprilMonthly').should('not.be.checked');
      cy.get('#MayMonthly').should('not.be.checked');
      cy.get('#JuneMonthly').should('not.be.checked');
      cy.get('#JulyMonthly').should('not.be.checked');
      cy.get('#AugustMonthly').should('not.be.checked');
      cy.get('#SeptemberMonthly').should('be.checked');
      cy.get('#OctoberMonthly').should('not.be.checked');
      cy.get('#NovemberMonthly').should('not.be.checked');
      cy.get('#DecemberMonthly').should('be.checked');

      cy.get('#radioButtonNthWeekday').should('be.checked');

      cy.get('#occurrence-number-select').find('.vscomp-value-tag-content').should('have.text', 'first');
      cy.get('#weekday-select').find('.vscomp-value').should('have.text', 'Wednesday');

      cy.get('#time').should('have.value', '19:00');
      cy.get('#durationInMinutes').should('have.value', '7');
      cy.get('#minutesForReminder').should('have.value', '3');
    });
  });

  function setTimeLineDomain(domain) {
    cy.get('#opfab-timeline-link-period-' + domain).click();
  }

  function checkHaveCircle(nb) {
    cy.get("of-custom-timeline-chart").find("ellipse").should('have.length', nb);
  }
});