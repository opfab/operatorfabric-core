/* Copyright (c) 2022-2026, RTE (http://www.rte-france.com)
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
        cy.env(['host']).then((env) => {
            cy.exec('cd .. && ./resources/loadTestConf.sh ' + env.host);
        });
    };

    loadRealTimeScreensConf = function () {
        // This clears existing realtimescreens.json and loads a new one
        cy.exec('cd ../resources/realTimeScreens && ./loadRealTimeScreens.sh realTimeScreens.json');
    };

    loadEmptyProcessGroups = function () {
        // This load a process groups file without any process group
        cy.exec('cd ../resources/processGroups && ./loadProcessGroups.sh emptyProcessGroups.json');
    };

    loadProcessGroupsNotTotallyConfigured = function () {
        // This load a process groups file without any process group
        cy.exec('cd ../resources/processGroups && ./loadProcessGroups.sh processGroupsNotTotallyConfigure.json');
    };

    loadProcessGroups = function () {
        cy.exec('cd ../resources/processGroups && ./loadProcessGroups.sh processGroups.json');
    };

    send6TestCards = function () {
        cy.env(['host']).then((env) => {
            cy.exec('cd .. && ./resources/send6TestCards.sh ' + env.host + ' 2002');
        });
    };

    sendCard = function (cardFile, cardCustomization = {}) {
        cy.env(['host']).then((env) => {
            cy.exec(
                'cd ../resources/cards/ && ./sendCard.sh ' +
                cardFile +
                ' ' +
                env.host +
                ' 2002 ' +
                JSON.stringify(JSON.stringify(cardCustomization))
            );
        });
    };

    delete6TestCards = function () {
        cy.env(['host']).then((env) => {
            cy.exec('cd .. && ./resources/delete6TestCards.sh ' + env.host);
        });
    };

    deleteCard = function (cardId) {
        cy.env(['host']).then((env) => {
            cy.exec('cd ../resources/cards/ && ./deleteCard.sh ' + cardId + ' ' + env.host);
        });
    };

    sendAckForCard = function (user, cardUid, entitiesAcks) {
        cy.exec('cd ../resources/cards/ && ./sendAckForCard.sh ' + user + ' ' + cardUid + ' ' + entitiesAcks);
    };

    resetUIConfigurationFiles = function () {
        cy.exec('cp ../../config/web-ui/ui-config/web-ui-base.json ../../config/web-ui/ui-config/web-ui.json');
    };

    removePropertyInConf = function (property) {
        const filePath = `./config/web-ui/ui-config/web-ui.json`;
        cy.exec(`cd ../.. && ./tests/resources/uiConfig/removePropertyInJson.sh ${filePath} ${property}`);
    };

    setPropertyInConf = function (property, value) {
        const filePath = `./config/web-ui/ui-config/web-ui.json`;
        cy.exec(`cd ../.. && ./tests/resources/uiConfig/updatePropertyInJson.sh ${filePath} ${property} ${value}`);
    };

    deleteAllArchivedCards = function () {
        cy.env(['host']).then((env) => {
            cy.exec('cd .. && ./resources/deleteAllArchivedCards.sh ' + env.host);
        });
    };

    deleteAllCards = function () {
        cy.env(['host']).then((env) => {
            cy.exec('cd .. && ./resources/deleteAllCards.sh ' + env.host);
        });
    };

    deleteAllSettings = function () {
        cy.env(['host']).then((env) => {
            cy.exec('cd .. && ./resources/deleteAllSettings.sh ' + env.host);
        });
    };

    deleteAllUserActionLogs = function () {
        cy.env(['host']).then((env) => {
            cy.exec('cd .. && ./resources/deleteAllUserActionLogs.sh ' + env.host);
        });
    };

    waitForOpfabToStart = function () {
        cy.exec('cd ../.. && ./bin/waitForOpfabToStart.sh ');
    };

    sendMessageToSubscriptions = function (message) {
        cy.exec('cd .. && ./resources/sendMessageToSubscriptions.sh ' + message);
    };

    cleanDownloadsDir = function () {
        cy.exec('./cypress/scripts/cleanDownloadsDir.sh');
    };
}