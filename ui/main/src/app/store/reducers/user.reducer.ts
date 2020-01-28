/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { userInitialState, UserState } from '@ofStore/states/user.state';
import * as userActions from '@ofStore/actions/user.actions';


export function reducer (state : UserState = userInitialState, action : userActions.UserActions) : UserState {
    switch(action.type) {
        case userActions.UserActionsTypes.UserApplicationNotRegistered :
        case userActions.UserActionsTypes.CreateUserApplicationOnFailure :
            return {
                ...state, 
                registered : false
            };
        case userActions.UserActionsTypes.CreateUserApplicationOnSuccess :
            return {
                ...state, 
                registered : true
            };
        default :
            return state;
    }
}
