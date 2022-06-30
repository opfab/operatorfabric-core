/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

/** Test for the OpFab UI reload requested */

describe ('UI Reload requested',()=>{

    it('Receive RELOAD message', ()=>{

        cy.loginOpFab('operator1_fr', 'test');

        cy.sendMessageToSubscriptions('RELOAD');

        // click on the link to reload the UI
        cy.get('#opfab-reload-msg').find('.opfab-reload-link').click();
        // wait for page reload
        cy.intercept('GET', '/config/ui-menu.json').as('reloaded');
        cy.wait('@reloaded');

        cy.get('of-navbar').should('exist');
        cy.get('#opfab-reload-msg').should('not.exist');

    })
})