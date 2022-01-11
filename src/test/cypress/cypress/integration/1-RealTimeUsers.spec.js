/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

/** Test for the OpFab real time users page */

describe ('RealTimeUsersPage',()=>{

    it('Connection of admin and check of Real time users screen : no one should be connected', ()=> {
        cy.loginOpFab('admin', 'test');

        //click on user menu (top right of the screen)
        cy.get('#opfab-navbar-drop_user_menu').click();

        //click on "Real time users"
        cy.get('#opfab-navbar-right-menu-realtimeusers').click();

        //we should have 3 disconnected users and 1 connected user (operator1_fr)
        //cy.get('#opfab-realtimeusers-disconnected').children().should('have.length',3);
        cy.get('#opfab-realtimeusers-connected').should('not.exist');

    })

    it('Connection of operator3_fr and check of Real time users screen', ()=> {
        cy.loginOpFab('operator3_fr', 'test');

        //click on user menu (top right of the screen)
        cy.get('#opfab-navbar-drop_user_menu').click();

        //click on "Real time users"
        cy.get('#opfab-navbar-right-menu-realtimeusers').click();

        //we should have 3 disconnected users and 1 connected user (operator1_fr)
        cy.get('#opfab-realtimeusers-disconnected').children().should('have.length',3);
        cy.get('#opfab-realtimeusers-connected').children().should('have.length',1);

    })
})