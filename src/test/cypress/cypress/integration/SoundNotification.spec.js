/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OpfabGeneralCommands} from '../support/opfabGeneralCommands';
import {SoundCommands} from '../support/soundCommands';
import {SettingsCommands} from '../support/settingsCommands'
import {ScriptCommands} from "../support/scriptCommands";
import {FeedCommands} from '../support/feedCommands'

describe('Sound notification test', function () {
    const user = 'operator1_fr';
    const opfab = new OpfabGeneralCommands();
    const sound = new SoundCommands();
    const settings = new SettingsCommands();
    const script = new ScriptCommands();
    const feed = new FeedCommands();

    before('Reset UI configuration file ', function () {
        //script.loadTestConf(); //Avoid to launch it as it is time consuming
        script.resetUIConfigurationFiles();
    });

    beforeEach('Reset settings', function () {
        script.deleteAllCards();
        script.deleteAllSettings();
    });

    describe('Checking sound when receiving notification ', function () {
        it('Sound when receiving card   ', () => {
            opfab.loginWithUser(user);
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
            opfab.loginWithUser(user);
            sound.stubPlaySound();
            opfab.navigateToSettings();
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

            // Click somewhere to stop repeating sound
            cy.get('#opfab-navbar-menu-feed').click();

            // Wait 30 seconds more , no new sound
            cy.tick(30000);
            sound.checkNumberOfEmittedSoundIs(3);
        });

        it('Repeating sound when receiving card  with  custom repeating interval ', () => {
   
            opfab.loginWithUser(user);
            sound.stubPlaySound();
            opfab.navigateToSettings();
            settings.setReplayIntervalTo('20');
            settings.clickOnSeverity('information'); 
            opfab.navigateToFeed();

            cy.clock(new Date());
            sendCardWithSeverityInformation();
            cy.waitDefaultTime();

            // wait for light card to appears
            cy.tick(1000);
            cy.get('of-light-card');

             // Shift 15 seconds in the future
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
            opfab.loginWithUser(user);
            sound.stubPlaySound();
            opfab.navigateToSettings();
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

    describe('Checking sound and alert when receiving notification for hidden cards', function () {
        it('Check sound and alert when receiving card hidden by filters', () => {
            opfab.loginWithUser(user);
            sound.stubPlaySound();

            opfab.navigateToSettings();
            settings.clickOnSeverity('alarm');  // set severity alarm to be notified by sound
            opfab.navigateToFeed();
            // Use cypress time simulation
            cy.clock(new Date());

            feed.filterByAcknowledgement('ack');
            feed.checkFilterIsActive();

            sendCardAndCheckSoundAndAlertMessage();
        });

        it('Check sound and alert when receiving card hidden by timeline', () => {
            opfab.loginWithUser(user);
            sound.stubPlaySound();

            opfab.navigateToSettings();
            settings.clickOnSeverity('alarm');  // set severity alarm to be notified by sound
            opfab.navigateToFeed();

            cy.clock(new Date());

            // reset ack filter
            feed.filterByAcknowledgement('notack');
            feed.checkFilterIsNotActive();
            // Set timeline to day domain
            setTimeLineDomain('J');
            // shift timeline forward by 2 days
            moveTimelineRight();
            moveTimelineRight();
            
            sendCardAndCheckSoundAndAlertMessage();
        });
    });

    function sendCardAndCheckSoundAndAlertMessage() {

        cy.tick(1000);
        feed.checkNumberOfDisplayedCardsIs(0);

        sendCardWithSeverityAlarm();
        cy.tick(100);
        cy.tick(100);
        cy.tick(100);
        cy.tick(100);
        sound.checkNumberOfEmittedSoundIs(1);
        feed.checkNumberOfDisplayedCardsIs(0);

        cy.get('#div-detail-msg').find('span').eq(0).contains('You have received a card hidden by the filters you have activated (Timeline or card feed)');
        // Check that alert message css class
        cy.get('of-alert').find('.opfab-alert-business').should('exist');
        cy.tick(6000);
        // Check that alert message is not closed automatically after 6 seconds
        cy.get('#div-detail-msg').should('exist');
        // close it
        cy.get('#opfab-close-alert').click();
        cy.get('div-detail-msg').should('not.exist');
    }

    function setTimeLineDomain(domain) {
        cy.get('#opfab-timeline-link-period-' + domain).click();
    }

    function moveTimelineRight() {
        cy.get("#opfab-timeline-link-move-right").click();
    }

    function sendCardWithSeverityAlarm() {
        script.sendCard('defaultProcess/contingencies.json');
    }

    function sendCardWithSeverityAction() {
        script.sendCard('defaultProcess/question.json');
    }

    function sendCardWithSeverityInformation() {
        script.sendCard('defaultProcess/message.json');
    }
});
