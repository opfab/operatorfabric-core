/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {Component, OnInit} from '@angular/core';
import {AppState} from '@ofStore/index';
import {Store} from '@ngrx/store';
import {selectUserNameOrIdentifier} from '@ofSelectors/authentication.selectors';
import {Observable} from 'rxjs';
import {TimeService} from '@ofServices/time.service';
import * as moment from 'moment';
import {UserService} from '@ofServices/user.service';
import {EntitiesService} from '@ofServices/entities.service';
import {ConfigService} from '@ofServices/config.service';


@Component({
    selector: 'of-info',
    templateUrl: './info.component.html',
    styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {
     _userName$: Observable<string>;
     userEntitiesToDisplay: string;
     timeToDisplay: string;


    constructor(private store: Store<AppState>, 
      private timeService: TimeService,
      private userService: UserService,
      private entitiesService: EntitiesService,
      private configService: ConfigService) {
    }

    ngOnInit() {
        this.updateTime();
        this._userName$ = this.store.select(selectUserNameOrIdentifier);
        if (this.configService.getConfigValue('showUserEntitiesOnTopRightOfTheScreen',false)) this.setUserEntitiesToDisplay();
    }


  updateTime(): void {
    this.timeToDisplay = this.timeService.formatTime(moment());
    setTimeout(() => {
      this.updateTime();
    }, 1000);
  }

  setUserEntitiesToDisplay()
  {
    let user_entities = this.userService.getCurrentUserWithPerimeters().userData.entities;
    if (!!user_entities) {
        this.userEntitiesToDisplay = "";
        let entities = this.entitiesService.getEntitiesFromIds(user_entities);
        entities.forEach( (entity) => {
          if (entity.entityAllowedToSendCard) { // this avoid to display entities use only for grouping 
            if (this.userEntitiesToDisplay.length>0) this.userEntitiesToDisplay+= ', ' 
            this.userEntitiesToDisplay += entity.name; 
          }
        });
        this.trimTooLongEntitiesList();
        
      }
    }

  trimTooLongEntitiesList()
  {
    if (this.userEntitiesToDisplay.length>20) this.userEntitiesToDisplay = this.userEntitiesToDisplay.slice(0,17) + '...';
  }

}
