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
import {formatInTimeZone} from 'date-fns-tz';

export default class CardsDiffusionControl {
    protected opfabUrlInMailContent: any;
    protected cardsExternalDiffusionOpfabServicesInterface: CardsExternalDiffusionOpfabServicesInterface;
    protected businessConfigOpfabServicesInterface: BusinessConfigOpfabServicesInterface;
    protected cardsExternalDiffusionDatabaseService: CardsExternalDiffusionDatabaseService;
    protected logger: any;
    protected mailService: SendMailService;
    protected from: string;
    protected defaultTimeZone: string;

    public setOpfabUrlInMailContent(opfabUrlInMailContent: any): this {
        this.opfabUrlInMailContent = opfabUrlInMailContent;
        return this;
    }

    public setOpfabServicesInterface(
        cardsExternalDiffusionOpfabServicesInterface: CardsExternalDiffusionOpfabServicesInterface
    ): this {
        this.cardsExternalDiffusionOpfabServicesInterface = cardsExternalDiffusionOpfabServicesInterface;
        return this;
    }

    public setOpfabBusinessConfigServicesInterface(
        businessConfigOpfabServicesInterface: BusinessConfigOpfabServicesInterface
    ): this {
        this.businessConfigOpfabServicesInterface = businessConfigOpfabServicesInterface;
        return this;
    }

    public setCardsExternalDiffusionDatabaseService(
        cardsExternalDiffusionDatabaseService: CardsExternalDiffusionDatabaseService
    ): this {
        this.cardsExternalDiffusionDatabaseService = cardsExternalDiffusionDatabaseService;
        return this;
    }

    public setLogger(logger: any): this {
        this.logger = logger;
        return this;
    }

    public setMailService(mailservice: SendMailService): this {
        this.mailService = mailservice;
        return this;
    }

    public setFrom(from: string): this {
        this.from = from;
        return this;
    }

    public setDefaultTimeZone(defaultTimeZone: string): this {
        this.defaultTimeZone = defaultTimeZone;
        return this;
    }

    protected isEmailSettingEnabled(userWithPerimeters: any): boolean {
        return userWithPerimeters.sendCardsByEmail === true && userWithPerimeters.email;
    }

    protected shouldEmailBePlainText(userWithPerimeters: any): boolean {
        return userWithPerimeters?.emailToPlainText ?? false;
    }

    protected removeElementsFromArray(arrayToFilter: string[], arrayToDelete: string[]): string[] {
        if (arrayToDelete != null && arrayToDelete.length > 0) {
            const elementsToDeleteSet = new Set(arrayToDelete);
            const newArray = arrayToFilter.filter((name) => {
                return !elementsToDeleteSet.has(name);
            });
            return newArray;
        } else {
            return arrayToFilter;
        }
    }

    protected escapeHtml(text: string | undefined): string {
        if (text == null) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    getFormattedDateAndTimeFromEpochDate(epochDate: number | undefined, timezoneForEmails: string): string {
        if (epochDate == null) {
            return '';
        }
        return formatInTimeZone(epochDate, timezoneForEmails, 'dd/MM/yyyy HH:mm');
    }
}
