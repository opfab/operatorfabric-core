/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {userRight, UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {Card} from '@ofModel/card.model';
import {Process, ShowAcknowledgmentFooterEnum} from '@ofModel/processes.model';
import {RightsEnum} from '@ofModel/perimeter.model';
import {EntitiesService} from 'app/business/services/users/entities.service';
import {ProcessesService} from 'app/business/services/businessconfig/processes.service';
import {User} from '@ofModel/user.model';

/** This class contains functions allowing to know if the user has the right to answer to the card or not */

@Injectable({
    providedIn: 'root'
})
export class UserPermissionsService {
    constructor(private processesService: ProcessesService) {}

    public isUserEnabledToRespond(user: UserWithPerimeters, card: Card, processDefinition: Process): boolean {
        if (this.isLttdExpired(card)) return false;

        return (
            this.getUserEntitiesAllowedToRespond(user, card, processDefinition).length > 0 &&
            this.doesTheUserHaveThePerimeterToRespond(user, card, processDefinition)
        );
    }

    /* 1st check : card.publisherType == ENTITY
   2nd check : the card has been sent by an entity of the user connected
   3rd check : the user has the Write access to the process/state of the card */
    public doesTheUserHavePermissionToDeleteCard(user: UserWithPerimeters, card: Card): boolean {
        let permission = false;
        if (card.publisherType === 'ENTITY' && user.userData.entities.includes(card.publisher)) {
            permission = this.checkUserWritePerimeter(user, card);
        }
        return permission;
    }

    public doesTheUserHavePermissionToEditCard(user: UserWithPerimeters, card: Card): boolean {
        if (card.entitiesAllowedToEdit && this.isUserInEntityAllowedToEditCard(user.userData, card))
            return this.checkUserWritePerimeter(user, card);
        if (card.publisherType === 'ENTITY' && user.userData.entities.includes(card.publisher))
            return this.checkUserWritePerimeter(user, card);
        return false;
    }

    private checkUserWritePerimeter(user: UserWithPerimeters, card: Card): boolean {
        let permission = false;
        user.computedPerimeters.forEach((perim) => {
            if (
                perim.process === card.process &&
                perim.state === card.state &&
                this.compareRightAction(perim.rights, RightsEnum.ReceiveAndWrite)
            ) {
                permission = true;
                return true;
            }
        });
        return permission;
    }

    private isUserInEntityAllowedToEditCard(user: User, card: Card): boolean {
        if (!card.entitiesAllowedToEdit) {
            return false;
        }

        const userEntitiesAllowed = user.entities.filter((entity) => card.entitiesAllowedToEdit.includes(entity));
        return userEntitiesAllowed.length > 0;
    }

    public isUserAuthorizedToSeeAcknowledgmentFooter(userWithPerimeters: UserWithPerimeters, card: Card) {
        const showAcknowledgmentFooter = this.processesService.getShowAcknowledgmentFooterForACard(card);
        if (showAcknowledgmentFooter === ShowAcknowledgmentFooterEnum.FOR_ALL_USERS) {
            return true;
        }
        if (showAcknowledgmentFooter === ShowAcknowledgmentFooterEnum.NEVER) {
            return false;
        }
        if (showAcknowledgmentFooter === ShowAcknowledgmentFooterEnum.ONLY_FOR_USERS_ALLOWED_TO_EDIT) {
            return this.doesTheUserHavePermissionToEditCard(userWithPerimeters, card);
        }
        return this.isCardPublishedByUserEntity(userWithPerimeters.userData, card);
    }

    private isCardPublishedByUserEntity(user: User, card: Card): boolean {
        return card.publisherType === 'ENTITY' && user.entities.includes(card.publisher);
    }

    private isLttdExpired(card: Card): boolean {
        return card.lttd != null && card.lttd - new Date().getTime() <= 0;
    }

    public getUserEntitiesAllowedToRespond(user: UserWithPerimeters, card: Card, processDefinition: Process): string[] {
        let userEntitiesAllowedToRespond = [];
        let entitiesAllowedToRespondAndEntitiesRequiredToRespond = [];
        if (card.entitiesAllowedToRespond)
            entitiesAllowedToRespondAndEntitiesRequiredToRespond =
                entitiesAllowedToRespondAndEntitiesRequiredToRespond.concat(card.entitiesAllowedToRespond);
        if (card.entitiesRequiredToRespond)
            entitiesAllowedToRespondAndEntitiesRequiredToRespond =
                entitiesAllowedToRespondAndEntitiesRequiredToRespond.concat(card.entitiesRequiredToRespond);

        if (entitiesAllowedToRespondAndEntitiesRequiredToRespond) {
            const entitiesAllowedToRespond = EntitiesService.getEntities().filter((entity) =>
                entitiesAllowedToRespondAndEntitiesRequiredToRespond.includes(entity.id)
            );

            let emittingEntityAllowedToRespond = false;
            if (processDefinition.states.get(card.state).response)
                emittingEntityAllowedToRespond = processDefinition.states.get(card.state).response
                    .emittingEntityAllowedToRespond;

            const allowed = EntitiesService.resolveEntitiesAllowedToSendCards(entitiesAllowedToRespond)
                .map((entity) => entity.id)
                .filter((x) => x !== card.publisher || emittingEntityAllowedToRespond);

            console.log(new Date().toISOString(), ' Detail card - entities allowed to respond = ', allowed);

            userEntitiesAllowedToRespond = allowed.filter((x) => user.userData.entities.includes(x));
            console.log(
                new Date().toISOString(),
                ' Detail card - users entities allowed to respond = ',
                userEntitiesAllowedToRespond
            );
        }
        return userEntitiesAllowedToRespond;
    }

    private doesTheUserHaveThePerimeterToRespond(
        user: UserWithPerimeters,
        card: Card,
        processDefinition: Process
    ): boolean {
        let permission = false;
        user.computedPerimeters.forEach((perim) => {
            const stateOfTheCard = processDefinition.states.get(card.state);

            if (
                stateOfTheCard?.response &&
                perim.process === card.process &&
                perim.state === stateOfTheCard.response.state &&
                this.compareRightAction(perim.rights, RightsEnum.ReceiveAndWrite)
            ) {
                permission = true;
            }
        });
        return permission;
    }

    private compareRightAction(userRights: RightsEnum, rightsAction: RightsEnum): boolean {
        return userRight(userRights) - userRight(rightsAction) === 0;
    }
}
