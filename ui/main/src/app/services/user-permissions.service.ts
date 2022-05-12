/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
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
import {Process} from '@ofModel/processes.model';
import {RightsEnum} from '@ofModel/perimeter.model';
import {ConfigService} from '@ofServices/config.service';
import {EntitiesService} from '@ofServices/entities.service';

/** This class contains functions allowing to know if the user has the right to answer to the card or not */

@Injectable({
  providedIn: 'root'
})
export class UserPermissionsService {

  constructor(private configService: ConfigService,
    private entitiesService: EntitiesService) { }

  public isUserEnabledToRespond(user: UserWithPerimeters, card: Card, processDefinition: Process): boolean {

    if (this.isLttdExpired(card)) return false;

    return this.isUserInEntityAllowedToRespond(user, card, processDefinition)
      && this.doesTheUserHaveThePerimeterToRespond(user, card, processDefinition);
  }


  /* 1st check : card.publisherType == ENTITY
   2nd check : the card has been sent by an entity of the user connected
   3rd check : the user has the Write access to the process/state of the card */
  public doesTheUserHavePermissionToDeleteCard(user: UserWithPerimeters, card: Card): boolean {
    let permission = false;
    if ((card.publisherType === 'ENTITY') && (user.userData.entities.includes(card.publisher))) {
      permission = this.checkUserWritePerimeter(user, card);
    }
    return permission;
  }


  public doesTheUserHavePermissionToEditCard(user: UserWithPerimeters, card: Card): boolean {
    if (!!card.entitiesAllowedToEdit && this.isUserInEntityAllowedToEditCard(user, card)) return this.checkUserWritePerimeter(user, card);
    if ((card.publisherType === 'ENTITY') && user.userData.entities.includes(card.publisher)) return this.checkUserWritePerimeter(user, card);
    return false;
  }

  private checkUserWritePerimeter(user: UserWithPerimeters, card: Card) : boolean {
    let permission = false;
    user.computedPerimeters.forEach(perim => {
      if ((perim.process === card.process) &&
        (perim.state === card.state)
        && (this.compareRightAction(perim.rights, RightsEnum.Write)
          || this.compareRightAction(perim.rights, RightsEnum.ReceiveAndWrite))) {
        permission = true;
        return true;
      }
    });
    return permission;
  }

  private isUserInEntityAllowedToEditCard(user: UserWithPerimeters, card: Card) {
    const userEntitiesAllowed = user.userData.entities.filter(entity =>
      card.entitiesAllowedToEdit.includes(entity)
    );
    return userEntitiesAllowed.length > 0;
  }

  private isLttdExpired(card: Card): boolean {
    return (card.lttd != null && (card.lttd - new Date().getTime()) <= 0);
  }

  private isUserInEntityAllowedToRespond(user: UserWithPerimeters, card: Card, processDefinition: Process): boolean {
    let userEntitiesAllowedToRespond = [];
    let entitiesAllowedToRespondAndEntitiesRequiredToRespond = [];
    if (card.entitiesAllowedToRespond)
      entitiesAllowedToRespondAndEntitiesRequiredToRespond = entitiesAllowedToRespondAndEntitiesRequiredToRespond
        .concat(card.entitiesAllowedToRespond);
    if (card.entitiesRequiredToRespond)
      entitiesAllowedToRespondAndEntitiesRequiredToRespond = entitiesAllowedToRespondAndEntitiesRequiredToRespond
        .concat(card.entitiesRequiredToRespond);

    if (entitiesAllowedToRespondAndEntitiesRequiredToRespond) {

      const entitiesAllowedToRespond = this.entitiesService.getEntities().filter(entity =>
        entitiesAllowedToRespondAndEntitiesRequiredToRespond.includes(entity.id));


      let emittingEntityAllowedToRespond = false;
      if (!!processDefinition.extractState(card.state).response)
        emittingEntityAllowedToRespond = !!processDefinition.extractState(card.state).response.emittingEntityAllowedToRespond;

      const allowed = this.entitiesService.resolveEntitiesAllowedToSendCards(entitiesAllowedToRespond)
        .map(entity => entity.id).filter(x => x !== card.publisher || emittingEntityAllowedToRespond);

      console.log(new Date().toISOString(), ' Detail card - entities allowed to respond = ', allowed);

      userEntitiesAllowedToRespond = allowed.filter(x => user.userData.entities.includes(x));
      console.log(new Date().toISOString(), ' Detail card - users entities allowed to respond = ', userEntitiesAllowedToRespond);
    }
    return userEntitiesAllowedToRespond.length > 0;
  }

  private doesTheUserHaveThePerimeterToRespond(user: UserWithPerimeters, card: Card, processDefinition: Process): boolean {
    let permission = false;
    user.computedPerimeters.forEach(perim => {
      const stateOfTheCard = Process.prototype.extractState.call(processDefinition, card);

      if ((!!stateOfTheCard) && (perim.process === card.process) && (!!stateOfTheCard.response) && (perim.state === stateOfTheCard.response.state)
        && (this.compareRightAction(perim.rights, RightsEnum.Write)
          || this.compareRightAction(perim.rights, RightsEnum.ReceiveAndWrite))) {
        permission = true;
      }
    });
    return permission;
  }



  private compareRightAction(userRights: RightsEnum, rightsAction: RightsEnum): boolean {
    return (userRight(userRights) - userRight(rightsAction)) === 0;
  }
}
