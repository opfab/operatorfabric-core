/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OpfabGeneralCommands} from "../support/opfabGeneralCommands"

describe('Check the behaviour of OpFab when URL is already in use', function () {

    const opfab = new OpfabGeneralCommands();

    const IS_OPFAB_URL_CURRENTLY_USED_KEY = 'isOpfabUrlCurrentlyUsed';
    const DISCONNECTED_BY_NEW_USER_USING_SAME_URL = 'disconnectedByNewUserUsingSameUrl';
    const disconnectionSignal = JSON.stringify(new Date(2000, 0, 1, 12, 0).getTime());

    function lockUrl() {
        localStorage.setItem(IS_OPFAB_URL_CURRENTLY_USED_KEY, true);
    }


    function sendDisconnectionSignal() {
        localStorage.setItem(DISCONNECTED_BY_NEW_USER_USING_SAME_URL, disconnectionSignal);
    }

    beforeEach('Set up configuration', function () {
        localStorage.clear();        
    });


    it(`Check OpFab does not start if connection is canceled`, function () {
        lockUrl();
        cy.visit('');
        cy.get('#opfab-log-in-confirmation-because-url-is-locked').should('exist');

        cy.get('#opfab-log-in-confirmation-because-url-is-locked').find('#opfab-cancel-button').click();
        cy.get('#opfab-disconnected-message').should('exist');
    });

    it(`Check OpFab starts if connection is confirmed`, function () {
        lockUrl();
        cy.visit('');
        cy.get('#opfab-log-in-confirmation-because-url-is-locked').should('exist');

        cy.get('#opfab-log-in-confirmation-because-url-is-locked').find('#opfab-confirm-button').click();
        cy.get('#opfab-disconnected-message').should('not.exist');

        opfab.loginWithoutHackWithUser('operator1_fr');
        cy.get('#opfab-navbar-menu-feed').should('exist');


    });

    it(`Check tab is disconnected when receiving disconnection signal`, function () {
        opfab.loginWithUser('operator1_fr');
        // magic here , without using the 'then' it does not work 
        cy.wait(1).then( () => {
            sendDisconnectionSignal();    
            expect(localStorage.getItem(DISCONNECTED_BY_NEW_USER_USING_SAME_URL)).to.equal(disconnectionSignal);
            cy.get('#opfab-disconnected-by-another-tab').should('exist');
        })

    });

});