/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import GetResponse from '../../common/server-side/getResponse';
import OpfabServicesInterface from '../../common/server-side/opfabServicesInterface';
import {Card} from './card';

export default class AcknowledgementChecker {
    private opfabInterface: OpfabServicesInterface;
    private logger: any;
    private secondsAfterPublicationToConsiderCardAsNotAcknowledged: number;
    private processStatesFilter: any;
    private windowInSecondsForCardSearch: number;
    private unackedCardTemplate: any = '';
    private readonly cardsAlreadySent = new Map();

    public setOpfabServicesInterface(opfabInterface: OpfabServicesInterface): this {
        this.opfabInterface = opfabInterface;
        return this;
    }

    public setLogger(logger: any): this {
        this.logger = logger;
        return this;
    }

    public setSecondsAfterPublicationToConsiderCardAsNotAcknowledged(
        secondsAfterPublicationToConsiderCardAsNotAcknowledged: number
    ): this {
        this.secondsAfterPublicationToConsiderCardAsNotAcknowledged =
            secondsAfterPublicationToConsiderCardAsNotAcknowledged;
        return this;
    }

    public setWindowInSecondsForCardSearch(windowInSecondsForCardSearch: number): this {
        this.windowInSecondsForCardSearch = windowInSecondsForCardSearch;
        return this;
    }

    public setUnackedCardTemplate(unackedCardTemplate: any): this {
        this.unackedCardTemplate = unackedCardTemplate;
        return this;
    }

    public setProcessStatesToSupervise(processStates: any[]): this {
        const processStatesKeys: string[] = [];
        processStates.forEach((processStatesConfiguration: any) => {
            processStatesConfiguration.states.forEach((state: string) => {
                processStatesKeys.push(processStatesConfiguration.process + '.' + state);
            });
        });

        this.processStatesFilter = {columnName: 'processStateKey', filter: processStatesKeys, matchType: 'IN'};

        return this;
    }

    public resetState(): void {
        this.cardsAlreadySent.clear();
    }

    public async checkAcknowledgment(): Promise<void> {
        const cardFilters = [];
        cardFilters.push(this.processStatesFilter);
        const now = Date.now();
        const dateFrom = now - this.windowInSecondsForCardSearch * 1000;
        cardFilters.push({columnName: 'publishDateFrom', filter: [dateFrom], matchType: 'EQUALS'});

        const GetResponse: GetResponse = await this.opfabInterface.getCards({adminMode: true, filters: cardFilters});
        if (!GetResponse.isValid()) return;

        const retrievedCards: Card[] = GetResponse.getData() as Card[];

        for (let i = 0; i < retrievedCards.length; i++) {
            const card = retrievedCards[i];
            let recipients = card.entityRecipients;

            if (
                recipients != null &&
                recipients.length > 0 &&
                card.entityRecipientsForInformation != null &&
                card.entityRecipientsForInformation.length > 0
            )
                recipients = this.removeElementsFromArray(recipients, card.entityRecipientsForInformation);

            if (
                recipients != null &&
                recipients.length > 0 &&
                (card.entitiesAcks == null || card.entitiesAcks.length < recipients.length) &&
                card.publishDate < now - this.secondsAfterPublicationToConsiderCardAsNotAcknowledged * 1000 &&
                !this.cardsAlreadySent.has(card.uid)
            ) {
                this.logger.info(card.uid + ' not acknowledged');

                const missingAcks = this.removeElementsFromArray(recipients, card.entitiesAcks ?? []).join(',');

                this.sendUnacknowlegedCard(card, missingAcks)
                    .then(() => this.cardsAlreadySent.set(card.uid, now))
                    .catch((err) => {
                        this.logger.error('Error sending unacknowledged card ' + card.uid + ' : ' + err);
                    });
            }
        }
        this.cleanCardsAreadySent();
    }

    private async sendUnacknowlegedCard(unackedCard: Card, missingAcks: string): Promise<any> {
        const card: Card = {...this.unackedCardTemplate};
        card.startDate = new Date().valueOf();
        card.processInstanceId = unackedCard.id;
        if (unackedCard.publisherType === 'ENTITY') {
            card.entityRecipients = [unackedCard.publisher];
        } else {
            card.userRecipients = [unackedCard.publisher];
        }
        card.data = {
            cardId: unackedCard.id,
            title: unackedCard.titleTranslated,
            summary: unackedCard.summaryTranslated,
            missingAcks
        };
        card.title = {
            key: 'acknowledgement.title',
            parameters: {
                cardId: unackedCard.id,
                title: unackedCard.titleTranslated,
                summary: unackedCard.summaryTranslated,
                missingAcks
            }
        };
        card.summary = {
            key: 'acknowledgement.summary',
            parameters: {
                cardId: unackedCard.id,
                title: unackedCard.titleTranslated,
                summary: unackedCard.summaryTranslated,
                missingAcks
            }
        };

        await this.opfabInterface.sendCard(card);
    }

    private removeElementsFromArray(arrayToFilter: string[], arrayToDelete: string[]): string[] {
        if (arrayToDelete?.length > 0) {
            const elementsToDeleteSet = new Set(arrayToDelete);
            const newArray = arrayToFilter.filter((name) => {
                return !elementsToDeleteSet.has(name);
            });
            return newArray;
        } else {
            return arrayToFilter;
        }
    }

    private cleanCardsAreadySent(): void {
        const dateLimit = Date.now() - this.windowInSecondsForCardSearch * 1000;
        this.cardsAlreadySent.forEach((v, k) => {
            if (v < dateLimit) {
                this.cardsAlreadySent.delete(k);
            }
        });
    }
}
