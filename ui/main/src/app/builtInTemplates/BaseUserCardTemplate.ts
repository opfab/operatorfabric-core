/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {LoggerService as logger} from 'app/services/logs/LoggerService';

declare const opfab;

export abstract class BaseUserCardTemplate extends HTMLElement {
    private externalRecipients;

    constructor() {
        super();
        this.setInitialSeverity();
        this.initRecipients();
        this.registerFunctionToGetSpecificCardInformation();
    }

    private setInitialSeverity() {
        const initialSeverity = this.getAttribute('initialSeverity');
        if (initialSeverity) opfab.currentUserCard.setInitialSeverity(initialSeverity);
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
                logger.error(
                    'Invalid entityRecipientList ' + JSON.stringify(entityRecipientList) + ' ' + JSON.stringify(err)
                );
            }
        }

        if (initialSelectedRecipients) {
            try {
                opfab.currentUserCard.setInitialSelectedRecipients(JSON.parse(initialSelectedRecipients));
            } catch (err) {
                logger.error(
                    'Invalid initialSelectedRecipients ' +
                        JSON.stringify(initialSelectedRecipients) +
                        ' ' +
                        JSON.stringify(err)
                );
            }
        }

        if (entityRecipientForInformationList) {
            try {
                opfab.currentUserCard.setDropdownEntityRecipientForInformationList(
                    JSON.parse(entityRecipientForInformationList)
                );
            } catch (err) {
                logger.error(
                    'Invalid entityRecipientForInformationList ' +
                        JSON.stringify(entityRecipientForInformationList) +
                        ' ' +
                        JSON.stringify(err)
                );
            }
        }

        if (initialSelectedRecipientsForInformation) {
            try {
                opfab.currentUserCard.setInitialSelectedRecipientsForInformation(
                    JSON.parse(initialSelectedRecipientsForInformation)
                );
            } catch (err) {
                logger.error(
                    'Invalid initialSelectedRecipientsForInformation ' +
                        JSON.stringify(initialSelectedRecipientsForInformation) +
                        ' ' +
                        JSON.stringify(err)
                );
            }
        }

        if (externalRecipientsAttribute) {
            try {
                this.externalRecipients = JSON.parse(externalRecipientsAttribute);
            } catch (err) {
                logger.error(
                    'Invalid externalRecipients ' +
                        JSON.stringify(externalRecipientsAttribute) +
                        ' ' +
                        JSON.stringify(err)
                );
            }
        }
    }

    private registerFunctionToGetSpecificCardInformation() {
        const that = this;
        opfab.currentUserCard.registerFunctionToGetSpecificCardInformation(() => {
            const info = that.getSpecificCardInformation();
            if (info.card && that.externalRecipients) {
                if (!info.card.externalRecipients) info.card.externalRecipients = that.externalRecipients;
            }
            return info;
        });
    }
    abstract getSpecificCardInformation();
}
