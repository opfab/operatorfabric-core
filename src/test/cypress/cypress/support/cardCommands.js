/* Copyright (c) 2022, RTE (http://www.rte-france.com)
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

    checkDeleteButtonDoesNotExist = function () {
        cy.get('#opfab-card-delete').should('not.exist');
    }

    close= function () {
        cy.get('#opfab-close-card').click();
    }

    delete = function () {
        cy.get('#opfab-card-delete').click();
        cy.get('#opfab-card-details-delete-btn-confirm').click();
    }

    modifyResponse = function () {
        cy.get('#opfab-card-details-btn-response').click();
    }

    sendResponse = function () {
        cy.get('#opfab-card-details-btn-response').click();
    }

    unacknowledge = function () {
        cy.get('#opfab-card-details-btn-ack').click();
    }
}

