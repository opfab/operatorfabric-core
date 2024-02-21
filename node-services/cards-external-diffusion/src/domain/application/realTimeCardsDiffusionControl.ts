/* Copyright (c) 2024, RTE (http://www.rte-france.com)
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

export default class RealTimeCardsDiffusionControl extends CardsDiffusionControl {
    private secondsAfterPublicationToConsiderCardAsNotRead: number;
    private windowInSecondsForCardSearch: number;
    private subjectPrefix: string;
    private bodyPrefix: string;
    private activateCardsDiffusionRateLimiter: boolean;
    private cardsDiffusionRateLimiter: CardsDiffusionRateLimiter;

    public setSubjectPrefix(subjectPrefix: string) {
        this.subjectPrefix = subjectPrefix;
        return this;
    }

    public setBodyPrefix(bodyPrefix: string) {
        this.bodyPrefix = bodyPrefix;
        return this;
    }

    public setSecondsAfterPublicationToConsiderCardAsNotRead(secondsAfterPublicationToConsiderCardAsNotRead: number) {
        this.secondsAfterPublicationToConsiderCardAsNotRead = secondsAfterPublicationToConsiderCardAsNotRead;
        return this;
    }

    public setWindowInSecondsForCardSearch(windowInSecondsForCardSearch: number) {
        this.windowInSecondsForCardSearch = windowInSecondsForCardSearch;
        return this;
    }

    public setActivateCardsDiffusionRateLimiter(activate: boolean) {
        this.activateCardsDiffusionRateLimiter = activate;
        return this;
    }

    public setCardsDiffusionRateLimiter(cardsDiffusionRateLimiter: CardsDiffusionRateLimiter) {
        this.cardsDiffusionRateLimiter = cardsDiffusionRateLimiter;
    }

    public setConfiguration(updated: ConfigDTO) {
        this.from = updated.mailFrom;
        this.subjectPrefix = updated.subjectPrefix;
        this.bodyPrefix = updated.bodyPrefix;
        this.secondsAfterPublicationToConsiderCardAsNotRead = updated.secondsAfterPublicationToConsiderCardAsNotRead;
        this.windowInSecondsForCardSearch = updated.windowInSecondsForCardSearch;
        this.activateCardsDiffusionRateLimiter = updated.activateCardsDiffusionRateLimiter;
        if (this.activateCardsDiffusionRateLimiter) {
            this.cardsDiffusionRateLimiter = new CardsDiffusionRateLimiter()
                .setLimitPeriodInSec(updated.sendRateLimitPeriodInSec)
                .setSendRateLimit(updated.sendRateLimit);
        }
    }

    public async checkUnreadCards() {
        const users = this.cardsExternalDiffusionOpfabServicesInterface.getUsers();
        const userLogins = users.map((u) => u.login);

        const connectedResponse = await this.cardsExternalDiffusionOpfabServicesInterface.getUsersConnected();
        if (connectedResponse.isValid()) {
            const connectedUsers = connectedResponse.getData().map((u: {login: string}) => u.login);
            const usersToCheck = this.removeElementsFromArray(userLogins, connectedUsers);
            this.logger.debug('Disconnected users ' + usersToCheck);
            if (usersToCheck.length > 0) {
                const dateFrom = Date.now() - this.windowInSecondsForCardSearch * 1000;
                const cards = await this.cardsExternalDiffusionDatabaseService.getCards(dateFrom);
                if (cards.length > 0) {
                    this.logger.debug('Found cards: ' + cards.length);
                    usersToCheck.forEach((login) => {
                        this.sendCardsToUserIfNecessary(cards, login).catch((error) =>
                            this.logger.error('error during sendCardsToUserIfNecessary ', error)
                        );
                    });
                }
            }
            await this.cleanCardsAlreadySent();
        }
    }

    async sendCardsToUserIfNecessary(cards: any[], login: string) {
        this.logger.debug('Check user ' + login);

        const resp = await this.cardsExternalDiffusionOpfabServicesInterface.getUserWithPerimetersByLogin(login);
        if (resp.isValid()) {
            const userWithPerimeters = resp.getData();
            const emailToPlainText = this.shouldEmailBePlainText(userWithPerimeters);
            this.logger.debug('Got user with perimeters ' + JSON.stringify(userWithPerimeters));
            if (this.isEmailSettingEnabled(userWithPerimeters)) {
                const unreadCards = await this.getCardsForUser(cards, userWithPerimeters);
                for (const unreadCard of unreadCards) {
                    await this.sendCardIfAllowed(unreadCard, userWithPerimeters.email, emailToPlainText);
                }
            }
        }
    }

    async sendCardIfAllowed(unreadCard: any, userEmail: string, emailToPlainText: boolean): Promise<void> {
        try {
            const alreadySent = await this.wasCardsAlreadySentToUser(unreadCard.uid, userEmail);
            if (!alreadySent) {
                if (this.isSendingAllowed(userEmail)) {
                    await this.sendMail(unreadCard, userEmail, emailToPlainText);
                } else {
                    this.logger.warn(
                        `Send rate limit reached for ${userEmail}, not sending mail for card ${unreadCard.uid}`
                    );
                    await this.cardsExternalDiffusionDatabaseService.persistSentMail(unreadCard.uid, userEmail);
                }
            }
        } catch (error) {
            this.logger.error('Error occurred while sending mail: ', error);
        }
    }

    isSendingAllowed(email: string) {
        return !this.activateCardsDiffusionRateLimiter || this.cardsDiffusionRateLimiter.isNewSendingAllowed(email);
    }

    registerNewSending(destination: string) {
        if (this.activateCardsDiffusionRateLimiter) this.cardsDiffusionRateLimiter.registerNewSending(destination);
    }

    async getCardsForUser(cards: any[], userWithPerimeters: any): Promise<any[]> {
        const perimeters = userWithPerimeters.computedPerimeters;
        this.logger.debug('Got user perimeters' + JSON.stringify(perimeters));
        return cards.filter(
            (card: any) =>
                CardsRoutingUtilities.shouldUserReceiveTheCard(userWithPerimeters, card) &&
                this.isCardUnreadForUser(card, userWithPerimeters.userData)
        );
    }

    wasCardsAlreadySentToUser(cardUid: string, email: string) {
        return this.cardsExternalDiffusionDatabaseService.getSentMail(cardUid, email);
    }

    isEmailSettingEnabled(userWithPerimeters: any): boolean {
        return userWithPerimeters.sendCardsByEmail && userWithPerimeters.email;
    }

    shouldEmailBePlainText(userWithPerimeters: any): boolean {
        return userWithPerimeters.emailToPlainText ? userWithPerimeters.emailToPlainText : false;
    }

    isCardUnreadForUser(card: any, user: any): boolean {
        return (
            card.publishDate < Date.now() - 1000 * this.secondsAfterPublicationToConsiderCardAsNotRead &&
            !card.usersReads?.includes(user.login)
        );
    }

    async sendMail(card: any, to: string, emailToPlainText: boolean) {
        this.logger.info('Send Mail to ' + to + ' for card ' + card.uid);
        let subject =
            this.subjectPrefix +
            ' - ' +
            card.titleTranslated +
            ' - ' +
            card.summaryTranslated +
            ' - ' +
            this.getFormattedDateAndTimeFromEpochDate(card.startDate);
        if (card.endDate) subject += ' - ' + this.getFormattedDateAndTimeFromEpochDate(card.endDate);
        const body = await this.processCardTemplate(card);
        try {
            await this.mailService.sendMail(subject, body, this.from, to, emailToPlainText);
            this.registerNewSending(to);
            await this.cardsExternalDiffusionDatabaseService.persistSentMail(card.uid, to);
        } catch (e) {
            this.logger.error('Error sending mail ', e);
        }
    }

    removeElementsFromArray(arrayToFilter: string[], arrayToDelete: string[]): string[] {
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

    async processCardTemplate(card: any): Promise<string> {
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
            '</a>';
        try {
            const cardConfig = await this.businessConfigOpfabServicesInterface.fetchProcessConfig(
                card.process,
                card.processVersion
            );
            const stateName = card.state;
            if (cardConfig?.states?.[stateName]?.emailBodyTemplate) {
                const cardContentResponse = await this.cardsExternalDiffusionOpfabServicesInterface.getCard(card.id);
                if (cardContentResponse.isValid()) {
                    const cardContent = cardContentResponse.getData();
                    const templateCompiler = await this.businessConfigOpfabServicesInterface.fetchTemplate(
                        card.process,
                        cardConfig.states[stateName].emailBodyTemplate,
                        card.processVersion
                    );
                    cardBodyHtml = cardBodyHtml + ' <br> ' + templateCompiler(cardContent);
                }
            }
        } catch (e) {
            console.warn("Couldn't parse email for : ", card.state, e);
        }
        return cardBodyHtml;
    }

    escapeHtml(text: string): string {
        if (!text) return text;
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    async cleanCardsAlreadySent() {
        const dateLimit = Date.now() - this.windowInSecondsForCardSearch * 1000;
        await this.cardsExternalDiffusionDatabaseService.deleteMailsSentBefore(dateLimit);
    }

    getFormattedDateAndTimeFromEpochDate(epochDate: number): string {
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

    pad(num: number): string {
        if (num < 10) {
            return '0' + num;
        }
        return '' + num;
    }
}
