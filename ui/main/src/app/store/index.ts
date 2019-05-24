/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
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
import {RouterEffects} from 'ngrx-router';
import {CardFeedState} from '@ofStates/feed.state';
import {reducer as timelineReducer} from '@ofStore/reducers/timeline.reducer';
import {reducer as lightCardReducer} from '@ofStore/reducers/light-card.reducer';
import {reducer as cardReducer} from '@ofStore/reducers/card.reducer';
import {reducer as configReducer} from '@ofStore/reducers/config.reducer';
import {reducer as menuReducer} from '@ofStore/reducers/menu.reducer';
import {AuthState} from '@ofStates/authentication.state';
import {CardState} from "@ofStates/card.state";
import {CustomRouterEffects} from "@ofEffects/custom-router.effects";
import {MenuState} from "@ofStates/menu.state";
import {MenuEffects} from "@ofEffects/menu.effects";
import {LightCardEffects} from "@ofEffects/light-card.effects";
import {FeedFiltersEffects} from "@ofEffects/feed-filters.effects";
import {ConfigState} from "@ofStates/config.state";
import {ConfigEffects} from "@ofEffects/config.effects";
import {TimelineState} from "@ofStates/timeline.state";

export interface AppState {
    router: RouterReducerState<RouterStateUrl>;
    feed: CardFeedState;
    timeline: TimelineState;
    authentication: AuthState;
    card: CardState;
    menu: MenuState;
    config: ConfigState
}

export const appEffects = [
    CardEffects,
    ConfigEffects,
    CardOperationEffects,
    RouterEffects,
    CustomRouterEffects,
    AuthenticationEffects,
    MenuEffects,
    LightCardEffects,
    FeedFiltersEffects];

export const appReducer: ActionReducerMap<AppState> = {
    router: fromRouter.routerReducer,
    feed: lightCardReducer,
    timeline: timelineReducer,
    authentication: authenticationReducer,
    card: cardReducer,
    menu: menuReducer,
    config: configReducer
};

export const appMetaReducers: MetaReducer<AppState>[] = !environment.production
    ? [storeFreeze]
    : [];

export const storeConfig = {
    metaReducers: appMetaReducers,
    // initialState: {
    //     router: routerInitialState,
    // }
}
