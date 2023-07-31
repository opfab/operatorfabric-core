/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import GetResponse from '../../common/server-side/getResponse';
import OpfabServicesInterface from '../../common/server-side/opfabServicesInterface';

export default class AcknowledgementChecker {

    private opfabInterface: OpfabServicesInterface;
    private logger: any;
    private secondsAfterPublicationToConsiderCardAsNotAcknowledged: number;
    private processStatesFilter: any;
    private windowInSecondsForCardSearch : number;
    private unackedCardTemplate: any = '';
    private cardsAlreadySent = new Map();


    public setOpfabServicesInterface(opfabInterface: OpfabServicesInterface) {
        this.opfabInterface = opfabInterface;
        return this;
    }

    public setLogger(logger: any) {
        this.logger = logger;
        return this;
    }

    public setSecondsAfterPublicationToConsiderCardAsNotAcknowledged(secondsAfterPublicationToConsiderCardAsNotAcknowledged: number) {
        this.secondsAfterPublicationToConsiderCardAsNotAcknowledged = secondsAfterPublicationToConsiderCardAsNotAcknowledged;
        return this;
    }


    public setWindowInSecondsForCardSearch (windowInSecondsForCardSearch : number) {
        this.windowInSecondsForCardSearch  = windowInSecondsForCardSearch ;
        return this;
    }

    public setUnackedCardTemplate(unackedCardTemplate: any) {
        this.unackedCardTemplate = unackedCardTemplate;
        return this;
    }

    public setProcessStatesToSupervise(processStates: any[]) {
        const processStatesKeys: string[] = [];
        processStates.forEach((processStatesConfiguration: any) => {
            processStatesConfiguration.states.forEach((state: string) => {
                 
                processStatesKeys.push(processStatesConfiguration.process + '.' + state);
            });
        });
            
        this.processStatesFilter = {columnName : 'processStateKey', filter: processStatesKeys, matchType: 'IN' };
            
        return this;
    }

    public resetState() {
        this.cardsAlreadySent.clear();
    }

    public async checkAcknowledgment() {
        const cardFilters = [];
        cardFilters.push(this.processStatesFilter);
        const now = Date.now(); 
        const dateFrom = now - (this.windowInSecondsForCardSearch  * 1000);  
        cardFilters.push({columnName : 'publishDateFrom', filter: [dateFrom], matchType: 'EQUALS' });


        const GetResponse: GetResponse = await this.opfabInterface.getCards({adminMode: true, filters: cardFilters});
        if (!GetResponse.isValid()) return;
        
        const retrievedCards = GetResponse.getData();

        retrievedCards.forEach(async (card: any) => {
            let recipients = card.entityRecipients;
            if (recipients && card.entityRecipientsForInformation && card.entityRecipientsForInformation.length > 0)
                recipients = this.removeElementsFromArray(recipients, card.entityRecipientsForInformation);

            if (recipients && (!card.entitiesAcks || card.entitiesAcks.length < recipients.length) 
                && card.publishDate < now - (this.secondsAfterPublicationToConsiderCardAsNotAcknowledged  * 1000)
                && !this.cardsAlreadySent.has(card.uid)) {
                    
                this.logger.info(card.uid + ' not ackmowledged');

                const missingAcks = this.removeElementsFromArray(recipients, card.entitiesAcks).join(',');

                this.sendUnacknowlegedCard(card, missingAcks).then(() => this.cardsAlreadySent.set(card.uid, now));
            }
            
        });
        this.cleanCardsAreadySent();
    }


    private async sendUnacknowlegedCard(unackedCard: any, missingAcks: string) {
        const card = Object.assign({}, this.unackedCardTemplate);
        card.startDate = new Date().valueOf();
        card.processInstanceId = unackedCard.id;
        if (unackedCard.publisherType === 'ENTITY') {
            card.entityRecipients = [unackedCard.publisher];
        } else {
            card.userRecipients = [unackedCard.publisher];

        }
        card.data = {cardId: unackedCard.id, title: unackedCard.titleTranslated, summary: unackedCard.summaryTranslated, missingAcks: missingAcks};
        card.title = {key: 'acknowledgement.title', parameters: {cardId: unackedCard.id, title: unackedCard.titleTranslated, summary: unackedCard.summaryTranslated, missingAcks: missingAcks}};
        card.summary = {key: 'acknowledgement.summary', parameters: {cardId: unackedCard.id, title: unackedCard.titleTranslated, summary: unackedCard.summaryTranslated, missingAcks: missingAcks}};
        
        return this.opfabInterface.sendCard(card);
    }

    private removeElementsFromArray(arrayToFilter: string[], arrayToDelete: string[]): string[] {
        if ((arrayToDelete) && (arrayToDelete.length > 0)) {
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
        this.cardsAlreadySent.forEach((v,k) => {
            if (v < dateLimit) {
                this.cardsAlreadySent.delete(k);

            }
        })
    }
    
}
