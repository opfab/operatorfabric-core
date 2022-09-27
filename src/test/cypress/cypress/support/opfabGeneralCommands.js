/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {externalCommands} from './externalCommands';

export function getOpfabGeneralCommands() {
    const opfab = new externalCommands('OPFAB');

    opfab.addCommand('checkLoadingSpinnerIsDisplayed', function () {
        cy.get('#opfab-loading-spinner').should('exist');
    });

    opfab.addCommand('checkLoadingSpinnerIsNotDisplayed', function () {
        cy.get('#opfab-loading-spinner').should('not.exist');
    });

    opfab.addCommand('hackUrlCurrentlyUsedMechanism', () => {
        cy.hackUrlCurrentlyUsedMechanism();
    });

    opfab.addCommand('loginWithoutHackWithUser', function (user) {
        //type login
        cy.get('#opfab-login').should('be.visible');
        cy.get('#opfab-login').type(user);

        //type password
        cy.get('#opfab-password').should('be.visible');
        cy.get('#opfab-password').type('test');

        //press login button
        cy.get('#opfab-login-btn-submit').click();

        //Wait for the app to finish initializing
        cy.get('#opfab-cypress-loaded-check', {timeout: 20000}).should('have.text', 'true');
    });

    opfab.addCommand('loginWithUser', function (user) {
        this.hackUrlCurrentlyUsedMechanism();
        //go to login page
        cy.visit('');
        //type login
        this.loginWithoutHackWithUser(user);
    });

    opfab.addCommand('loginWithClock', function (dateToUse) {
        // Do not use the generic login feature as we
        // need to launch cy.clock after cy.visit('')
        this.hackUrlCurrentlyUsedMechanism();
        cy.visit('');
        cy.clock(dateToUse);
        cy.get('#opfab-login').type('operator1_fr');
        cy.get('#opfab-password').type('test');
        cy.get('#opfab-login-btn-submit').click();

        //Wait for the app to finish initializing
        cy.get('#opfab-cypress-loaded-check', {timeout: 15000}).should('have.text', 'true');
    });

    opfab.addCommand('logout', function () {
        cy.get('#opfab-navbar-drop-user-menu').click();
        cy.get('#opfab-navbar-right-menu-logout').click();
    });

    opfab.addCommand('navigateToAdministration', function () {
        cy.get('#opfab-navbar-drop-user-menu').click();
        cy.get('#opfab-navbar-right-menu-admin').click();
    });

    opfab.addCommand('navigateToFeed', function () {
        cy.get('#opfab-navbar-menu-feed').click();
        cy.get('of-card-list').should('exist');
    });

    opfab.addCommand('navigateToActivityArea', function () {
        cy.get('#opfab-navbar-drop-user-menu').click();
        cy.get('#opfab-navbar-right-menu-activityarea').click();
        cy.get('of-activityarea').should('exist');
    });

    opfab.addCommand('navigateToArchives', function () {
        cy.get('#opfab-navbar-menu-archives').click();
        cy.get('of-archives').should('exist');
    });

    opfab.addCommand('navigateToRealTimeUsers', function () {
        cy.get('#opfab-navbar-drop-user-menu').click();
        cy.get('#opfab-navbar-right-menu-realtimeusers').click();
    });

    opfab.addCommand('navigateToSettings', function () {
        cy.get('#opfab-navbar-drop-user-menu').click();
        cy.get('#opfab-navbar-right-menu-settings').click();
        cy.get('of-settings').should('exist');
    });

    opfab.addCommand('navigateToUserCard', function () {
        cy.get('#opfab-navbarContent').find('#opfab-newcard-menu').click();
        cy.get('of-usercard').should('exist');
    });

    opfab.addCommand('openExternalDevices', () => {
        cy.get('#opfab-navbar-drop-user-menu').click();
        cy.get('#opfab-navbar-right-menu-externaldevicesconfiguration').click();
    });

    opfab.addCommand('switchToDayMode', () => {
        cy.get('#opfab-navbar-drop-user-menu').click();
        cy.get('#opfab-navbar-right-menu-day-mode').click();
    });

    return opfab;
}
