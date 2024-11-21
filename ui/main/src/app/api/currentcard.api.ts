/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {LoggerService as logger} from '../business/services/logs/logger.service';

declare const opfab: any;

export class CurrentCardAPI {
    // Ignore SonarQube rule typescript:S1444 for these fields
    // These variables need to be shared and static.
    // While this is not recommended by SonarQube, refactoring to avoid this
    // would require significant changes. This could be addressed in a future version.
    public static currentCard; // NOSONAR
    public static templateInterface: any; // NOSONAR

    public static initCurrentCard() {
        CurrentCardAPI.currentCard = {
            card: null,
            childCards: [],
            isUserAllowedToRespond: false,
            isUserMemberOfAnEntityRequiredToRespond: false,
            entitiesAllowedToRespond: [],
            entitiesUsableForUserResponse: [],
            displayContext: '',
            isResponseLocked: false,
            displayLoadingSpinner: function () {},
            hideLoadingSpinner: function () {},
            applyChildCards: function () {
                CurrentCardAPI.templateInterface.setChildCards(CurrentCardAPI.currentCard.childCards);
            }
        };
    }

    public static initTemplateInterface() {
        CurrentCardAPI.templateInterface = {
            lockAnswer: function () {},
            unlockAnswer: function () {},
            // OpFab calls this function to inform that the template has to apply child cards (called after template rendering and after change in child cards)
            setChildCards: function (childCards) {},
            setLttdExpired: function (expired) {}, // This function should be overridden in the template.

            // OpFab calls this method to inform the template of the size of the screen dedicated to the card
            // size = 'md' for standard size
            // size = 'lg' for large size , i.e when the card is in full screen mode
            setScreenSize: function (size) {},

            // OpFab calls this method to get the form result when the user wants to send a response
            getUserResponse: function (emitter) {
                logger.info(` Template : no getUserResponse method provided , valid set to false`);
                return {valid: false, errorMsg: 'Impossible to respond due to a technical error in the template'};
            },

            // OpFab calls this method when it has finished all tasks regarding rendering template :
            // it is called after applyChildCard(), lockAnswer(), setLttdExpired() and setScreenSize()
            setTemplateRenderingComplete: function () {},

            // OpFab calls this function when global style has changed
            setStyleChange: function () {}
        };
    }

    public static init() {
        opfab.currentCard = {
            displayLoadingSpinner: function () {
                CurrentCardAPI.currentCard.displayLoadingSpinner();
            },

            getCard: function () {
                return CurrentCardAPI.currentCard.card;
            },

            getChildCards: function () {
                const childCards = [];
                CurrentCardAPI.currentCard.childCards.forEach((card) => childCards.push({...card}));
                return childCards;
            },

            getDisplayContext: function () {
                return CurrentCardAPI.currentCard.displayContext;
            },

            getEntitiesAllowedToRespond: function () {
                return CurrentCardAPI.currentCard.entitiesAllowedToRespond;
            },
            getEntitiesUsableForUserResponse: function () {
                return CurrentCardAPI.currentCard.entitiesUsableForUserResponse;
            },

            hideLoadingSpinner: function () {
                CurrentCardAPI.currentCard.hideLoadingSpinner();
            },

            isResponseLocked: function () {
                return CurrentCardAPI.currentCard.isResponseLocked;
            },

            isUserAllowedToRespond: function () {
                return CurrentCardAPI.currentCard.isUserAllowedToRespond;
            },

            isUserMemberOfAnEntityRequiredToRespond: function () {
                return CurrentCardAPI.currentCard.isUserMemberOfAnEntityRequiredToRespond;
            },

            listenToResponseLock: function (listener) {
                CurrentCardAPI.templateInterface.lockAnswer = listener;
            },

            listenToResponseUnlock: function (listener) {
                CurrentCardAPI.templateInterface.unlockAnswer = listener;
            },

            listenToChildCards: function (listener) {
                CurrentCardAPI.templateInterface.setChildCards = listener;
            },

            listenToLttdExpired: function (listener) {
                CurrentCardAPI.templateInterface.setLttdExpired = listener;
            },

            listenToStyleChange: function (listener) {
                CurrentCardAPI.templateInterface.setStyleChange = listener;
            },

            listenToScreenSize: function (listener) {
                CurrentCardAPI.templateInterface.setScreenSize = listener;
            },

            listenToTemplateRenderingComplete: function (listener) {
                CurrentCardAPI.templateInterface.setTemplateRenderingComplete = listener;
            },

            registerFunctionToGetUserResponse: function (getUserResponse) {
                CurrentCardAPI.templateInterface.getUserResponse = getUserResponse;
            }
        };

        // prevent unwanted modifications from templates code
        Object.freeze(opfab.currentCard);
    }
}
