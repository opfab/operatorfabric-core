/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import SendMailService from '../server-side/sendMailService';
import GetResponse from '../server-side/getResponse';
import OpfabServicesInterface from '../server-side/opfabServicesInterface';
import CardsRoutingUtilities from './cardRoutingUtilities';
import ConfigDTO from '../client-side/configDTO';

export default class CardsDiffusionControl {
    private opfabServicesInterface: OpfabServicesInterface;
    private logger: any;
    private secondsAfterPublicationToConsiderCardAsNotRead: number;
    private windowInSecondsForCardSearch: number;
    private cardsAlreadySent = new Map();
    private mailService: SendMailService;
    private from: string;
    private subjectPrefix: string;
    private bodyPrefix: string;

    public setOpfabServicesInterface(opfabServicesInterface: OpfabServicesInterface) {
        this.opfabServicesInterface = opfabServicesInterface;
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

    public setSecondsAfterPublicationToConsiderCardAsNotRead(secondsAfterPublicationToConsiderCardAsNotRead: number) {
        this.secondsAfterPublicationToConsiderCardAsNotRead = secondsAfterPublicationToConsiderCardAsNotRead;
        return this;
    }

    public setWindowInSecondsForCardSearch(windowInSecondsForCardSearch: number) {
        this.windowInSecondsForCardSearch = windowInSecondsForCardSearch;
        return this;
    }

    setConfiguration(updated: ConfigDTO) {
        this.from = updated.mailFrom;
        this.subjectPrefix = updated.subjectPrefix;
        this.bodyPrefix = updated.bodyPrefix;
        this.secondsAfterPublicationToConsiderCardAsNotRead = updated.secondsAfterPublicationToConsiderCardAsNotRead;
        this.windowInSecondsForCardSearch = updated.windowInSecondsForCardSearch;
    }

    public async checkUnreadCards() {
        const users = this.opfabServicesInterface.getUsers();
        const userLogins = users.map((u) => u.login);

        const connectedResponse = await this.opfabServicesInterface.getUsersConnected();
        if (connectedResponse.isValid()) {
            const usersToCheck = this.removeElementsFromArray(userLogins, connectedResponse.getData());
            this.logger.debug('Disconnected users ' + usersToCheck);
            if (usersToCheck.length > 0) {
                const cardFilters = [];
                const now = Date.now();
                const dateFrom = now - this.windowInSecondsForCardSearch * 1000;
                cardFilters.push({columnName: 'publishDateFrom', filter: [dateFrom], matchType: 'EQUALS'});

                const cardsResponse: GetResponse = await this.opfabServicesInterface.getCards({
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
            this.cleanCardsAreadySent();
        }
    }

    private async sendCardsToUserIfNecessary(cards: [], login: string) {
        this.logger.debug('Check user ' + login);
        const resp = await this.opfabServicesInterface.getUserSettings(login);
        if (resp.isValid()) {
            const userSettings = resp.getData();
            this.logger.debug('Got user settings ' + JSON.stringify(userSettings));
            if (this.isEmailSettingEnabled(userSettings)) {
                const userDataResp = await this.opfabServicesInterface.getUser(login);
                    if (userDataResp.isValid()) {
                        const userData = userDataResp.getData();
                        const unreadCards = await this.getCardsForUser(cards, userData, userSettings);
                        unreadCards.forEach((unreadCard: any) => {
                            if (!this.wasCardsAlreadySentToUser(unreadCard.uid, userSettings.email))
                                this.sendMail(unreadCard, userSettings.email).catch(error =>
                                    this.logger.error("error during sendMail ", error)
                                )
                        });
                    }
            }
        }
    }

    private async getCardsForUser(cards : [], user: any, settings: any) : Promise<any[]> {
        const perimetersResp = await this.opfabServicesInterface.getUserPerimeters(user.login);
        if (perimetersResp.isValid()) {
            const perimeters = perimetersResp.getData();
            this.logger.debug('Got user perimeters' + JSON.stringify(perimeters));
            return cards
            .filter(
                (card: any) =>
                CardsRoutingUtilities.shouldUserReceiveTheCard(
                        user,
                        perimeters,
                        settings,
                        card
                    ) && this.isCardUnreadForUser(card, user)
            );
        }
        return [];
    }

    private setCardSent(cardUid: string, email: string) {
        let mailSent = this.cardsAlreadySent.get(cardUid);
        if (!mailSent) mailSent = [];
        mailSent.push({email: email, date: Date.now()});
        this.cardsAlreadySent.set(cardUid, mailSent);
    }

    private wasCardsAlreadySentToUser(cardUid: string, email: string): boolean {
        const cardsRecipients = this.cardsAlreadySent.get(cardUid);
        if (!cardsRecipients) return false;
        const res = cardsRecipients.findIndex((sent: any) => sent.email === email) >= 0;
        return res;
    }

    private isEmailSettingEnabled(settings: any): boolean {
        return settings.sendCardsByEmail && settings.email;
    }

    private isCardUnreadForUser(card: any, user: any): boolean {
        return (
            card.publishDate < Date.now() - 1000 * this.secondsAfterPublicationToConsiderCardAsNotRead &&
            !card.userReads?.includes(user.login)
        );
    }

    private async sendMail(card: any, to: string) {
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
        const body =
            this.bodyPrefix +
            ' <a href="' +
            this.opfabServicesInterface.getOpfabUrl() +
            '/#/feed/cards/' +
            card.id +
            '">' +
            card.titleTranslated +
            ' - ' +
            card.summaryTranslated +
            '</a>';

        try {
            await this.mailService.sendMail(subject, body, this.from, to);
            this.setCardSent(card.uid, to);
        } catch (e) {
            this.logger.error('Error sending mail ', e);
        }
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

    private cleanCardsAreadySent() {
        const dateLimit = Date.now() - this.windowInSecondsForCardSearch * 1000;
        this.cardsAlreadySent.forEach((v, k) => {
            const maxDate = v.sort((a: any, b: any) => b.date - a.date)[0];
            if (maxDate.date < dateLimit) {
                this.cardsAlreadySent.delete(k);
            }
        });
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
