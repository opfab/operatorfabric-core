/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import * as fromRouter from '@ngrx/router-store';
import {RouterReducerState} from '@ngrx/router-store';
import {RouterStateUrl} from '@ofStore/states/router.state';
import {reducer as authenticationReducer} from '@ofStore/reducers/authentication.reducer';
import {ActionReducerMap, MetaReducer} from '@ngrx/store';
import {environment} from '@env/environment';
import {storeFreeze} from 'ngrx-store-freeze';
import {CardEffects} from '@ofEffects/card.effects';
import {CardOperationEffects} from '@ofEffects/card-operation.effects';
import {AuthenticationEffects} from '@ofEffects/authentication.effects';
import {CardFeedState} from '@ofStates/feed.state';
import {reducer as lightCardReducer} from '@ofStore/reducers/light-card.reducer';
import {reducer as cardReducer} from '@ofStore/reducers/card.reducer';
import {reducer as globalStyleReducer} from '@ofStore/reducers/global-style.reducer';
import {AuthState} from '@ofStates/authentication.state';
import {CardState} from '@ofStates/card.state';
import {CustomRouterEffects} from '@ofEffects/custom-router.effects';
import {UserEffects} from '@ofEffects/user.effects';

import {GlobalStyleState} from './states/global-style.state';
import {ProcessesEffects} from './effects/processes.effects';

export interface AppState {
    router: RouterReducerState<RouterStateUrl>;
    feed: CardFeedState;
    authentication: AuthState;
    card: CardState;
    globalStyle: GlobalStyleState;
}

export const appEffects = [
    CardEffects,
    CardOperationEffects,
    CustomRouterEffects,
    AuthenticationEffects,
    UserEffects,
    ProcessesEffects
];

export const appReducer: ActionReducerMap<AppState> = {
    router: fromRouter.routerReducer,
    feed: lightCardReducer,
    authentication: authenticationReducer,
    card: cardReducer,
    globalStyle: globalStyleReducer
};

export const appMetaReducers: MetaReducer<AppState>[] = !environment.production ? [storeFreeze] : [];

export const storeConfig = {
    metaReducers: appMetaReducers
};
