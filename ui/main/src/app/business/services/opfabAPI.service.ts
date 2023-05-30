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
import {TranslationService} from './translation/translation.service';
import {EntitiesService} from './users/entities.service';

declare const opfab: any;

@Injectable({
    providedIn: 'root'
})
export class OpfabAPIService {
    public currentCard;
    public currentUserCard;

    public templateInterface: any;
    public userCardTemplateInterface: any;

    constructor(private entityService: EntitiesService, private businessDataService: BusinessDataService,private translationService: TranslationService) {
        this.initCurrentCard();
        this.initCurrentUserCard();
    }

    public initCurrentCard() {
        const self = this;
        this.currentCard = {
            card: null,
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

    public initCurrentUserCard() {
        this.currentUserCard = {
            editionMode: null,
            endDate: null,
            expirationDate : null,
            initialSeverity: null,
            lttd: null,
            processId : null,
            state: null,
            startDate: null,
            userEntityChildCard: null,
            selectedEntityRecipients: null,
            selectedEntityForInformationRecipients: null,
            setInitialSelectedRecipients: function(recipients) {},
            setInitialSelectedRecipientsForInformation: function(recipients) {},
            setDropdownEntityRecipientList: function (recipients) {},
            setDropdownEntityRecipientForInformationList: function (recipients) {}
        }
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

    public initUserCardTemplateInterface() {
        this.userCardTemplateInterface = {
            setEntityUsedForSendingCard: function (senderEntity) {},



            getSpecificCardInformation: function () {
                console.log(
                    new Date().toISOString(),
                    ` Template : no getSpecificCardInformation method registered , valid set to false`
                );
                return {valid: false, errorMsg: 'Impossible to respond due to a technical error in the template'};
            }
        }
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

        opfab.utils.getTranslation = function (key,params) {
            return self.translationService.getTranslation(key,params)
        }


        this.initUserApi();
        this.initCurrentCardApi();
        this.initCurrentUserCardApi();
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

        opfab.currentCard.getCard = function () {
            return self.currentCard.card;
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

    private initCurrentUserCardApi() {
        const self = this;

        opfab.currentUserCard.getEditionMode = function () {
            return self.currentUserCard.editionMode;
        };

        opfab.currentUserCard.getEndDate = function () {
            return self.currentUserCard.endDate;
        };

        opfab.currentUserCard.getExpirationDate = function () {
            return self.currentUserCard.expirationDate;
        };

        opfab.currentUserCard.getLttd = function () {
            return self.currentUserCard.lttd;
        };

        opfab.currentUserCard.getProcessId = function () {
            return self.currentUserCard.processId;
        };

        opfab.currentUserCard.getSelectedEntityRecipients = function () {
            return self.currentUserCard.selectedEntityRecipients;
        };

        opfab.currentUserCard.getSelectedEntityForInformationRecipients = function () {
            return self.currentUserCard.selectedEntityForInformationRecipients;
        };

        opfab.currentUserCard.getStartDate = function () {
            return self.currentUserCard.startDate;
        };

        opfab.currentUserCard.getState = function () {
            return self.currentUserCard.state;
        };

        opfab.currentUserCard.getUserEntityChildCard = function () {
            return self.currentUserCard.userEntityChildCard;
        };

        opfab.currentUserCard.listenToEntityUsedForSendingCard = function (listener) {
            self.userCardTemplateInterface.setEntityUsedForSendingCard = listener;
        };

        opfab.currentUserCard.registerFunctionToGetSpecificCardInformation = function (getSpecificCardInformation) {
            self.userCardTemplateInterface.getSpecificCardInformation = getSpecificCardInformation;
        };

        opfab.currentUserCard.setDropdownEntityRecipientList = function (recipients) {
            self.currentUserCard.setDropdownEntityRecipientList(recipients);
        };

        opfab.currentUserCard.setDropdownEntityRecipientForInformationList = function (recipients) {
            self.currentUserCard.setDropdownEntityRecipientForInformationList(recipients);
        };
        
        opfab.currentUserCard.setInitialEndDate = function (endDate) {
            if (opfab.currentUserCard.getEditionMode() === 'CREATE') self.currentUserCard.endDate  = endDate;
        };

        opfab.currentUserCard.setInitialExpirationDate = function (expirationDate) {
            if (opfab.currentUserCard.getEditionMode() === 'CREATE') self.currentUserCard.expirationDate  = expirationDate;
        };

        opfab.currentUserCard.setInitialLttd = function (lttd) {
            if (opfab.currentUserCard.getEditionMode() === 'CREATE') self.currentUserCard.lttd  = lttd;
        };

        opfab.currentUserCard.setInitialStartDate = function (startDate) {
            if (opfab.currentUserCard.getEditionMode() === 'CREATE') self.currentUserCard.startDate  = startDate;
        };

        opfab.currentUserCard.setInitialSeverity = function (initialSeverity) {
            self.currentUserCard.initialSeverity = initialSeverity;
        };

        opfab.currentUserCard.setInitialSelectedRecipients = function (recipients) {
            self.currentUserCard.setInitialSelectedRecipients(recipients);
        };

        opfab.currentUserCard.setInitialSelectedRecipientsForInformation = function (recipients) {
            self.currentUserCard.setInitialSelectedRecipientsForInformation(recipients);
        };


        // prevent unwanted modifications from templates code
        Object.freeze(opfab.currentUserCard);
    }
}
