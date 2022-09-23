/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {externalCommands} from './externalCommands';

export function getCardCommands() {
    const card = new externalCommands('CARD');


    card.addCommand('checkEditButtonDoesNotExist', function () {
        cy.get('#opfab-card-edit').should('not.exist');
    });

    card.addCommand('checkDeleteButtonDoesNotExist', function () {
        cy.get('#opfab-card-delete').should('not.exist');
    });


    card.addCommand('delete', function () {
        cy.get('#opfab-card-delete').click();
        cy.get('#opfab-card-details-delete-btn-confirm').click();
    });

   
    return card;
}
