/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {externalCommands} from './externalCommands';

export function getOpfabGeneralCommands() {
    const opfab = new externalCommands('OPFAB');

    opfab.addCommand('navigateToUserCard', function () {
        cy.get('#opfab-navbarContent').find('#opfab-newcard-menu').click();
        cy.get("of-usercard").should('exist');
    });

    opfab.addCommand('navigateToFeed', function () {
        cy.get('#opfab-navbar-menu-feed').click();
        cy.get("of-card-list").should('exist');
    });

    opfab.addCommand('navigateToArchives', function () {
        cy.get('#opfab-navbar-menu-archives').click();
        cy.get("of-archives").should('exist');
    });

    opfab.addCommand('navigateToSettings', function () {
        cy.get('#opfab-navbar-drop-user-menu').click();
        cy.get('#opfab-navbar-right-menu-settings').click();
        cy.get("of-settings").should('exist');
    });


    opfab.addCommand('openExternalDevices', () => {
        cy.get('#opfab-navbar-drop-user-menu').click();
        cy.get('#opfab-navbar-right-menu-externaldevicesconfiguration').click();
    });
    


    return opfab;
}
