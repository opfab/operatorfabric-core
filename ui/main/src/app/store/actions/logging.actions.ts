/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Action} from '@ngrx/store';
import {Page} from '@ofModel/page.model';
import {LineOfLoggingResult} from '@ofModel/line-of-logging-result.model';

export enum LoggingActionType {
    FlushLoggingResult = '[Logging] Flush previous logging result',
    SendLoggingQuery = '[Logging] Send Query',
    UpdateLoggingFilter = '[Logging] Update Filters'
    , LoggingQuerySuccess = '[Logging] Notify successful Query'
    , UpdateLoggingPage = '[Logging] Update query result Page'
}

export class FlushLoggingResult implements Action {
    readonly type = LoggingActionType.FlushLoggingResult;
}

export class SendLoggingQuery implements Action {
    readonly type = LoggingActionType.SendLoggingQuery;

    constructor(public payload: { params: Map<string, string[]> }) {
    }
}

export class UpdateLoggingFilter implements Action {
    readonly type = LoggingActionType.UpdateLoggingFilter;

    constructor(public payload: { filters: Map<String, string[]> }) {
    }
}

export class LoggingQuerySuccess implements Action {
    readonly type = LoggingActionType.LoggingQuerySuccess;

    constructor(public payload: { resultPage: Page<LineOfLoggingResult> }) {
    }
}

export class UpdateLoggingPage implements Action {
    readonly type = LoggingActionType.UpdateLoggingPage;

    constructor(public payload: { page: number }) {
    }
}

export type LoggingAction = FlushLoggingResult
    | SendLoggingQuery
    | UpdateLoggingFilter
    | LoggingQuerySuccess
    | UpdateLoggingPage
    ;
