/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {loggingInitialState, LoggingState} from '@ofStates/loggingState';
import {LoggingAction, LoggingActionType} from '@ofActions/logging.actions';

export function reducer(
    state = loggingInitialState,
    action: LoggingAction
): LoggingState {
    switch (action.type) {
        case LoggingActionType.FlushLoggingResult: {
            return loggingInitialState;
        }
        case LoggingActionType.LoggingQuerySuccess: {
            return {
                ...state,
                resultPage: action.payload.resultPage
            };
        }
        default: {
            return state;
        }

    }
}
