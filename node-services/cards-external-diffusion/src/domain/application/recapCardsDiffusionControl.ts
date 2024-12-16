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
const MILLISECONDS_IN_A_WEEK = 7 * MILLISECONDS_IN_A_DAY;

export default class RecapCardsDiffusionControl extends CardsDiffusionControl {
    opfabUrlInMailContent: any;

    protected dailyEmailTitle: string;
    protected weeklyEmailTitle: string;
    protected titlePrefix: string;

    protected dailyEmailBodyPrefix: string;
    protected weeklyEmailBodyPrefix: string;

    public setDailyEmailTitle(dailyEmailTitle: string): this {
        this.dailyEmailTitle = dailyEmailTitle;
        return this;
    }

    public setWeeklyEmailTitle(weeklyEmailTitle: string): this {
        this.weeklyEmailTitle = weeklyEmailTitle;
        return this;
    }

    public setDailyEmailBodyPrefix(dailyEmailBodyPrefix: string): this {
        this.dailyEmailBodyPrefix = dailyEmailBodyPrefix;
        return this;
    }

    public setWeeklyEmailBodyPrefix(weeklyEmailBodyPrefix: string): this {
        this.weeklyEmailBodyPrefix = weeklyEmailBodyPrefix;
        return this;
    }

    public setConfiguration(updated: ConfigDTO): void {
        this.from = updated.mailFrom;
        this.dailyEmailTitle = updated.dailyEmailTitle;
        this.weeklyEmailTitle = updated.weeklyEmailTitle;
        this.dailyEmailBodyPrefix = updated.dailyEmailBodyPrefix;
        this.weeklyEmailBodyPrefix = updated.weeklyEmailBodyPrefix;
    }

    public async checkCardsStartingFrom(mode: string): Promise<void> {
        const users = this.cardsExternalDiffusionOpfabServicesInterface.getUsers();
        const userLogins = users.map((u) => u.login);

        const dateFrom = this.getStartingDate(mode);

        const cards = (await this.cardsExternalDiffusionDatabaseService.getCards(dateFrom)) as Card[];

        for (const login of userLogins) {
            try {
                const resp = await this.cardsExternalDiffusionOpfabServicesInterface.getUserWithPerimetersByLogin(
                    login as string
                );
                if (resp.isValid()) {
                    const userWithPerimeters = resp.getData() as UserWithPerimeters;
                    const timezoneForEmails = userWithPerimeters.timezoneForEmails ?? this.defaultTimeZone;
                    const emailToPlainText = this.shouldEmailBePlainText(userWithPerimeters);
                    const visibleCards = cards.filter((card: Card) =>
                        CardsRoutingUtilities.shouldUserReceiveTheCard(userWithPerimeters, card)
                    );
                    if (visibleCards.length > 0) {
                        if (mode === 'daily' && userWithPerimeters.sendDailyEmail) {
                            await this.sendEmailRecap(
                                visibleCards,
                                userWithPerimeters.email,
                                emailToPlainText,
                                this.dailyEmailTitle,
                                this.dailyEmailBodyPrefix,
                                timezoneForEmails
                            );
                            this.logger.info(`Sent daily recap to user ${login}`);
                        } else if (mode === 'weekly' && userWithPerimeters.sendWeeklyEmail) {
                            await this.sendEmailRecap(
                                visibleCards,
                                userWithPerimeters.email,
                                emailToPlainText,
                                this.weeklyEmailTitle,
                                this.weeklyEmailBodyPrefix,
                                timezoneForEmails
                            );
                            this.logger.info(`Sent weekly recap to user ${login}`);
                        }
                    }
                }
            } catch (error) {
                this.logger.error(
                    `Failed to send ${mode} recap email to user ${login}. Error: ` + JSON.stringify(error)
                );
            }
        }
    }

    private getStartingDate(mode: string): number {
        let dateFrom = 0;
        switch (mode) {
            case 'daily':
                dateFrom = Date.now() - MILLISECONDS_IN_A_DAY;
                break;
            case 'weekly':
                dateFrom = Date.now() - MILLISECONDS_IN_A_WEEK;
                break;
            default:
                this.logger.error(`Unknown email recap mode: ${mode} `);
        }
        return dateFrom;
    }

    async sendEmailRecap(
        cards: Card[],
        userEmailAddress: string | undefined,
        emailToPlainText: boolean,
        emailTitle: string,
        emailBodyPrefix: string,
        timezoneForEmails: string
    ): Promise<void> {
        if (userEmailAddress == null) return;
        const emailBody = this.recapFormat(cards, emailBodyPrefix, timezoneForEmails);
        await this.mailService.sendMail(emailTitle, emailBody, this.from, userEmailAddress, emailToPlainText);
    }

    recapFormat(cards: Card[], emailBodyPrefix: string, timezoneForEmails: string): string {
        let body = emailBodyPrefix + '</br></br>\n';
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
