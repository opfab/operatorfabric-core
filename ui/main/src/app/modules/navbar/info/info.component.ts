/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {UserService} from 'app/business/services/users/user.service';
import {EntitiesService} from 'app/business/services/users/entities.service';
import {ConfigService} from 'app/business/services/config.service';
import {DateTimeFormatterService} from 'app/business/services/date-time-formatter.service';
import {ApplicationEventsService} from 'app/business/services/events/application-events.service';
import * as _ from 'lodash-es';
import {RolesEnum} from '@ofModel/roles.model';
import {NgIf, NgFor} from '@angular/common';

@Component({
    selector: 'of-info',
    templateUrl: './info.component.html',
    styleUrls: ['./info.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, NgFor]
})
export class InfoComponent implements OnInit {
    userName: string;
    userEntities: string[];
    userEntitiesToDisplay: string;
    userEntitiesToDisplayTrimmed: boolean;
    timeToDisplay: string;

    constructor(private changeDetector: ChangeDetectorRef) {}

    ngOnInit() {
        this.updateTime();
        const firstName = UserService.getCurrentUserWithPerimeters().userData.firstName;
        const lastName = UserService.getCurrentUserWithPerimeters().userData.lastName;
        if (firstName && lastName) this.userName = `${_.upperFirst(firstName)} ${_.upperFirst(lastName)}`;
        else this.userName = UserService.getCurrentUserWithPerimeters().userData.login;

        if (ConfigService.getConfigValue('showUserEntitiesOnTopRightOfTheScreen', false)) {
            this.setUserEntitiesToDisplay();
            ApplicationEventsService.getUserConfigChanges().subscribe(() => this.setUserEntitiesToDisplay());
        }
    }

    updateTime(): void {
        this.timeToDisplay = DateTimeFormatterService.getFormattedTime(new Date().valueOf());
        setTimeout(() => {
            this.updateTime();
            this.changeDetector.markForCheck();
        }, 1000);
    }

    setUserEntitiesToDisplay() {
        const user_entities = UserService.getCurrentUserWithPerimeters().userData.entities;
        if (user_entities) {
            this.userEntities = [];
            const entities = EntitiesService.getEntitiesFromIds(user_entities);
            entities.forEach((entity) => {
                if (entity.roles?.includes(RolesEnum.ACTIVITY_AREA)) {
                    // this avoids to display entities used only for grouping
                    this.userEntities.push(entity.name);
                }
            });
            this.userEntitiesToDisplay = this.userEntities.join(', ');
            this.trimTooLongEntitiesString();
        }
        this.changeDetector.markForCheck();
    }

    trimTooLongEntitiesString() {
        if (this.userEntitiesToDisplay.length > 20) {
            this.userEntitiesToDisplay = this.userEntitiesToDisplay.slice(0, 17) + '...';
            this.userEntitiesToDisplayTrimmed = true;
        } else this.userEntitiesToDisplayTrimmed = false;
    }
}
