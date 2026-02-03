/* Copyright (c) 2023-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import SendMailService from '../server-side/sendMailService';
import EmailGatewayOpfabServicesInterface from '../server-side/emailGatewayOpfabServicesInterface';
import EmailGatewayDatabaseService from '../server-side/emailGatewayDatabaseService';
import BusinessConfigOpfabServicesInterface from '../server-side/BusinessConfigOpfabServicesInterface';
import {formatInTimeZone} from 'date-fns-tz';

export default class CardsDiffusionControl {
    protected opfabUrlInMailContent: any;
    protected emailGatewayOpfabServicesInterface: EmailGatewayOpfabServicesInterface;
    protected businessConfigOpfabServicesInterface: BusinessConfigOpfabServicesInterface;
    protected emailGatewayDatabaseService: EmailGatewayDatabaseService;
    protected logger: any;
    protected mailService: SendMailService;
    protected from: string;
    protected defaultTimeZone: string;
    protected showCardUrls: boolean;
    protected forceEmailsInPlainText: boolean = false;
    protected showCardTitleInBody: boolean = true;

    public setOpfabUrlInMailContent(opfabUrlInMailContent: any): this {
        this.opfabUrlInMailContent = opfabUrlInMailContent;
        return this;
    }

    public setOpfabServicesInterface(emailGatewayOpfabServicesInterface: EmailGatewayOpfabServicesInterface): this {
        this.emailGatewayOpfabServicesInterface = emailGatewayOpfabServicesInterface;
        return this;
    }

    public setOpfabBusinessConfigServicesInterface(
        businessConfigOpfabServicesInterface: BusinessConfigOpfabServicesInterface
    ): this {
        this.businessConfigOpfabServicesInterface = businessConfigOpfabServicesInterface;
        return this;
    }

    public setEmailGatewayDatabaseService(emailGatewayDatabaseService: EmailGatewayDatabaseService): this {
        this.emailGatewayDatabaseService = emailGatewayDatabaseService;
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

    public setShowCardUrls(showCardUrls: boolean): this {
        this.showCardUrls = showCardUrls;
        return this;
    }

    public setForceEmailsInPlainText(forceEmailsInPlainText: boolean): this {
        this.forceEmailsInPlainText = forceEmailsInPlainText;
        return this;
    }

    public setShowCardTitleInBody(showCardTitleInBody: boolean): this {
        this.showCardTitleInBody = showCardTitleInBody;
        return this;
    }

    protected isEmailSettingEnabled(userWithPerimeters: any): boolean {
        return userWithPerimeters.sendCardsByEmail === true && userWithPerimeters.email;
    }

    protected shouldEmailBePlainText(userWithPerimeters: any): boolean {
        if (this.forceEmailsInPlainText) {
            return true;
        } else {
            return userWithPerimeters?.emailToPlainText ?? false;
        }
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

    protected base64urlEncode(str: string) {
        const base64 = btoa(str);
        // Replace '+' with '-', '/' with '_' and remove trailing '=' to convert base64 to base64url
        let base64url = base64.replaceAll('+', '-').replaceAll('/', '_');
        while (base64url.endsWith('=')) {
            base64url = base64url.slice(0, -1);
        }
        return base64url;
    }

    protected escapeHtml(text: string | undefined): string {
        if (text == null) return '';
        return text
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;')
            .replaceAll('`', '&#96;')
            .replaceAll('=', '&#61;');
    }

    getFormattedDateAndTimeFromEpochDate(epochDate: number | undefined, timezoneForEmails: string): string {
        if (epochDate == null) {
            return '';
        }
        return formatInTimeZone(epochDate, timezoneForEmails, 'dd/MM/yyyy HH:mm');
    }
}
