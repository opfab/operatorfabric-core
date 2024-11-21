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

export class CurrentUserCardAPI {
    // Ignore SonarQube rule typescript:S1444 for these fields
    // These variables need to be shared and static.
    // While this is not recommended by SonarQube, refactoring to avoid this
    // would require significant changes. This could be addressed in a future version.
    public static currentUserCard; //NOSONAR
    public static userCardTemplateInterface: any; //NOSONAR

    public static initCurrentUserCard() {
        CurrentUserCardAPI.currentUserCard = {
            editionMode: null,
            endDate: null,
            expirationDate: null,
            initialSeverity: null,
            initialKeepChildCards: null,
            lttd: null,
            processId: null,
            state: null,
            startDate: null,
            userEntityChildCard: null,
            selectedEntityRecipients: [],
            selectedEntityForInformationRecipients: [],
            setInitialSelectedRecipients: function (recipients) {},
            setInitialSelectedRecipientsForInformation: function (recipients) {},
            setSelectedRecipients: function (recipients) {},
            setSelectedRecipientsForInformation: function (recipients) {},
            setDropdownEntityRecipientList: function (recipients) {},
            setDropdownEntityRecipientForInformationList: function (recipients) {}
        };
    }

    public static initUserCardTemplateInterface() {
        CurrentUserCardAPI.userCardTemplateInterface = {
            setEntityUsedForSendingCard: function (senderEntity) {},

            getSpecificCardInformation: function () {
                logger.info(
                    new Date().toISOString() +
                        ` Template : no getSpecificCardInformation method registered , valid set to false`
                );
                return {valid: false, errorMsg: 'Impossible to respond due to a technical error in the template'};
            }
        };
    }

    public static init() {
        opfab.currentUserCard = {
            getEditionMode: function () {
                return CurrentUserCardAPI.currentUserCard.editionMode;
            },

            getEndDate: function () {
                return CurrentUserCardAPI.currentUserCard.endDate;
            },

            getExpirationDate: function () {
                return CurrentUserCardAPI.currentUserCard.expirationDate;
            },

            getLttd: function () {
                return CurrentUserCardAPI.currentUserCard.lttd;
            },

            getProcessId: function () {
                return CurrentUserCardAPI.currentUserCard.processId;
            },

            getSelectedEntityRecipients: function () {
                return CurrentUserCardAPI.currentUserCard.selectedEntityRecipients;
            },

            getSelectedEntityForInformationRecipients: function () {
                return CurrentUserCardAPI.currentUserCard.selectedEntityForInformationRecipients;
            },

            getStartDate: function () {
                return CurrentUserCardAPI.currentUserCard.startDate;
            },

            getState: function () {
                return CurrentUserCardAPI.currentUserCard.state;
            },

            getUserEntityChildCard: function () {
                return CurrentUserCardAPI.currentUserCard.userEntityChildCard;
            },

            listenToEntityUsedForSendingCard: function (listener) {
                CurrentUserCardAPI.userCardTemplateInterface.setEntityUsedForSendingCard = listener;
            },

            registerFunctionToGetSpecificCardInformation: function (getSpecificCardInformation) {
                CurrentUserCardAPI.userCardTemplateInterface.getSpecificCardInformation = getSpecificCardInformation;
            },

            setDropdownEntityRecipientList: function (recipients) {
                CurrentUserCardAPI.currentUserCard.setDropdownEntityRecipientList(recipients);
            },

            setDropdownEntityRecipientForInformationList: function (recipients) {
                CurrentUserCardAPI.currentUserCard.setDropdownEntityRecipientForInformationList(recipients);
            },

            setInitialEndDate: function (endDate) {
                if (opfab.currentUserCard.getEditionMode() === 'CREATE')
                    CurrentUserCardAPI.currentUserCard.endDate = endDate;
            },

            setInitialExpirationDate: function (expirationDate) {
                if (opfab.currentUserCard.getEditionMode() === 'CREATE')
                    CurrentUserCardAPI.currentUserCard.expirationDate = expirationDate;
            },

            setInitialLttd: function (lttd) {
                if (opfab.currentUserCard.getEditionMode() === 'CREATE') CurrentUserCardAPI.currentUserCard.lttd = lttd;
            },

            setInitialStartDate: function (startDate) {
                if (opfab.currentUserCard.getEditionMode() === 'CREATE')
                    CurrentUserCardAPI.currentUserCard.startDate = startDate;
            },

            setInitialSeverity: function (initialSeverity) {
                CurrentUserCardAPI.currentUserCard.initialSeverity = initialSeverity;
            },

            setInitialKeepChildCards: function (initialKeepChildCards) {
                CurrentUserCardAPI.currentUserCard.initialKeepChildCards = initialKeepChildCards;
            },

            setInitialSelectedRecipients: function (recipients) {
                CurrentUserCardAPI.currentUserCard.setInitialSelectedRecipients(recipients);
            },

            setInitialSelectedRecipientsForInformation: function (recipients) {
                CurrentUserCardAPI.currentUserCard.setInitialSelectedRecipientsForInformation(recipients);
            },

            setSelectedRecipients: function (recipients) {
                CurrentUserCardAPI.currentUserCard.setSelectedRecipients(recipients);
            },

            setSelectedRecipientsForInformation: function (recipients) {
                CurrentUserCardAPI.currentUserCard.setSelectedRecipientsForInformation(recipients);
            }
        };

        // prevent unwanted modifications from templates code
        Object.freeze(opfab.currentUserCard);
    }
}
