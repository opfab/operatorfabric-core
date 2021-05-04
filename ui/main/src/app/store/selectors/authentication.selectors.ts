/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {createFeatureSelector, createSelector} from '@ngrx/store';
import {AuthState} from '@ofStates/authentication.state';
import * as _ from 'lodash-es';

export const selectAuthenticationState = createFeatureSelector<AuthState>('authentication');

export const selectCode = createSelector(selectAuthenticationState, (authState) => authState.code);
export const selectMessage = createSelector(selectAuthenticationState, (authState) => authState.message);
export const selectIdentifier = createSelector(selectAuthenticationState, (authState) => authState.identifier);
export const selectUserNameOrIdentifier = createSelector(selectAuthenticationState, (authState) => {
    if (authState.lastName && authState.firstName) {
        return `${_.upperFirst(authState.firstName)} ${_.upperFirst(authState.lastName)}`;
    }
    return authState.identifier;
});
