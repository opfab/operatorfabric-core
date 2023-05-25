/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnInit} from '@angular/core';
import {UserService} from 'app/business/services/user.service';
import {EntitiesService} from 'app/business/services/entities.service';
import {ConfigService} from 'app/business/services/config.service';
import {DateTimeFormatterService} from 'app/business/services/date-time-formatter.service';
import {ApplicationEventsService} from 'app/business/services/application-events.service';
import * as _ from 'lodash-es';

@Component({
    selector: 'of-info',
    templateUrl: './info.component.html',
    styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {
    userName: string;
    userEntitiesToDisplay: string;
    timeToDisplay: string;

    constructor(
        private dateTimeFormatter: DateTimeFormatterService,
        private userService: UserService,
        private entitiesService: EntitiesService,
        private configService: ConfigService,
        private applicationEventsService: ApplicationEventsService
    ) {}

    ngOnInit() {
        this.updateTime();
        const firstName = this.userService.getCurrentUserWithPerimeters().userData.firstName;
        const lastName = this.userService.getCurrentUserWithPerimeters().userData.lastName;
        if (firstName && lastName) this.userName = `${_.upperFirst(firstName)} ${_.upperFirst(lastName)}`;
        else this.userName = this.userService.getCurrentUserWithPerimeters().userData.login;

        if (this.configService.getConfigValue('showUserEntitiesOnTopRightOfTheScreen', false)) {
            this.setUserEntitiesToDisplay();
            this.applicationEventsService.getUserConfigChanges().subscribe(() => this.setUserEntitiesToDisplay());
        }
    }

    updateTime(): void {
        this.timeToDisplay = this.dateTimeFormatter.getFormattedTimeFromEpochDate(new Date().valueOf());
        setTimeout(() => {
            this.updateTime();
        }, 1000);
    }

    setUserEntitiesToDisplay() {
        const user_entities = this.userService.getCurrentUserWithPerimeters().userData.entities;
        if (user_entities) {
            this.userEntitiesToDisplay = '';
            const entities = this.entitiesService.getEntitiesFromIds(user_entities);
            entities.forEach((entity) => {
                if (entity.entityAllowedToSendCard) {
                    // this avoids to display entities used only for grouping
                    if (this.userEntitiesToDisplay.length > 0) this.userEntitiesToDisplay += ', ';
                    this.userEntitiesToDisplay += entity.name;
                }
            });
            this.trimTooLongEntitiesList();
        }
    }

    trimTooLongEntitiesList() {
        if (this.userEntitiesToDisplay.length > 20)
            this.userEntitiesToDisplay = this.userEntitiesToDisplay.slice(0, 17) + '...';
    }
}
