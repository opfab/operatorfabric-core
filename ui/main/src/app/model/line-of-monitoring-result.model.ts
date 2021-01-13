/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Moment} from 'moment-timezone';
import {I18n} from '@ofModel/i18n.model';

export interface LineOfMonitoringResult {
    creationDateTime: Moment;
    beginningOfBusinessPeriod: Moment;
    endOfBusinessPeriod: Moment;
    title: I18n;
    summary: I18n;
    processName: string;
    coordinationStatus: string;
    coordinationStatusColor: string;
    cardId: string;
    severity: string;
}
