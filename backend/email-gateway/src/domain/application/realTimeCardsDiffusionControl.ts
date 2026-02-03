/* Copyright (c) 2024-2026, RTE (http://www.rte-france.com)
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
import {htmlToText} from 'html-to-text';
import {HandlebarsHelper} from './handlebarsHelpers';
import {LightCard} from './lightCard';

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
        const users = this.emailGatewayOpfabServicesInterface.getUsers();
        const userLogins: string[] = users.map((u) => u.login);

        if (userLogins.length > 0) {
            const dateFrom = Date.now() - this.windowInSecondsForCardSearch * 1000;
            const cards = (await this.emailGatewayDatabaseService.getCards(dateFrom)) as LightCard[];
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

    async sendCardsToUserIfNecessary(lightCards: LightCard[], login: string): Promise<void> {
        this.logger.debug('Check user ' + login);

        const resp = await this.emailGatewayOpfabServicesInterface.getUserWithPerimetersByLogin(login);
        if (resp.isValid()) {
            const userWithPerimeters: UserWithPerimeters = resp.getData();
            const emailToPlainText = this.shouldEmailBePlainText(userWithPerimeters);
            const timezoneForEmails = userWithPerimeters.timezoneForEmails ?? this.defaultTimeZone;

            if (this.isEmailSettingEnabled(userWithPerimeters)) {
                this.logger.debug(
                    'Email setting enabled for ' +
                        userWithPerimeters.userData.login +
                        ' with mail ' +
                        userWithPerimeters.emailForCardSending
                );
                const cardsForUser: LightCard[] = await this.getCardsForUser(lightCards, userWithPerimeters);
                for (const cardForUser of cardsForUser) {
                    await this.sendCardIfAllowed(
                        cardForUser,
                        userWithPerimeters.emailForCardSending,
                        emailToPlainText,
                        timezoneForEmails
                    );
                }
            }
        }
    }

    async sendCardIfAllowed(
        lightCard: LightCard,
        userEmail: string | undefined,
        emailToPlainText: boolean,
        timezone: string
    ): Promise<void> {
        if (userEmail == null) return;
        try {
            const alreadySent = await this.wasCardsAlreadySentToUser(lightCard.uid, userEmail);
            if (alreadySent == null || !alreadySent) {
                if (this.isSendingAllowed(userEmail)) {
                    await this.sendMail(lightCard.id, lightCard.uid, userEmail, emailToPlainText, timezone);
                } else {
                    this.logger.warn(
                        `Send rate limit reached for ${userEmail}, not sending mail for card ${lightCard.uid}`
                    );
                    await this.emailGatewayDatabaseService.persistSentMail(lightCard.uid, userEmail);
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
        return await this.emailGatewayDatabaseService.getSentMail(cardUid, email);
    }

    isEmailSettingEnabled(userWithPerimeters: any): boolean {
        return userWithPerimeters.sendCardsByEmail === true && userWithPerimeters.emailForCardSending;
    }

    async sendMail(
        cardId: string,
        cardUid: string,
        to: string,
        emailToPlainText: boolean,
        timezone: string
    ): Promise<void> {
        let body = '';
        let attachment = [];

        let cardConfig;
        let stateName;

        try {
            const card = await this.emailGatewayDatabaseService.getCard(cardUid);
            if (!card) {
                this.logger.info('Impossible to load card ' + cardUid + ' from database');
                return;
            }
            this.logger.info('Send Mail to ' + to + ' for card ' + card.uid);

            let subject = this.subjectPrefix + ' - ' + card.titleTranslated;
            stateName = card.state;
            cardConfig = await this.businessConfigOpfabServicesInterface.fetchProcessConfig(
                card.process,
                card.processVersion
            );
            body = await this.processEmailTemplate(card, cardConfig, timezone);
            attachment = await this.processAttachmentTemplate(card, cardConfig);

            if (cardConfig?.states?.[stateName]?.email?.cardFieldUsedForSubject) {
                subject = this.getValueByPath(
                    card,
                    cardConfig.states[stateName].email.cardFieldUsedForSubject
                ) as string;
            }

            if (emailToPlainText) {
                body = htmlToText(body, {wordwrap: false, selectors: [{selector: 'table', format: 'dataTable'}]});
            }

            try {
                const from = cardConfig?.states?.[stateName]?.email?.sender ?? this.from;

                await this.mailService.sendMail(subject, body, attachment, from, to, emailToPlainText);
                this.registerNewSending(to);
                await this.emailGatewayDatabaseService.persistSentMail(card.uid, to);
            } catch (e) {
                this.logger.error('Error sending mail ', e);
            }
        } catch (e) {
            this.logger.warn(`Couldn't parse email for card id : ${cardId}, `, e);
            return;
        }
    }

    private getValueByPath<T>(obj: T, path: string): unknown {
        return path.split('.').reduce((acc: any, key) => acc?.[key], obj);
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

    async processEmailTemplate(cardContent: Card, cardConfig: any, timezone: string): Promise<string> {
        const urlOfCard =
            '<a href=" ' + this.opfabUrlInMailContent + '/#/feed/cards/' + this.base64urlEncode(cardContent.id) + ' ">';

        const stateName = cardContent.state;

        let cardBodyHtml = cardConfig?.states?.[stateName]?.email?.hideDefaultBodyPrefixAndPostfix
            ? ''
            : this.bodyPrefix + ' ';
        cardBodyHtml +=
            (this.showCardUrls ? urlOfCard : '') +
            (this.showCardTitleInBody ? this.escapeHtml(cardContent.titleTranslated) : '') +
            (this.showCardUrls ? '</a>' : '');

        if (cardConfig?.states?.[stateName]?.email?.bodyTemplate != null) {
            const templateCompiler = await this.businessConfigOpfabServicesInterface.fetchTemplate(
                cardContent.process,
                cardConfig.states[stateName].email.bodyTemplate as string,
                cardContent.processVersion
            );
            // Set timezone near templateCompiler call to avoid concurrency issues when sending multiple emails with different timezones.
            // Safe in single-threaded Node.js event loop when requests are processed sequentially.
            // Did not find a better way to pass timezone to Handlebars helpers.
            HandlebarsHelper.timezone = timezone;
            cardBodyHtml = cardBodyHtml + ' <br> ' + templateCompiler({card: cardContent, config: this.customConfig});
        }
        if (
            this.publisherEntityPrefix != null &&
            cardContent.publisher != null &&
            cardContent.publisherType === 'ENTITY'
        ) {
            const entity = await this.emailGatewayOpfabServicesInterface.getEntityById(cardContent.publisher);
            cardBodyHtml = cardBodyHtml + ' <br><br>' + this.publisherEntityPrefix + entity.name + '.';
        }
        if (this.bodyPostfix != null && !cardConfig?.states?.[stateName]?.email?.hideDefaultBodyPrefixAndPostfix) {
            cardBodyHtml = cardBodyHtml + ' <br><br>' + this.bodyPostfix;
        }
        return cardBodyHtml;
    }

    async processAttachmentTemplate(card: Card, cardConfig: any): Promise<any> {
        const attachment = [];

        const stateName = card.state;
        if (cardConfig?.states?.[stateName]?.emailAttachmentTemplate != null) {
            const templateCompiler = await this.businessConfigOpfabServicesInterface.fetchTemplate(
                card.process,
                cardConfig.states[stateName].emailAttachmentTemplate as string,
                card.processVersion
            );
            const filename = cardConfig?.states?.[stateName]?.emailAttachmentFileName ?? 'attachment';
            attachment.push({
                filename: filename,
                content: templateCompiler({card: card, config: this.customConfig})
            });
        }
        return attachment;
    }

    async cleanCardsAlreadySent(): Promise<void> {
        const dateLimit = Date.now() - this.windowInSecondsForCardSearch * 1000;
        await this.emailGatewayDatabaseService.deleteMailsSentBefore(dateLimit);
    }

    getFormattedDateAndTimeFromEpochDate(epochDate: number | undefined, timezoneForEmails: string): string {
        if (epochDate == null) {
            return '';
        }
        return formatInTimeZone(epochDate, timezoneForEmails, 'dd/MM/yyyy HH:mm');
    }
}
