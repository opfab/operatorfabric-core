/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {createFeatureSelector, createSelector, MetaReducer} from '@ngrx/store';
import * as fromRouter from '@ngrx/router-store';
import {AppState} from "@ofStore/index";
import {environment} from "@env/environment";
import {storeFreeze} from "ngrx-store-freeze";

export const selectRouterState = createFeatureSelector<fromRouter.RouterReducerState>('router');
export const getCurrentUrl = createSelector(selectRouterState,
  (router) => router.state && router.state.url);

export const authentification = (state:AppState)=> state.authentication;

export const appMetaReducers: MetaReducer<AppState>[] = !environment.production
? [storeFreeze] : [];
