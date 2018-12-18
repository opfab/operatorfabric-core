/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as fromRouter from '@ngrx/router-store';
import {RouterReducerState} from '@ngrx/router-store';
import {RouterStateUrl} from '@ofStore/shared/utils';
import {
    reducer as authenticationReducer
} from '@ofStore/reducers/authentication.reducer';
import {ActionReducerMap, MetaReducer} from '@ngrx/store';
import {environment} from '@env/environment';
import {storeFreeze} from 'ngrx-store-freeze';
import {LightCardEffects} from '@ofEffects/light-card.effects';
import {CardOperationEffects} from '@ofEffects/card-operation.effects';
import {AuthenticationEffects} from '@ofEffects/authentication.effects';
import {RouterEffects} from 'ngrx-router';
import {initialState as routerInitialState} from '@ofStore/states/router.state';
import {LightCardStateEntity} from "@ofStates/light-card.state";
import {reducer as lightCardReducer} from "@ofStore/reducers/light-card.reducer";
import {AuthState} from "@ofStates/authentication.state";

export interface AppState {
    router: RouterReducerState<RouterStateUrl>;
    lightCard: LightCardStateEntity;
    authentication: AuthState;
}

export const appEffects = [LightCardEffects, CardOperationEffects, RouterEffects,AuthenticationEffects];

export const appReducer: ActionReducerMap<AppState> = {
    router: fromRouter.routerReducer,
    lightCard: lightCardReducer,
    authentication: authenticationReducer
};

export const appMetaReducers: MetaReducer<AppState>[] = !environment.production
    ? [storeFreeze]
    : [];

export const storeConfig = {
    metaReducers: appMetaReducers,
    initialState: {
        router: routerInitialState,
    }
}