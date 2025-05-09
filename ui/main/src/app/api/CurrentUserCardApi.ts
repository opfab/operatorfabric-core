/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Severity} from 'app/model/Severity';
import {UserCardTemplateGateway} from '@ofServices/templateGateway/UserCardTemplateGateway';

declare const opfab: any;

export class CurrentUserCardAPI {
    public static init() {
        opfab.currentUserCard = {
            getEditionMode: UserCardTemplateGateway.getEditionMode,
            getEndDate: UserCardTemplateGateway.getEndDate,
            getExpirationDate: UserCardTemplateGateway.getExpirationDate,
            getInitialKeepChildCards: UserCardTemplateGateway.getInitialKeepChildCards,
            getInitialSeverity: UserCardTemplateGateway.getInitialSeverity,
            getLttd: UserCardTemplateGateway.getLttd,
            getProcessId: UserCardTemplateGateway.getProcessId,
            getSelectedEntityRecipients: UserCardTemplateGateway.getSelectedEntityRecipients,
            getSelectedEntityForInformationRecipients:
                UserCardTemplateGateway.getSelectedEntityForInformationRecipients,
            getState: UserCardTemplateGateway.getState,
            getStartDate: UserCardTemplateGateway.getStartDate,
            getUserEntityChildCard: UserCardTemplateGateway.getUserEntityChildCard,

            listenToEntityUsedForSendingCard: (listener) =>
                UserCardTemplateGateway.setTemplateListenerForEntityUsedForSendingCard(listener),

            registerFunctionToGetSpecificCardInformation: (getSpecificCardInformation) =>
                UserCardTemplateGateway.setFunctionToGetSpecificCardInformationFromTemplate(getSpecificCardInformation),

            registerFunctionToBeCalledBeforeCardSending: (beforeCardSending) =>
                UserCardTemplateGateway.setFunctionToBeCalledBeforeCardSending(beforeCardSending),

            setDropdownEntityRecipientList: (recipients) =>
                UserCardTemplateGateway.setDropdownEntityRecipientList(recipients),

            setDropdownEntityRecipientForInformationList: (recipients) =>
                UserCardTemplateGateway.setDropdownEntityRecipientForInformationList(recipients),

            setInitialEndDate: (endDate) => {
                if (UserCardTemplateGateway.getEditionMode() === 'CREATE') UserCardTemplateGateway.setEndDate(endDate);
            },

            setInitialExpirationDate: (expirationDate) => {
                if (UserCardTemplateGateway.getEditionMode() === 'CREATE')
                    UserCardTemplateGateway.setExpirationDate(expirationDate);
            },

            setInitialLttd: (lttd) => {
                if (UserCardTemplateGateway.getEditionMode() === 'CREATE') UserCardTemplateGateway.setLttd(lttd);
            },

            setInitialStartDate: (startDate) => {
                if (UserCardTemplateGateway.getEditionMode() === 'CREATE')
                    UserCardTemplateGateway.setStartDate(startDate);
            },

            setInitialSeverity: (initialSeverity: Severity) =>
                UserCardTemplateGateway.setInitialSeverity(initialSeverity),

            setInitialKeepChildCards: (initialKeepChildCards) =>
                UserCardTemplateGateway.setInitialKeepChildCards(initialKeepChildCards),

            setInitialSelectedRecipients: (recipients) =>
                UserCardTemplateGateway.setInitialSelectedRecipients(recipients),

            setInitialSelectedRecipientsForInformation: (recipients) =>
                UserCardTemplateGateway.setInitialSelectedRecipientsForInformation(recipients),

            setSelectedRecipients: (recipients) => UserCardTemplateGateway.setSelectedRecipients(recipients),

            setSelectedRecipientsForInformation: (recipients) =>
                UserCardTemplateGateway.setSelectedRecipientsForInformation(recipients)
        };

        // prevent unwanted modifications from templates code
        Object.freeze(opfab.currentUserCard);
    }
}
