/* Copyright (c) 2024-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
import {Card} from '../../model/Card';
import {ShowAcknowledgmentFooterEnum} from '@ofServices/processes/model/Processes';
import {UserWithPerimeters} from '@ofServices/users/model/UserWithPerimeters';
import {Utilities} from '../../utils/utilities';
import {ProcessesService} from '@ofServices/processes/ProcessesService';
import {ConfigService} from 'app/services/config/ConfigService';
import {UserPermissionsService} from '@ofServices/userPermissions/UserPermissionsService';

export class CardBodyView {
    private readonly alwaysShowAcknowledgmentFooter: boolean;
    private readonly card: Card;
    private cards: Card[];
    private readonly userWithPerimeters: UserWithPerimeters;

    constructor(card: Card, userWithPerimeters: UserWithPerimeters) {
        this.card = card;
        this.userWithPerimeters = userWithPerimeters;
        this.alwaysShowAcknowledgmentFooter = ConfigService.getConfigValue('settings.showAcknowledgmentFooter', false);
    }

    public isCardAcknowledgedFooterVisible() {
        let entityRecipientsToAck = [];
        if (this.card.entityRecipients) {
            entityRecipientsToAck = Utilities.removeElementsFromArray(
                this.card.entityRecipients,
                this.card.entityRecipientsForInformation
            );
        }

        return entityRecipientsToAck.length > 0 && this.isUserAuthorizedToSeeAcknowledgmentFooter();
    }

    private isUserAuthorizedToSeeAcknowledgmentFooter() {
        const showAcknowledgmentFooter = ProcessesService.getShowAcknowledgmentFooterForACard(this.card);

        if (showAcknowledgmentFooter === ShowAcknowledgmentFooterEnum.FOR_ALL_USERS) {
            return true;
        }
        if (showAcknowledgmentFooter === ShowAcknowledgmentFooterEnum.NEVER) {
            return false;
        }
        if (showAcknowledgmentFooter === ShowAcknowledgmentFooterEnum.ONLY_FOR_USERS_ALLOWED_TO_EDIT) {
            return (
                UserPermissionsService.doesTheUserHavePermissionToEditCard(this.userWithPerimeters, this.card) ||
                this.alwaysShowAcknowledgmentFooter
            );
        }
        return this.isCardPublishedByUserEntity() || this.alwaysShowAcknowledgmentFooter;
    }

    private isCardPublishedByUserEntity(): boolean {
        return (
            this.card.publisherType === 'ENTITY' &&
            this.userWithPerimeters.userData.entities.includes(this.card.publisher)
        );
    }

    public setCards(cards: Card[]) {
        this.cards = cards;
    }

    public getNextCardIdToOpenAfterAck(): string | undefined {
        if (!this.cards) return undefined;
        const currentCardIndex = this.cards.findIndex((card) => card.id === this.card.id);
        const isLastCard = currentCardIndex === this.cards.length - 1;
        const nextCardIndex = isLastCard ? currentCardIndex - 1 : currentCardIndex + 1;
        return nextCardIndex >= 0 ? this.cards[nextCardIndex].id : undefined;
    }
}
