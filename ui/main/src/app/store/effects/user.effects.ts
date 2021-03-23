/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {UserService} from '@ofServices/user.service';
import {Observable} from 'rxjs';
import {
    CreateUserApplication,
    CreateUserApplicationOnFailure,
    CreateUserApplicationOnSuccess,
    LoadAllEntities,
    UserActions,
    UserActionsTypes,
    UserApplicationRegistered
} from '@ofStore/actions/user.actions';
import {AcceptLogIn, AuthenticationActionTypes} from '@ofStore/actions/authentication.actions';
import {catchError, map, switchMap} from 'rxjs/operators';
import {Entity, User} from '@ofModel/user.model';
import {AuthenticationService} from '@ofServices/authentication/authentication.service';


@Injectable()
export class UserEffects {

    constructor(private store: Store<AppState>,
                private actions$: Actions,
                private userService: UserService,
                private authService: AuthenticationService
    ) {
    }

    /**
     * after that the user is authenticated through the token,
     * detect if the user is already registered in the application and raise the UserApplicationRegistered action
     * if not, set the creation user workflow
     */
    
    checkUserApplication: Observable<UserActions> = createEffect(() => this.actions$
        .pipe(
            ofType(AuthenticationActionTypes.AcceptLogIn),
            switchMap((action: AcceptLogIn) => {
                const userPayload = action.payload;
                return this.userService.askUserApplicationRegistered(userPayload.identifier)
                    .pipe(
                        map((user: User) => new UserApplicationRegistered({user})),
                        catchError((error, caught) => {
                            const userData: User = new User(userPayload.identifier, userPayload.firstName, userPayload.lastName);
                            this.store.dispatch(new CreateUserApplication({user: userData}));
                            return caught;
                        })
                    );
            })
        ));


    /**
     * create the user application (first time in the application)
     * raise an CreateUserApplicationOnSuccess action or CreateUserApplicationOnFailure action.
     */
    
    CreateUserApplication: Observable<UserActions> = createEffect(() => this.actions$
        .pipe(
            ofType(UserActionsTypes.CreateUserApplication),
            switchMap((action: CreateUserApplication) => {
                const user = action.payload.user;
                return this.userService.askCreateUser(user)
                    .pipe(
                        map(currentUser => {
                            return new CreateUserApplicationOnSuccess({user: currentUser});
                        }),
                        catchError((error, caught) => {
                            this.authService.clearAuthenticationInformation();
                            this.store.dispatch(new CreateUserApplicationOnFailure({error: error}));
                            return caught;
                        })
                    );
            }),
        ));

    /**
     * transition to the userApplicationRegistered action after an CreateUserApplicationOnSuccess action
     */
    
    transition2UserApplicationRegistered: Observable<UserActions> = createEffect(() => this.actions$
        .pipe(
            ofType(UserActionsTypes.CreateUserApplicationOnSuccess),
            map((action: CreateUserApplicationOnSuccess) => {
                const userDataPayload = action.payload.user;
                return new UserApplicationRegistered({user: userDataPayload});
            })
        ));

    /**
     * Query all existing entities from the Users service
     */
    
    loadAllEntities: Observable<UserActions> = createEffect(() => this.actions$.pipe(
        ofType(UserActionsTypes.QueryAllEntities),
        switchMap(() => this.userService.queryAllEntities()),
        map((allEntities: Entity[]) => new LoadAllEntities({entities: allEntities}))
    ));
}
