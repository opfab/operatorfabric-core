/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {userRight, UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {Card} from '@ofModel/card.model';
import {Process} from '@ofModel/processes.model';
import {RightsEnum} from '@ofModel/perimeter.model';
import {EntitiesService} from 'app/business/services/users/entities.service';
import {User} from '@ofModel/user.model';
import {LoggerService} from 'app/services/logs/LoggerService';

export class UserPermissionsService {
    public static isUserEnabledToRespond(user: UserWithPerimeters, card: Card, processDefinition: Process): boolean {
        if (UserPermissionsService.isLttdExpired(card)) return false;

        return (
            UserPermissionsService.getUserEntitiesAllowedToRespond(user, card, processDefinition).length > 0 &&
            UserPermissionsService.doesTheUserHaveThePerimeterToRespond(user, card, processDefinition)
        );
    }

    /* 1st check : card.publisherType == ENTITY
   2nd check : the card has been sent by an entity of the user connected
   3rd check : the user has the Write access to the process/state of the card */
    public static doesTheUserHavePermissionToDeleteCard(user: UserWithPerimeters, card: Card): boolean {
        let permission = false;
        if (card.publisherType === 'ENTITY' && user.userData.entities.includes(card.publisher)) {
            permission = UserPermissionsService.checkUserWritePerimeter(user, card);
        }
        return permission;
    }

    public static doesTheUserHavePermissionToEditCard(user: UserWithPerimeters, card: Card): boolean {
        if (card.entitiesAllowedToEdit && UserPermissionsService.isUserInEntityAllowedToEditCard(user.userData, card))
            return UserPermissionsService.checkUserWritePerimeter(user, card);
        if (card.publisherType === 'ENTITY' && user.userData.entities.includes(card.publisher))
            return UserPermissionsService.checkUserWritePerimeter(user, card);
        return false;
    }

    private static checkUserWritePerimeter(user: UserWithPerimeters, card: Card): boolean {
        let permission = false;
        user.computedPerimeters.forEach((perim) => {
            if (
                perim.process === card.process &&
                perim.state === card.state &&
                UserPermissionsService.compareRightAction(perim.rights, RightsEnum.ReceiveAndWrite)
            ) {
                permission = true;
                return true;
            }
        });
        return permission;
    }

    private static isUserInEntityAllowedToEditCard(user: User, card: Card): boolean {
        if (!card.entitiesAllowedToEdit) {
            return false;
        }

        const userEntitiesAllowed = user.entities.filter((entity) => card.entitiesAllowedToEdit.includes(entity));
        return userEntitiesAllowed.length > 0;
    }

    private static isLttdExpired(card: Card): boolean {
        return card.lttd != null && card.lttd - new Date().getTime() <= 0;
    }

    public static getUserEntitiesAllowedToRespond(
        user: UserWithPerimeters,
        card: Card,
        processDefinition: Process
    ): string[] {
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

            LoggerService.debug(' Detail card - entities allowed to respond = ' + allowed);

            userEntitiesAllowedToRespond = allowed.filter((x) => user.userData.entities.includes(x));
            LoggerService.debug(' Detail card - users entities allowed to respond = ' + userEntitiesAllowedToRespond);
        }
        return userEntitiesAllowedToRespond;
    }

    private static doesTheUserHaveThePerimeterToRespond(
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
                UserPermissionsService.compareRightAction(perim.rights, RightsEnum.ReceiveAndWrite)
            ) {
                permission = true;
            }
        });
        return permission;
    }

    private static compareRightAction(userRights: RightsEnum, rightsAction: RightsEnum): boolean {
        return userRight(userRights) - userRight(rightsAction) === 0;
    }
}
