/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {RouterReducerState} from '@ngrx/router-store';
import {RouterStateUrl} from './shared/utils';
import {State as CardState} from './light-card/light-card.reducer';
import {State as IdentificationState} from './identification/identification.reducer';

export interface AppState {
  router: RouterReducerState<RouterStateUrl>;
  lightCard: CardState;
  identification: IdentificationState;
}

export type State = AppState;
