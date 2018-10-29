/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {RouterReducerState} from '@ngrx/router-store';
import {RouterStateUrl} from './shared/utils';
import {State as CardState} from './light-card/light-card.reducer';
import {State as AuthenticationState} from './authentication/authentication.reducer';
import {State as CardOperationState} from './card-operation/card-operation.reducer';

export interface AppState {
  router: RouterReducerState<RouterStateUrl>;
  lightCard: CardState;
  authentication: AuthenticationState;
  cardOperation: CardOperationState;
}

export type State = AppState;
