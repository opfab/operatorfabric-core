/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

declare const opfab;



export function initOpfabApiMock() {

    opfab.users = {
        entities: {
            getEntityName: function (entityId) {return entityId + " name"},
            getEntity: function (entityId) {},
            getAllEntities: function () {}
        }
    };
    
    opfab.navigate = {
        showCardInFeed: function (cardId) {},
        redirectToBusinessMenu: function (menuId, menuItemId, urlExtension) {}
    };


    opfab.currentCard = {
        getCard: function() {},
        isUserAllowedToRespond: function () {},
        isUserMemberOfAnEntityRequiredToRespond: function () {},
        getEntitiesAllowedToRespond: function () {},
        getEntityUsedForUserResponse: function () {},
        getDisplayContext: function () {},
        isResponseLocked: function () {},
        getChildCards: function () {},
        displayLoadingSpinner: function () {},
        hideLoadingSpinner: function () {},
        registerFunctionToGetUserResponse: function (getUserResponse) {},
        listenToResponseLock(listener) {},
        listenToResponseUnlock(listener) {},
        listenToLttdExpired(listener) {},
        listenToStyleChange(listener) {},
        listenToScreenSize(listener) {},
        listenToTemplateRenderingComplete(listener) {},
        listenToChildCards(listener) {}
    };
    
    opfab.currentUserCard = {
        getEditionMode: function () {},
        getEndDate: function () {},
        getExpirationDate: function () {},
        getLttd: function () {},
        getProcessId: function () {},
        getSelectedEntityRecipients: function () {},
        getSelectedEntityForInformationRecipients: function () {},
        getStartDate: function () {},
        getState: function () {},
        getUserEntityChildCard: function () {},
        listenToEntityUsedForSendingCard: function (listener) {},
        registerFunctionToGetSpecificCardInformation: function (getSpecificCardInformation) {
            opfab.currentUserCard.getSpecificCardInformation = getSpecificCardInformation;
        },
        setDropdownEntityRecipientList: function (recipients) {},
        setDropdownEntityRecipientForInformationList: function (recipients) {},
        setInitialEndDate: function (endDate) {},
        setInitialExpirationDate: function (expirationDate) {},
        setInitialLttd: function (lttd) {},
        setInitialSelectedRecipients: function (recipients) {},
        setInitialSelectedRecipientsForInformation: function (recipients) {},
        setInitialSeverity: function (initialSeverity) {},
        setInitialStartDate: function (startDate) {}
    };

    opfab.utils.getTranslation = function(key,values) {
        return "Translation of " + key;
    }

}


