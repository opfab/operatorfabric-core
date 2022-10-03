/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {OpfabCommands} from './opfabCommands';

export class FeedCommands extends OpfabCommands {

    constructor() {
        super();
        super.init('FEED');
    }


    checkNumberOfDisplayedCardsIs= function (nb) {
        cy.get('of-light-card').should('have.length', nb);
    }

    openFirstCard= function () {
        cy.get('of-light-card').eq(0).click();
        cy.get('#opfab-div-card-template-processed');
    }

    checkSelectedCardHasTitle= function (title) {
        cy.get('.light-card-detail-selected .card-title').should('have.text',title + " ");
    }

    checkSelectedCardHasSummary= function (summary) {
        cy.get('#opfab-selected-card-summary').should('have.text',summary);
    }

    deleteCurrentCard= function () {
        cy.get('#opfab-card-delete').click();
        cy.get('#opfab-card-details-delete-btn-confirm').click();
    }

    editCurrentCard= function () {
        cy.get('#opfab-card-edit').click();
        cy.get("of-usercard").should('exist');
    }
}
