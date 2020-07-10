/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {AppState} from '@ofStore/index';
import {LoggingState} from '@ofStates/loggingState';
import {createSelector} from '@ngrx/store';

export const selectLogging = (state: AppState) => state.logging;

export const selectLoggingFilter = createSelector(selectLogging, (loggingState: LoggingState) => loggingState.filters);

export const selectLoggingResultPage = createSelector(selectLogging, (loggingState: LoggingState) => loggingState.resultPage);

export const selectLoggingCount = createSelector(selectLogging, (loggingState: LoggingState) => loggingState.resultPage.totalElements);

export const selectLinesOfLoggingResult = createSelector(selectLogging, (loggingState: LoggingState) => loggingState.resultPage.content);

export const selecteLoggindLoadingStatus = createSelector(selectLogging, (loggingState: LoggingState) => loggingState.loading);
