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


Cypress.Commands.overwrite('reload', () => {
    cy.hackUrlCurrentlyUsedMechanism();

    //go to login page
    cy.visit('');

    //Wait for the app to finish initializing
    cy.get('#opfab-cypress-loaded-check', {timeout: 15000}).should('have.text', 'true');
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


Cypress.Commands.add('loadMonitoringConfig', (config) => {
    cy.exec('cd .. && ./resources/monitoringConfig/loadMonitoringConfig.sh ' + config);
});

Cypress.Commands.add('sendMessageToSubscriptions', (message) => {
    cy.exec('cd .. && ./resources/sendMessageToSubscriptions.sh ' + message);
});

Cypress.Commands.add('selectProcess', (processName) => {
    cy.get('#opfab-process').contains(processName).click();
});
