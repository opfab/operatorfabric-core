/* Copyright (c) 2024-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import CardsRoutingUtilities from './cardRoutingUtilities';
import ConfigDTO from '../client-side/configDTO';
import CardsDiffusionRateLimiter from './cardsDiffusionRateLimiter';
import CardsDiffusionControl from './cardsDiffusionControl';
import {UserWithPerimeters} from './userWithPerimeter';
import {Card} from './card';
import {formatInTimeZone} from 'date-fns-tz';

export default class RealTimeCardsDiffusionControl extends CardsDiffusionControl {
    private windowInSecondsForCardSearch: number;
    private subjectPrefix: string;
    private bodyPrefix: string;
    private bodyPostfix: string;
    private publisherEntityPrefix: string;
    private activateCardsDiffusionRateLimiter: boolean;
    private cardsDiffusionRateLimiter: CardsDiffusionRateLimiter;
    private customConfig: any = {};

    public setSubjectPrefix(subjectPrefix: string): this {
        this.subjectPrefix = subjectPrefix;
        return this;
    }

    public setBodyPrefix(bodyPrefix: string): this {
        this.bodyPrefix = bodyPrefix;
        return this;
    }

    public setBodyPostfix(bodyPostfix: string): this {
        this.bodyPostfix = bodyPostfix;
        return this;
    }

    public setPublisherEntityPrefix(publisherEntityPrefix: string): this {
        this.publisherEntityPrefix = publisherEntityPrefix;
        return this;
    }

    public setWindowInSecondsForCardSearch(windowInSecondsForCardSearch: number): this {
        this.windowInSecondsForCardSearch = windowInSecondsForCardSearch;
        return this;
    }

    public setActivateCardsDiffusionRateLimiter(activate: boolean): this {
        this.activateCardsDiffusionRateLimiter = activate;
        return this;
    }

    public setCardsDiffusionRateLimiter(cardsDiffusionRateLimiter: CardsDiffusionRateLimiter): void {
        this.cardsDiffusionRateLimiter = cardsDiffusionRateLimiter;
    }

    public setCustomConfig(config: any) {
        this.customConfig = config;
        return this;
    }

    public setConfiguration(updated: ConfigDTO): void {
        this.from = updated.mailFrom;
        this.subjectPrefix = updated.subjectPrefix;
        this.bodyPrefix = updated.bodyPrefix;
        this.bodyPostfix = updated.bodyPostfix;
        this.windowInSecondsForCardSearch = updated.windowInSecondsForCardSearch;
        this.activateCardsDiffusionRateLimiter = updated.activateCardsDiffusionRateLimiter;
        this.defaultTimeZone = updated.defaultTimeZone;
        if (this.activateCardsDiffusionRateLimiter) {
            this.cardsDiffusionRateLimiter = new CardsDiffusionRateLimiter()
                .setLimitPeriodInSec(updated.sendRateLimitPeriodInSec)
                .setSendRateLimit(updated.sendRateLimit);
        }
        this.customConfig = updated.customConfig;
    }

    public async checkCardsNeedToBeSent(): Promise<void> {
        const users = this.cardsExternalDiffusionOpfabServicesInterface.getUsers();
        const userLogins: string[] = users.map((u) => u.login);

        if (userLogins.length > 0) {
            const dateFrom = Date.now() - this.windowInSecondsForCardSearch * 1000;
            const cards = (await this.cardsExternalDiffusionDatabaseService.getCards(dateFrom)) as Card[];
            if (cards.length > 0) {
                this.logger.debug('Found cards: ' + cards.length);
                userLogins.forEach((login) => {
                    this.sendCardsToUserIfNecessary(cards, login).catch((error) =>
                        this.logger.error('error during sendCardsToUserIfNecessary ', error)
                    );
                });
            }
        }
        await this.cleanCardsAlreadySent();
    }

    async sendCardsToUserIfNecessary(cards: Card[], login: string): Promise<void> {
        this.logger.debug('Check user ' + login);

        const resp = await this.cardsExternalDiffusionOpfabServicesInterface.getUserWithPerimetersByLogin(login);
        if (resp.isValid()) {
            const userWithPerimeters: UserWithPerimeters = resp.getData();
            const emailToPlainText = this.shouldEmailBePlainText(userWithPerimeters);
            const timezoneForEmails = userWithPerimeters.timezoneForEmails ?? this.defaultTimeZone;

            if (this.isEmailSettingEnabled(userWithPerimeters)) {
                this.logger.debug(
                    'Email setting enabled for ' +
                        userWithPerimeters.userData.login +
                        ' with mail ' +
                        userWithPerimeters.email
                );
                const cardsForUser: Card[] = await this.getCardsForUser(cards, userWithPerimeters);
                for (const cardForUser of cardsForUser) {
                    await this.sendCardIfAllowed(
                        cardForUser,
                        userWithPerimeters.email,
                        emailToPlainText,
                        timezoneForEmails
                    );
                }
            }
        }
    }

    async sendCardIfAllowed(
        card: Card,
        userEmail: string | undefined,
        emailToPlainText: boolean,
        timezoneForEmails: string
    ): Promise<void> {
        if (userEmail == null) return;
        try {
            const alreadySent = await this.wasCardsAlreadySentToUser(card.uid, userEmail);
            if (alreadySent == null || !alreadySent) {
                if (this.isSendingAllowed(userEmail)) {
                    await this.sendMail(card, userEmail, emailToPlainText, timezoneForEmails);
                } else {
                    this.logger.warn(`Send rate limit reached for ${userEmail}, not sending mail for card ${card.uid}`);
                    await this.cardsExternalDiffusionDatabaseService.persistSentMail(card.uid, userEmail);
                }
            }
        } catch (error) {
            this.logger.error('Error occurred while sending mail: ', error);
        }
    }

    isSendingAllowed(email: string): boolean {
        return !this.activateCardsDiffusionRateLimiter || this.cardsDiffusionRateLimiter.isNewSendingAllowed(email);
    }

    registerNewSending(destination: string): void {
        if (this.activateCardsDiffusionRateLimiter) this.cardsDiffusionRateLimiter.registerNewSending(destination);
    }

    async getCardsForUser(cards: Card[], userWithPerimeters: UserWithPerimeters): Promise<any[]> {
        return cards.filter((card: Card) => CardsRoutingUtilities.shouldUserReceiveTheCard(userWithPerimeters, card));
    }

    async wasCardsAlreadySentToUser(cardUid: string, email: string): Promise<boolean> {
        return await this.cardsExternalDiffusionDatabaseService.getSentMail(cardUid, email);
    }

    isEmailSettingEnabled(userWithPerimeters: any): boolean {
        return userWithPerimeters.sendCardsByEmail === true && userWithPerimeters.email;
    }

    shouldEmailBePlainText(userWithPerimeters: any): boolean {
        return userWithPerimeters.emailToPlainText ?? false;
    }

    async sendMail(card: Card, to: string, emailToPlainText: boolean, timezoneForEmails: string): Promise<void> {
        this.logger.info('Send Mail to ' + to + ' for card ' + card.uid);
        let subject =
            this.subjectPrefix +
            ' - ' +
            card.titleTranslated +
            ' - ' +
            card.summaryTranslated +
            ' - ' +
            this.getFormattedDateAndTimeFromEpochDate(card.startDate, timezoneForEmails);
        if (card.endDate != null)
            subject += ' - ' + this.getFormattedDateAndTimeFromEpochDate(card.endDate, timezoneForEmails);
        const body = await this.processCardTemplate(card, timezoneForEmails);
        try {
            await this.mailService.sendMail(subject, body, this.from, to, emailToPlainText);
            this.registerNewSending(to);
            await this.cardsExternalDiffusionDatabaseService.persistSentMail(card.uid, to);
        } catch (e) {
            this.logger.error('Error sending mail ', e);
        }
    }

    removeElementsFromArray(arrayToFilter: string[], arrayToDelete: string[]): string[] {
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

    async processCardTemplate(card: Card, timezoneForEmails: string): Promise<string> {
        let cardBodyHtml =
            this.bodyPrefix +
            ' <a href=" ' +
            this.opfabUrlInMailContent +
            '/#/feed/cards/' +
            card.id +
            ' ">' +
            this.escapeHtml(card.titleTranslated) +
            ' - ' +
            this.escapeHtml(card.summaryTranslated) +
            ' - ' +
            this.getFormattedDateAndTimeFromEpochDate(card.startDate, timezoneForEmails) +
            ' - ' +
            this.getFormattedDateAndTimeFromEpochDate(card.endDate, timezoneForEmails) +
            '</a>';
        try {
            const cardConfig = await this.businessConfigOpfabServicesInterface.fetchProcessConfig(
                card.process,
                card.processVersion
            );
            const stateName = card.state;
            if (cardConfig?.states?.[stateName]?.emailBodyTemplate != null) {
                const cardContentResponse = await this.cardsExternalDiffusionOpfabServicesInterface.getCard(card.id);
                if (cardContentResponse.isValid()) {
                    const cardContent = cardContentResponse.getData();
                    const templateCompiler = await this.businessConfigOpfabServicesInterface.fetchTemplate(
                        card.process,
                        cardConfig.states[stateName].emailBodyTemplate as string,
                        card.processVersion
                    );
                    cardBodyHtml =
                        cardBodyHtml + ' <br> ' + templateCompiler({card: cardContent, config: this.customConfig});
                }
            }
            if (this.publisherEntityPrefix != null && card.publisher != null && card.publisherType === 'ENTITY') {
                const entity = await this.cardsExternalDiffusionOpfabServicesInterface.getEntityById(card.publisher);
                cardBodyHtml = cardBodyHtml + ' <br/>' + this.publisherEntityPrefix + entity.name + '.';
            }
            if (this.bodyPostfix != null) {
                cardBodyHtml = cardBodyHtml + ' <br/>' + this.bodyPostfix;
            }
        } catch (e) {
            this.logger.warn(`Couldn't parse email for : ${card.state}, `, e);
        }
        return cardBodyHtml;
    }

    escapeHtml(text: string | undefined): string {
        if (text == null) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    async cleanCardsAlreadySent(): Promise<void> {
        const dateLimit = Date.now() - this.windowInSecondsForCardSearch * 1000;
        await this.cardsExternalDiffusionDatabaseService.deleteMailsSentBefore(dateLimit);
    }

    getFormattedDateAndTimeFromEpochDate(epochDate: number | undefined, timezoneForEmails: string): string {
        if (epochDate == null) {
            return '';
        }
        return formatInTimeZone(epochDate, timezoneForEmails, 'dd/MM/yyyy HH:mm');
    }
}
