/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

/** Test for the OpFab login page (used with password mode) */

import {ScriptCommands} from "../support/scriptCommands";

describe ('LoginPage',()=>{
    const script = new ScriptCommands();

    before('Set up configuration', function () {

        // This can stay in a `before` block rather than `beforeEach` as long as the test does not change configuration
        script.resetUIConfigurationFiles();

    });

    let username = 'admin';
    let password = 'test';

    it('login', ()=>{

        //go to login page
        cy.visit("/")
        cy.get('#opfab-login-btn-submit').contains("Sign In");

        //type login
        cy.get('#opfab-login').should('be.visible')
        cy.get('#opfab-login').type(username)

        //type password
        cy.get('#opfab-password').should('be.visible')
        cy.get('#opfab-password').type(password)

        //press login button
        cy.get('#opfab-login-btn-submit').click()

        //Check that the browser has been redirected to the feed page
        cy.hash().should('eq', '#/feed')

        //Basic check that we got past the login page
        cy.get('of-navbar').should('exist');
    });


    it('login with invalid password ', ()=>{

        //go to login page
        cy.visit("/")

        //type login
        cy.get('#opfab-login').should('be.visible')
        cy.get('#opfab-login').type(username)

        //type password
        cy.get('#opfab-password').should('be.visible')
        cy.get('#opfab-password').type("invalid_password ")

        //press login button
        cy.get('#opfab-login-btn-submit').click()

        //Check Error message 
        cy.get('#opfab-login-msg').should('exist');
        cy.get("#opfab-login-msg").contains("Wrong login or password");

    })

    it('login is in french if settings.locale is set to fr in web-ui.json' , () => {
        //go to login page
        script.setPropertyInConf('settings.locale','web-ui','\\"fr\\"');
        cy.visit("/");
        cy.get('#opfab-login-btn-submit').contains("Se connecter");
    })
})