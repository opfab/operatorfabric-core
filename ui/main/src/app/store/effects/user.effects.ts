/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
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
    LoadAllEntitiesAction,
    UserActions,
    UserActionsTypes,
    UserApplicationRegisteredAction
} from '@ofStore/actions/user.actions';
import {AuthenticationActionTypes} from '@ofStore/actions/authentication.actions';
import {catchError, debounce, map, switchMap} from 'rxjs/operators';
import {User} from '@ofModel/user.model';
import {AuthenticationService} from '@ofServices/authentication/authentication.service';
import {Entity} from '@ofModel/entity.model';

@Injectable()
export class UserEffects {
    constructor(
        private actions$: Actions,
        private userService: UserService,
        private authService: AuthenticationService
    ) {}

    /**
     * after that the user is authenticated through the token,
     * synchronize user data from the token with the backend
     * (if the user does not exist in the database it will be created)
     * and raise the UserApplicationRegistered action.
     */

    checkUserApplication: Observable<UserActions> = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthenticationActionTypes.AcceptLogIn),
            switchMap(() => {
                return this.userService.synchronizeWithToken().pipe(
                    map((user: User) => new UserApplicationRegisteredAction({user})),
                    catchError((_error, caught) => {
                        console.log('Error in synchronizeWithToken');
                        this.authService.clearAuthenticationInformation();
                        return caught;
                    })
                );
            })
        )
    );

    /**
     * Query all existing entities from the Users service
     */

    loadAllEntities: Observable<UserActions> = createEffect(() =>
        this.actions$.pipe(
            ofType(UserActionsTypes.QueryAllEntities),
            switchMap(() => this.userService.queryAllEntities()),
            map((allEntities: Entity[]) => new LoadAllEntitiesAction({entities: allEntities}))
        )
    );

    updateUserConfig: Observable<any> = createEffect(
        () =>
            this.actions$.pipe(
                ofType(UserActionsTypes.UserConfigChange),
                debounce(() => timer(5000 + Math.floor(Math.random() * 5000))), // use a random  part to avoid all UI to access at the same time the server
                map(() => {
                    this.userService.loadUserWithPerimetersData().subscribe();
                }),
                catchError((error, caught) => {
                    console.error('UserEffects - Error in update user config ', error);
                    return caught;
                })
            ),
        {dispatch: false}
    );
}
