/* Copyright (c) 2021, RTE (http://www.rte-france.com)
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
    cy.get('#opfab-cypress-loaded-check', {timeout: 10000}).should('have.text', 'true');
})

Cypress.Commands.add('loadTestConf', () => {
    // This clears existing processGroups, bundles and perimeters and load the test configuration
    cy.exec('cd .. && ./resources/loadTestConf.sh '+Cypress.env('host'));
})

Cypress.Commands.add('sendTestCards', () => {
    cy.exec('cd .. && ./resources/send6TestCards.sh '+Cypress.env('host'));
})

Cypress.Commands.add('sendCard', (cardFile) => {
    cy.exec('cd ../resources/cards/ && ./sendCard.sh '+ cardFile + ' ' + Cypress.env('host'));
})

Cypress.Commands.add('deleteTestCards', () => {
    cy.exec('cd .. && ./resources/delete6TestCards.sh '+Cypress.env('host'));
})

Cypress.Commands.add('deleteCard', (cardId) => {
    cy.exec('cd ../resources/cards/ && ./deleteCard.sh '+ cardId + ' ' + Cypress.env('host'));
})

Cypress.Commands.add('resetUIConfigurationFile', () => {

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

Cypress.Commands.add('deleteAllArchivedCards', () => {
    cy.exec('cd .. && ./resources/deleteAllArchivedCards.sh '+Cypress.env('host'));
})