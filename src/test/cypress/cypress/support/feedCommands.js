/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {externalCommands} from './externalCommands';

export function getFeedCommands() {
    const feed = new externalCommands('FEED');

    feed.addCommand('checkNumberOfDisplayedCardsIs', function (nb) {
        cy.get('of-light-card').should('have.length', nb);
    });

    feed.addCommand('openFirstCard', function () {
        cy.get('of-light-card').eq(0).click();
        cy.get('#opfab-div-card-template-processed');
    });

    feed.addCommand('editCurrentCard', function () {
        cy.get('#opfab-card-edit').click();
        cy.get("of-usercard").should('exist');
    });

   
    return feed;
}
