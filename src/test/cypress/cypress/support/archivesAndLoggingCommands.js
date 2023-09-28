/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OpfabCommands} from './opfabCommands';

export class ArchivesAndLoggingCommands extends OpfabCommands {

    constructor() {
        super();
        super.init('ARCHIVES AND LOGGING');
    }

    checkAdminModeCheckboxIsDisplayed = function () {
        cy.get('#opfab-archives-logging-admin-mode-checkbox').contains('Admin mode').should('exist');
        cy.get('#opfab-archives-logging-admin-help').should('exist');
    }

    checkAdminModeCheckboxDoesNotExist = function () {
        cy.get('#opfab-archives-logging-admin-mode-checkbox').should('not.exist');
        cy.get('#opfab-archives-logging-admin-help').should('not.exist');
    }

    checkAdminModeCheckboxIsNotChecked = function () {
        cy.get('#opfab-archives-logging-admin-mode-checkbox').contains('Admin mode').find('input').should('not.be.checked');
    }

    checkAdminModeCheckboxIsChecked = function () {
        cy.get('#opfab-archives-logging-admin-mode-checkbox').contains('Admin mode').find('input').should('be.checked');
    }

    clickAdminModeCheckbox = function () {
        cy.get('#opfab-archives-logging-admin-mode-checkbox').contains('Admin mode').click();
    }

    clickOnSearchButton = function () {
        cy.get('#opfab-archives-logging-btn-search').click();
    }

    checkAdminModeLinkIsDisplayed = function () {
        cy.get('#opfab-admin-mode-link').contains('Go to admin mode').should('exist');
        cy.get('#opfab-admin-mode-help').should('exist');
    }

    checkAdminModeLinkDoesNotExist = function () {
        cy.get('#opfab-admin-mode-link').should('not.exist');
        cy.get('#opfab-admin-mode-help').should('not.exist');
    }

    clickAdminModeLink = function () {
        cy.get('#opfab-admin-mode-link').contains('Go to admin mode').click();
    }

    checkProcessGroupSelectDoesNotExist = function () {
        cy.get('#opfab-processGroup').should('not.exist');
    }

    checkProcessSelectDoesNotExist = function () {
        cy.get('#opfab-process').should('not.exist');
    }

    checkStateSelectDoesNotExist = function () {
        cy.get('#opfab-state').should('not.exist');
    }

    checkNoProcessStateMessageIsDisplayed = function () {
        cy.get('#opfab-no-process-state-available').contains('No process/state available').should('exist');
    }

    checkNoCardDetailIsDisplayed = function () {
        cy.get('of-simplified-card-view').should('not.exist');
    }

    clickOnProcessGroupSelect = function () {
        cy.get('#opfab-processGroup').click();
    }

    selectAllProcessGroups = function () {
        cy.get('#opfab-processGroup').find('.vscomp-toggle-all-button').click();
    }

    checkNumberOfProcessGroupEntriesIs = function (nb) {
        cy.get('#opfab-processGroup').find('.vscomp-option-text').should('have.length', nb);
    }

    checkProcessGroupSelectContains = function (value) {
        cy.get('#opfab-processGroup').contains(value).should('exist');
    }

    clickOnProcessSelect = function () {
        cy.get('#opfab-process').click();
    }

    selectAllProcesses = function () {
        cy.get('#opfab-process').find('.vscomp-toggle-all-button').click({force: true});
    }

    unselectAllProcesses = function () {
        this.selectAllProcesses();
    }

    checkNumberOfProcessEntriesIs = function (nb) {
        cy.get('#opfab-process').find('.vscomp-option-text').should('have.length', nb);
    }

    checkProcessSelectContains = function (value) {
        cy.get('#opfab-process').contains(value).should('exist');
    }

    clickOnStateSelect = function () {
        cy.get('#opfab-state').click();
    }

    selectAllStates = function () {
        cy.get('#opfab-state').find('.vscomp-toggle-all-button').click();
    }

    checkNumberOfStateEntriesIs = function (nb) {
        cy.get('#opfab-state').find('.vscomp-option-text').should('have.length', nb);
    }

    checkNumberOfStateSelectedIs = function (nb) {
        cy.get('#opfab-state')
            .find('.vscomp-value')
            .contains('+ ' + (nb - 1) + ' more')
            .should('exist');
    }

    checkStateSelectContains = function (value) {
        cy.get('#opfab-state').contains(value, {matchCase: false}).should('exist');
    }

    checkStateSelectDoesNotContains = function (value) {
        cy.get('#opfab-state').contains(value, {matchCase: false}).should('not.exist');
    }

    checkNoResultForSearch = function () {
        cy.get('of-archives-entry-point').contains('Your search did not match any result.');
    }
}