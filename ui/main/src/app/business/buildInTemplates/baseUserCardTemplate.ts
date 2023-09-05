/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


declare const opfab;

export abstract class BaseUserCardTemplate extends HTMLElement {

    private externalRecipients;

    constructor() {
        super();
        this.initRecipients();
        this.registerFunctionToGetSpecificCardInformation()
    }

    private initRecipients() {

        const entityRecipientList = this.getAttribute('entityRecipientList');
        const initialSelectedRecipients = this.getAttribute('initialSelectedRecipients');
        const entityRecipientForInformationList = this.getAttribute('entityRecipientForInformationList');
        const initialSelectedRecipientsForInformation = this.getAttribute('initialSelectedRecipientsForInformation');
        const externalRecipientsAttribute = this.getAttribute('externalRecipients');
        if (entityRecipientList) {
            try {
                opfab.currentUserCard.setDropdownEntityRecipientList(JSON.parse(entityRecipientList));
            } catch (err) {
                console.error('Invalid entityRecipientList', entityRecipientList, err);
            }
        }

        if (initialSelectedRecipients) {
            try {
                opfab.currentUserCard.setSelectedRecipients(JSON.parse(initialSelectedRecipients));
            } catch (err) {
                console.error('Invalid initialSelectedRecipients',initialSelectedRecipients, err);
            }
        }

        if (entityRecipientForInformationList) {
            try {
                opfab.currentUserCard.setDropdownEntityRecipientForInformationList(
                    JSON.parse(entityRecipientForInformationList)
                );
            } catch (err) {
                console.error('Invalid entityRecipientForInformationList', entityRecipientForInformationList, err);
            }
        }

        if (initialSelectedRecipientsForInformation) {
            try {
                opfab.currentUserCard.setSelectedRecipientsForInformation(
                    JSON.parse(initialSelectedRecipientsForInformation)
                );
            } catch (err) {
                console.error(
                    'Invalid initialSelectedRecipientsForInformation',
                    initialSelectedRecipientsForInformation,
                    err
                );
            }
        }

        if (externalRecipientsAttribute) {
            try {
                this.externalRecipients = JSON.parse(externalRecipientsAttribute);
            } catch (err) {
                console.error('Invalid externalRecipients',externalRecipientsAttribute, err);
            }
        }
    }

    private registerFunctionToGetSpecificCardInformation() {
        const that = this;
        opfab.currentUserCard.registerFunctionToGetSpecificCardInformation(() => {
            const info = that.getSpecificCardInformation();
            if (info.card && that.externalRecipients) {
                if (!info.card.externalRecipients)  info.card.externalRecipients = that.externalRecipients;
            }
            return info;

        });
    }
    abstract getSpecificCardInformation();
}