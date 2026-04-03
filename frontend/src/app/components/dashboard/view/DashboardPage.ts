/* Copyright (c) 2023-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Severity} from 'app/model/Severity';

export class DashboardPage {
    tiles: Tile[];
}

export class Tile {
    id: string;
    label: string;
    cells: TileCell[];
    isCustomTile?: boolean;
}

export class TileCell {
    id: string;
    label: string;
    type: 'state' | 'customScreenLink';
    circles: DashboardCircle[];
}

export class DashboardCircle {
    color: string;
    width: number;
    severity: Severity;
    numberOfCards: number;
    cards: CardForDashboard[];
}

export class CardForDashboard {
    id: string;
    publishDate: string;
    title: string;
}
