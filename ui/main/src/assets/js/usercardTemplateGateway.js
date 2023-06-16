/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


   // UTILITIES FOR TEMPLATE - DEPRECATED

const usercardTemplateGateway = {

  

    getEditionMode() {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of usercardTemplateGateway.getEditionMode is deprecated , you shall use opfab.currentUserCard.getEditionMode instead'
        );
        return opfab.currentUserCard.getEditionMode();
    },

    getUserEntityChildCardFromCurrentCard() {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of usercardTemplateGateway.getUserEntityChildCardFromCurrentCard is deprecated , you shall use opfab.currentUserCard.getUserEntityChildCard instead'
        );
        return opfab.currentUserCard.getUserEntityChildCard();
       
    },

    getCurrentState() {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of usercardTemplateGateway.getCurrentState is deprecated , you shall use opfab.currentUserCard.getState instead'
        );
        return opfab.currentUserCard.getState();
        
    },

    getCurrentProcess() {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of usercardTemplateGateway.getCurrentProcess is deprecated , you shall use opfab.currentUserCard.getProcessId instead'
        );
        return opfab.currentUserCard.getProcessId();
    },

    getStartDate() {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of usercardTemplateGateway.getStartDate is deprecated , you shall use opfab.currentUserCard.getStartDate instead'
        );
        return opfab.currentUserCard.getStartDate();
    },

    getEndDate() {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of usercardTemplateGateway.getEndDate is deprecated , you shall use opfab.currentUserCard.getEndDate instead'
        );
        return opfab.currentUserCard.getEndDate();
    },

    getLttd() {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of usercardTemplateGateway.getLttd is deprecated , you shall use opfab.currentUserCard.getLttd instead'
        );
        return opfab.currentUserCard.getLttd();

    },

    getExpirationDate() {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of usercardTemplateGateway.getExpirationDate is deprecated , you shall use opfab.currentUserCard.getExpirationDate instead'
        );
        return opfab.currentUserCard.getExpirationDate();
    },

    getSelectedEntityRecipients() {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of usercardTemplateGateway.getSelectedEntityRecipients is deprecated , you shall use opfab.currentUserCard.getSelectedEntityRecipients instead'
        );
        return opfab.currentUserCard.getSelectedEntityRecipients();
    },

    getSelectedEntityForInformationRecipients() {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of usercardTemplateGateway.getSelectedEntityForInformationRecipients is deprecated , you shall use opfab.currentUserCard.getSelectedEntityForInformationRecipients instead'
        );
        return opfab.currentUserCard.getSelectedEntityForInformationRecipients();
    },

    setDropdownEntityRecipientList: function(recipients) {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of usercardTemplateGateway.setDropdownEntityRecipientList is deprecated , you shall use opfab.currentUserCard.setDropdownEntityRecipientList instead'
        );
        opfab.currentUserCard.setDropdownEntityRecipientList(recipients);
    },

    setDropdownEntityRecipientForInformationList: function(recipients) {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of usercardTemplateGateway.setDropdownEntityRecipientForInformationList is deprecated , you shall use opfab.currentUserCard.setDropdownEntityRecipientForInformationList instead'
        );
        opfab.currentUserCard.setDropdownEntityRecipientForInformationList(recipients);
    },

    setInitialStartDate: function (startDate) {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of usercardTemplateGateway.setInitialStartDate is deprecated , you shall use opfab.currentUserCard.setInitialStartDate instead'
        );
        opfab.currentUserCard.setInitialStartDate(startDate);
    },

    setInitialEndDate: function (endDate) {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of usercardTemplateGateway.setInitialEndDate is deprecated , you shall use opfab.currentUserCard.setInitialEndDate instead'
        );
        opfab.currentUserCard.setInitialEndDate(endDate);
    },

    setInitialLttd: function (lttd) {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of usercardTemplateGateway.setInitialLttd is deprecated , you shall use opfab.currentUserCard.setInitialLttd instead'
        );
        opfab.currentUserCard.setInitialLttd(lttd);
    },

    setInitialExpirationDate: function (expirationDate) {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of usercardTemplateGateway.setInitialExpirationDate is deprecated , you shall use opfab.currentUserCard.setInitialExpirationDate instead'
        );
        opfab.currentUserCard.setInitialExpirationDate(expirationDate);
    },

    setInitialSelectedRecipients(recipients) {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of userCardTemplateGateway.setInitialSelectedRecipients is deprecated , you shall use opfab.currentUserCard.setInitialSelectedRecipients instead'
        );
        opfab.currentUserCard.setInitialSelectedRecipients(recipients);
    },


    setInitialSelectedRecipientsForInformation(recipients) {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of userCardTemplateGateway.setInitialSelectedRecipientsForInformation is deprecated , you shall use opfab.currentUserCard.setInitialSelectedRecipientsForInformation instead'
        );
        opfab.currentUserCard.setInitialSelectedRecipientsForInformation(recipients);
    },

    setInitialSeverity: function (initialSeverity) {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of usercardTemplateGateway.setInitialSeverity is deprecated , you shall use opfab.currentUserCard.setInitialSeverity instead'
        );
        opfab.currentUserCard.setInitialSeverity(initialSeverity);
    },

    set getSpecificCardInformation(value) {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of usercardTemplateGateway.getSpecificCardInformation is deprecated , you shall use opfab.currentUserCard.registerFunctionToGetSpecificCardInformation() instead'
        );
        opfab.currentUserCard.registerFunctionToGetSpecificCardInformation(value);
    },


    set setEntityUsedForSendingCard(value) {
        console.warn(
            new Date().toISOString(),
            ' WARNING : Use of userCardTemplateGateway.setEntityUsedForSendingCard is deprecated , you shall use opfab.currentUserCard.listenToEntityUsedForSendingCard instead'
        );
        opfab.currentUserCard.listenToEntityUsedForSendingCard(value);
    },

};
