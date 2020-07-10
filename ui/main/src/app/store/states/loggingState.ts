/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {emptyPage, Page} from '@ofModel/page.model';
import {LineOfLoggingResult} from '@ofModel/line-of-logging-result.model';

export interface LoggingState {
    resultPage: Page<LineOfLoggingResult>;
    filters: Map<string, string[]>;
    loading: boolean;

}

export const loggingInitialState: LoggingState = {
    resultPage: emptyPage,
    filters: new Map(),
    loading: false
};
