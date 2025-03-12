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
import {EntitiesService} from '../entities/EntitiesService';
import {UsersService} from '../users/UsersService';

export class AcknowledgeStatus {
    public static hasLightCardBeenAcknowledgedByUserOrByUserEntity(lightCard: Card): boolean {
        const consideredAcknowledgedForUserWhen =
            ProcessesService.getConsideredAcknowledgedForUserWhenForALightCard(lightCard);

        if (AcknowledgeStatus.areWeInModeUserHasAcknowledged(lightCard, consideredAcknowledgedForUserWhen)) {
            return lightCard.hasBeenAcknowledged;
        } else {
            return AcknowledgeStatus.hasLightCardBeenAcknowledgedByUserEntity(
                lightCard,
                consideredAcknowledgedForUserWhen
            );
        }
    }

    private static areWeInModeUserHasAcknowledged(
        lightCard: Card,
        consideredAcknowledgedForUserWhen: ConsideredAcknowledgedForUserWhenEnum
    ): boolean {
        return (
            consideredAcknowledgedForUserWhen === ConsideredAcknowledgedForUserWhenEnum.USER_HAS_ACKNOWLEDGED ||
            UsersService.hasCurrentUserAnyPermission([PermissionEnum.READONLY]) ||
            !lightCard.entityRecipients?.length ||
            !AcknowledgeStatus.doEntityRecipientsIncludeAtLeastOneEntityOfUser(lightCard)
        );
    }

    private static doEntityRecipientsIncludeAtLeastOneEntityOfUser(lightCard: Card): boolean {
        const entitiesOfUserThatAreRecipients = lightCard.entityRecipients.filter((entityId) => {
            return (
                EntitiesService.isEntityAllowedToSendCard(entityId) &&
                UsersService.getCurrentUserWithPerimeters().userData.entities.includes(entityId)
            );
        });
        return entitiesOfUserThatAreRecipients.length > 0;
    }

    private static hasLightCardBeenAcknowledgedByUserEntity(
        lightCard: Card,
        consideredAcknowledgedForUserWhen: ConsideredAcknowledgedForUserWhenEnum
    ): boolean {
        const listEntitiesToAck = AcknowledgeStatus.computeListEntitiesToAck(lightCard);

        if (
            AcknowledgeStatus.isMemberOfEntityThatPublishedTheCard(lightCard) &&
            !lightCard.entitiesAcks?.includes(lightCard.publisher)
        ) {
            return false;
        }

        if (listEntitiesToAck?.length > 0) {
            return AcknowledgeStatus.checkIsAcknowledgedForTheCaseOfAllEntitiesMustAckTheCard(
                consideredAcknowledgedForUserWhen,
                lightCard,
                listEntitiesToAck
            );
        }
        return false;
    }

    private static checkIsAcknowledgedForTheCaseOfAllEntitiesMustAckTheCard(
        consideredAcknowledgedForUserWhen: ConsideredAcknowledgedForUserWhenEnum,
        lightCard: Card,
        listEntitiesToAck: string[]
    ): boolean {
        if (
            consideredAcknowledgedForUserWhen ===
                ConsideredAcknowledgedForUserWhenEnum.ALL_ENTITIES_OF_USER_HAVE_ACKNOWLEDGED &&
            lightCard.entitiesAcks
        ) {
            // We compute the entities for which the ack is pending
            const entitiesWaitedForAck = listEntitiesToAck.filter(
                (entityId) => lightCard.entitiesAcks.indexOf(entityId) < 0
            );

            const entitiesOfUserAndWaitedForAck = entitiesWaitedForAck.filter((entityId) => {
                return (
                    EntitiesService.isEntityAllowedToSendCard(entityId) &&
                    UsersService.getCurrentUserWithPerimeters().userData.entities.includes(entityId)
                );
            });
            return entitiesOfUserAndWaitedForAck.length === 0;
        } else return false;
    }

    private static isMemberOfEntityThatPublishedTheCard(lightCard: Card): boolean {
        if (
            lightCard.publisherType === 'ENTITY' &&
            UsersService.getCurrentUserWithPerimeters().userData.entities?.includes(lightCard.publisher)
        ) {
            return true;
        } else {
            return false;
        }
    }

    private static computeListEntitiesToAck(lightCard: Card): string[] {
        const listEntitiesToAck = [];

        if (lightCard.entityRecipients) {
            const listOfEntityRecipients = EntitiesService.getEntitiesFromIds(lightCard.entityRecipients);
            if (listOfEntityRecipients)
                EntitiesService.resolveEntitiesAllowedToSendCards(listOfEntityRecipients).forEach((entityToAdd) =>
                    listEntitiesToAck.push(entityToAdd.id)
                );
        }
        return listEntitiesToAck;
    }
}
