/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {createFeatureSelector, createSelector} from '@ngrx/store';
import * as fromAuthentication from '@ofStore/reducers/authentication.reducer';
import {AuthState} from '@ofStates/authentication.state';
import * as _ from 'lodash';

export const selectAuthenticationState = createFeatureSelector<AuthState>('authentication');

export const selectExpirationTime = createSelector(selectAuthenticationState, fromAuthentication.getExpirationTime);
export const selectCode = createSelector(selectAuthenticationState, (authState)=>authState.code);
export const selectMessage = createSelector(selectAuthenticationState, (authState)=>authState.message);
export const selectIdentifier = createSelector(selectAuthenticationState, (authState)=>authState.identifier);
export const selectUserNameOrIdentifier = createSelector(selectAuthenticationState, (authState)=>{
    if(authState.lastName && authState.firstName){
        return `${_.upperFirst(authState.firstName)} ${_.upperFirst(authState.lastName)}`
    }
    return authState.identifier
});