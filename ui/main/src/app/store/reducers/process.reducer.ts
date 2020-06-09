/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {processInitialState, ProcessState} from '@ofStates/process.state';
import {ProcessAction, ProcessActionType} from '@ofActions/process.action';

export function reducer (state = processInitialState, action: ProcessAction): ProcessState {
    switch (action.type ) {
        case (ProcessActionType.LoadAllProcesses): {
            return {
                ...state,
                processes: action.payload.processes,
                loaded: true
            };
        }
        default:
            return state;
    }
}
