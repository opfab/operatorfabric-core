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
import CardsDiffusionControl from './cardsDiffusionControl';
import {UserWithPerimeters} from './userWithPerimeter';
import {Card} from './card';

const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000;

export default class DailyCardsDiffusionControl extends CardsDiffusionControl {
    opfabUrlInMailContent: any;

    protected dailyEmailTitle: string;
    protected titlePrefix: string;

    public setDailyEmailTitle(dailyEmailTitle: string): this {
        this.dailyEmailTitle = dailyEmailTitle;
        return this;
    }

    public setConfiguration(updated: ConfigDTO): void {
        this.from = updated.mailFrom;
        this.dailyEmailTitle = updated.dailyEmailTitle;
    }

    public async checkCardsOfTheDay(limitDateForRecap: number = Date.now()): Promise<void> {
        const users = this.cardsExternalDiffusionOpfabServicesInterface.getUsers();
        const userLogins = users.map((u) => u.login);

        const dateFrom = limitDateForRecap - MILLISECONDS_IN_A_DAY;
        const cards = (await this.cardsExternalDiffusionDatabaseService.getCards(dateFrom)) as Card[];
        for (const login of userLogins) {
            try {
                const resp = await this.cardsExternalDiffusionOpfabServicesInterface.getUserWithPerimetersByLogin(
                    login as string
                );
                if (resp.isValid()) {
                    const userWithPerimeters = resp.getData() as UserWithPerimeters;
                    const timezoneForEmails = userWithPerimeters.timezoneForEmails ?? 'Europe/Paris';

                    if (userWithPerimeters.sendDailyEmail) {
                        const emailToPlainText = this.shouldEmailBePlainText(userWithPerimeters);
                        const visibleCards = cards.filter((card: Card) =>
                            CardsRoutingUtilities.shouldUserReceiveTheCard(userWithPerimeters, card)
                        );
                        if (visibleCards.length > 0) {
                            await this.sendDailyRecap(
                                visibleCards,
                                userWithPerimeters.email,
                                emailToPlainText,
                                timezoneForEmails
                            );
                            this.logger.info(`Sent daily recap to user ${login}`);
                        }
                    }
                }
            } catch (error) {
                this.logger.error(`Failed to send daily recap email to user ${login}. Error: ` + JSON.stringify(error));
            }
        }
    }

    async sendDailyRecap(
        cards: Card[],
        userEmailAddress: string | undefined,
        emailToPlainText: boolean,
        timezoneForEmails: string
    ): Promise<void> {
        if (userEmailAddress == null) return;
        const emailBody = this.dailyFormat(cards, timezoneForEmails);
        await this.mailService.sendMail(this.dailyEmailTitle, emailBody, this.from, userEmailAddress, emailToPlainText);
    }

    dailyFormat(cards: Card[], timezoneForEmails: string): string {
        let body = '';
        for (const card of cards) {
            body += this.getFormattedDateAndTimeFromEpochDate(card.startDate, timezoneForEmails) + ' - ';
            if (card.endDate != null)
                body += this.getFormattedDateAndTimeFromEpochDate(card.endDate, timezoneForEmails) + ' - ';
            body +=
                card.severity +
                ' - ' +
                '<a href=" ' +
                this.opfabUrlInMailContent +
                '/#/feed/cards/' +
                card.id +
                ' ">' +
                this.escapeHtml(card.titleTranslated) +
                ' - ' +
                this.escapeHtml(card.summaryTranslated) +
                '</a></br></br>\n';
        }
        return body;
    }
}
