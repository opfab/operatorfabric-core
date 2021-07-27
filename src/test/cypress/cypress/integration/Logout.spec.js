/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


describe ('Test log out behaviour',()=>{

    before('Set up configuration', function () {

        // This can stay in a `before` block rather than `beforeEach` as long as the test does not change configuration
        cy.resetUIConfigurationFiles();

    });


    it('Logout should clear cookie and redirect to feed page with login inputs', ()=>{

        cy.loginOpFab('operator1','test');

        cy.logoutOpFab();

        //Check that the browser has been redirected to the feed page
        cy.hash().should('eq', '#/feed')

        //Check that it is showing the login component
        cy.get('#opfab-login').should('be.visible')

    })
})