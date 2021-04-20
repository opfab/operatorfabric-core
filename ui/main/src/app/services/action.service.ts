/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import { Injectable } from '@angular/core';
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
export class ActionService {

  constructor(private configService: ConfigService,
              private entitiesService: EntitiesService) { }

  public isUserEnabledToRespond(user: UserWithPerimeters, card: Card, processDefinition: Process): boolean {
    const checkPerimeterForResponseCard = this.configService.getConfigValue('checkPerimeterForResponseCard');

    if (checkPerimeterForResponseCard === false)
      return this.isUserInEntityAllowedToRespond(user, card);
    else
      return this.isUserInEntityAllowedToRespond(user, card)
          && this.doesTheUserHavePermissionToRespond(user, card, processDefinition);
  }

  private isUserInEntityAllowedToRespond(user: UserWithPerimeters, card: Card): boolean {
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

      const allowed = this.entitiesService.resolveEntitiesAllowedToSendCards(entitiesAllowedToRespond)
          .map(entity => entity.id).filter(x =>  x !== card.publisher);

      console.log(new Date().toISOString(), ' Detail card - entities allowed to respond = ', allowed);

      userEntitiesAllowedToRespond = allowed.filter(x => user.userData.entities.includes(x));
      console.log(new Date().toISOString(), ' Detail card - users entities allowed to respond = ', userEntitiesAllowedToRespond);
      if (userEntitiesAllowedToRespond.length > 1)
        console.log(new Date().toISOString(), 'Warning : user can respond on behalf of more than one entity, so response is disabled');
    }
    return userEntitiesAllowedToRespond.length === 1;
  }

  private doesTheUserHavePermissionToRespond(user: UserWithPerimeters, card: Card, processDefinition: Process): boolean {
    let permission = false;
    user.computedPerimeters.forEach(perim => {
      const stateOfTheCard = Process.prototype.extractState.call(processDefinition, card);

      if ((!! stateOfTheCard) && (perim.process === card.process) && (perim.state === stateOfTheCard.response.state)
          && (this.compareRightAction(perim.rights, RightsEnum.Write)
              || this.compareRightAction(perim.rights, RightsEnum.ReceiveAndWrite))) {
        permission = true;
        return true;
      }
    });
    return permission;
  }

  private compareRightAction(userRights: RightsEnum, rightsAction: RightsEnum): boolean {
    return (userRight(userRights) - userRight(rightsAction)) === 0;
  }
}
