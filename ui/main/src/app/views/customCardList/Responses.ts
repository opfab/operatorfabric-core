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
import {OpfabStore} from '@ofStore/opfabStore';
import {UserPermissionsService} from '@ofServices/userPermissions/UserPermissionsService';
import {UsersService} from '@ofServices/users/UsersService';
import {ProcessesService} from '@ofServices/processes/ProcessesService';
import {AlertMessageService} from '@ofServices/alerteMessage/AlertMessageService';
import {Message, MessageLevel} from '@ofServices/alerteMessage/model/Message';

export class Responses {
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

    public addIsResponsePossibleForCardToResults(results: any[]): any[] {
        return results.map((result) => {
            const isResponsePossible = this.isResponsePossibleForCard(result.cardId);
            return {
                ...result,
                isResponsePossible
            };
        });
    }

    private isResponsePossibleForCard(cardId: string): boolean {
        const card = OpfabStore.getLightCardStore().getLightCard(cardId);
        if (!card) {
            return false;
        }
        return UserPermissionsService.isUserEnabledToRespond(
            UsersService.getCurrentUserWithPerimeters(),
            card,
            ProcessesService.getProcess(card.process)
        );
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
}
