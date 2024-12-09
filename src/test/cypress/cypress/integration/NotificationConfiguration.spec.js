/* Copyright (c) 2021-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OpfabGeneralCommands} from '../support/opfabGeneralCommands';
import {AgGridCommands} from '../support/agGridCommands';
import {ScriptCommands} from '../support/scriptCommands';
import {SettingsCommands} from '../support/settingsCommands';

describe('Feed notification configuration tests', function () {
    const opfab = new OpfabGeneralCommands();
    const agGrid = new AgGridCommands();
    const script = new ScriptCommands();
    const settings = new SettingsCommands();

    const totalCards = 6;
    const cardsToTest = ['Message', 'Electricity consumption forecast'];

    const cardsToTestRegex = cardsToTest.map((x) => new RegExp(x + '\\s*$')); // Convert to regex, ignore any trailing whitespace
    const cardsToTestString = cardsToTest.map((x) => x.toUpperCase());

    before('Set up configuration', function () {
        script.loadTestConf();
        script.deleteAllSettings();
    });

    it('Check feed notification configuration screen for operator1_fr', function () {
        opfab.loginWithUser('operator1_fr');

        opfab.navigateToNotificationConfiguration();

        cy.get('.opfab-notificationconfiguration-title').should('have.text', ' NOTIFICATION CONFIGURATION\n');
        cy.get('.opfab-notificationconfiguration-processlist').should('have.length', 3);

        // First process group
        cy.get('.opfab-notificationconfiguration-processlist').first().find('h5').should('have.text', 'Base Examples');
        cy.get('.opfab-notificationconfiguration-processlist').first().find('p').should('have.length', 2);
        cy.get('.opfab-notificationconfiguration-processlist').first().find('p').first().should('have.text', 'IGCC ');

        // We check the number of states for first process
        cy.get('.opfab-notificationconfiguration-processlist')
            .first()
            .find('.opfab-notificationconfiguration-process')
            .first()
            .find('tr')
            .should('have.length', 6);

        // We check 'Process example/Network Contingencies' is disabled and checked (because 'filteringNotificationAllowed' is false for the corresponding perimeter)
        cy.get('.opfab-notificationconfiguration-processlist')
            .first()
            .find('.opfab-notificationconfiguration-process')
            .last()
            .contains('⚠️ Network Contingencies ⚠️ ')
            .find('input')
            .should('be.disabled')
            .should('be.checked');

        // Second process group
        cy.get('.opfab-notificationconfiguration-processlist')
            .eq(1)
            .find('h5')
            .should('have.text', 'User card examples');
        cy.get('.opfab-notificationconfiguration-processlist').eq(1).find('p').should('have.length', 4);
        cy.get('.opfab-notificationconfiguration-processlist')
            .eq(1)
            .find('p')
            .first()
            .should('have.text', 'Conference and IT incident  ');
        cy.get('.opfab-notificationconfiguration-processlist')
            .eq(1)
            .find('.opfab-notificationconfiguration-process')
            .first()
            .find('tr')
            .should('have.length', 2);

        // Processes without group
        cy.get('.opfab-notificationconfiguration-processlist').last().find('p').should('have.length', 3);
        cy.get('.opfab-notificationconfiguration-processlist')
            .last()
            .find('p')
            .eq(0)
            .should('have.text', 'External recipient ');
        cy.get('.opfab-notificationconfiguration-processlist')
            .last()
            .find('.opfab-notificationconfiguration-process')
            .eq(0)
            .find('tr')
            .should('have.length', 1);
    });

    it('Check feed notification configuration screen for admin', function () {
        opfab.loginWithUser('admin');

        opfab.navigateToNotificationConfiguration();

        cy.get('.opfab-notificationconfiguration-title').should('have.text', ' NOTIFICATION CONFIGURATION\n');
        cy.get('.opfab-notificationconfiguration-processlist').should('have.length', 0);
        cy.get('#opfab-notificationconfiguration-no-process-state-available')
            .contains('No process/state available')
            .should('exist');
    });

    it('Check feature select/unselect all states for a process', function () {
        opfab.loginWithUser('operator1_fr');
        opfab.navigateToNotificationConfiguration();

        // Basic check
        cy.get('#opfab_notification_processgroup_service1').should('be.checked');
        cy.get('.opfab-notificationconfiguration-processlist').last().find('p').find('input').should('be.checked');

        // We unselect 'Process example' process (to test the state 'Network Contingencies' is still checked (because filtering notification on this state is not allowed))
        cy.get('.opfab-notificationconfiguration-processlist')
            .eq(0)
            .find('p')
            .eq(1)
            .find('input')
            .uncheck({force: true});

        // Process group should be unchecked
        cy.get('#opfab_notification_processgroup_service1').should('not.be.checked');

        // We check 'Process example' process and all of its states are unchecked except 'Network Contingencies'
        cy.get('.opfab-notificationconfiguration-processlist')
            .eq(0)
            .find('p')
            .eq(1)
            .find('input')
            .should('not.be.checked');
        cy.get('.opfab-notificationconfiguration-processlist')
            .eq(0)
            .find('.opfab-notificationconfiguration-process')
            .eq(1)
            .find('tr')
            .as('ProcessExampleStates');
        cy.get('@ProcessExampleStates').contains('Action required').find('input').should('not.be.checked');
        cy.get('@ProcessExampleStates')
            .contains('Additional information required')
            .find('input')
            .should('not.be.checked');
        cy.get('@ProcessExampleStates').contains('Data quality').find('input').should('not.be.checked');
        cy.get('@ProcessExampleStates')
            .contains('Electricity consumption forecast')
            .find('input')
            .should('not.be.checked');
        cy.get('@ProcessExampleStates').contains('Message').find('input').should('not.be.checked');
        cy.get('@ProcessExampleStates').contains('Process example').find('input').should('not.be.checked');
        cy.get('@ProcessExampleStates')
            .contains('⚠️ Network Contingencies ⚠')
            .find('input')
            .should('be.disabled')
            .should('be.checked');

        // We select 'Process example' process
        cy.get('.opfab-notificationconfiguration-processlist').eq(0).find('p').eq(1).find('input').check({force: true});

        // We check 'Process example' process and all of its states are checked
        cy.get('.opfab-notificationconfiguration-processlist').eq(0).find('p').eq(1).find('input').should('be.checked');
        cy.get('@ProcessExampleStates').contains('Action required').find('input').should('be.checked');
        cy.get('@ProcessExampleStates').contains('Additional information required').find('input').should('be.checked');
        cy.get('@ProcessExampleStates').contains('Data quality').find('input').should('be.checked');
        cy.get('@ProcessExampleStates').contains('Electricity consumption forecast').find('input').should('be.checked');
        cy.get('@ProcessExampleStates').contains('Message').find('input').should('be.checked');
        cy.get('@ProcessExampleStates').contains('Process example').find('input').should('be.checked');
        cy.get('@ProcessExampleStates')
            .contains('⚠️ Network Contingencies ⚠')
            .find('input')
            .should('be.disabled')
            .should('be.checked');
    });

    it('Test remove some notifications after cards are sent', function () {
        // Clean up existing cards
        script.deleteAllCards();
        script.send6TestCards();
        opfab.loginWithUser('operator1_fr');

        // All cards should be present
        cy.get('of-light-card').should('have.length', totalCards);

        // All cards should exist in the card feed
        cardsToTestString.forEach((c) => {
            cy.get('#opfab-card-list').contains(c).should('exist');
        });

        // Cards should exist on the monitoring page
        opfab.navigateToMonitoring();
        cardsToTestRegex.forEach((c) => {
            cy.get('of-monitoring-table').contains(c).should('exist');
        });

        // Unselect some notifications
        cy.get('#opfab-navbar-drop-user-menu').click(); // Click top right dropdown menu
        cy.get('#opfab-navbar-right-menu-feedconfiguration').click(); // Click notification reception

        cardsToTestRegex.forEach((c) => {
            cy.get('.opfab-notificationconfiguration-process').contains(c).click({force: true}); // Unselect card
        });

        saveSettingsForNotificationConfigurationScreen();

        // Check feed
        cy.get('#opfab-navbar-menu-feed').click(); // Open feed

        // All cards minus the cards to check should be visible
        cy.get('of-light-card').should('have.length', totalCards - cardsToTestRegex.length);

        // Cards should not be visible anymore in the card feed
        cardsToTestRegex.forEach((c) => {
            cy.get('#opfab-card-list').contains(c).should('not.exist');
        });

        // Cards should not exist on the monitoring page
        opfab.navigateToMonitoring();
        cardsToTestRegex.forEach((c) => {
            cy.get('of-monitoring-table').contains(c).should('not.exist'); // wait for dialog to go away
        });

        // Pagination should display ' Results number  : <5 - cardsToTest> '
        cy.get('.opfab-pagination').should(
            'contain.text',
            ' Results number  : ' + parseInt(5 - cardsToTestRegex.length)
        );
    });

    it('When sending new cards, check only monitored cards are shown', function () {
        script.deleteAllCards();
        script.send6TestCards();
        opfab.loginWithUser('operator1_fr');

        // Check feed
        cy.get('#opfab-navbar-menu-feed').click(); // Open feed

        // Cards should not be visible anymore in the card feed
        cardsToTestRegex.forEach((c) => {
            cy.get('of-light-card').contains(c).should('not.exist');
        });

        // All cards minus the cards to check should be visible
        cy.get('of-light-card').should('have.length', totalCards - cardsToTestRegex.length);

        // Cards should not exist on the monitoring page
        opfab.navigateToMonitoring();
        // Monitoring results table
        cardsToTestRegex.forEach((c) => {
            cy.get('of-monitoring-table').contains(c).should('not.exist');
        });
    });

    it('Check envelop icon is present only if mail option is checked and mail address is filled', function () {
        opfab.loginWithUser('operator1_fr');

        opfab.navigateToNotificationConfiguration();

        // We check no icon envelope is present
        cy.get('.opfab-notificationconfiguration-icon-envelope-with-slash').should('not.exist');
        cy.get('.opfab-notificationconfiguration-icon-envelope-without-slash').should('not.exist');

        opfab.navigateToFeed(); // necessary otherwise navigateToSettings() fails
        opfab.navigateToSettings();
        settings.setEmailAddressAndSave('mail@test.com');
        settings.clickOnSendNotificationByEmailAndSave();

        // We go back to feed notification configuration screen, and we check envelope icons are displayed
        opfab.navigateToNotificationConfiguration();
        cy.get('.opfab-notificationconfiguration-icon-envelope-with-slash').should('have.length', 35);
        cy.get('.opfab-notificationconfiguration-icon-envelope-without-slash').should('have.length', 0);
    });

    it('Check subscription to mail notif is saved when we navigate to another screen', function () {
        script.deleteAllSettings();
        opfab.loginWithUser('operator1_fr');

        opfab.navigateToSettings();
        settings.setEmailAddressAndSave('mail@test.com');
        settings.clickOnSendNotificationByEmailAndSave();

        opfab.navigateToNotificationConfiguration();
        cy.get('.opfab-notificationconfiguration-icon-envelope-with-slash').should('have.length', 35);
        cy.get('.opfab-notificationconfiguration-icon-envelope-without-slash').should('have.length', 0);

        // We subscribe to a process/state for mail notif
        cy.get('.opfab-notificationconfiguration-processlist')
            .eq(0)
            .contains(/^Message $/)
            .parentsUntil('tr')
            .parent()
            .as('ProcessExampleMessageState');
        cy.get('@ProcessExampleMessageState')
            .find('.opfab-notificationconfiguration-icon-envelope-with-slash')
            .click({force: true});
        cy.wait(100); // wait for the icon to change

        saveSettingsForNotificationConfigurationScreen();

        opfab.navigateToFeed(); // we navigate to another screen

        opfab.navigateToNotificationConfiguration();
        cy.get('.opfab-notificationconfiguration-icon-envelope-with-slash').should('have.length', 34);
        cy.get('.opfab-notificationconfiguration-icon-envelope-without-slash').should('have.length', 1);

        cy.get('@ProcessExampleMessageState')
            .find('.opfab-notificationconfiguration-icon-envelope-without-slash')
            .should('exist');
    });

    it('Check subscription to mail notif is automatically canceled if user has unsubscribed from a state', function () {
        opfab.loginWithUser('operator1_fr');

        opfab.navigateToNotificationConfiguration();
        cy.get('.opfab-notificationconfiguration-icon-envelope-with-slash').should('have.length', 34);
        cy.get('.opfab-notificationconfiguration-icon-envelope-without-slash').should('have.length', 1);

        cy.get('.opfab-notificationconfiguration-processlist')
            .eq(0)
            .contains(/^Message $/)
            .parentsUntil('tr')
            .parent()
            .as('ProcessExampleMessageState');

        cy.get('@ProcessExampleMessageState')
            .find('.opfab-notificationconfiguration-icon-envelope-without-slash')
            .should('exist');

        // We unsubscribe from the state
        cy.get('@ProcessExampleMessageState').find('input').uncheck({force: true});

        cy.get('#opfab-navbar-menu-feed').click(); // we navigate to another screen

        cy.get('.modal-body')
            .find('p')
            .eq(0)
            .should('contain.text', 'There are pending modifications, do you want to save?');
        cy.get('#opfab-btn-cancel').click(); // and cancel
        cy.get('#opfab-btn-cancel').should('not.exist'); // wait for dialog to go away
        cy.hash().should('eq', '#/feedconfiguration'); // should stay in feed configuration page

        cy.get('#opfab-navbar-menu-feed').click();

        cy.get('.modal-body')
            .find('p')
            .eq(0)
            .should('contain.text', 'There are pending modifications, do you want to save?');
        cy.get('#opfab-btn-save').click(); // and confirm to save
        cy.get('#opfab-btn-ok').click(); // confirm save done and close dialog
        cy.hash().should('eq', '#/feed');

        opfab.navigateToNotificationConfiguration();
        cy.get('.opfab-notificationconfiguration-icon-envelope-with-slash').should('have.length', 35);
        cy.get('.opfab-notificationconfiguration-icon-envelope-without-slash').should('have.length', 0);
        cy.get('@ProcessExampleMessageState')
            .find('.opfab-notificationconfiguration-icon-envelope-with-slash')
            .should('exist'); // subscription for mail notif automatically canceled for this state
    });

    it(
        'In case of a state unsubscribed and then filtering notif on this state is prohibited : ' +
            'test a popup is displayed and then the subscription to this state is forced',
        function () {
            opfab.loginWithUser('operator1_fr');

            opfab.navigateToNotificationConfiguration();

            cy.get('.opfab-notificationconfiguration-processlist')
                .eq(0)
                .contains('Data quality')
                .find('input')
                .as('DataQualityState');
            cy.get('@DataQualityState').should('be.checked');
            cy.get('@DataQualityState').click({force: true}); // Unselect state

            saveSettingsForNotificationConfigurationScreen();

            opfab.logout();
            opfab.loginWithUser('admin');

            // Click on user menu (top right of the screen)
            cy.get('#opfab-navbar-drop-user-menu').click();
            // Click on "Administration"
            cy.get('#opfab-navbar-right-menu-admin').click();

            // Click on "Perimeters Management"
            cy.get('#opfab-admin-perimeters-tab').click();
            // Edit perimeter defaultProcess
            agGrid.clickCell('ag-grid-angular', 2, 3, 'of-action-cell-renderer');
            cy.get('of-edit-perimeter-modal').should('exist');
            cy.get('.modal-title').should('contain.text', 'defaultProcess');
            cy.get('#state2').should('contain.text', 'Data quality');
            cy.get('#opfab-admin-perimeter-filtering-notification-allowed2').should('be.checked').click({force: true});
            cy.get('#opfab-admin-perimeter-btn-save').click();

            opfab.logout();
            opfab.loginWithUser('operator1_fr');

            opfab.navigateToNotificationConfiguration();

            // We check the text displayed in the popup
            cy.get('#opfab-modal-body').should(
                'contain.text',
                'You are unsubscribed from one or more notifications for which unsubscribing is now prohibited'
            );
            cy.get('#opfab-modal-body').should('contain.text', 'Notification(s) concerned');
            cy.get('#opfab-modal-body').should('contain.text', 'Process example  / Data quality');
            cy.get('#opfab-modal-body').should(
                'contain.text',
                'By clicking OK, you will be subscribed to these notifications again.'
            );
            cy.get('#opfab-btn-ok').click(); // Click OK
            cy.get('#opfab-modal-body').should('contain.text', 'Settings saved');
            cy.get('#opfab-btn-ok').click(); // Click OK when saved

            // Check the state 'Data quality' is checked and disabled
            cy.get('.opfab-notificationconfiguration-processlist')
                .eq(0)
                .contains('Data quality')
                .find('input')
                .as('DataQualityState');
            cy.get('@DataQualityState').should('be.checked');
            cy.get('@DataQualityState').should('be.disabled');
        }
    );
});

function saveSettingsForNotificationConfigurationScreen() {
    cy.get('#opfab-notificationconfiguration-btn-confirm').click(); // Save settings
    cy.get('#opfab-btn-ok').click(); // and confirm
    cy.get('#opfab-btn-ok').should('not.exist'); // wait for dialog to go away
}
