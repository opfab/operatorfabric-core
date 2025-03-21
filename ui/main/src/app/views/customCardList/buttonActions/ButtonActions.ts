/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CardResponseService} from '@ofServices/cardResponse/CardResponseService';
import {CustomScreenDefinition, ResponseButton} from '@ofServices/customScreen/model/CustomScreenDefinition';
import {Card} from 'app/model/Card';
import {OpfabStore} from '@ofStore/OpfabStore';
import {AlertMessageService} from '@ofServices/alerteMessage/AlertMessageService';
import {Message, MessageLevel} from '@ofServices/alerteMessage/model/Message';
import {AcknowledgeService} from '@ofServices/acknowlegment/AcknowledgeService';

export class ButtonActions {
    private readonly customScreenDefinition: CustomScreenDefinition;

    constructor(customScreenDefinition: CustomScreenDefinition) {
        this.customScreenDefinition = customScreenDefinition;
    }

    public getResponseButtons(): {id: string; label: string}[] {
        if (!this.customScreenDefinition.responseButtons) {
            return [];
        }
        return this.customScreenDefinition.responseButtons.map((button: ResponseButton) => {
            return {
                id: button.id,
                label: button.label
            };
        });
    }

    public async sendResponsesWhenUserClicksOnResponseButton(
        buttonId: string,
        responsesData: Map<string, unknown>
    ): Promise<void> {
        const button = this.customScreenDefinition.responseButtons.find(
            (button: ResponseButton) => button.id === buttonId
        );
        if (button) {
            const selectedCards = this.getCards(responsesData);
            const responses = button.getUserResponses(selectedCards, responsesData);
            if (responses.valid) {
                await this.sendResponseCards(responses, selectedCards);
            } else {
                AlertMessageService.sendAlertMessage(new Message(responses.errorMsg, MessageLevel.ERROR));
            }
        }
    }

    private async sendResponseCards(responses: any, selectedCards: Card[]) {
        if (responses?.responseCards) {
            for (const [index, response] of responses.responseCards.entries()) {
                try {
                    await CardResponseService.sendResponse(selectedCards[index], response);
                } catch (error) {
                    AlertMessageService.sendAlertMessage(new Message(error.message, MessageLevel.ERROR));
                }
            }
        }
    }

    private getCards(responsesData: Map<string, unknown>): Card[] {
        const cards: Card[] = [];
        responsesData.forEach((_value, key) => {
            const card = OpfabStore.getLightCardStore().getLightCard(key);
            if (card) {
                cards.push(card);
            }
        });

        return cards;
    }

    public isAcknowledgmentButtonVisible(): boolean {
        return this.customScreenDefinition.showAcknowledgmentButton;
    }

    public sendAcknowledgments(cardIds: string[]) {
        cardIds.forEach((cardId) => {
            const card = OpfabStore.getLightCardStore().getLightCard(cardId);
            AcknowledgeService.postAcknowledgement(card).subscribe();
        });
    }
}
