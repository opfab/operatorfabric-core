/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {AppState} from '@ofStore/index';
import {createSelector} from '@ngrx/store';
import {ProcessState} from '@ofStates/process.state';

export const selectProcessSlice = (state: AppState) => state.process;

export const selectProcesses = createSelector(selectProcessSlice,
    (processState: ProcessState) => processState.processes);

export const selectLoadStatusOfProcesses = createSelector(selectProcessSlice,
    (processState: ProcessState) => processState.loaded);
