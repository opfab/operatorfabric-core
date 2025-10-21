/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ConsideredAcknowledgedForUserWhenEnum} from '@ofServices/processes/model/Processes';
import {Card} from 'app/model/Card';
import {PermissionEnum} from '@ofServices/groups/model/PermissionEnum';
import {ProcessesService} from '../processes/ProcessesService';
import {UsersService} from '../users/UsersService';
import {AcknowledgeUtils} from './AcknowledgeUtils';

export class AcknowledgeStatus {
    public static isCardAcknowledgedForCurrentUser(card: Card): boolean {
        if (AcknowledgeStatus.doWeConsiderAckAtTheUserLevel(card)) {
            return card.hasBeenAcknowledged;
        } else {
            return AcknowledgeStatus.hasCardBeenAcknowledgedByAllUserEntities(card);
        }
    }

    private static doWeConsiderAckAtTheUserLevel(card: Card): boolean {
        const consideredAcknowledgedForUserWhen =
            ProcessesService.getConsideredAcknowledgedForUserWhenForALightCard(card);
        return (
            consideredAcknowledgedForUserWhen === ConsideredAcknowledgedForUserWhenEnum.USER_HAS_ACKNOWLEDGED ||
            UsersService.hasCurrentUserAnyPermission([PermissionEnum.READONLY])
        );
    }

    private static hasCardBeenAcknowledgedByAllUserEntities(card: Card): boolean {
        const listEntitiesToAck = AcknowledgeStatus.getEntitiesAllowedToAcknowledge(card);

        if (!AcknowledgeStatus.doEntityRecipientsIncludeAtLeastOneEntityOfUser(listEntitiesToAck)) {
            return card.hasBeenAcknowledged;
        }

        let entitiesNotAcked = listEntitiesToAck;
        if (card.entitiesAcks)
            entitiesNotAcked = listEntitiesToAck.filter((entityId) => card.entitiesAcks.indexOf(entityId) < 0);

        const userEntitiesNotAcked = entitiesNotAcked.filter((entityId) => {
            return UsersService.getCurrentUserWithPerimeters().userData.entities.includes(entityId);
        });
        return userEntitiesNotAcked.length === 0;
    }

    private static doEntityRecipientsIncludeAtLeastOneEntityOfUser(entitiesToAck: string[]): boolean {
        const entitiesOfUserThatAreRecipients = entitiesToAck.filter((entityId) => {
            return UsersService.getCurrentUserWithPerimeters().userData.entities.includes(entityId);
        });
        return entitiesOfUserThatAreRecipients.length > 0;
    }

    private static getEntitiesAllowedToAcknowledge(card: Card): string[] {
        const entities = [];

        if (card.publisherType === 'ENTITY' && card.publisher) {
            entities.push(card.publisher);
        }
        if (card.entityRecipients) {
            entities.push(...card.entityRecipients);
        }
        const entitiesAllowed = AcknowledgeUtils.getEntitiesAllowedToAcknowledge(entities);

        return Array.from(entitiesAllowed);
    }
}
