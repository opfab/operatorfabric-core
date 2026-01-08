/* Copyright (c) 2025-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ScriptCommands} from '../support/scriptCommands';

describe('Login with implicit or code flow ', () => {
    const script = new ScriptCommands();

    before('Set up configuration', function () {
        script.resetUIConfigurationFiles();
    });

    const username = 'admin';
    const password = 'test';

    it('login with oauth2 implicit flow', () => {
        script.setPropertyInConf('security.oauth2.flow.mode', '\\"IMPLICIT\\"');
        script.setPropertyInConf('security.oauth2.flow.delegate-url', '\\"http://localhost:2002/auth/realms/dev\\"');
        //go to login page
        cy.visit('/');
        cy.get('#username').type(username);
        cy.get('#password').type(password);

        //press login button
        cy.get('#kc-login').click();

        //Check that the browser has been redirected to the feed page
        cy.hash().should('eq', '#/feed');

        //Basic check that we got past the login page
        cy.get('of-navbar').should('exist');
    });

    it('login with oauth2 code flow', () => {
        script.setPropertyInConf('security.oauth2.flow.mode', '\\"CODE\\"');
        script.setPropertyInConf('security.oauth2.flow.delegate-url', '\\"http://localhost:2002/auth/realms/dev\\"');
        //go to login page
        cy.visit('/');
        cy.get('#username').type(username);
        cy.get('#password').type(password);

        //press login button
        cy.get('#kc-login').click();

        //Check that the browser has been redirected to the feed page
        cy.hash().should('eq', '#/feed');

        //Basic check that we got past the login page
        cy.get('of-navbar').should('exist');
    });
});
