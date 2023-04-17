/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Severity} from '@ofModel/light-card.model';

export class CardForDashboard {
    id: string;
    publishDate: string;
    title: string;
}

export class StateContent {
    id: string;
    name: string;
    circles: DashboardCircle[];
}

export class ProcessContent {
    id: string;
    name: string;
    states: StateContent[];
}

export class DashboardPage {
    processes: ProcessContent[];
}

export class DashboardCircle {
    color: string;
    width: number;
    severity: Severity;
    numberOfCards: number;
    cards: CardForDashboard[];
}
