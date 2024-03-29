/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OpfabGeneralCommands} from '../support/opfabGeneralCommands';
import {SettingsCommands} from '../support/settingsCommands';
import {SoundCommands} from '../support/soundCommands'
import {ScriptCommands} from "../support/scriptCommands";

describe('Session ended test', function () {
    const opfab = new OpfabGeneralCommands();
    const sound = new SoundCommands();
    const settings = new SettingsCommands();
    const script = new ScriptCommands();

    before('Reset UI configuration file ', function () {
        script.resetUIConfigurationFiles();
        script.deleteAllCards();
        script.deleteAllSettings();
    });

    it('Checking session end after 7 days and with no sound by default', () => {
        opfab.loginWithUser('operator1_fr');
        sound.stubPlaySound();
        setTimelineInYearMode(); // to avoid having a lot of update subscription request  when simulating time
        goOneHourInTheFuture();
        checkSessionIsActive();
        goSevenDaysInTheFuture();
        checkSessionIsClosed();
        sound.checkNumberOfEmittedSoundIs(0);
    });

    it('Checking sound when session end and one sound is configured ', () => {
        opfab.loginWithUser('operator1_fr');
        sound.stubPlaySound();
        setTimelineInYearMode(); // to avoid having a lot of update subscription request  when simulating time
        configureOneSound();
        goOneHourInTheFuture();
        checkSessionIsActive();
        goSevenDaysInTheFuture();
        checkSessionIsClosed();
        cy.tick(10); // necessary to trigger the sound   
        sound.checkNumberOfEmittedSoundIs(1);
    });

    function setTimelineInYearMode() {
        cy.get('.axis').find('text').first().as('firstTimelineXTick');
        cy.get('#opfab-timeline-link-period-Y').click();
    }

    function goOneHourInTheFuture() {
        cy.clock(new Date());
        cy.tick(1 * 60 * 60 * 1000);
    }

    function checkSessionIsActive() {
        cy.get('#opfab-sessionEnd').should('not.exist');
    }

    function goSevenDaysInTheFuture() {
        cy.clock(new Date());
        cy.tick(7 * 24 * 60 * 60 * 1000);
    }

    function checkSessionIsClosed() {
        cy.get('#opfab-modal-body').should('exist');
        cy.get('#opfab-modal-body').should('contain', 'Your session has expired');
    }

    function configureOneSound() {
        opfab.navigateToSettings();
        settings.clickOnSeverity('alarm');
        settings.clickOnReplaySoundAndSave(); // set no replay for sound
        cy.wait(500); // need to wait due to the fact that we use clock after (no explanation found)
    }
});
