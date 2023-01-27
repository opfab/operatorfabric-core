/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {UserService} from '@ofServices/user.service';
import {Observable, timer} from 'rxjs';
import {
    UserActionsTypes,
    UserConfigLoadedAction
} from '@ofStore/actions/user.actions';
import {catchError, debounce, map, switchMap} from 'rxjs/operators';
import {EntitiesService} from '@ofServices/entities.service';
import {GroupsService} from '@ofServices/groups.service';
import {Utilities} from 'app/business/common/utilities';
import {LogOption, OpfabLoggerService} from '@ofServices/logs/opfab-logger.service';

@Injectable()
export class UserEffects {
    constructor(
        private actions$: Actions,
        private userService: UserService,
        private entitieservice: EntitiesService,
        private groupservice: GroupsService,
        private logger: OpfabLoggerService
    ) {}



    updateUserConfig: Observable<any> = createEffect(
        () =>
            this.actions$.pipe(
                ofType(UserActionsTypes.UserConfigChange),
                debounce(() => timer(5000 + Math.floor(Math.random() * 5000))), // use a random  part to avoid all UI to access at the same time the server
                switchMap(() => {
                    const requestsToLaunch$ = [
                        this.userService.loadUserWithPerimetersData(),
                        this.entitieservice.loadAllEntitiesData(),
                        this.groupservice.loadAllGroupsData()
                    ];
                    this.logger.info("Update user perimeter, entities and groups",LogOption.LOCAL_AND_REMOTE);
                    return Utilities.subscribeAndWaitForAllObservablesToEmitAnEvent(requestsToLaunch$)
                }),
                map(() => new UserConfigLoadedAction()),
                catchError((error, caught) => {
                    console.error('UserEffects - Error in update user config ', error);
                    return caught;
                })
            ),
        {dispatch: true}
    );
}
