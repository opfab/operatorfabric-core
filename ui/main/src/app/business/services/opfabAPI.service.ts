/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {BusinessDataService} from './businessconfig/businessdata.service';
import {EntitiesService} from './users/entities.service';

declare const opfab: any;

@Injectable({
    providedIn: 'root'
})
export class OpfabAPIService {
    public currentCard;

    public templateInterface: any;

    constructor(private entityService: EntitiesService, private businessDataService: BusinessDataService) {
        this.initCurrentCard();
    }

    public initCurrentCard() {
        const self = this;
        this.currentCard = {
            childCards: [],
            isUserAllowedToRespond: false,
            isUserMemberOfAnEntityRequiredToRespond: false,
            entitiesAllowedToRespond: [],
            entityUsedForUserResponse: null,
            displayContext: '',
            isResponseLocked: false,
            displayLoadingSpinner: function () {},
            hideLoadingSpinner: function () {},
            applyChildCards: function() { self.templateInterface.setChildCards(self.currentCard.childCards)}
        };
    }

    public initTemplateInterface() {
        this.templateInterface = {
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
            getUserResponse: function () {
                console.log(
                    new Date().toISOString(),
                    ` Template : no getUserResponse method provided , valid set to false`
                );
                return {valid: false, errorMsg: 'Impossible to respond due to a technical error in the template'};
            },

            // OpFab calls this method when it has finished all tasks regarding rendering template :
            // it is called after applyChildCard(), lockAnswer(), setLttdExpired() and setScreenSize()
            setTemplateRenderingComplete: function () {},

            // OpFab calls this function when global style has changed
            setStyleChange: function () {}
        };
    }

    public initAPI() {
        const self = this;
        opfab.businessconfig.businessData.get = async function (resourceName) {
            const resource = await self.businessDataService.getBusinessData(resourceName);
            return resource;
        };

        opfab.navigate.redirectToBusinessMenu = function (menuId, menuItemId, urlExtension) {
            const urlSplit = document.location.href.split('#');
            // WARNING : HACK
            //
            // When user makes a reload (for example via F5) or use a bookmark link, the browser encodes what is after #
            // if user makes a second reload, the browser encodes again the encoded link
            // and after if user reload again, this time it is not encoded anymore by the browser
            // So it ends up with 3 possible links: a none encoded link, an encoded link or a twice encoding link
            // and we have no way to know which one it is when processing the url
            //
            // To solve the problem we encode two times the url before giving it to the browser
            // so we always have a unique case : a double encoded url
            let newUrl =
                urlSplit[0] +
                '#/businessconfigparty/' +
                encodeURIComponent(encodeURIComponent(menuId)) +
                '/' +
                encodeURIComponent(encodeURIComponent(menuItemId));
            if (urlExtension) newUrl += encodeURIComponent(encodeURIComponent(urlExtension));
            document.location.href = newUrl;
        };


        this.initUserApi();
        this.initCurrentCardApi();
    }

    private initUserApi() {
        const self = this;
        opfab.users.entities.getEntityName = function (entityId: string) {
            return self.entityService.getEntityName(entityId);
        };
        opfab.users.entities.getEntity = function (entityId: string) {
            const entity = self.entityService.getEntity(entityId);
            if (entity) return {...entity};
            else return undefined;
        };

        opfab.users.entities.getAllEntities = function () {
            const entities = [];
            self.entityService.getEntities().forEach((entity) => entities.push({...entity}));
            return entities;
        };
        // prevent unwanted modifications from templates code
        Object.freeze(opfab.users);
    }

    private initCurrentCardApi() {
        const self = this;

        opfab.currentCard.displayLoadingSpinner = function () {
            self.currentCard.displayLoadingSpinner();
        };

        opfab.currentCard.getChildCards = function () {
            const childCards = [];
            self.currentCard.childCards.forEach((card) => childCards.push({...card}));
            return childCards;
        };

        opfab.currentCard.getDisplayContext = function () {
            return self.currentCard.displayContext;
        };

        opfab.currentCard.getEntitiesAllowedToRespond = function () {
            return self.currentCard.entitiesAllowedToRespond;
        };
        opfab.currentCard.getEntityUsedForUserResponse = function () {
            return self.currentCard.entityUsedForUserResponse;
        };

        opfab.currentCard.hideLoadingSpinner = function () {
            self.currentCard.hideLoadingSpinner();
        };

        opfab.currentCard.isResponseLocked = function () {
            return self.currentCard.isResponseLocked;
        };

        opfab.currentCard.isUserAllowedToRespond = function () {
            return self.currentCard.isUserAllowedToRespond;
        };

        opfab.currentCard.isUserMemberOfAnEntityRequiredToRespond = function () {
            return self.currentCard.isUserMemberOfAnEntityRequiredToRespond;
        };

        opfab.currentCard.listenToResponseLock = function (listener) {
            self.templateInterface.lockAnswer = listener;
        };

        opfab.currentCard.listenToResponseUnlock = function (listener) {
            self.templateInterface.unlockAnswer = listener;
        };

        opfab.currentCard.listenToChildCards = function (listener) {
            self.templateInterface.setChildCards = listener;
        };


        opfab.currentCard.listenToLttdExpired = function (listener) {
            self.templateInterface.setLttdExpired = listener;
        };

        opfab.currentCard.listenToStyleChange = function (listener) {
            self.templateInterface.setStyleChange = listener;
        };

        opfab.currentCard.listenToScreenSize = function (listener) {
            self.templateInterface.setScreenSize = listener;
        };

        opfab.currentCard.listenToTemplateRenderingComplete = function (listener) {
            self.templateInterface.setTemplateRenderingComplete = listener;
        };

        opfab.currentCard.registerFunctionToGetUserResponse = function (getUserResponse) {
            self.templateInterface.getUserResponse = getUserResponse;
        };

        // prevent unwanted modifications from templates code
        Object.freeze(opfab.currentCard);
    }
}
