/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


describe('Sound notification test', function () {

  const user = 'operator1';


  before('Reset UI configuration file ', function () {
    //cy.loadTestConf(); Avoid to launch it as it is time consuming 
    cy.resetUIConfigurationFiles();
    cy.deleteAllCards();
    cy.deleteAllSettings();
  })

  describe('Checking sound when receiving notification ', function () {
    it('Sound when receiving card   ', () => {
      cy.loginOpFab(user, 'test');
      cy.stubPlaySound();
      cy.openOpfabSettings();

      // set severity alarm to be notified by sound
      cy.get('#opfab-checkbox-setting-form-alarm').click();

      cy.waitDefaultTime();

      // Open the feed
      cy.get('#opfab-navbar-menu-feed').click({force: true});

      // send card with severity alarm
      cy.sendCard('defaultProcess/contingencies.json');

      // sound should be launch 
      cy.get('@playSound').its('callCount').should('eq', 1);

      // send card with severity action
      cy.sendCard('defaultProcess/question.json');

      // no new sound 
      cy.get('@playSound').its('callCount').should('eq', 1);

      cy.openOpfabSettings();

      // set severity alarm to NOT be notified by sound 
      cy.get('#opfab-checkbox-setting-form-alarm').click();

      // Open the feed
      cy.get('#opfab-navbar-menu-feed').click({force: true});

      // Send a card with severity alarm 
      cy.sendCard('defaultProcess/contingencies.json');

      // No new sound 
      cy.get('@playSound').its('callCount').should('eq', 1);

      cy.openOpfabSettings();

      // set severity action to be notified by sound
      cy.get('#opfab-checkbox-setting-form-action').click();
      

      // Open the archives screen  , even if user is in archives screen sound are activated 
      cy.get('#opfab-navbar-menu-archives').click({force: true});

      // send card with severity action
      cy.sendCard('defaultProcess/question.json');

      // New sound 
      cy.get('@playSound').its('callCount').should('eq', 2);

      cy.openOpfabSettings();

      // set severity information  to be notified by sound
      cy.get('#opfab-checkbox-setting-form-information').click();

      // Open the archives screen  
      cy.get('#opfab-navbar-menu-archives').click({force: true});

      // Send three cars : alarm ,information  and action
      cy.sendCard('defaultProcess/contingencies.json');
      cy.sendCard('defaultProcess/message.json');
      cy.sendCard('defaultProcess/question.json');

      // Two new sound (no sound for alarm)
      cy.get('@playSound').its('callCount').should('eq', 4);
    });

    it('Repeating sound when receiving card with default repeating interval   ', () => {
      cy.delete6TestCards();
      cy.loginOpFab(user, 'test');
      cy.stubPlaySound();

      // Activate repeating sound (no need to click the checkbox because it is already checked, because of the default value set to true in web-ui.json)
      cy.openOpfabSettings();
      cy.waitDefaultTime();

      // Open the feed and send card 
      cy.get('#opfab-navbar-menu-feed').click({force: true});
      cy.waitDefaultTime();

      // Use cypress time simulation 
      cy.clock(new Date());
      cy.sendCard('defaultProcess/message.json');
      cy.waitDefaultTime();

       // wait for light card to appears 
      cy.tick(1000);
      cy.get('of-light-card');

      // Shift 15 seconds in the future
      cy.tick(15000);

      // Two new sound , the first one + a repetition as default replay interval is 10 seconds in web-ui.json
      cy.get('@playSound').its('callCount').should('eq', 2);

      // After 10 seconds more , one more sound 
      cy.tick(10000);
      cy.get('@playSound').its('callCount').should('eq', 3);

      // Click somewhere to stop repeating sound 
      cy.get('#opfab-navbar-menu-feed').click({force: true});

      // Wait 30 seconds more , no new sound 
      cy.tick(30000);
      cy.get('@playSound').its('callCount').should('eq', 3);
    
    })

    it('Repeating sound when receiving card  with  custom repeating interval ', () => {
      cy.delete6TestCards();
      cy.loginOpFab(user, 'test');
      cy.stubPlaySound();

      // Set repeating interval to 20 seconds
      cy.openOpfabSettings();
      cy.get('#opfab-setting-replayInterval').clear();
      cy.get('#opfab-setting-replayInterval').type('20');
      cy.waitDefaultTime();

      // Open the feed and send card 
      cy.get('#opfab-navbar-menu-feed').click({force: true});
      cy.waitDefaultTime();

      cy.clock(new Date());
      cy.sendCard('defaultProcess/message.json');
      cy.waitDefaultTime();

       // wait for light card to appears 
       cy.tick(1000);
       cy.get('of-light-card');

      cy.tick(50000);

      // Two new sound , the first one + 2 repetition
      cy.get('@playSound').its('callCount').should('eq', 3);


      // Click somewhere to stop repeating sound 
      cy.get('#opfab-navbar-menu-feed').click({force: true});

      // Wait 30 seconds more , no new sound 
      cy.tick(30000);
      cy.get('@playSound').its('callCount').should('eq', 3);

    })

  })
})
