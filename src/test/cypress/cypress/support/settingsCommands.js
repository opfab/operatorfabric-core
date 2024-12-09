/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OpfabCommands} from './opfabCommands';

export class SettingsCommands extends OpfabCommands {
    constructor() {
        super();
        super.init('SETTINGS');
    }

    save = function () {
        cy.get('#opfab-settings-btn-save').click();
        cy.get('#opfab-btn-ok').click();
    };

    clickOnSeverity = function (severity) {
        cy.get('#opfab-setting-input-sev-' + severity).click();
    };

    clickOnSeverityAndSave = function (severity) {
        this.clickOnSeverity(severity);
        this.save();
    };

    clickOnReplaySoundAndSave = function () {
        cy.get('#opfab-setting-input-replayEnabled').click();
        this.save();
    };

    setReplayIntervalToAndSave = function (interval) {
        cy.get('#opfab-setting-input-replayInterval').clear();
        cy.get('#opfab-setting-input-replayInterval').type(interval);
        this.save();
    };

    clickOnSendNotificationByEmailAndSave = function () {
        cy.get('input[formControlName="sendCardsByEmail"]').click({force: true});
        this.save();
    };

    setEmailAddressAndSave = function (email) {
        cy.get('#opfab-setting-input-email').clear();
        cy.get('#opfab-setting-input-email').type(email);
        this.save();
    };

    clickHallwayModeAndSave = function () {
        cy.get('#opfab-setting-input-hallway-mode-checkbox').click();
        this.save();
    };

    clickOpenNextCardOnAcknowledgment = function () {
        cy.get('#opfab-setting-input-open-next-card-checkbox').click();
        this.save();
    };
}
