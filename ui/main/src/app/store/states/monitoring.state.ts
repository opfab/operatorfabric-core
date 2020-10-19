/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {LineOfMonitoringResult} from '@ofModel/line-of-monitoring-result.model';
import {emptyPage, Page} from '@ofModel/page.model';

export interface MonitoringState {
    resultPage: Page<LineOfMonitoringResult>;
    filters: Map<string, string[]>;
    loading: boolean;
}

export const monitoringInitialSate: MonitoringState = {
    resultPage: emptyPage
    , filters: new Map()
    , loading: false
};
