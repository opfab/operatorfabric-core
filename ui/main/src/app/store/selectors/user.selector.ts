/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AppState} from '@ofStore/index';
import {createSelector} from '@ngrx/store';
import {UserState} from '@ofStates/user.state';


export const selectUserSlice = (state: AppState) => state.user;

export const selectAllEntities = createSelector(selectUserSlice,
    (userState: UserState) => userState.allEntities);
