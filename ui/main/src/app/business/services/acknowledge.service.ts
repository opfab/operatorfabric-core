/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {AcknowledgmentAllowedEnum, ConsideredAcknowledgedForUserWhenEnum, Process} from '@ofModel/processes.model';
import {Card} from '@ofModel/card.model';
import {UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {LightCard} from '@ofModel/light-card.model';
import {Observable} from 'rxjs';
import {AcknowledgeServer} from '../server/acknowledge.server';
import {ServerResponse} from '../server/serverResponse';
import {UserPermissionsService} from 'app/business/services/user-permissions.service';
import {PermissionEnum} from "@ofModel/permission.model";
import {ProcessesService} from './businessconfig/processes.service';
import {EntitiesService} from './users/entities.service';
import {UserService} from './users/user.service';

@Injectable({
    providedIn: 'root'
})
export class AcknowledgeService {

    constructor(
        private acknowledgeServer: AcknowledgeServer,
        private userPermissionsService: UserPermissionsService,
        private processesService: ProcessesService
    ) {}

    postUserAcknowledgement(cardUid: string, entitiesAcks: string[]): Observable<ServerResponse<void>> {
        return this.acknowledgeServer.postUserAcknowledgement(cardUid, entitiesAcks);
    }

    deleteUserAcknowledgement(cardUid: string): Observable<ServerResponse<void>> {
        return this.acknowledgeServer.deleteUserAcknowledgement(cardUid);
    }

    isAcknowledgmentAllowed(user: UserWithPerimeters, card: Card | LightCard, processDefinition: Process): boolean {
        if (!processDefinition) return true;
        const state = processDefinition.states.get(card.state);

        if (state) {
            if (state.acknowledgmentAllowed === AcknowledgmentAllowedEnum.NEVER) return false;
            if (state.acknowledgmentAllowed === AcknowledgmentAllowedEnum.ALWAYS) return true;
            return !this.userPermissionsService.isUserEnabledToRespond(user, card, processDefinition);
        }
        return true;
    }

    public isLightCardHasBeenAcknowledgedByUserOrByUserEntity(lightCard: LightCard): boolean {
        const consideredAcknowledgedForUserWhen =
            this.processesService.getConsideredAcknowledgedForUserWhenForALightCard(lightCard);

        if (this.areWeInModeUserHasAcknowledged(lightCard, consideredAcknowledgedForUserWhen)) {
            return lightCard.hasBeenAcknowledged;
        } else {
            return this.isLightCardHasBeenAcknowledgedByUserEntity(lightCard, consideredAcknowledgedForUserWhen);
        }
    }

    private areWeInModeUserHasAcknowledged(
        lightCard: LightCard,
        consideredAcknowledgedForUserWhen: ConsideredAcknowledgedForUserWhenEnum
    ): boolean {
        return (
            consideredAcknowledgedForUserWhen === ConsideredAcknowledgedForUserWhenEnum.USER_HAS_ACKNOWLEDGED ||
            UserService.hasCurrentUserAnyPermission([PermissionEnum.READONLY]) ||
            !lightCard.entityRecipients ||
            !lightCard.entityRecipients.length ||
            !this.doEntityRecipientsIncludeAtLeastOneEntityOfUser(lightCard)
        );
    }

    private doEntityRecipientsIncludeAtLeastOneEntityOfUser(lightCard: LightCard): boolean {
        const entitiesOfUserThatAreRecipients = lightCard.entityRecipients.filter((entityId) => {
            return (
                EntitiesService.isEntityAllowedToSendCard(entityId) &&
                UserService.getCurrentUserWithPerimeters().userData.entities.includes(entityId)
            );
        });
        return entitiesOfUserThatAreRecipients.length > 0;
    }

    private isLightCardHasBeenAcknowledgedByUserEntity(lightCard: LightCard,
                                                       consideredAcknowledgedForUserWhen: ConsideredAcknowledgedForUserWhenEnum): boolean {

        const listEntitiesToAck = this.computeListEntitiesToAck(lightCard);

        if (this.isMemberOfEntityThatPublishedTheCard(lightCard) &&
            !lightCard.entitiesAcks?.includes(lightCard.publisher)) {
            return false;
        }

        if (listEntitiesToAck?.length > 0) {
            return (
                this.checkIsAcknowledgedForTheCaseOfAllEntitiesMustAckTheCard(
                    consideredAcknowledgedForUserWhen,
                    lightCard,
                    listEntitiesToAck
                )
            );
        }
        return false;
    }

    private checkIsAcknowledgedForTheCaseOfAllEntitiesMustAckTheCard(
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

    private isMemberOfEntityThatPublishedTheCard(lightCard: LightCard): boolean {
        if (lightCard.publisherType === 'ENTITY' &&
            UserService
                .getCurrentUserWithPerimeters()
                .userData.entities?.includes(lightCard.publisher)) {
            return true;
        } else {
            return false;
        }
    }

    private computeListEntitiesToAck(lightCard: LightCard): string[] {
        const listEntitiesToAck = [];

        if (lightCard.entityRecipients) {
            const listOfEntityRecipients = EntitiesService.getEntitiesFromIds(lightCard.entityRecipients);
            if (listOfEntityRecipients)
            EntitiesService
                    .resolveEntitiesAllowedToSendCards(listOfEntityRecipients)
                    .forEach((entityToAdd) => listEntitiesToAck.push(entityToAdd.id));
        }
        return listEntitiesToAck;
    }
}
