/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OpfabGeneralCommands} from '../support/opfabGeneralCommands';
import {SettingsCommands} from '../support/settingsCommands';
import {ScriptCommands} from '../support/scriptCommands';

describe('Settings', function () {
    const opfab = new OpfabGeneralCommands();
    const settings = new SettingsCommands();
    const script = new ScriptCommands();

    before('Reset configuration', function () {
        script.resetUIConfigurationFiles();
        script.deleteAllSettings();
    });

    it('Should proposed to save settings ', () => {
        opfab.loginWithUser('operator1_fr');
        checkEmailValidation();
        checkCancelNavigation();
        checkExitWithoutSaving();
        checkAcceptSaving();
    });


    function checkEmailValidation() {
        opfab.navigateToSettings();
        cy.get('#opfab-settings-btn-save').should('be.enabled')
        cy.get('#opfab-setting-input-email').type('test');
        cy.get('#opfab-settings-btn-save').should('be.disabled')
        cy.get('#opfab-setting-input-email').type('@domain');
        cy.get('#opfab-settings-btn-save').should('be.enabled')
    }

    function checkCancelNavigation() {
        opfab.navigateToSettings();
        settings.clickOnSeverity('alarm');
        cy.get('#opfab-navbar-menu-archives').click();
        cy.get('#opfab-btn-cancel').click();
    }

    function checkExitWithoutSaving() {
        cy.get('#opfab-setting-input-email').type('test@test.fr');
        cy.get('#opfab-navbar-menu-archives').click();
        cy.get('#opfab-btn-doNotSave').click();
        cy.get('of-archives').should('exist');
        opfab.navigateToSettings();
        cy.get('#opfab-setting-input-email').should('have.value', '');
    }

    function checkAcceptSaving() {
        cy.get('#opfab-setting-input-email').type('test@test.fr');
        cy.get('#opfab-navbar-menu-archives').click();
        cy.get('#opfab-btn-save').click();
        cy.get('#opfab-btn-ok').click();
        cy.get('of-archives').should('exist');
        opfab.navigateToSettings();
        cy.get('#opfab-setting-input-email').should('have.value', 'test@test.fr');
    }
});
