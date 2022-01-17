/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

Cypress.Commands.add('waitDefaultTime', () => {
    cy.wait(Cypress.env('defaultWaitTime'))
})

Cypress.Commands.add('loginOpFab',(username, password)=>
{   //go to login page
    cy.visit('')

    //type login
    cy.get('#opfab-login').should('be.visible')
    cy.get('#opfab-login').type(username)

    //type password
    cy.get('#opfab-password').should('be.visible')
    cy.get('#opfab-password').type(password)

    //press login button
    cy.get('#opfab-login-btn-submit').click()
    cy.get('#opfab-login-btn-submit').should('be.visible')

    //Wait for the app to finish initializing
    cy.get('#opfab-cypress-loaded-check', {timeout: 15000}).should('have.text', 'true');
})

Cypress.Commands.overwrite('reload',()=>
{   //go to login page
    cy.visit('');

    //Wait for the app to finish initializing
    cy.get('#opfab-cypress-loaded-check', {timeout: 15000}).should('have.text', 'true');
})

Cypress.Commands.add('logoutOpFab',()=>
{
    cy.get('#opfab-navbar-drop_user_menu').click(); // Click top right dropdown menu
    cy.get('#opfab-navbar-right-menu-logout').click({force: true}); // Click logout button

})

Cypress.Commands.add('loadTestConf', () => {
    // This clears existing processGroups, bundles and perimeters and load the test configuration
    cy.exec('cd .. && ./resources/loadTestConf.sh '+Cypress.env('host'));
})

Cypress.Commands.add('loadRealTimeScreensConf', () => {
    // This clears existing realtimescreens.json and loads a new one
    cy.exec('cd ../resources/realTimeScreens && ./loadRealTimeScreens.sh realTimeScreens.json '+Cypress.env('host'));
})

Cypress.Commands.add('loadEmptyProcessGroups', () => {
    // This load a process groups file without any process group
    cy.exec('cd ../resources/processGroups && ./loadProcessGroups.sh emptyProcessGroups.json '+Cypress.env('host'));
})

Cypress.Commands.add('send6TestCards', () => {
    cy.exec('cd .. && ./resources/send6TestCards.sh '+Cypress.env('host'));
})

Cypress.Commands.add('sendCard', (cardFile) => {
    cy.exec('cd ../resources/cards/ && ./sendCard.sh '+ cardFile + ' ' + Cypress.env('host'));
})

Cypress.Commands.add('delete6TestCards', () => {
    cy.exec('cd .. && ./resources/delete6TestCards.sh '+Cypress.env('host'));
})

Cypress.Commands.add('deleteCard', (cardId) => {
    cy.exec('cd ../resources/cards/ && ./deleteCard.sh '+ cardId + ' ' + Cypress.env('host'));
})

Cypress.Commands.add('resetUIConfigurationFiles', () => {

    cy.exec('cp ../../../config/cypress/ui-config/web-ui-base.json ../../../config/cypress/ui-config/web-ui.json');
    cy.exec('cp ../../../config/cypress/ui-config/ui-menu-base.json ../../../config/cypress/ui-config/ui-menu.json');

})

Cypress.Commands.add('removePropertyInConf', (property,file) => {
    switch (file) {
        case 'web-ui':
        case 'ui-menu':
            const filePath = `./config/cypress/ui-config/${file}.json`;
            cy.exec(`cd ../../.. && ./src/test/resources/uiConfig/removePropertyInJson.sh ${filePath} ${property}`);
            break;
        default:
            cy.log(`${file} is not a recognized configuration file (valid options: web-ui, ui-menu).`);
    }
})

Cypress.Commands.add('setPropertyInConf', (property,file,value) => {
    switch (file) {
        case 'web-ui':
        case 'ui-menu':
            const filePath = `./config/cypress/ui-config/${file}.json`;
            cy.exec(`cd ../../.. && ./src/test/resources/uiConfig/updatePropertyInJson.sh ${filePath} ${property} ${value}`);
            break;
        default:
            cy.log(`${file} is not a recognized configuration file (valid options: web-ui, ui-menu).`);
    }
})

Cypress.Commands.add('updateCoreMenuInConf', (menu, property, value) => {
    const filePath = `./config/cypress/ui-config/ui-menu.json`;
    cy.exec(`cd ../../.. && ./src/test/resources/uiConfig/updateCoreMenu.sh ${filePath} ${menu} ${property} ${value}`);
})

Cypress.Commands.add('deleteCoreMenuFromConf', (menu) => {
    const filePath = `./config/cypress/ui-config/ui-menu.json`;
    cy.exec(`cd ../../.. && ./src/test/resources/uiConfig/deleteCoreMenu.sh ${filePath} ${menu}`);
})

Cypress.Commands.add('deleteAllArchivedCards', () => {
    cy.exec('cd .. && ./resources/deleteAllArchivedCards.sh '+Cypress.env('host'));
})

Cypress.Commands.add('deleteAllCards', () => {
    cy.exec('cd .. && ./resources/deleteAllCards.sh '+Cypress.env('host'));
})

Cypress.Commands.add('deleteAllSettings', () => {
    cy.exec('cd .. && ./resources/deleteAllSettings.sh '+Cypress.env('host'));
})

Cypress.Commands.add('waitForOpfabToStart', () => {
    cy.exec('cd ../../.. && ./bin/waitForOpfabToStart.sh ');
})

Cypress.Commands.add('openOpfabSettings', () => {
    cy.get('#opfab-navbar-drop_user_menu').click();
    cy.get("#opfab-navbar-right-menu-settings").click({force: true});
})

  // Stub playSound method to catch when opfab send a sound 
Cypress.Commands.add('stubPlaySound', () => {
    cy.window()
    .its('soundNotificationService')
    .then((soundNotificationService) => {
      cy.stub(soundNotificationService, 'playSound').as('playSound')
    })
})

Cypress.Commands.add('setFormDateTime', (formName, year, month, day, hours, minutes) => {

    cy.get('#opfab-datepicker-' + formName).click();
    cy.get('[aria-label="Select year"]').select(year);
    cy.get('[aria-label="Select month"]').select(month);
    cy.get('[aria-label*="' + day + ',"]').click();
    cy.get('#opfab-timepicker-' + formName).find('[aria-label="Hours"]').click().type('{backspace}{backspace}' + hours);
    cy.get('#opfab-timepicker-' + formName).find('[aria-label="Minutes"]').click().type('{backspace}{backspace}' + minutes);
})

// Count ag-grid table rows
Cypress.Commands.add('countAgGridTableRows', (table, rowsNum) => {
    cy.get(table).find('.ag-center-cols-container').find('.ag-row').should('have.length', rowsNum);

})

// Check ag-grid cell value
Cypress.Commands.add('checkAgGridCellValue', (table, row, col, value) => {
    cy.get(table).find('.ag-center-cols-container').find('.ag-row').eq(row).find('.ag-cell-value').eq(col).contains(value);
})

// Click on ag-grid cell
// Specific tag should be specified in case of cell renderers 
Cypress.Commands.add('clickAgGridCell', (table, row, col, tag) => {
    if (!!tag) {
        cy.get(table).find('.ag-center-cols-container').find('.ag-row').eq(row).find('.ag-cell-value').eq(col).find(tag).eq(0).click();
    } else {
        cy.get(table).find('.ag-center-cols-container').find('.ag-row').eq(row).find('.ag-cell-value').eq(col).click();

    }

})
