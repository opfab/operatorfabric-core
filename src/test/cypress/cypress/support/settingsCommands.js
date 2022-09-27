/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {externalCommands} from './externalCommands';

export function getSettingsCommands() {
    const settings = new externalCommands('SETTINGS');

    settings.addCommand('clickOnSeverity', function (severity) {
        cy.intercept('PATCH', '/users/**').as('saved');
        cy.get('#opfab-checkbox-setting-form-' + severity).click();
        cy.wait('@saved'); // wait for settings to be saved
    });

    settings.addCommand('clickOnReplaySound', function () {
        cy.intercept('PATCH', '/users/**').as('saved');
        cy.get('#opfab-checkbox-setting-form-replay').click();
        cy.wait('@saved'); // wait for settings to be saved
    });

    settings.addCommand('setReplayIntervalTo', function (interval) {
        cy.intercept('PATCH', '/users/**').as('saved');
        cy.get('#opfab-setting-replayInterval').clear();
        cy.wait('@saved'); // wait for settings to be saved
        cy.get('#opfab-setting-replayInterval').type(interval);
        cy.wait('@saved'); // wait for settings to be saved
    });


    return settings;
}
