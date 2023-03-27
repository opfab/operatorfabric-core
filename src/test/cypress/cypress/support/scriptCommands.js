/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OpfabCommands} from './opfabCommands';

export class ScriptCommands extends OpfabCommands {

    constructor() {
        super();
        super.init('SCRIPT');
    }

    loadTestConf = function () {
        // This clears existing processGroups, bundles and perimeters and load the test configuration
        cy.exec('cd .. && ./resources/loadTestConf.sh ' + Cypress.env('host'));
    }

    loadRealTimeScreensConf = function () {
        // This clears existing realtimescreens.json and loads a new one
        cy.exec('cd ../resources/realTimeScreens && ./loadRealTimeScreens.sh realTimeScreens.json ' + Cypress.env('host'));
    }

    loadEmptyProcessGroups = function () {
        // This load a process groups file without any process group
        cy.exec('cd ../resources/processGroups && ./loadProcessGroups.sh emptyProcessGroups.json ' + Cypress.env('host'));
    }

    loadProcessGroupsNotTotallyConfigured = function () {
        // This load a process groups file without any process group
        cy.exec('cd ../resources/processGroups && ./loadProcessGroups.sh processGroupsNotTotallyConfigure.json ' + Cypress.env('host'));
    }

    loadProcessGroups = function () {
        cy.exec('cd ../resources/processGroups && ./loadProcessGroups.sh processGroups.json ' + Cypress.env('host'));
    }


    send6TestCards = function () {
        cy.exec('cd .. && ./resources/send6TestCards.sh ' + Cypress.env('host'));
    }

    sendCard = function (cardFile, customEpochDate1 = new Date().getTime(), customEpochDate2 = new Date().getTime() + 5 * 60 * 1000) {
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

    delete6TestCards = function () {
        cy.exec('cd .. && ./resources/delete6TestCards.sh ' + Cypress.env('host'));
    }

    deleteCard = function (cardId) {
        cy.exec('cd ../resources/cards/ && ./deleteCard.sh ' + cardId + ' ' + Cypress.env('host'));
    }

    sendAckForCard = function (user, cardUid, entitiesAcks) {
        cy.exec('cd ../resources/cards/ && ./sendAckForCard.sh ' + user + ' ' + cardUid + ' ' + entitiesAcks);
    }

    resetUIConfigurationFiles = function () {
        cy.exec('cp ../../../config/cypress/ui-config/web-ui-base.json ../../../config/cypress/ui-config/web-ui.json');
        cy.exec('cp ../../../config/cypress/ui-config/ui-menu-base.json ../../../config/cypress/ui-config/ui-menu.json');
    }

    configureMenuNotDefined = function () {
        cy.exec('cp ../resources/uiConfig/ui-menu-not-defined.json ../../../config/cypress/ui-config/ui-menu.json');
    }
    configureMenuVisibleForAllUsers = function () {
        cy.exec('cp ../resources/uiConfig/ui-menu-visible-to-all.json ../../../config/cypress/ui-config/ui-menu.json');
    }

    configureMenuNotVisibleForAllUsers = function () {
        cy.exec('cp ../resources/uiConfig/ui-menu-not-visible-to-all.json ../../../config/cypress/ui-config/ui-menu.json');
    }

    configureMenuForAdminGroup = function () {
        cy.exec('cp ../resources/uiConfig/ui-menu-only-admin-group.json ../../../config/cypress/ui-config/ui-menu.json');
    }

    removePropertyInConf = function (property, file) {
        switch (file) {
            case 'web-ui':
            case 'ui-menu':
                const filePath = `./config/cypress/ui-config/${file}.json`;
                cy.exec(`cd ../../.. && ./src/test/resources/uiConfig/removePropertyInJson.sh ${filePath} ${property}`);
                break;
            default:
                cy.log(`${file} is not a recognized configuration file (valid options: web-ui, ui-menu).`);
        }
    }

    setPropertyInConf = function (property, file, value) {
        switch (file) {
            case 'web-ui':
            case 'ui-menu':
                const filePath = `./config/cypress/ui-config/${file}.json`;
                cy.exec(`cd ../../.. && ./src/test/resources/uiConfig/updatePropertyInJson.sh ${filePath} ${property} ${value}`);
                break;
            default:
                cy.log(`${file} is not a recognized configuration file (valid options: web-ui, ui-menu).`);
        }
    }

    updateCoreMenuInConf = function (menu, property, value) {
        const filePath = `./config/cypress/ui-config/ui-menu.json`;
        cy.exec(`cd ../../.. && ./src/test/resources/uiConfig/updateCoreMenu.sh ${filePath} ${menu} ${property} ${value}`);
    }

    deleteAllArchivedCards = function () {
        cy.exec('cd .. && ./resources/deleteAllArchivedCards.sh ' + Cypress.env('host'));
    }

    deleteAllCards = function () {
        cy.exec('cd .. && ./resources/deleteAllCards.sh ' + Cypress.env('host'));
    }

    deleteAllSettings = function () {
        cy.exec('cd .. && ./resources/deleteAllSettings.sh ' + Cypress.env('host'));
    }

    deleteAllUserActionLogs = function () {
        cy.exec('cd .. && ./resources/deleteAllUserActionLogs.sh ' + Cypress.env('host'));
    }

    waitForOpfabToStart = function () {
        cy.exec('cd ../../.. && ./bin/waitForOpfabToStart.sh ');
    }

    loadMonitoringConfig = function (config) {
        cy.exec('cd .. && ./resources/monitoringConfig/loadMonitoringConfig.sh ' + config);
    }

    sendMessageToSubscriptions = function (message) {
        cy.exec('cd .. && ./resources/sendMessageToSubscriptions.sh ' + message);
    }

    cleanDownloadsDir = function () {
        cy.exec('./cypress/scripts/cleanDownloadsDir.sh');
    }
}

