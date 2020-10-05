/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {monitoringInitialSate, MonitoringState} from '@ofStates/monitoring.state';
import {MonitoringAction, MonitoringActionType} from '@ofActions/monitoring.actions';

export function reducer(state = monitoringInitialSate, action: MonitoringAction): MonitoringState {
    switch (action.type) {
        case(MonitoringActionType.UpdateMonitoringFilter): {
            return {
                ...state,
                filters: action.payload.filters
            };
        }
        default: {
            return state;
        }
    }
}
