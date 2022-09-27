/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {externalCommands} from './externalCommands';

export function getSoundCommands() {
    const sound = new externalCommands('SOUND');

    sound.addCommand('checkNumberOfEmittedSoundIs', function (nb) {
            cy.get('@playSound').its('callCount').should('eq', nb);
    });

    sound.addCommand('stubPlaySound', function () {
        cy.window()
        .its('soundNotificationService')
        .then((soundNotificationService) => {
            cy.stub(soundNotificationService, 'playSound').as('playSound');
        });
    });

    return sound;
}
