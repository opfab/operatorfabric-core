/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {externalCommands} from './externalCommands';

export function getActivityAreaCommands() {
    const activityArea = new externalCommands('ACTIVITY AREA');

    activityArea.addCommand('save', function () {
        cy.intercept('PATCH', '/users/**').as('saved');
        cy.intercept('GET', '/users/CurrentUserWithPerimeters').as('reloadPerimeter');
        cy.get('#opfab-activityarea-btn-confirm').should('exist').click({force: true}); //click confirm settings
        cy.get('#opfab-activityarea-btn-yes').should('exist').click(); // and click yes on the confirmation popup
        cy.wait('@saved'); // wait for settings to be saved
        cy.wait('@reloadPerimeter'); // wait for user perimeter to be updated 
    
        // pause the cypress code  to let the time to update the perimeter
        // this is to unsure javascript engine  launch the user perimeter processing before the next cypress instruction 
        cy.wait(100); 
    });

    activityArea.addCommand('clickOnCheckbox', function (entityName) {
        cy.get('.opfab-checkbox').contains(entityName).click();
    });

   
    return activityArea;
}
