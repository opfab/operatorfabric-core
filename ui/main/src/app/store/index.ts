/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
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
import {RouterEffects} from 'ngrx-router';
import {CardFeedState} from '@ofStates/feed.state';
import {reducer as lightCardReducer} from '@ofStore/reducers/light-card.reducer';
import {reducer as cardReducer} from '@ofStore/reducers/card.reducer';
import {reducer as configReducer} from '@ofStore/reducers/config.reducer';
import {reducer as settingsReducer} from '@ofStore/reducers/settings.reducer';
import {reducer as menuReducer} from '@ofStore/reducers/menu.reducer';
import {reducer as globalStyleReducer} from '@ofStore/reducers/global-style.reducer';
import {reducer as loggingReducer} from '@ofStore/reducers/logging.reducer';
import {reducer as monitoringReducer} from '@ofStore/reducers/monitoring.reducer';
import {AuthState} from '@ofStates/authentication.state';
import {CardState} from '@ofStates/card.state';
import {CustomRouterEffects} from '@ofEffects/custom-router.effects';
import {MenuState} from '@ofStates/menu.state';
import {MenuEffects} from '@ofEffects/menu.effects';
import {FeedFiltersEffects} from '@ofEffects/feed-filters.effects';
import {ConfigState} from '@ofStates/config.state';
import {SettingsState} from '@ofStates/settings.state';
import {SettingsEffects} from '@ofEffects/settings.effects';

import {reducer as userReducer} from '@ofStore/reducers/user.reducer';
import {UserState} from '@ofStates/user.state';
import {UserEffects} from '@ofEffects/user.effects';


import {CardsSubscriptionState} from '@ofStates/cards-subscription.state';
import {cardsSubscriptionReducer} from '@ofStore/reducers/cards-subscription.reducer';
import {GlobalStyleState } from './states/global-style.state';
import {LoggingState} from '@ofStates/loggingState';
import {LoggingEffects} from '@ofEffects/logging.effects';
import {MonitoringState} from '@ofStates/monitoring.state';
import {MonitoringEffects} from '@ofEffects/monitoring.effects';


export interface AppState {
    router: RouterReducerState<RouterStateUrl>;
    feed: CardFeedState;
    authentication: AuthState;
    card: CardState;
    menu: MenuState;
    config: ConfigState;
    settings: SettingsState;
    user: UserState;
    cardsSubscription: CardsSubscriptionState;
    globalStyle: GlobalStyleState;
    logging: LoggingState;
    monitoring: MonitoringState;
}

export const appEffects = [
    CardEffects,
    SettingsEffects,
    CardOperationEffects,
    RouterEffects,
    CustomRouterEffects,
    AuthenticationEffects,
    MenuEffects,
    FeedFiltersEffects,
    UserEffects,
    LoggingEffects,
    MonitoringEffects
];

export const appReducer: ActionReducerMap<AppState> = {
    router: fromRouter.routerReducer,
    feed: lightCardReducer,
    authentication: authenticationReducer,
    card: cardReducer,
    menu: menuReducer,
    config: configReducer,
    settings: settingsReducer,
    user: userReducer,
    cardsSubscription: cardsSubscriptionReducer,
    globalStyle: globalStyleReducer,
    logging: loggingReducer,
    monitoring: monitoringReducer,

};

export const appMetaReducers: MetaReducer<AppState>[] = !environment.production
    ? [storeFreeze]
    : [];

export const storeConfig = {
    metaReducers: appMetaReducers
};
