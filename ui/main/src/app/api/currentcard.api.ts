/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CardTemplateGateway} from 'app/business/templateGateway/cardTemplateGateway';

declare const opfab: any;

export class CurrentCardAPI {
    public static init() {
        opfab.currentCard = {
            displayLoadingSpinner: CardTemplateGateway.displayLoadingSpinner,
            getCard: CardTemplateGateway.getCard,
            getChildCards: CardTemplateGateway.getChildCards,
            getDisplayContext: CardTemplateGateway.getDisplayContext,
            getEntitiesAllowedToRespond: CardTemplateGateway.getEntitiesAllowedToRespond,
            getEntitiesUsableForUserResponse: CardTemplateGateway.getEntitiesUsableForUserResponse,
            hideLoadingSpinner: CardTemplateGateway.hideLoadingSpinner,
            isResponseLocked: CardTemplateGateway.isResponseLocked,
            isUserAllowedToRespond: CardTemplateGateway.isUserAllowedToRespond,
            isUserMemberOfAnEntityRequiredToRespond: CardTemplateGateway.isUserMemberOfAnEntityRequiredToRespond,
            listenToResponseLock: (listener) => CardTemplateGateway.setTemplateListenerForResponseLock(listener),
            listenToResponseUnlock: (listener) => CardTemplateGateway.setTemplateListenerForResponseUnlock(listener),
            listenToChildCards: (listener) => CardTemplateGateway.setTemplateListenerForChildCards(listener),
            listenToLttdExpired: (listener) => CardTemplateGateway.setTemplateListenerForLttdExpired(listener),
            listenToStyleChange: (listener) => CardTemplateGateway.setTemplateListenerForStyleChange(listener),
            listenToScreenSize: (listener) => CardTemplateGateway.setTemplateListenerForScreenSize(listener),
            listenToTemplateRenderingComplete: (listener) =>
                CardTemplateGateway.setTemplateListenerForTemplateRenderingComplete(listener),
            registerFunctionToGetUserResponse: (getUserResponse) =>
                CardTemplateGateway.setFunctionToGetUserResponseFromTemplate(getUserResponse)
        };

        // prevent unwanted modifications from templates code
        Object.freeze(opfab.currentCard);
    }
}
