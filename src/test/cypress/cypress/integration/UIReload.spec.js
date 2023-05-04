/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
import {OpfabGeneralCommands} from '../support/opfabGeneralCommands'
import {ScriptCommands} from "../support/scriptCommands";

describe ('UI Reload requested',()=>{

    const opfab = new OpfabGeneralCommands();
    const script = new ScriptCommands();
    
    it('Receive RELOAD message', ()=>{

        opfab.loginWithUser('operator1_fr');
        script.sendMessageToSubscriptions('RELOAD');
        clickOnLinkToReloadUI();
        waitForPageReload();
        checkThereIsNoReloadMessage();
    })

    function clickOnLinkToReloadUI() {
        cy.get('#opfab-reload-msg').find('.opfab-reload-link').click();
    }

    function waitForPageReload() {
        cy.intercept('GET', '/businessconfig/uiMenu').as('reloaded');
        cy.wait('@reloaded');
        cy.get('of-navbar').should('exist');
    }

    function checkThereIsNoReloadMessage() {
        cy.get('#opfab-reload-msg').should('not.exist');
    }
})