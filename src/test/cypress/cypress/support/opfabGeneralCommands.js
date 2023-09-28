/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OpfabCommands} from './opfabCommands';

export class OpfabGeneralCommands extends OpfabCommands {
   
    constructor() {
        super();
        super.init('OPFAB');
    }

    checkLoadingSpinnerIsDisplayed = function () {
        cy.get('#opfab-loading-spinner').should('exist');
    }

    checkLoadingSpinnerIsNotDisplayed = function () {
        cy.get('#opfab-loading-spinner').should('not.exist');
    }

    hackUrlCurrentlyUsedMechanism = function() {
        cy.hackUrlCurrentlyUsedMechanism();
    }

    loginWithoutHackWithUser = function (user) {
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
    }

    loginWithUser = function (user) {
        this.hackUrlCurrentlyUsedMechanism();
        //go to login page
        cy.visit('');
        //type login
        this.loginWithoutHackWithUser(user);
    }

    loginWithClock = function (dateToUse) {
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
    }

    logout = function () {
        cy.get('#opfab-navbar-drop-user-menu').click();
        cy.get('#opfab-navbar-right-menu-logout').click();
    }

    navigateToAdministration = function () {
        cy.get('#opfab-navbar-drop-user-menu').click();
        cy.get('#opfab-navbar-right-menu-admin').click();
    }

    navigateToFeed = function () {
        cy.get('#opfab-navbar-menu-feed').click();
        cy.get('of-card-list').should('exist');
    }

    navigateToActivityArea = function () {
        cy.get('#opfab-navbar-drop-user-menu').click();
        cy.get('#opfab-navbar-right-menu-activityarea').click();
        cy.get('of-activityarea').should('exist');
    }

    navigateToArchives = function () {
        cy.get('#opfab-navbar-menu-archives').click();
        cy.get('of-archives').should('exist');
    }

    navigateToDashboard = function () {
        cy.get('#opfab-navbar-menu-dashboard').click();
        cy.get('of-dashboard').should('exist');
    }

    navigateToRealTimeUsers = function () {
        cy.get('#opfab-navbar-drop-user-menu').click();
        cy.get('#opfab-navbar-right-menu-realtimeusers').click();
    }

    navigateToSettings = function () {
        cy.get('#opfab-navbar-drop-user-menu').click();
        cy.get('#opfab-navbar-right-menu-settings').click();
        cy.get('of-settings').should('exist');
    }

    navigateToUserCard = function () {
        cy.get('#opfab-navbarContent').find('#opfab-newcard-menu').click();
        cy.get('of-usercard').should('exist');
    }

    navigateToNotificationConfiguration = function () {
        cy.get('#opfab-navbar-drop-user-menu').click();
        cy.get('#opfab-menu-icon-notification').click();
    }

    openExternalDevices = function ()  {
        cy.get('#opfab-navbar-drop-user-menu').click();
        cy.get('#opfab-navbar-right-menu-externaldevicesconfiguration').click();
    }

    simulateTimeForOpfabCodeToExecute = function () {
        cy.tick(100);
        cy.wait(10);
        cy.tick(100);
        cy.wait(10);
        cy.tick(100);
        cy.wait(10);
    }
    
    navigateToUserActionLogs = function () {
        cy.get('#opfab-navbar-drop-user-menu').click();
        cy.get('#opfab-navbar-right-menu-useractionlogs').click();
    }

    switchToDayMode = function () {
        cy.get('#opfab-navbar-drop-user-menu').click();
        cy.get('#opfab-navbar-right-menu-day-mode').click();
    }

    checkUrlDisplayedIs = function (url) {
        cy.get('iframe').invoke('attr', 'src').should('eq', url);
    }
}
