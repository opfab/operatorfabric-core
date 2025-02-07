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

    public isResponsePossibleForCard(cardId: string): boolean {
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

    public async sendResponse(buttonId: string, selectedCardIds: string[]): Promise<void> {
        const button = this.customScreenDefinition.responseButtons.find(
            (button: ResponseButton) => button.id === buttonId
        );
        if (button) {
            const selectedCards = this.getCards(selectedCardIds);
            const responses = button.getUserResponses(selectedCards);
            if (responses?.responseCards) {
                for (let index = 0; index < responses.responseCards.length; index++) {
                    const response = responses.responseCards[index];
                    await CardResponseService.sendResponse(selectedCards[index], response);
                }
            }
        }
    }

    private getCards(selectedCardIds: string[]): Card[] {
        const cards: Card[] = [];
        selectedCardIds.forEach((cardId) => {
            const card = OpfabStore.getLightCardStore().getLightCard(cardId);
            if (card) {
                cards.push(card);
            }
        });
        return cards;
    }
}
