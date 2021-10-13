/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

describe ('About pop up tests',function () {

  const user = 'operator1';


  before('Reset UI configuration file ', function () {
    cy.resetUIConfigurationFiles(); 
  })



  describe('Checking that the About pop up is shown', function () {

    it('About pop-up should be visible for ' + user, ()=>{

      cy.loginOpFab(user,'test');

      cy.get('#opfab-navbarContent').find('#opfab-navbar-drop_user_menu').click();
      cy.get("#opfab-navbar-right-menu-about").should('exist'); // Check that the corresponding element is present

      cy.get("#opfab-navbar-right-menu-about").click();
      cy.get("#opfab-about-dialog").should('exist'); // Check that the corresponding element is present

      cy.get("#opfab-about-dialog-header").should("be.visible");
      cy.get("#opfab-about-dialog-body").should("be.visible");

    })

  })


  describe('Checking that the About pop up can be closed with the "OK" button', function () {

    it('About pop-up should be closeable for ' + user, ()=>{

      cy.loginOpFab(user,'test');

      cy.get('#opfab-navbarContent').find('#opfab-navbar-drop_user_menu').click();
      cy.get("#opfab-navbar-right-menu-about").click();

      // Check that the pop-up is closed when clicking "OK" button
      cy.get("#opfab-about-dialog").find("#opfab-about-btn-close").click();
      cy.get("#opfab-about-dialog").should('not.exist'); // Check that the corresponding element is absent

    })

  })


  describe('Checking that the About pop up can be closed with the "X" button', function () {

    it('About pop-up should be closeable for ' + user, ()=>{

      cy.loginOpFab(user,'test');

      cy.get('#opfab-navbarContent').find('#opfab-navbar-drop_user_menu').click();
      cy.get("#opfab-navbar-right-menu-about").click();

      // Check that the pop-up is closed when clicking "X" button
      cy.get("#opfab-about-dialog").find("#opfab-about-close").click();
      cy.get("#opfab-about-dialog").should('not.exist'); // Check that the corresponding element is absent

    })

  })
})
