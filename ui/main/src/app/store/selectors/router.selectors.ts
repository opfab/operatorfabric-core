/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {createFeatureSelector, createSelector} from '@ngrx/store';
import * as fromRouter from '@ngrx/router-store';

export const selectRouterState = createFeatureSelector<fromRouter.RouterReducerState>('router');
export const selectCurrentUrl = createSelector(selectRouterState, (router) => {
    if (router) return router.state && router.state.url;
    return null;
});
