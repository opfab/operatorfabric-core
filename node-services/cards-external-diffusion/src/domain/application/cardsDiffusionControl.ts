/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import SendMailService from '../server-side/sendMailService';
import GetResponse from '../../common/server-side/getResponse';
import CardsExternalDiffusionOpfabServicesInterface from '../server-side/cardsExternalDiffusionOpfabServicesInterface';
import CardsRoutingUtilities from './cardRoutingUtilities';
import ConfigDTO from '../client-side/configDTO';
import CardsExternalDiffusionDatabaseService from '../server-side/cardsExternaDiffusionDatabaseService';
import CardsDiffusionRateLimiter from './cardsDiffusionRateLimiter';
import BusinessConfigOpfabServicesInterface from '../server-side/BusinessConfigOpfabServicesInterface';

export default class CardsDiffusionControl {

    opfabUrlInMailContent: any;

    private cardsExternalDiffusionOpfabServicesInterface: CardsExternalDiffusionOpfabServicesInterface;
    private businessConfigOpfabServicesInterface: BusinessConfigOpfabServicesInterface;
    private cardsExternalDiffusionDatabaseService: CardsExternalDiffusionDatabaseService;
    private logger: any;
    private secondsAfterPublicationToConsiderCardAsNotRead: number;
    private windowInSecondsForCardSearch: number;
    private mailService: SendMailService;
    private from: string;
    private subjectPrefix: string;
    private bodyPrefix: string;
    private activateCardsDiffusionRateLimiter: boolean;
    private cardsDiffusionRateLimiter: CardsDiffusionRateLimiter;

    public setOpfabServicesInterface(cardsExternalDiffusionOpfabServicesInterface: CardsExternalDiffusionOpfabServicesInterface) {
        this.cardsExternalDiffusionOpfabServicesInterface = cardsExternalDiffusionOpfabServicesInterface;
        return this;
    }

    public setOpfabBusinessConfigServicesInterface(businessConfigOpfabServicesInterface: BusinessConfigOpfabServicesInterface) {
        this.businessConfigOpfabServicesInterface = businessConfigOpfabServicesInterface;
        return this;
    }

    public setCardsExternalDiffusionDatabaseService(cardsExternalDiffusionDatabaseService: CardsExternalDiffusionDatabaseService) {
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

    public setSubjectPrefix(subjectPrefix: string) {
        this.subjectPrefix = subjectPrefix;
        return this;
    }

    public setBodyPrefix(bodyPrefix: string) {
        this.bodyPrefix = bodyPrefix;
        return this;
    }

    public setOpfabUrlInMailContent(opfabUrlInMailContent: any) {
        this.opfabUrlInMailContent = opfabUrlInMailContent;
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

    public setCardsDiffusionRateLimiter( cardsDiffusionRateLimiter: CardsDiffusionRateLimiter) {
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
            const connectedUsers = connectedResponse.getData().map((u: {login: string;}) => u.login);
            const usersToCheck = this.removeElementsFromArray(userLogins, connectedUsers);
            this.logger.debug('Disconnected users ' + usersToCheck);
            if (usersToCheck.length > 0) {
                const cardFilters = [];
                const now = Date.now();
                const dateFrom = now - this.windowInSecondsForCardSearch * 1000;
                cardFilters.push({columnName: 'publishDateFrom', filter: [dateFrom], matchType: 'EQUALS'});

                const cardsResponse: GetResponse = await this.cardsExternalDiffusionOpfabServicesInterface.getCards({
                    adminMode: true,
                    filters: cardFilters
                });
                if (cardsResponse.isValid()) {
                    const cards = cardsResponse.getData();
                    if (cards.length > 0) {
                        this.logger.debug('Found cards: ' + cards.length);
                        usersToCheck.forEach((login) => {
                            this.sendCardsToUserIfNecessary(cards, login).catch(error =>
                                this.logger.error("error during sendCardsToUserIfNecessary ", error)
                            )
                        });
                    }
                }
            }
            await this.cleanCardsAreadySent();
        }
    }

    private async sendCardsToUserIfNecessary(cards: [], login: string) {
        this.logger.debug('Check user ' + login);
        
        const resp = await this.cardsExternalDiffusionOpfabServicesInterface.getUserWithPerimetersByLogin(login);
        if (resp.isValid()) {
            const userWithPerimeters = resp.getData();
            const emailToPlainText = this.shouldEmailBePlainText(userWithPerimeters);
            this.logger.debug('Got user with perimeters ' + JSON.stringify(userWithPerimeters));
            if (this.isEmailSettingEnabled(userWithPerimeters)) {
                const unreadCards = await this.getCardsForUser(cards, userWithPerimeters);
                for (let i = 0; i < unreadCards.length; i++) {
                    await this.sendCardIfAllowed(unreadCards[i], userWithPerimeters.email, emailToPlainText);
                }
            }
        }
    }


    private async sendCardIfAllowed(unreadCard: any, userEmail: string, emailToPlainText: boolean): Promise<void> {
        try {
            const alreadySent = await this.wasCardsAlreadySentToUser(unreadCard.uid, userEmail);

            if (!alreadySent) {
                if (this.isSendingAllowed(userEmail)) {
                    await this.sendMail(unreadCard, userEmail, emailToPlainText);
                } else {
                    this.logger.warn(`Send rate limit reached for ${userEmail}, not sending mail for card ${unreadCard.uid}`);
                }
            }
        } catch (error) {
            this.logger.error("Error occurred while sending mail: ", error);
        }
    }

    private isSendingAllowed(email: string) {
        return !this.activateCardsDiffusionRateLimiter || this.cardsDiffusionRateLimiter.isNewSendingAllowed(email);
    }

    private registerNewSending(destination: string) {
        if (this.activateCardsDiffusionRateLimiter)
            this.cardsDiffusionRateLimiter.registerNewSending(destination);
    }

    private async getCardsForUser(cards : [], userWithPerimeters: any) : Promise<any[]> {

        const perimeters = userWithPerimeters.computedPerimeters;
        this.logger.debug('Got user perimeters' + JSON.stringify(perimeters));
        return cards
        .filter(
            (card: any) =>
            CardsRoutingUtilities.shouldUserReceiveTheCard(
                userWithPerimeters,
                    card
                ) && this.isCardUnreadForUser(card, userWithPerimeters.userData)
        );
    }

    private wasCardsAlreadySentToUser(cardUid: string, email: string) {
        return this.cardsExternalDiffusionDatabaseService.getSentMail(cardUid, email);
    }

    private isEmailSettingEnabled(userWithPerimeters: any): boolean {
        return userWithPerimeters.sendCardsByEmail && userWithPerimeters.email;
        
    }

    private shouldEmailBePlainText(userWithPerimeters: any): boolean {
        return userWithPerimeters.emailToPlainText;
    }

    private isCardUnreadForUser(card: any, user: any): boolean {
        return (
            card.publishDate < Date.now() - 1000 * this.secondsAfterPublicationToConsiderCardAsNotRead &&
            !card.usersReads?.includes(user.login)
        );
    }

    private async sendMail(card: any, to: string, emailToPlainText:boolean) {
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
        };
        
    }

    private removeElementsFromArray(arrayToFilter: string[], arrayToDelete: string[]): string[] {
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

    private async processCardTemplate(card: any): Promise<string> {
        let cardBodyHtml = this.bodyPrefix +
        ' <a href="' +
        this.opfabUrlInMailContent +
        '/#/feed/cards/' +
        card.id +
        '">' +
        card.titleTranslated +
        ' - ' +
        card.summaryTranslated +
        '</a>';
        try {
            const cardConfig = await this.businessConfigOpfabServicesInterface.fetchProcessConfig(card.process, card.processVersion);
            const stateName = card.state;
            if (cardConfig?.states?.[stateName]?.emailBodyTemplate) {
                const cardContentResponse = await this.cardsExternalDiffusionOpfabServicesInterface.getCard(card.id);
                if (cardContentResponse.isValid()) {
                    const cardContent = cardContentResponse.getData();
                    const templateCompiler = await this.businessConfigOpfabServicesInterface.fetchTemplate(card.process, cardConfig.states[stateName].emailBodyTemplate, card.processVersion);
                    cardBodyHtml = cardBodyHtml + ' <br> ' + templateCompiler(cardContent);
                }
            }
        } catch(e) {
            console.warn("Couldn't parse email for : ", card.state, e);
        }
        return cardBodyHtml;
    }

    private async cleanCardsAreadySent() {
        const dateLimit = Date.now() - this.windowInSecondsForCardSearch * 1000;
        await this.cardsExternalDiffusionDatabaseService.deleteMailsSentBefore(dateLimit);
    }

    private getFormattedDateAndTimeFromEpochDate(epochDate: number): string {
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

    private pad(num: number): string {
        if (num < 10) {
            return '0' + num;
        }
        return '' + num;
    }
}
