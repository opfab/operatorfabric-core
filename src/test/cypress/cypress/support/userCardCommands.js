/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {externalCommands} from './externalCommands';

export function getUserCardCommands() {
    const usercard = new externalCommands('USERCARD');


    // SERVICE COMMANDS 
    usercard.addCommand('checkServiceSelectDoesNotExist', function () {
        cy.get('#of-usercard-service-selector').should('not.exist');
    });

    usercard.addCommand('checkServiceSelectExists', function () {
        cy.get('#of-usercard-service-selector');
    });

    usercard.addCommand('selectService', function (serviceName) {
        cy.get('#of-usercard-service-selector').click();
        cy.get('#of-usercard-service-selector')
            .find('.vscomp-option-text')
            .contains(serviceName)
            .eq(0)
            .click({force: true});
    });

    usercard.addCommand('checkSelectedServiceIs', function (serviceName) {
        cy.get('#of-usercard-service-selector')
            .find('.vscomp-value')
            .contains(serviceName);
    });


    // PROCESS COMMANDS 
    usercard.addCommand('checkProcessSelectDoesNotExist', function () {
        cy.get('#of-usercard-process-filter').should('not.exist');
    });

    usercard.addCommand('selectProcess', function (processName) {
        cy.get('#of-usercard-process-filter').click();
        cy.get('#of-usercard-process-filter')
            .find('.vscomp-option-text')
            .contains(processName)
            .eq(0)
            .click({force: true});
    });

    usercard.addCommand('checkSelectedProcessIs', function (processName) {
        cy.get('#of-usercard-process-filter')
            .find('.vscomp-value')
            .contains(processName);
    });

    // STATES COMMANDS 
    usercard.addCommand('checkStateSelectDoesNotExist', function () {
        cy.get('#of-state-filter').should('not.be.visible');
    });

    usercard.addCommand('selectState', function (stateName) {
        cy.get('#of-state-filter').click();
        cy.get('#of-state-filter').find('.vscomp-option-text').contains(stateName).eq(0).click({force: true});
    });

    usercard.addCommand('checkSelectedStateIs', function (stateName) {
        cy.get('#of-state-filter')
            .find('.vscomp-value')
            .contains(stateName);
    });

    // DATES COMMANDS 

    usercard.addCommand('checkStartDateChoiceDoesNotExist', function () {
        cy.get('#opfab-usercard-startdate-choice').should("not.exist");
    });

    usercard.addCommand('checkStartDateChoiceExists', function () {
        cy.get('#opfab-usercard-startdate-choice');
    });

    usercard.addCommand('checkEndDateChoiceDoesNotExist', function () {
        cy.get('#opfab-usercard-enddate-choice').should("not.exist");
    });

    usercard.addCommand('checkEndDateChoiceExists', function () {
        cy.get('#opfab-usercard-enddate-choice');
    });

    usercard.addCommand('checkLttdChoiceDoesNotExist', function () {
        cy.get('#opfab-usercard-lttd-choice').should("not.exist");
    });

    usercard.addCommand('checkLttdChoiceExists', function () {
        cy.get('#opfab-usercard-lttd-choice');
    });

    // SEVERITY COMMANDS 
    usercard.addCommand('checkSeverityChoiceExists', function () {
        cy.get('#opfab-usercard-severity-choice');
    });

    usercard.addCommand('checkSeverityChoiceDoesNotExist', function () {
        cy.get('#opfab-usercard-severity-choice').should("not.exist");
    });

    usercard.addCommand('checkSelectedSeverityIs', function (severity) {
        cy.get('#opfab-sev-' + severity.toLowerCase()).should('be.checked');
    });

    // EMITTER COMMANDS 
    usercard.addCommand('checkEmitterSelectDoesNotExist', function () {
        cy.get('#of-usercard-card-emitter-selector').should("not.exist");
    });

    usercard.addCommand('checkEmitterSelectExists', function () {
        cy.get('#of-usercard-card-emitter-selector');
    });
  
    // RECIPIENTS COMMANDS 
    usercard.addCommand('checkRecipientSelectDoesNotExist', function () {
        cy.get('#opfab-recipients').should("not.exist");
    })

    usercard.addCommand('selectRecipient', function (recipientName) {
        cy.get('#opfab-recipients').click();
        cy.get('#opfab-recipients').find('.vscomp-search-input').clear();
        cy.get('#opfab-recipients').find('.vscomp-search-input').type(recipientName);
        cy.get('#opfab-recipients').find('.vscomp-option-text').eq(0).should('contain.text', recipientName);
        cy.get('#opfab-recipients').find('.vscomp-option-text').eq(0).click();
        cy.get('#opfab-recipients').find('.vscomp-value-tag').should('contain.text', recipientName);
        cy.get('#opfab-recipients').find('.vscomp-toggle-button').click();
    });

    // PREVIEW 
    usercard.addCommand('preview', function () {
        cy.get('#opfab-usercard-btn-prepareCard').click();
        cy.get('of-card-detail').should('exist');
    });

    usercard.addCommand('checkEntityRecipientsInPreviewContains', function (entityName) {
        cy.get('#opfab-entity-recipients').contains(entityName);
    });

    usercard.addCommand('cancelCardSending', function () {
        cy.get('#opfab-usercard-btn-refuse').click();
    });

  
    // SENDING CARD COMMANDS
    usercard.addCommand('sendCard', function () {
        cy.get('#opfab-usercard-btn-accept').click();
    });

    usercard.addCommand('previewThenSendCard', function () {
        cy.get('#opfab-usercard-btn-prepareCard').click();
        cy.get('of-card-detail').should('exist');
        cy.get('#opfab-usercard-btn-accept').click();
    });

    usercard.addCommand('checkCardHasBeenSend', function () {
        cy.get('.opfab-info-message').should('have.class', 'opfab-alert-info').contains('Your card is published');
    });

    return usercard;
}
