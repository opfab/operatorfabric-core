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

Cypress.Commands.add('delayRequestResponse', (url, delayTime = 2000) => {
    cy.intercept(url, (req) => {
        req.reply((res) => {
            res.delay = delayTime;
        });
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


Cypress.Commands.add('loadMonitoringConfig', (config) => {
    cy.exec('cd .. && ./resources/monitoringConfig/loadMonitoringConfig.sh ' + config);
});

Cypress.Commands.add('sendMessageToSubscriptions', (message) => {
    cy.exec('cd .. && ./resources/sendMessageToSubscriptions.sh ' + message);
});

Cypress.Commands.add('selectProcess', (processName) => {
    cy.get('#opfab-process').contains(processName).click();
});
