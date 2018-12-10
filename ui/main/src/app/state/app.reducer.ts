/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {ActionReducerMap, createFeatureSelector, createSelector, MetaReducer} from '@ngrx/store';
import * as fromRouter from '@ngrx/router-store';
import {AppState} from './app.interface';
import {reducer as lightCardReducer} from './light-card/light-card.reducer';
import {reducer as authenticationReducer} from './identification/identification.reducer';
import {environment} from '@env/environment';
import {storeFreeze} from 'ngrx-store-freeze';

export const appReducer: ActionReducerMap<AppState> = {
  router: fromRouter.routerReducer,
  lightCard: lightCardReducer,
  identification: authenticationReducer
};

export const selectRouterState = createFeatureSelector<fromRouter.RouterReducerState>('router');
export const getCurrentUrl = createSelector(selectRouterState,
  (router) => router.state && router.state.url);

export const getIdentification = (state:AppState)=> state.identification;

export const appMetaReducers: MetaReducer<AppState>[] = !environment.production
? [storeFreeze]
  : [];
