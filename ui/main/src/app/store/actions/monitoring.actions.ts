/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Action} from '@ngrx/store';
import {Page} from '@ofModel/page.model';
import {LineOfMonitoringResult} from '@ofModel/line-of-monitoring-result.model';

export enum MonitoringActionType {
 SendMonitoringQuery = '[Monitoring] Send Query'
    , UpdateMonitoringFilter = '[Monitoring] Update Filters'
    , MonitoringQuerySuccess = '[Monitoring] Notify successful query'
    , UpdateMonitoringPage = '[Monitoring] Update query result page'
}

export class SendMonitoringQuery implements Action {
    readonly type = MonitoringActionType.SendMonitoringQuery;
    constructor(public payload: { params: Map<string, string[]> }) {
    }
}

export class UpdateMonitoringFilter implements Action {
    readonly type = MonitoringActionType.UpdateMonitoringFilter;
    constructor(public payload: { filters: Map<string, string[]> }) {
    }
}

export class MonitoringQuerySuccess implements Action {
    readonly type = MonitoringActionType.MonitoringQuerySuccess;
    constructor(public payload: { resultPage: Page<LineOfMonitoringResult> }) {
    }
}

export class UpdateMonitoringPage implements Action {
    readonly type = MonitoringActionType.UpdateMonitoringPage;
    constructor(public payload: { page: number }) {
    }
}

export type MonitoringAction =
    | SendMonitoringQuery
    | UpdateMonitoringFilter
    | MonitoringQuerySuccess
    | UpdateMonitoringPage
    ;
