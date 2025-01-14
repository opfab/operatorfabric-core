/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {UsersService} from '@ofServices/users/UsersService';
import {EntitiesService} from '@ofServices/entities/EntitiesService';
import {ConfigService} from 'app/services/config/ConfigService';
import {DateTimeFormatterService} from 'app/services/dateTimeFormatter/DateTimeFormatterService';
import {ApplicationEventsService} from '@ofServices/events/ApplicationEventsService';
import * as _ from 'lodash-es';
import {RoleEnum} from '@ofServices/entities/model/RoleEnum';
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

    constructor(private readonly changeDetector: ChangeDetectorRef) {}

    ngOnInit() {
        this.updateTime();
        const firstName = UsersService.getCurrentUserWithPerimeters().userData.firstName;
        const lastName = UsersService.getCurrentUserWithPerimeters().userData.lastName;
        if (firstName && lastName) this.userName = `${_.upperFirst(firstName)} ${_.upperFirst(lastName)}`;
        else this.userName = UsersService.getCurrentUserWithPerimeters().userData.login;

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
        const user_entities = UsersService.getCurrentUserWithPerimeters().userData.entities;
        if (user_entities) {
            this.userEntities = [];
            const entities = EntitiesService.getEntitiesFromIds(user_entities);
            entities.forEach((entity) => {
                if (entity.roles?.includes(RoleEnum.ACTIVITY_AREA)) {
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
