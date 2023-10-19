/* Copyright (c) 2023, RTE (http://www.rte-france.com)
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

export default class CardsDiffusionControl {
    opfabUrlInMailContent: any;

    private opfabServicesInterface: CardsExternalDiffusionOpfabServicesInterface;
    private logger: any;
    private secondsAfterPublicationToConsiderCardAsNotRead: number;
    private windowInSecondsForCardSearch: number;
    private cardsAlreadySent = new Map();
    private mailService: SendMailService;
    private from: string;
    private subjectPrefix: string;
    private bodyPrefix: string;

    public setOpfabServicesInterface(opfabServicesInterface: CardsExternalDiffusionOpfabServicesInterface) {
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
            const connectedUsers = connectedResponse.getData().map((u: {login: string;}) => u.login);
            const usersToCheck = this.removeElementsFromArray(userLogins, connectedUsers);
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
        
        const resp = await this.opfabServicesInterface.getUserWithPerimetersByLogin(login);
        if (resp.isValid()) {
            const userWithPerimeters = resp.getData();
            this.logger.debug('Got user with perimeters ' + JSON.stringify(userWithPerimeters));
            if (this.isEmailSettingEnabled(userWithPerimeters)) {
                const unreadCards = await this.getCardsForUser(cards, userWithPerimeters);
                unreadCards.forEach((unreadCard: any) => {
                    if (!this.wasCardsAlreadySentToUser(unreadCard.uid, userWithPerimeters.email))
                        this.sendMail(unreadCard, userWithPerimeters.email).catch(error =>
                            this.logger.error("error during sendMail ", error)
                        )
                });
            }
        }

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

    private isEmailSettingEnabled(userWithPerimeters: any): boolean {
        return userWithPerimeters.sendCardsByEmail && userWithPerimeters.email;
    }

    private isCardUnreadForUser(card: any, user: any): boolean {
        return (
            card.publishDate < Date.now() - 1000 * this.secondsAfterPublicationToConsiderCardAsNotRead &&
            !card.usersReads?.includes(user.login)
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
            this.opfabUrlInMailContent +
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
