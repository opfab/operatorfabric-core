/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {getOpfabGeneralCommands} from '../support/opfabGeneralCommands';
import {getSoundCommands} from '../support/soundCommands'
import {getSettingsCommands} from '../support/settingsCommands'

describe('Sound notification test', function () {
    const user = 'operator1_fr';
    const opfab = getOpfabGeneralCommands();
    const sound = getSoundCommands();
    const settings = getSettingsCommands();

    before('Reset UI configuration file ', function () {
        //cy.loadTestConf(); Avoid to launch it as it is time consuming
        cy.resetUIConfigurationFiles();
        cy.deleteAllCards();
        cy.deleteAllSettings();
    });

    describe('Checking sound when receiving notification ', function () {
        it('Sound when receiving card   ', () => {
            cy.loginOpFab(user, 'test');
            sound.stubPlaySound();

            opfab.navigateToSettings();
            settings.clickOnSeverity('alarm');  // set severity alarm to be notified by sound
            opfab.navigateToFeed();
            sendCardWithSeverityAlarm();
            sound.checkNumberOfEmittedSoundIs(1);
            sendCardWithSeverityAction();
            sound.checkNumberOfEmittedSoundIs(1); // no new sound

            opfab.navigateToSettings();
            settings.clickOnSeverity('alarm'); // set severity alarm to NOT be notified by sound
            opfab.navigateToFeed();
            sendCardWithSeverityAlarm();
            sound.checkNumberOfEmittedSoundIs(1); // No new sound

            opfab.navigateToSettings();
            settings.clickOnSeverity('action'); // set severity action to be notified by sound
            opfab.navigateToArchives(); //even if user is in archives screen sound are activated
            sendCardWithSeverityAction();
            sound.checkNumberOfEmittedSoundIs(2); // One new sound

            opfab.navigateToSettings();
            settings.clickOnSeverity('information'); // set severity information  to be notified by sound
            opfab.navigateToArchives(); //even if user is in archives screen sound are activated
            sendCardWithSeverityAlarm();
            sendCardWithSeverityInformation();
            sendCardWithSeverityAction();
            sound.checkNumberOfEmittedSoundIs(4); // Two new sound (no sound for alarm)
        });

        it('Repeating sound when receiving card with default repeating interval   ', () => {
            cy.delete6TestCards();
            cy.loginOpFab(user, 'test');
            sound.stubPlaySound();

            opfab.navigateToFeed();

            // Use cypress time simulation
            cy.clock(new Date());
            sendCardWithSeverityInformation();
            cy.waitDefaultTime();

            // wait for light card to appear
            cy.tick(1000);
            cy.get('of-light-card');

            // Shift 15 seconds in the future
            cy.tick(15000);

            // Two new sound , the first one + a repetition as default replay interval is 10 seconds in web-ui.json
            sound.checkNumberOfEmittedSoundIs(2);

            // After 10 seconds more , one more sound
            cy.tick(10000);
            cy.get('@playSound').its('callCount').should('eq', 3);

            // Click somewhere to stop repeating sound
            cy.get('#opfab-navbar-menu-feed').click();

            // Wait 30 seconds more , no new sound
            cy.tick(30000);
            sound.checkNumberOfEmittedSoundIs(3);
        });

        it('Repeating sound when receiving card  with  custom repeating interval ', () => {
            cy.delete6TestCards();
            cy.loginOpFab(user, 'test');
            sound.stubPlaySound();

            opfab.navigateToSettings();
            settings.setReplayIntervalTo('20');

            opfab.navigateToFeed();

            cy.clock(new Date());
            sendCardWithSeverityInformation();
            cy.waitDefaultTime();

            // wait for light card to appears
            cy.tick(1000);
            cy.get('of-light-card');

            cy.tick(50000);

            // Two new sound , the first one + 2 repetition
            sound.checkNumberOfEmittedSoundIs(3);

            // Click somewhere to stop repeating sound
            cy.get('#opfab-navbar-menu-feed').click();

            // Wait 30 seconds more , no new sound
            cy.tick(30000);
            sound.checkNumberOfEmittedSoundIs(3);
        });

        it('Repeating sound when receiving card with no existing settings for user on login \
        and default settings replayEnabled = true  (Test for bug #3422)  ', () => {
            cy.deleteAllSettings();
            cy.delete6TestCards();
            cy.loginOpFab(user, 'test');
            sound.stubPlaySound();

            opfab.navigateToSettings();
            // set severity information  to be notified by sound
            settings.clickOnSeverity('information');

            opfab.navigateToFeed();

            // Use cypress time simulation
            cy.clock(new Date());
            sendCardWithSeverityInformation();
            cy.waitDefaultTime();

            // wait for light card to appear
            cy.tick(1000);
            cy.get('of-light-card');

            // Shift 15 seconds in the future
            cy.tick(15000);

            // Two new sound , the first one + a repetition as default replay interval is 10 seconds in web-ui.json
            sound.checkNumberOfEmittedSoundIs(2);

            // After 10 seconds more , one more sound
            cy.tick(10000);
            sound.checkNumberOfEmittedSoundIs(3);
        });
    });


    function sendCardWithSeverityAlarm() {
        cy.sendCard('defaultProcess/contingencies.json');
    }

    function sendCardWithSeverityAction() {
        cy.sendCard('defaultProcess/question.json');
    }

    function sendCardWithSeverityInformation() {
        cy.sendCard('defaultProcess/message.json');
    }
});
