/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import SendMailService from '../server-side/sendMailService';
import CardsExternalDiffusionOpfabServicesInterface from '../server-side/cardsExternalDiffusionOpfabServicesInterface';
import CardsExternalDiffusionDatabaseService from '../server-side/cardsExternaDiffusionDatabaseService';
import BusinessConfigOpfabServicesInterface from '../server-side/BusinessConfigOpfabServicesInterface';

export default class CardsDiffusionControl {

    protected opfabUrlInMailContent: any;
    protected cardsExternalDiffusionOpfabServicesInterface: CardsExternalDiffusionOpfabServicesInterface;
    protected businessConfigOpfabServicesInterface: BusinessConfigOpfabServicesInterface;
    protected cardsExternalDiffusionDatabaseService: CardsExternalDiffusionDatabaseService;
    protected logger: any;
    protected mailService: SendMailService;
    protected from: string;

    public setOpfabUrlInMailContent(opfabUrlInMailContent: any) {
        this.opfabUrlInMailContent = opfabUrlInMailContent;
        return this;
    }

    public setOpfabServicesInterface(
        cardsExternalDiffusionOpfabServicesInterface: CardsExternalDiffusionOpfabServicesInterface
    ) {
        this.cardsExternalDiffusionOpfabServicesInterface = cardsExternalDiffusionOpfabServicesInterface;
        return this;
    }

    public setOpfabBusinessConfigServicesInterface(
        businessConfigOpfabServicesInterface: BusinessConfigOpfabServicesInterface
    ) {
        this.businessConfigOpfabServicesInterface = businessConfigOpfabServicesInterface;
        return this;
    }

    public setCardsExternalDiffusionDatabaseService(
        cardsExternalDiffusionDatabaseService: CardsExternalDiffusionDatabaseService
    ) {
        this.cardsExternalDiffusionDatabaseService = cardsExternalDiffusionDatabaseService;
        return this;
    }

    public setLogger(logger: any) {
        this.logger = logger;
        return this;
    }

    public setMailService(mailservice: SendMailService) {
        this.mailService = mailservice;
        return this;
    }

    public setFrom(from: string) {
        this.from = from;
        return this;
    }

    protected isEmailSettingEnabled(userWithPerimeters: any): boolean {
        return userWithPerimeters.sendCardsByEmail && userWithPerimeters.email;
    }

    protected shouldEmailBePlainText(userWithPerimeters: any): boolean {
        return userWithPerimeters.emailToPlainText ? userWithPerimeters.emailToPlainText : false;
    }

    protected removeElementsFromArray(arrayToFilter: string[], arrayToDelete: string[]): string[] {
        if (arrayToDelete && arrayToDelete.length > 0) {
            const elementsToDeleteSet = new Set(arrayToDelete);
            const newArray = arrayToFilter.filter((name) => {
                return !elementsToDeleteSet.has(name);
            });
            return newArray;
        } else {
            return arrayToFilter;
        }
    }

    protected escapeHtml(text: string): string {
        if (!text) return text;
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    protected getFormattedDateAndTimeFromEpochDate(epochDate: number): string {
        if (!epochDate) return '';
        const date = new Date(epochDate);

        return (
            this.pad(date.getDate()) +
            '-' +
            this.pad(date.getMonth()) +
            '-' +
            date.getFullYear() +
            ' ' +
            this.pad(date.getHours()) +
            ':' +
            this.pad(date.getMinutes())
        );
    }

    protected pad(num: number): string {
        if (num < 10) {
            return '0' + num;
        }
        return '' + num;
    }
}
