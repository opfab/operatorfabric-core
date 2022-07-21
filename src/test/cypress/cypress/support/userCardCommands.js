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

    usercard.addCommand('checkCardHasBeenSend', function () {
        cy.get('.opfab-info-message').should('have.class', 'opfab-alert-info').contains('Your card is published');
    });

    usercard.addCommand('selectService', function (serviceName) {
        cy.get('#of-usercard-service-selector').click();
        cy.get('#of-usercard-service-selector')
            .find('.vscomp-option-text')
            .contains(serviceName)
            .eq(0)
            .click({force: true});
    });

    usercard.addCommand('selectProcess', function (processName) {
        cy.get('#of-usercard-process-filter').click();
        cy.get('#of-usercard-process-filter')
            .find('.vscomp-option-text')
            .contains(processName)
            .eq(0)
            .click({force: true});
    });

    usercard.addCommand('selectState', function (stateName) {
        cy.get('#of-state-filter').click();
        cy.get('#of-state-filter').find('.vscomp-option-text').contains(stateName).eq(0).click({force: true});
    });

    usercard.addCommand('selectRecipient', function (recipientName) {
        cy.get('#opfab-recipients').click();
        cy.get('#opfab-recipients').find('.vscomp-search-input').clear();
        cy.get('#opfab-recipients').find('.vscomp-search-input').type(recipientName);
        cy.get('#opfab-recipients').find('.vscomp-option-text').eq(0).should('contain.text', recipientName);
        cy.get('#opfab-recipients').find('.vscomp-option-text').eq(0).click();
        cy.get('#opfab-recipients').find('.vscomp-value-tag').should('contain.text', recipientName);
        cy.get('#opfab-recipients').find('.vscomp-toggle-button').click();
    });

    usercard.addCommand('prepareAndSendCard', function () {
        cy.get('#opfab-usercard-btn-prepareCard').click();
        cy.get('of-card-detail').should('exist');
        cy.get('#opfab-usercard-btn-accept').click();
    });

    usercard.addCommand('seeBeforeSending', function () {
        cy.get('#opfab-usercard-btn-prepareCard').click();
        cy.get('of-card-detail').should('exist');
    });

    return usercard;
}
