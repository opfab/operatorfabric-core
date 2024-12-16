/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AcknowledgmentAllowedEnum, ConsideredAcknowledgedForUserWhenEnum, Process} from '@ofModel/processes.model';
import {Card} from '@ofModel/card.model';
import {UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {LightCard} from '@ofModel/light-card.model';
import {Observable} from 'rxjs';
import {AcknowledgeServer} from './server/AcknowledgeServer';
import {ServerResponse} from '../../business/server/serverResponse';
import {UserPermissionsService} from 'app/business/services/user-permissions.service';
import {PermissionEnum} from '@ofModel/permission.model';
import {ProcessesService} from '../../business/services/businessconfig/processes.service';
import {EntitiesService} from '../../business/services/users/entities.service';
import {UserService} from '../../business/services/users/user.service';

export class AcknowledgeService {
    private static acknowledgeServer: AcknowledgeServer;

    public static setAcknowledgeServer(acknowledgeServer: AcknowledgeServer) {
        AcknowledgeService.acknowledgeServer = acknowledgeServer;
    }

    public static postUserAcknowledgement(cardUid: string, entitiesAcks: string[]): Observable<ServerResponse<void>> {
        return AcknowledgeService.acknowledgeServer.postUserAcknowledgement(cardUid, entitiesAcks);
    }

    public static deleteUserAcknowledgement(cardUid: string, entitiesAcks: string[]): Observable<ServerResponse<void>> {
        return AcknowledgeService.acknowledgeServer.deleteUserAcknowledgement(cardUid, entitiesAcks);
    }

    public static isAcknowledgmentAllowed(
        user: UserWithPerimeters,
        card: Card | LightCard,
        processDefinition: Process
    ): boolean {
        if (!processDefinition) return true;
        const state = processDefinition.states.get(card.state);

        if (!state?.acknowledgmentAllowed) return true;

        const isUserEnabledToRespond = UserPermissionsService.isUserEnabledToRespond(user, card, processDefinition);

        return (
            state.acknowledgmentAllowed === AcknowledgmentAllowedEnum.ALWAYS ||
            (state.acknowledgmentAllowed === AcknowledgmentAllowedEnum.ONLY_WHEN_RESPONSE_DISABLED_FOR_USER &&
                (UserService.hasCurrentUserAnyPermission([PermissionEnum.READONLY]) ||
                    !isUserEnabledToRespond ||
                    (isUserEnabledToRespond && AcknowledgeService.isLttdExpired(card))))
        );
    }

    private static isLttdExpired(card): boolean {
        return card.lttd != null && card.lttd - new Date().getTime() <= 0;
    }

    public static isLightCardHasBeenAcknowledgedByUserOrByUserEntity(lightCard: LightCard): boolean {
        const consideredAcknowledgedForUserWhen =
            ProcessesService.getConsideredAcknowledgedForUserWhenForALightCard(lightCard);

        if (AcknowledgeService.areWeInModeUserHasAcknowledged(lightCard, consideredAcknowledgedForUserWhen)) {
            return lightCard.hasBeenAcknowledged;
        } else {
            return AcknowledgeService.isLightCardHasBeenAcknowledgedByUserEntity(
                lightCard,
                consideredAcknowledgedForUserWhen
            );
        }
    }

    private static areWeInModeUserHasAcknowledged(
        lightCard: LightCard,
        consideredAcknowledgedForUserWhen: ConsideredAcknowledgedForUserWhenEnum
    ): boolean {
        return (
            consideredAcknowledgedForUserWhen === ConsideredAcknowledgedForUserWhenEnum.USER_HAS_ACKNOWLEDGED ||
            UserService.hasCurrentUserAnyPermission([PermissionEnum.READONLY]) ||
            !lightCard.entityRecipients?.length ||
            !AcknowledgeService.doEntityRecipientsIncludeAtLeastOneEntityOfUser(lightCard)
        );
    }

    private static doEntityRecipientsIncludeAtLeastOneEntityOfUser(lightCard: LightCard): boolean {
        const entitiesOfUserThatAreRecipients = lightCard.entityRecipients.filter((entityId) => {
            return (
                EntitiesService.isEntityAllowedToSendCard(entityId) &&
                UserService.getCurrentUserWithPerimeters().userData.entities.includes(entityId)
            );
        });
        return entitiesOfUserThatAreRecipients.length > 0;
    }

    private static isLightCardHasBeenAcknowledgedByUserEntity(
        lightCard: LightCard,
        consideredAcknowledgedForUserWhen: ConsideredAcknowledgedForUserWhenEnum
    ): boolean {
        const listEntitiesToAck = AcknowledgeService.computeListEntitiesToAck(lightCard);

        if (
            AcknowledgeService.isMemberOfEntityThatPublishedTheCard(lightCard) &&
            !lightCard.entitiesAcks?.includes(lightCard.publisher)
        ) {
            return false;
        }

        if (listEntitiesToAck?.length > 0) {
            return AcknowledgeService.checkIsAcknowledgedForTheCaseOfAllEntitiesMustAckTheCard(
                consideredAcknowledgedForUserWhen,
                lightCard,
                listEntitiesToAck
            );
        }
        return false;
    }

    private static checkIsAcknowledgedForTheCaseOfAllEntitiesMustAckTheCard(
        consideredAcknowledgedForUserWhen: ConsideredAcknowledgedForUserWhenEnum,
        lightCard: LightCard,
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
                    UserService.getCurrentUserWithPerimeters().userData.entities.includes(entityId)
                );
            });
            return entitiesOfUserAndWaitedForAck.length === 0;
        } else return false;
    }

    private static isMemberOfEntityThatPublishedTheCard(lightCard: LightCard): boolean {
        if (
            lightCard.publisherType === 'ENTITY' &&
            UserService.getCurrentUserWithPerimeters().userData.entities?.includes(lightCard.publisher)
        ) {
            return true;
        } else {
            return false;
        }
    }

    private static computeListEntitiesToAck(lightCard: LightCard): string[] {
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
