/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


describe('Session ended test', function () {

  const user = 'operator1_fr';

  // Do not use the generic login feature as we 
  // need to launch cy.clock after cy.visit('')
  const loginWithClock = function () {

    cy.visit('')
    cy.clock(new Date());
    cy.get('#opfab-login').type('operator1_fr')
    cy.get('#opfab-password').type('test')
    cy.get('#opfab-login-btn-submit').click();

    //Wait for the app to finish initializing
    cy.get('#opfab-cypress-loaded-check', {timeout: 15000}).should('have.text', 'true');
   
  }

  before('Reset UI configuration file ', function () {
    cy.resetUIConfigurationFiles();
    cy.deleteAllCards();
    cy.deleteAllSettings();
  })


  it('Checking session end after 10 hours  ', () => {
    
    loginWithClock();
    cy.stubPlaySound();
    // go 1 hour in the future 
    cy.tick(1*60*60*1000);
   
    // The session is active
    cy.get('#opfab-sessionEnd').should('not.exist');

    // go 10 hour in the future 
    cy.tick(10*60*60*1000); 

    // Session is closed 
    // check session end message 
    cy.get('#opfab-sessionEnd');

    // no sound configured , sound shall not be activated
    cy.get('@playSound').its('callCount').should('eq', 0);

  })

  it('Checking sound when session end  ', () => {
    
    cy.loginOpFab('operator1_fr', 'test');
    cy.openOpfabSettings();

    // set severity alarm to be notified by sound 
    cy.get('#opfab-checkbox-setting-form-alarm').click();
    cy.waitDefaultTime();
    // set no replay for sound
    cy.get('#opfab-checkbox-setting-form-replay').click();
    cy.waitDefaultTime();

    cy.logoutOpFab();
    loginWithClock();
    cy.stubPlaySound();
    cy.waitDefaultTime(); // wait for configuration load end (in SoundNotificationService.ts)  
    
    // go 1 hour in the future 
    cy.tick(1*60*60*1000);
   
    // The session is active
    cy.get('#opfab-sessionEnd').should('not.exist');

    // go 10 hour in the future 
    cy.tick(10*60*60*1000); 

    // Session is closed 
    // check session end message 
    cy.get('#opfab-sessionEnd');

    //As one sound is configured , sound shall be activated
    cy.get('@playSound').its('callCount').should('eq', 1);
   

  })


})
