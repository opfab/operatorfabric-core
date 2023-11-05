/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OpfabCommands} from './opfabCommands';
import {OpfabGeneralCommands} from './opfabGeneralCommands';

export class ArchivesAndLoggingCommands extends OpfabCommands {
    opfab = new OpfabGeneralCommands();

    constructor() {
        super();
        super.init('ARCHIVES AND LOGGING');
    }

    checkSeeOnlyCardsIAmRecipientOfCheckboxIsDisplayed = function () {
        cy.get('#opfab-archives-logging-see-only-cards-i-am-recipient-of-checkbox').contains('See only the cards I am recipient of').should('exist');
    };

    checkSeeOnlyCardsIAmRecipientOfCheckboxDoesNotExist = function () {
        cy.get('#opfab-archives-logging-see-only-cards-i-am-recipient-of-checkbox').should('not.exist');
    };

    checkSeeOnlyCardsIAmRecipientOfCheckboxIsNotChecked = function () {
        cy.get('#opfab-archives-logging-see-only-cards-i-am-recipient-of-checkbox')
            .contains('See only the cards I am recipient of')
            .find('input')
            .should('not.be.checked');
    };

    checkSeeOnlyCardsIAmRecipientOfCheckboxIsChecked = function () {
        cy.get('#opfab-archives-logging-see-only-cards-i-am-recipient-of-checkbox').contains('See only the cards I am recipient of').find('input').should('be.checked');
    };

    clickSeeOnlyCardsIAmRecipientOfCheckbox = function () {
        cy.get('#opfab-archives-logging-see-only-cards-i-am-recipient-of-checkbox').contains('See only the cards I am recipient of').click();
    };

    clickOnSearchButton = function () {
        cy.get('#opfab-archives-logging-btn-search').click();
    };

    clickOnResetButton =  function () {
        cy.get('#opfab-archives-logging-btn-reset').click();
        cy.wait(200); // wait reset is done
    };

    checkSeeAllCardsLinkIsDisplayed = function () {
        cy.get('#opfab-see-all-cards-link').contains('See all cards (whether I am the recipient or not)').should('exist');
    };

    checkSeeAllCardsLinkDoesNotExist = function () {
        cy.get('#opfab-see-all-cards-link').should('not.exist');
    };

    clickSeeAllCardsLink = function () {
        cy.get('#opfab-see-all-cards-link').contains('See all cards (whether I am the recipient or not)').click();
    };

    checkProcessGroupSelectDoesNotExist = function () {
        cy.get('#opfab-processGroup').should('not.exist');
    };

    checkProcessSelectDoesNotExist = function () {
        cy.get('#opfab-process').should('not.exist');
    };

    checkStateSelectDoesNotExist = function () {
        cy.get('#opfab-state').should('not.exist');
    };

    checkNoProcessStateMessageIsDisplayed = function () {
        cy.get('#opfab-no-process-state-available').contains('No process/state available').should('exist');
    };

    checkNoCardDetailIsDisplayed = function () {
        cy.get('of-simplified-card-view').should('not.exist');
    };

    clickOnProcessGroupSelect = function () {
        cy.get('#opfab-processGroup').click();
    };

    selectAllProcessGroups = function () {
        cy.get('#opfab-processGroup').find('.vscomp-toggle-all-button').click();
    };

    checkNumberOfProcessGroupEntriesIs = function (nb) {
        cy.get('#opfab-processGroup').find('.vscomp-option-text').should('have.length', nb);
    };

    checkProcessGroupSelectContains = function (value) {
        cy.get('#opfab-processGroup').contains(value).should('exist');
    };

    clickOnProcessSelect = function () {
        cy.get('#opfab-process').click();
    };

    selectAllProcesses = function () {
        cy.get('#opfab-process').find('.vscomp-toggle-all-button').click();
    };

    unselectAllProcesses = function () {
        this.selectAllProcesses();
    };

    checkNumberOfProcessEntriesIs = function (nb) {
        cy.get('#opfab-process').find('.vscomp-option-text').should('have.length', nb);
    };

    checkProcessSelectContains = function (value) {
        cy.get('#opfab-process').contains(value).should('exist');
    };

    clickOnStateSelect = function () {
        cy.get('#opfab-state').click();
    };

    selectAllStates = function () {
        cy.get('#opfab-state').find('.vscomp-toggle-all-button').click();
    };

    checkNumberOfStateEntriesIs = function (nb) {
        cy.get('#opfab-state').find('.vscomp-option-text').should('have.length', nb);
    };

    checkNumberOfStateSelectedIs = function (nb) {
        cy.get('#opfab-state')
            .find('.vscomp-value')
            .contains('+ ' + (nb - 1) + ' more')
            .should('exist');
    };

    checkStateSelectContains = function (value) {
        cy.get('#opfab-state').contains(value, {matchCase: false}).should('exist');
    };

    checkStateSelectDoesNotContains = function (value) {
        cy.get('#opfab-state').contains(value, {matchCase: false}).should('not.exist');
    };

    selectProcess = function (processName) {
        this.opfab.selectOptionsFromMultiselect('#opfab-process', processName)
    };

    selectState = function (stateName, searchResultNumber = 0) {
        this.opfab.selectOptionsFromMultiselect('#opfab-state', stateName, false, searchResultNumber)
    };

    checkNoResultForSearch = function () {
        cy.get('of-archives').contains('Your search did not match any result.');
    };

 
}
