/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OpfabGeneralCommands} from "../support/opfabGeneralCommands"

describe ('About pop up tests',function () {

  const opfab = new OpfabGeneralCommands();

  before('Reset UI configuration file ', function () {
    cy.resetUIConfigurationFiles(); 
  })

  describe('Checking that the About pop up ', function () {

    it('About pop-up should be visible ', ()=>{
      opfab.loginWithUser('operator1_fr');
      openAboutPopup();
      cy.get("#opfab-about-dialog-header").should("be.visible");
      cy.get("#opfab-about-dialog-body").should("be.visible");
      cy.get("#opfab-about-dialog-body").contains("OperatorFabric");
      cy.get("#opfab-about-dialog-body").contains("First application");
      cy.get("#opfab-about-dialog-body").contains("v12.34.56");
    })

    it('About pop-up should be closeable via the OK Button ', ()=>{
      opfab.loginWithUser('operator1_fr');
      openAboutPopup();
      cy.get("#opfab-about-dialog").find("#opfab-about-btn-close").click();
      cy.get("#opfab-about-dialog").should('not.exist'); 
    })

    it('About pop-up should be closeable with the "X" button ' , ()=>{
      opfab.loginWithUser('operator1_fr');
      openAboutPopup();
      cy.get("#opfab-about-dialog").find("#opfab-about-close").click();
      cy.get("#opfab-about-dialog").should('not.exist'); 
    })
  })

  function openAboutPopup() {
    cy.get('#opfab-navbarContent').find('#opfab-navbar-drop-user-menu').click();
    cy.get("#opfab-navbar-right-menu-about").click();
  }
})
