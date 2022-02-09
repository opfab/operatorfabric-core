/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


describe('Session ended test', function () {

  
  before('Reset UI configuration file ', function () {
    cy.resetUIConfigurationFiles();
    cy.deleteAllCards();
    cy.deleteAllSettings();
  })


  it('Checking session end after 10 hours  ', () => {
    
    cy.loginWithClock();
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
    cy.loginWithClock();
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
