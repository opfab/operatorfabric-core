/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {userInitialState, UserState} from '@ofStore/states/user.state';
import * as userActions from '@ofStore/actions/user.actions';


export function reducer(state: UserState = userInitialState, action: userActions.UserActions): UserState {
    switch (action.type) {
        case userActions.UserActionsTypes.UserApplicationRegistered :
            return {
                ...state,
                registered: true
            };
        case userActions.UserActionsTypes.LoadAllEntities :
            return {
                ...state,
                allEntities: action.payload.entities
            };
        default :
            return state;
    }
}
