/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import { reducer } from "./user.reducer";
import { userInitialState } from '@ofStore/states/user.state';
import { UserApplicationNotRegistered, CreateUserApplicationOnSuccess, CreateUserApplicationOnFailure } from '@ofStore/actions/user.actions';
import { User } from '@ofModel/user.model';


describe('User Reducer', () => {

    describe('unknown action', () => {
        it('should return the state unchanged', () => {
            const unknownAction = {} as any;
            const result = reducer(userInitialState, unknownAction);
            expect(result).toBe(userInitialState);
        });
    });

    describe('UserApplicationNotRegistered action', () => {
        it('should update UserApplicationNotRegistered', () => {

            const userApplicationNonRegistered = new UserApplicationNotRegistered({ error: new Error(), user : new User("userNotRegistered", "aaa", "bbb" )});
            const actualState = reducer(userInitialState, userApplicationNonRegistered);

            expect(actualState.registered).toEqual(false);
            expect(actualState.group).toBeNull();
        });
    })

    describe('CreateUserApplicationOnSuccess action', () => {
        it('should update CreateUserApplicationOnFailure', () => {

            const createUserApplicationOnSuccess = new CreateUserApplicationOnSuccess({ user : new User("userCreated", "aaa", "bbb" )});
            const actualState = reducer(userInitialState, createUserApplicationOnSuccess);

            expect(actualState.registered).toEqual(true);
            expect(actualState.group).toBeNull();
        });
    })

    describe('CreateUserApplicationOnFailure action', () => {
        it('should update CreateUserApplicationOnFailure', () => {

            const createUserApplicationOnFailure = new CreateUserApplicationOnFailure({ error: new Error()});
            const actualState = reducer(userInitialState, createUserApplicationOnFailure)

            expect(actualState.registered).toEqual(false);
            expect(actualState.group).toBeNull();
        });
    })
});

