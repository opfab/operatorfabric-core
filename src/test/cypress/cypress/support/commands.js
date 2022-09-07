/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

Cypress.Commands.add('waitDefaultTime', () => {
    cy.wait(Cypress.env('defaultWaitTime'));
});

Cypress.Commands.add('hackUrlCurrentlyUsedMechanism', () => {
    localStorage.setItem('isOpfabUrlCurrentlyUsed', 'false');
    expect(localStorage.getItem('isOpfabUrlCurrentlyUsed')).to.eq('false');
    cy.wait(100);
});

Cypress.Commands.add('loginOpFab', (username, password) => {
    cy.hackUrlCurrentlyUsedMechanism();

    //go to login page
    cy.visit('');

    cy.loginOpFabWithoutHack(username, password);
});

Cypress.Commands.add('loginOpFabWithoutHack', (username, password) => {
    //type login
    cy.get('#opfab-login').should('be.visible');
    cy.get('#opfab-login').type(username);

    //type password
    cy.get('#opfab-password').should('be.visible');
    cy.get('#opfab-password').type(password);

    //press login button
    cy.get('#opfab-login-btn-submit').click();
    cy.get('#opfab-login-btn-submit').should('be.visible');

    //Wait for the app to finish initializing
    cy.get('#opfab-cypress-loaded-check', {timeout: 20000}).should('have.text', 'true');
});

Cypress.Commands.add('loginWithClock', (dateToUse = new Date()) => {
    // Do not use the generic login feature as we
    // need to launch cy.clock after cy.visit('')
    cy.hackUrlCurrentlyUsedMechanism();
    cy.visit('');
    cy.clock(dateToUse);
    cy.get('#opfab-login').type('operator1_fr');
    cy.get('#opfab-password').type('test');
    cy.get('#opfab-login-btn-submit').click();

    //Wait for the app to finish initializing
    cy.get('#opfab-cypress-loaded-check', {timeout: 15000}).should('have.text', 'true');
});

Cypress.Commands.overwrite('reload', () => {
    cy.hackUrlCurrentlyUsedMechanism();

    //go to login page
    cy.visit('');

    //Wait for the app to finish initializing
    cy.get('#opfab-cypress-loaded-check', {timeout: 15000}).should('have.text', 'true');
});

Cypress.Commands.add('logoutOpFab', () => {
    cy.get('#opfab-navbar-drop-user-menu').click(); // Click top right dropdown menu
    cy.get('#opfab-navbar-right-menu-logout').click(); // Click logout button
});

Cypress.Commands.add('loadTestConf', () => {
    // This clears existing processGroups, bundles and perimeters and load the test configuration
    cy.exec('cd .. && ./resources/loadTestConf.sh ' + Cypress.env('host'));
});

Cypress.Commands.add('loadRealTimeScreensConf', () => {
    // This clears existing realtimescreens.json and loads a new one
    cy.exec('cd ../resources/realTimeScreens && ./loadRealTimeScreens.sh realTimeScreens.json ' + Cypress.env('host'));
});

Cypress.Commands.add('loadEmptyProcessGroups', () => {
    // This load a process groups file without any process group
    cy.exec('cd ../resources/processGroups && ./loadProcessGroups.sh emptyProcessGroups.json ' + Cypress.env('host'));
});

Cypress.Commands.add('loadProcessGroupsNotTotallyConfigured', () => {
    // This load a process groups file without any process group
    cy.exec('cd ../resources/processGroups && ./loadProcessGroups.sh processGroupsNotTotallyConfigure.json ' + Cypress.env('host'));
});

Cypress.Commands.add('delayRequestResponse', (url, delayTime = 2000) => {
    cy.intercept(url, (req) => {
        req.reply((res) => {
            res.delay = delayTime;
        });
    });
});

Cypress.Commands.add('checkLoadingSpinnerIsDisplayed', () => {
    cy.get('#opfab-loading-spinner').should('exist');
});

Cypress.Commands.add('checkLoadingSpinnerIsNotDisplayed', () => {
    cy.get('#opfab-loading-spinner').should('not.exist');
});

Cypress.Commands.add('send6TestCards', () => {
    cy.exec('cd .. && ./resources/send6TestCards.sh ' + Cypress.env('host'));
});

Cypress.Commands.add(
    'sendCard',
    (cardFile, customEpochDate1 = new Date().getTime(), customEpochDate2 = new Date().getTime() + 5 * 60 * 1000) => {
        cy.exec(
            'cd ../resources/cards/ && ./sendCard.sh ' +
                cardFile +
                ' ' +
                Cypress.env('host') +
                ' ' +
                customEpochDate1 +
                ' ' +
                customEpochDate2
        );
    }
);

Cypress.Commands.add('delete6TestCards', () => {
    cy.exec('cd .. && ./resources/delete6TestCards.sh ' + Cypress.env('host'));
});

Cypress.Commands.add('deleteCard', (cardId) => {
    cy.exec('cd ../resources/cards/ && ./deleteCard.sh ' + cardId + ' ' + Cypress.env('host'));
});

Cypress.Commands.add('sendAckForCard', (user, cardUid, entitiesAcks) => {
    cy.exec('cd ../resources/cards/ && ./sendAckForCard.sh ' + user + ' ' + cardUid + ' ' + entitiesAcks);
});

Cypress.Commands.add('resetUIConfigurationFiles', () => {
    cy.exec('cp ../../../config/cypress/ui-config/web-ui-base.json ../../../config/cypress/ui-config/web-ui.json');
    cy.exec('cp ../../../config/cypress/ui-config/ui-menu-base.json ../../../config/cypress/ui-config/ui-menu.json');
});

Cypress.Commands.add('removePropertyInConf', (property, file) => {
    switch (file) {
        case 'web-ui':
        case 'ui-menu':
            const filePath = `./config/cypress/ui-config/${file}.json`;
            cy.exec(`cd ../../.. && ./src/test/resources/uiConfig/removePropertyInJson.sh ${filePath} ${property}`);
            break;
        default:
            cy.log(`${file} is not a recognized configuration file (valid options: web-ui, ui-menu).`);
    }
});

Cypress.Commands.add('setPropertyInConf', (property, file, value) => {
    switch (file) {
        case 'web-ui':
        case 'ui-menu':
            const filePath = `./config/cypress/ui-config/${file}.json`;
            cy.exec(
                `cd ../../.. && ./src/test/resources/uiConfig/updatePropertyInJson.sh ${filePath} ${property} ${value}`
            );
            break;
        default:
            cy.log(`${file} is not a recognized configuration file (valid options: web-ui, ui-menu).`);
    }
});

Cypress.Commands.add('updateCoreMenuInConf', (menu, property, value) => {
    const filePath = `./config/cypress/ui-config/ui-menu.json`;
    cy.exec(`cd ../../.. && ./src/test/resources/uiConfig/updateCoreMenu.sh ${filePath} ${menu} ${property} ${value}`);
});

Cypress.Commands.add('deleteCoreMenuFromConf', (menu) => {
    const filePath = `./config/cypress/ui-config/ui-menu.json`;
    cy.exec(`cd ../../.. && ./src/test/resources/uiConfig/deleteCoreMenu.sh ${filePath} ${menu}`);
});
Cypress.Commands.add('deleteAllArchivedCards', () => {
    cy.exec('cd .. && ./resources/deleteAllArchivedCards.sh ' + Cypress.env('host'));
});

Cypress.Commands.add('deleteAllCards', () => {
    cy.exec('cd .. && ./resources/deleteAllCards.sh ' + Cypress.env('host'));
});

Cypress.Commands.add('deleteAllSettings', () => {
    cy.exec('cd .. && ./resources/deleteAllSettings.sh ' + Cypress.env('host'));
});

Cypress.Commands.add('waitForOpfabToStart', () => {
    cy.exec('cd ../../.. && ./bin/waitForOpfabToStart.sh ');
});

Cypress.Commands.add('openSettings', () => {
    cy.get('#opfab-navbar-drop-user-menu').click();
    cy.get('#opfab-navbar-right-menu-settings').click();
});

Cypress.Commands.add('openActivityArea', () => {
    cy.get('#opfab-navbar-drop-user-menu').click();
    cy.get('#opfab-navbar-right-menu-activityarea').click();
});

Cypress.Commands.add('saveActivityAreaModifications', () => {
    cy.get('#opfab-activityarea-btn-confirm').should('exist').click({force: true}); //click confirm settings
    cy.get('#opfab-activityarea-btn-yes').should('exist').click(); // and click yes on the confirmation popup
});



// Stub playSound method to catch when opfab send a sound
Cypress.Commands.add('stubPlaySound', () => {
    cy.window()
        .its('soundNotificationService')
        .then((soundNotificationService) => {
            cy.stub(soundNotificationService, 'playSound').as('playSound');
        });
});

Cypress.Commands.add('setFormDateTime', (formName, year, month, day, hours, minutes) => {
    cy.get('#opfab-datepicker-' + formName).click();
    cy.get('[aria-label="Select year"]').select(year);
    cy.get('[aria-label="Select month"]').select(month);
    cy.get('[aria-label*="' + day + ',"]').click();
    cy.get('#opfab-timepicker-' + formName)
        .find('[aria-label="Hours"]')
        .click()
        .type('{backspace}{backspace}' + hours);
    cy.get('#opfab-timepicker-' + formName)
        .find('[aria-label="Minutes"]')
        .click()
        .type('{backspace}{backspace}' + minutes);
});

// Count ag-grid table rows
Cypress.Commands.add('countAgGridTableRows', (table, rowsNum) => {
    cy.get(table).find('.ag-center-cols-container').find('.ag-row').should('have.length', rowsNum);
});

// Check ag-grid cell value
Cypress.Commands.add('agGridCellShould', (table, row, col, operator, value) => {
    cy.get(table)
        .find('.ag-center-cols-container')
        .find('.ag-row')
        .eq(row)
        .find('.ag-cell-value')
        .eq(col)
        .should(operator, value);
});

// Check ag-grid cell value
Cypress.Commands.add('agGridCellElementShould', (table, row, col, element, operator, value) => {
    cy.get(table)
        .find('.ag-center-cols-container')
        .find('.ag-row')
        .eq(row)
        .find('.ag-cell-value')
        .eq(col)
        .find(element)
        .should(operator, value);
});

// Click on ag-grid cell
// Specific tag should be specified in case of cell renderers
Cypress.Commands.add('clickAgGridCell', (table, row, col, tag) => {
    if (!!tag) {
        cy.get(table)
            .find('.ag-center-cols-container')
            .find('.ag-row')
            .eq(row)
            .find('.ag-cell-value')
            .eq(col)
            .find(tag)
            .eq(0)
            .click();
    } else {
        cy.get(table).find('.ag-center-cols-container').find('.ag-row').eq(row).find('.ag-cell-value').eq(col).click();
    }
});


Cypress.Commands.add('loadMonitoringConfig', (config) => {
    cy.exec('cd .. && ./resources/monitoringConfig/loadMonitoringConfig.sh ' + config);
});

Cypress.Commands.add('sendMessageToSubscriptions', (message) => {
    cy.exec('cd .. && ./resources/sendMessageToSubscriptions.sh ' + message);
});

Cypress.Commands.add('checkAdminModeCheckboxIsDisplayed', () => {
    cy.get('#opfab-archives-logging-admin-mode-checkbox').contains('Admin mode').should('exist');
    cy.get('#opfab-archives-logging-admin-help').should('exist');
});

Cypress.Commands.add('checkAdminModeCheckboxDoesNotExist', () => {
    cy.get('#opfab-archives-logging-admin-mode-checkbox').should('not.exist');
    cy.get('#opfab-archives-logging-admin-help').should('not.exist');
});

Cypress.Commands.add('checkAdminModeCheckboxIsNotChecked', () => {
    cy.get('#opfab-archives-logging-admin-mode-checkbox').contains('Admin mode').find('input').should('not.be.checked');
});

Cypress.Commands.add('checkAdminModeCheckboxIsChecked', () => {
    cy.get('#opfab-archives-logging-admin-mode-checkbox').contains('Admin mode').find('input').should('be.checked');
});

Cypress.Commands.add('clickAdminModeCheckbox', () => {
    cy.get('#opfab-archives-logging-admin-mode-checkbox').contains('Admin mode').click();
});

Cypress.Commands.add('checkAdminModeLinkIsDisplayed', () => {
    cy.get('#opfab-admin-mode-link').contains('Go to admin mode').should('exist');
    cy.get('#opfab-admin-mode-help').should('exist');
});

Cypress.Commands.add('checkAdminModeLinkDoesNotExist', () => {
    cy.get('#opfab-admin-mode-link').should('not.exist');
    cy.get('#opfab-admin-mode-help').should('not.exist');
});

Cypress.Commands.add('clickAdminModeLink', () => {
    cy.get('#opfab-admin-mode-link').contains('Go to admin mode').click();
});

Cypress.Commands.add('checkProcessGroupSelectDoesNotExist', () => {
    cy.get('#opfab-processGroup').should('not.exist');
});

Cypress.Commands.add('checkProcessSelectDoesNotExist', () => {
    cy.get('#opfab-process').should('not.exist');
});

Cypress.Commands.add('checkStateSelectDoesNotExist', () => {
    cy.get('#opfab-state').should('not.exist');
});

Cypress.Commands.add('checkNoProcessStateMessageIsDisplayed', () => {
    cy.get('#opfab-no-process-state-available').contains('No process/state available').should('exist');
});

Cypress.Commands.add('checkNoCardDetailIsDisplayed', () => {
    cy.get('of-card-detail').should('not.exist');
});

Cypress.Commands.add('clickOnProcessGroupSelect', () => {
    cy.get('#opfab-processGroup').click();
});

Cypress.Commands.add('selectAllProcessGroups', () => {
    cy.get('#opfab-processGroup').find('.vscomp-toggle-all-button').click();
});
Cypress.Commands.add('checkNumberOfProcessGroupEntriesIs', (nb) => {
    cy.get('#opfab-processGroup').find('.vscomp-option-text').should('have.length', nb);
});

Cypress.Commands.add('checkProcessGroupSelectContains', (value) => {
    cy.get('#opfab-processGroup').contains(value).should('exist');
});

Cypress.Commands.add('clickOnProcessSelect', () => {
    cy.get('#opfab-process').click();
});

Cypress.Commands.add('selectProcess', (processName) => {
    cy.get('#opfab-process').contains(processName).click();
});

Cypress.Commands.add('selectAllProcesses', () => {
    cy.get('#opfab-process').find('.vscomp-toggle-all-button').click();
});

Cypress.Commands.add('unselectAllProcesses', () => {
    cy.selectAllProcesses();
});

Cypress.Commands.add('checkNumberOfProcessEntriesIs', (nb) => {
    cy.get('#opfab-process').find('.vscomp-option-text').should('have.length', nb);
});

Cypress.Commands.add('checkProcessSelectContains', (value) => {
    cy.get('#opfab-process').contains(value).should('exist');
});

Cypress.Commands.add('clickOnStateSelect', () => {
    cy.get('#opfab-state').click();
});

Cypress.Commands.add('selectAllStates', () => {
    cy.get('#opfab-state').find('.vscomp-toggle-all-button').click();
});

Cypress.Commands.add('checkNumberOfStateEntriesIs', (nb) => {
    cy.get('#opfab-state').find('.vscomp-option-text').should('have.length', nb);
});

Cypress.Commands.add('checkNumberOfStateSelectedIs', (nb) => {
    cy.get('#opfab-state')
        .find('.vscomp-value')
        .contains('+ ' + (nb - 1) + ' more')
        .should('exist');
});

Cypress.Commands.add('checkStateSelectContains', (value) => {
    cy.get('#opfab-state').contains(value, {matchCase: false}).should('exist');
});

Cypress.Commands.add('checkStateSelectDoesNotContains', (value) => {
    cy.get('#opfab-state').contains(value, {matchCase: false}).should('not.exist');
});

Cypress.Commands.add('clickOnSearchButton', () => {
    cy.get('#opfab-archives-logging-btn-search').click();
});
