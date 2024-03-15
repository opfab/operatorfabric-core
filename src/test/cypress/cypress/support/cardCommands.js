/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {OpfabCommands} from './opfabCommands';

export class CardCommands extends OpfabCommands {

    constructor() {
        super();
        super.init('CARD');
    }

    acknowledge = function () {
        cy.get('#opfab-card-details-btn-ack').click();
    }

    checkEditButtonDoesNotExist = function () {
        cy.get('#opfab-card-edit').should('not.exist');
    }

    checkCopyButtonDoesNotExist = function () {
        cy.get('#opfab-card-create-copy').should('not.exist');
    }

    checkCopyButtonDoesExist = function () {
        cy.get('#opfab-card-create-copy').should('exist');
    }

    checkDeleteButtonDoesNotExist = function () {
        cy.get('#opfab-card-delete').should('not.exist');
    }

    checkEntityIsGreenInCardHeader = function(entityId) {
        cy.get(`#opfab-card-header-entity-${entityId}`).should('have.css', 'color', 'rgb(0, 128, 0)');
    }

    checkEntityIsOrangeInCardHeader = function(entityId) {
        cy.get(`#opfab-card-header-entity-${entityId}`).should('have.css', 'color', 'rgb(255, 102, 0)');
    }

    checkEntityIsNotVisibleInCardHeader = function(entityId) {
        cy.get(`#opfab-card-header-entity-${entityId}`).should('not.exist');
    }

    checkExpirationDateIconDoesExist = function () {
        cy.get('#opfab-card-expiration-date').should('exist');
    }

    close= function () {
        cy.get('#opfab-close-card').click();
    }

    delete = function () {
        cy.get('#opfab-card-delete').click();
        cy.get('#opfab-btn-ok').click();
    }

    modifyResponse = function () {
        cy.get('#opfab-card-details-btn-response').click();
    }

    openEntityDropdownInCardHeader() {
        cy.get('#opfab-entities-dropdown').click();
    }

    clickOnSendResponse = function() {
        cy.get('#opfab-card-details-btn-response').click();
    }

    closeMessageAfterResponseSend = function() {
        cy.get('.opfab-info-message').contains('Your answer is confirmed. Thank you!');
        cy.get('#opfab-close-alert').click();
    }

    sendResponse = function () {
        this.clickOnSendResponse();
        this.closeMessageAfterResponseSend();
    }


    unacknowledge = function () {
        cy.get('#opfab-card-details-btn-unack').click();
    }
}

