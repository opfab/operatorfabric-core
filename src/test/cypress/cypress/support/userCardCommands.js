/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OpfabCommands} from './opfabCommands';

export class UserCardCommands extends OpfabCommands {

    constructor() {
        super();
        super.init('USERCARD');
    }

    // SERVICE COMMANDS 
    checkServiceSelectDoesNotExist= function () {
        cy.get('#of-usercard-service-selector').should('not.exist');
    }

    checkServiceSelectExists= function () {
        cy.get('#of-usercard-service-selector');
    }

    selectService= function (serviceName) {
        cy.get('#of-usercard-service-selector').click();
        cy.get('#of-usercard-service-selector')
            .find('.vscomp-option-text')
            .contains(serviceName)
            .eq(0)
            .click({force: true});
    }

    checkSelectedServiceIs= function (serviceName) {
        cy.get('#of-usercard-service-selector')
            .find('.vscomp-value')
            .contains(serviceName);
    }


    // PROCESS COMMANDS 
    checkProcessSelectDoesNotExist= function () {
        cy.get('#of-usercard-process-filter').should('not.exist');
    }

    selectProcess= function (processName) {
        cy.get('#of-usercard-process-filter').click();
        cy.get('#of-usercard-process-filter').find('.vscomp-search-input').clear();
        cy.get('#of-usercard-process-filter').find('.vscomp-search-input').type(processName);
        cy.get('#of-usercard-process-filter').find('.vscomp-option-text').eq(0).should('contain.text', processName);
        cy.get('#of-usercard-process-filter').find('.vscomp-option-text').eq(0).click();
    }

    checkSelectedProcessIs= function (processName) {
        cy.get('#of-usercard-process-filter')
            .find('.vscomp-value')
            .contains(processName);
    }

    // STATES COMMANDS 
    checkStateSelectDoesNotExist= function () {
        cy.get('#of-state-filter').should('not.be.visible');
    }

    selectState= function (stateName) {
        cy.get('#of-state-filter').click();
        cy.get('#of-state-filter').find('.vscomp-option-text').contains(stateName).eq(0).click({force: true});
    }

    checkSelectedStateIs= function (stateName) {
        cy.get('#of-state-filter')
            .find('.vscomp-value')
            .contains(stateName);
    }

    // DATES COMMANDS 

    checkStartDateChoiceDoesNotExist= function () {
        cy.get('#opfab-usercard-startdate-choice').should("not.exist");
    }

    checkStartDateChoiceExists= function () {
        cy.get('#opfab-usercard-startdate-choice');
    }

    checkEndDateChoiceDoesNotExist= function () {
        cy.get('#opfab-usercard-enddate-choice').should("not.exist");
    }

    checkEndDateChoiceExists= function () {
        cy.get('#opfab-usercard-enddate-choice');
    }

    checkLttdChoiceDoesNotExist= function () {
        cy.get('#opfab-usercard-lttd-choice').should("not.exist");
    }

    checkLttdChoiceExists= function () {
        cy.get('#opfab-usercard-lttd-choice');
    }

    // SEVERITY COMMANDS 
    checkSeverityChoiceExists= function () {
        cy.get('#opfab-usercard-severity-choice');
    }

    checkSeverityChoiceDoesNotExist= function () {
        cy.get('#opfab-usercard-severity-choice').should("not.exist");
    }

    checkSelectedSeverityIs= function (severity) {
        cy.get('#opfab-sev-' + severity.toLowerCase()).should('be.checked');
    }

    // EMITTER COMMANDS 
    checkEmitterSelectDoesNotExist= function () {
        cy.get('#of-usercard-card-emitter-selector').should("not.exist");
    }

    checkEmitterSelectExists= function () {
        cy.get('#of-usercard-card-emitter-selector');
    }

    selectEmitter= function (emitterName) {
        cy.get('#of-usercard-card-emitter-selector').click();
        cy.get('#of-usercard-card-emitter-selector').find('.vscomp-search-input').clear();
        cy.get('#of-usercard-card-emitter-selector').find('.vscomp-search-input').type(emitterName);
        cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(0).should('contain.text', emitterName);
        cy.get('#of-usercard-card-emitter-selector').find('.vscomp-option-text').eq(0).click();
        cy.get('#of-usercard-card-emitter-selector').find('.vscomp-value').should('contain.text', emitterName);
        cy.wait(200);
    }

    checkEmitterIs= function(emitterName) {
        cy.get('#of-usercard-card-emitter-selector').find('.vscomp-value').should('contain.text', emitterName);
    }
  
    // RECIPIENTS COMMANDS 
    checkRecipientSelectDoesNotExist= function () {
        cy.get('#opfab-recipients').should("not.exist");
    }

    selectRecipient= function (recipientName) {
        cy.get('#opfab-recipients').click();
        cy.get('#opfab-recipients').find('.vscomp-search-input').clear();
        cy.get('#opfab-recipients').find('.vscomp-search-input').type(recipientName);
        cy.get('#opfab-recipients').find('.vscomp-option-text').eq(0).should('contain.text', recipientName);
        cy.get('#opfab-recipients').find('.vscomp-option-text').eq(0).click();
        cy.get('#opfab-recipients').find('.vscomp-value-tag').should('contain.text', recipientName);
        cy.get('#opfab-recipients').find('.vscomp-toggle-button').click();
        cy.wait(200);
    }

    clearSelectedRecipients= function () {
        cy.get('#opfab-recipients').find('.vscomp-clear-button').click();
    }

    checkNumberOfRecipientsIs= function (number) {
        cy.get('#opfab-recipients').find('.vscomp-value-tag-content').should('have.length', number);
    }

    checkRecipientsContain= function(recipientName) {
        cy.get('#opfab-recipients').find('.vscomp-value-tag').should('contain.text', recipientName);
    }

    // RECIPIENTS FOR INFORMATION COMMANDS
    checkRecipientForInformationSelectDoesNotExist= function () {
        cy.get('#opfab-recipients-for-information').should("not.exist");
    }

    selectRecipientForInformation= function (recipientName) {
        cy.get('#opfab-recipients-for-information').click();
        cy.get('#opfab-recipients-for-information').find('.vscomp-search-input').clear();
        cy.get('#opfab-recipients-for-information').find('.vscomp-search-input').type(recipientName);
        cy.get('#opfab-recipients-for-information').find('.vscomp-option-text').eq(0).should('contain.text', recipientName);
        cy.get('#opfab-recipients-for-information').find('.vscomp-option-text').eq(0).click();
        cy.get('#opfab-recipients-for-information').find('.vscomp-value-tag').should('contain.text', recipientName);
        cy.get('#opfab-recipients-for-information').find('.vscomp-toggle-button').click();
        cy.wait(200);
    }

    clearSelectedRecipientsForInformation= function () {
        cy.get('#opfab-recipients-for-information').find('.vscomp-clear-button').click();
    }

    checkNumberOfRecipientsForInformationIs= function (number) {
        cy.get('#opfab-recipients-for-information').find('.vscomp-value-tag-content').should('have.length', number);
    }

    checkRecipientsForInformationContain= function(recipientName) {
        cy.get('#opfab-recipients-for-information').find('.vscomp-value-tag').should('contain.text', recipientName);
    }

    // PREVIEW 
    preview= function () {
        cy.get('#opfab-usercard-btn-prepareCard').click();
        cy.get('of-simplified-card-view').should('exist');
    }

    checkEntityRecipientsInPreviewContains= function (entityName) {
        cy.get('#opfab-entity-recipients').contains(entityName);
    }

    checkEntityRecipientsForInformationInPreviewContains= function (entityName) {
        cy.get('#opfab-entity-recipients-for-information').contains(entityName);
    }

    checkSenderIsTheOnlyOneRecipient= function () {
        cy.get('#opfab-you-are-only-one-recipient').find('span').should('contain.text', "No recipient are set.");
    }

    cancelCardSending= function () {
        cy.get('#opfab-usercard-btn-refuse').click();
    }

  
    // SENDING CARD COMMANDS
    sendCard= function () {
        cy.get('#opfab-usercard-btn-accept').click();
        cy.get('.opfab-info-message').contains('Your card is published');
        cy.get('#opfab-close-alert').click();
    }

    previewThenSendCard= function () {
        cy.get('#opfab-usercard-btn-prepareCard').click();
        cy.get('of-simplified-card-view').should('exist');
        cy.get('#opfab-usercard-btn-accept').click();
        cy.get('.opfab-info-message').contains('Your card is published');
        cy.get('#opfab-close-alert').click();
    }
}
