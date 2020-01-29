/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {createFeatureSelector, createSelector} from "@ngrx/store";
import {TimeState} from "@ofStates/time.state";

export const selectTimeState = createFeatureSelector<TimeState>('time');
export const selectError = createSelector(selectTimeState,(timeState)=>timeState.error);
export const selectCurrentDate = createSelector(selectTimeState,(timeState)=> timeState.currentDate);
export const selectTimeReference = createSelector(selectTimeState, (timeState) => timeState.timeReference);
