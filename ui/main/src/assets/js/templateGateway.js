/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

const templateGateway = {
    
    // UTILITIES FOR TEMPLATE - DEPRECATED

    getEntityName: function (entityId) {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of templateGateway.getEntityName is deprecated , you shall use opfab.users.entities.getEntityName instead'
        );
        return opfab.users.entities.getEntityName(entityId);
    },

    getEntity: function (entityId) {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of templateGateway.getEntity is deprecated , you shall use opfab.users.entities.getEntity instead'
        );
        return opfab.users.entities.getEntity(entityId);
    },

    getAllEntities: function () {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of templateGateway.getAllEntities is deprecated , you shall use opfab.users.entities.getAllEntities instead'
        );
        return opfab.users.entities.getAllEntities();
    },

    redirectToBusinessMenu: function (menuId, menuItemId, urlExtension) {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of templateGateway.redirectToBusinessMenu is deprecated , you shall use opfab.navigate.redirectToBusinessMenu instead'
        );
        opfab.navigate.redirectToBusinessMenu(menuId, menuItemId, urlExtension);
    },

    // True if user is allowed to respond to the current card :
    //  - his entity is allowed to respond
    //  - he is member of a group having a perimeter permitting the response
    isUserAllowedToRespond: function () {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of templateGateway.isUserAllowedToRespond is deprecated , you shall use opfab.currentCard.isUserAllowedToRespond instead'
        );
        return opfab.currentCard.isUserAllowedToRespond();
    },

    // True if user is member of an entity required to respond to the current card
    isUserMemberOfAnEntityRequiredToRespond: function () {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of templateGateway.isUserMemberOfAnEntityRequiredToRespond is deprecated , you shall use opfab.currentCard.isUserMemberOfAnEntityRequiredToRespond instead'
        );
        return opfab.currentCard.isUserMemberOfAnEntityRequiredToRespond();
    },

    // Returns an array containing the ids of the entities allowed to respond
    getEntitiesAllowedToRespond() {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of templateGateway.getEntitiesAllowedToRespond is deprecated , you shall use opfab.currentCard.getEntitiesAllowedToRespond instead'
        );
        return opfab.currentCard.getEntitiesAllowedToRespond();
    },

    getEntityUsedForUserResponse() {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of templateGateway.getEntityUsedForUserResponse is deprecated , you shall use opfab.currentCard.getEntityUsedForUserResponse instead'
        );
        return opfab.currentCard.getEntityUsedForUserResponse();
    },

    getDisplayContext() {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of templateGateway.getDisplayContext is deprecated , you shall use opfab.currentCard.getDisplayContext instead'
        );
        return opfab.currentCard.getDisplayContext();
    },

    displayLoadingSpinner() {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of templateGateway.displayLoadingSpinner is deprecated , you shall use opfab.currentCard.displayLoadingSpinner instead'
        );
        opfab.currentCard.displayLoadingSpinner();
    },

    hideLoadingSpinner() {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of templateGateway.hideLoadingSpinner is deprecated , you shall use opfab.currentCard.hideLoadingSpinner instead'
        );
        opfab.currentCard.hideLoadingSpinner();
    },

    //
    // DEPRECATED FUNCTIONS OVERRIDE BY TEMPLATES
    //

    get childCards() {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of templateGateway.childCards is deprecated , you shall use opfab.currentCard.getChildCards() instead'
        );
        return opfab.currentCard.getChildCards();
    },

    get isLocked() {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of templateGateway.isLocked is deprecated , you shall use opfab.currentCard.isResponseLocked() instead'
        );
        return opfab.currentCard.isResponseLocked();
    },

    set lockAnswer(value) {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of templateGateway.lockAnswer is deprecated , you shall use opfab.currentCard.listenToResponseLock() instead'
        );
        opfab.currentCard.listenToResponseLock(value);
    },

    set unlockAnswer(value) {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of templateGateway.unlockAnswer is deprecated , you shall use opfab.currentCard.listenToResponseUnlock() instead'
        );
        opfab.currentCard.listenToResponseUnlock(value);
    },

    set setLttdExpired(value) {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of templateGateway.setLttdExpired is deprecated , you shall use opfab.currentCard.listenToLttdExpired() instead'
        );
        opfab.currentCard.listenToLttdExpired(value);
    },

    set onStyleChange(value) {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of templateGateway.onStyleChange is deprecated , you shall use opfab.currentCard.listenToStyleChange() instead'
        );
        opfab.currentCard.listenToStyleChange(value);
    },

    set setScreenSize(value) {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of templateGateway.setScreenSize is deprecated , you shall use opfab.currentCard.listenToScreenSize() instead'
        );
        opfab.currentCard.listenToScreenSize(value);
    },

    set onTemplateRenderingComplete(value) {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of templateGateway.onTemplateRenderingComplete is deprecated , you shall use opfab.currentCard.listenToTemplateRenderingComplete() instead'
        );
        opfab.currentCard.listenToTemplateRenderingComplete(value);
    },

    set getUserResponse(value) {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of templateGateway.getUserResponse is deprecated , you shall use opfab.currentCard.registerFunctionToGetUserResponse() instead'
        );
        opfab.currentCard.registerFunctionToGetUserResponse(value);
    },

    set applyChildCards(value) {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of templateGateway.applyChildCards is deprecated , you shall use opfab.currentCard.listenToChildCards() instead'
        );
        opfab.currentCard.listenToChildCards(value);
    }
};
